const path = require('path');
const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
 
const app = express();
const docker = new Docker();
const PORT = 3000;
 
app.use(cors()); // restrict to your site's origin in production: cors({ origin: 'https://yoursite.com' })
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public'))); // only the "public" folder is served
 
// ---------- Config ----------
const TIME_LIMIT_MS = 10_000;
const MAX_CODE_BYTES = 50_000;
const MAX_OUTPUT_CHARS = 10_000;
const MAX_CONCURRENT = 4;
 
const LANGUAGES = {
  c: {
    image: 'gcc:latest',
    filename: 'solution.c',
    compile: 'gcc solution.c -o solution',
    run: './solution',
  },
  verilog: {
    image: 'iverilog-runner:latest', // built locally from Dockerfile.iverilog
    filename: 'design.v',
    compile: 'iverilog -o simv design.v',
    run: 'vvp simv',
  },
};
 
// Test cases live on the server only, so users can't see expected outputs.
// Replace with a database later.
const PROBLEMS = {
  'sum-two': {
    language: 'c',
    tests: [
      { input: '2 3\n', expected: '5' },
      { input: '-4 10\n', expected: '6' },
    ],
  },
  'hello-verilog': {
    language: 'verilog',
    tests: [{ input: '', expected: 'Hello from Verilog inside Docker!' }],
  },
};
 
// ---------- Docker helpers ----------
async function ensureImage(image) {
  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(`Pulling ${image} ...`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (e) => (e ? reject(e) : resolve()));
      });
    });
  }
}
 
// Docker multiplexes stdout/stderr with 8-byte headers when Tty is false.
function demuxLogs(buf) {
  let out = '';
  let off = 0;
  while (off + 8 <= buf.length) {
    const size = buf.readUInt32BE(off + 4);
    out += buf.subarray(off + 8, off + 8 + size).toString('utf8');
    off += 8 + size;
  }
  return out;
}
 
let running = 0;
 
async function runInDocker({ language, code, stdin = '' }) {
  const lang = LANGUAGES[language];
  if (!lang) throw Object.assign(new Error(`Unsupported language: ${language}`), { status: 400 });
 
  if (running >= MAX_CONCURRENT) {
    throw Object.assign(new Error('Server busy, try again shortly'), { status: 429 });
  }
  running++;
 
  let container;
  try {
    const script =
      `printf %s "$CODE_B64" | base64 -d > ${lang.filename} && ` +
      `printf %s "$INPUT_B64" | base64 -d > input.txt && ` +
      `${lang.compile} && ${lang.run} < input.txt`;
 
    container = await docker.createContainer({
      Image: lang.image,
      Cmd: ['sh', '-c', script],
      Env: [
        `CODE_B64=${Buffer.from(code).toString('base64')}`,
        `INPUT_B64=${Buffer.from(stdin).toString('base64')}`,
      ],
      WorkingDir: '/tmp',
      User: '65534:65534', // nobody
      Tty: false,
      NetworkDisabled: true,
      HostConfig: {
        NetworkMode: 'none',
        Memory: 128 * 1024 * 1024,
        MemorySwap: 128 * 1024 * 1024,
        NanoCpus: 1_000_000_000,
        PidsLimit: 64,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges'],
        ReadonlyRootfs: true,
        Tmpfs: { '/tmp': 'rw,exec,nosuid,size=64m' },
        LogConfig: { Type: 'json-file', Config: { 'max-size': '1m', 'max-file': '1' } },
      },
    });
 
    await container.start();
 
    let timedOut = false;
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(async () => {
        timedOut = true;
        try { await container.kill(); } catch { /* already exited */ }
        resolve({ StatusCode: 124 });
      }, TIME_LIMIT_MS);
    });
 
    const result = await Promise.race([container.wait(), timeout]);
    clearTimeout(timer);
 
    const logBuffer = await container.logs({ stdout: true, stderr: true });
    let output = demuxLogs(logBuffer).trim();
    if (output.length > MAX_OUTPUT_CHARS) {
      output = output.slice(0, MAX_OUTPUT_CHARS) + '\n...[output truncated]';
    }
    if (timedOut) output += '\n[Time limit exceeded]';
 
    return { output: output.trim(), exitCode: result.StatusCode, timedOut };
  } finally {
    running--;
    if (container) {
      try { await container.remove({ force: true }); } catch { /* ignore */ }
    }
  }
}
 
// Ignore trailing whitespace on each line and at the end
const normalize = (s) =>
  s.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trim();
 
function validate(language, code) {
  if (typeof language !== 'string' || typeof code !== 'string') return 'language and code must be strings';
  if (Buffer.byteLength(code) > MAX_CODE_BYTES) return 'Code too large';
  return null;
}
 
// ---------- Routes ----------
// "Run" button: run the user's code, optionally with custom stdin
app.post('/run', async (req, res) => {
  const { language, code, stdin } = req.body;
  const bad = validate(language, code);
  if (bad) return res.status(400).json({ error: bad });
 
  try {
    const { output, exitCode, timedOut } = await runInDocker({ language, code, stdin: stdin || '' });
    res.json({ output, exitCode, timedOut });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
});
 
// "Check" button: run against hidden test cases
app.post('/check', async (req, res) => {
  const { problemId, code } = req.body;
  const problem = PROBLEMS[problemId];
  if (!problem) return res.status(404).json({ error: 'Unknown problem' });
  const bad = validate(problem.language, code);
  if (bad) return res.status(400).json({ error: bad });
 
  try {
    const results = [];
    for (const [i, t] of problem.tests.entries()) {
      const r = await runInDocker({ language: problem.language, code, stdin: t.input });
      const passed = r.exitCode === 0 && normalize(r.output) === normalize(t.expected);
      results.push({
        test: i + 1,
        passed,
        exitCode: r.exitCode,
        timedOut: r.timedOut,
        // only reveal details for the first failure, and never hidden expected output
        output: passed ? undefined : r.output,
      });
      if (!passed) break; // stop at first failure
    }
    const allPassed = results.length === problem.tests.length && results.every((r) => r.passed);
    res.json({ passed: allPassed, results });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
});
 
// ---------- Start ----------
(async () => {
  try {
    await Promise.all(Object.values(LANGUAGES).map((l) => ensureImage(l.image)));
  } catch (err) {
    console.error('Could not prepare Docker images (is Docker running?):', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
})();
 