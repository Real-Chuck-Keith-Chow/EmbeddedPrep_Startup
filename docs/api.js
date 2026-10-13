// Data layer. Problem lists come from PROBLEMS in problems-data.js.
// Problems flagged `backend: true` (C and Verilog coding problems) are run for
// real by the code-runner server (coding-backend/server.js). The rest still
// use the mock judge below.
 
// Where the code runner lives. Change this once the backend is hosted,
// e.g. "https://api.yourdomain.com".
const BACKEND_URL = "http://localhost:3000";
 
const TOOL = { verilog: "iverilog", sv: "verilator", vhdl: "ghdl" };
const EXT = { verilog: "v", sv: "sv", vhdl: "vhd" };
 
function fetchProblems({ search, language, topic, difficulty } = {}) {
  let results = PROBLEMS;
 
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (language) results = results.filter((p) => p.languages.includes(language));
  if (topic) results = results.filter((p) => p.topic === topic);
  if (difficulty) results = results.filter((p) => p.difficulty === difficulty);
 
  const shaped = results.map(
    ({ id, slug, title, topic, difficulty, success_rate, languages }) => ({
      id, slug, title, topic, difficulty, success_rate, languages,
    })
  );
  return Promise.resolve(shaped);
}
 
function fetchTopics() {
  const topics = [...new Set(PROBLEMS.map((p) => p.topic))].sort();
  return Promise.resolve(topics);
}
 
function fetchProblem(slug) {
  const p = PROBLEMS.find((p) => p.slug === slug);
  if (!p) return Promise.reject(new Error(`Problem not found: ${slug}`));
  return Promise.resolve(p);
}
 
// ---- Real judge (code-runner backend) ----
async function postBackend(path, body) {
  const res = await fetch(BACKEND_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  return data;
}
 
async function submitToBackend({ problem, language, code, isSubmit }) {
  try {
    if (!isSubmit) {
      // Run: execute with the sample input
      const r = await postBackend("/run", { language, code, stdin: problem.sample_input || "" });
      const ok = r.exitCode === 0;
      let log = r.output || "(no output)";
      if (!ok && !r.timedOut) log += `\n\n[exit code ${r.exitCode}]`;
      return {
        status: ok ? "passed" : "failed",
        label: ok ? "Ran successfully" : r.timedOut ? "Time limit exceeded" : "Error",
        log,
      };
    }
 
    // Submit: run against the hidden tests on the server
    const r = await postBackend("/check", { problemId: problem.slug, code });
    const lines = r.results.map(
      (t) => `Test ${t.test}: ${t.passed ? "[PASS]" : "[FAIL]"}${t.timedOut ? " (time limit exceeded)" : ""}`
    );
    const failed = r.results.find((t) => !t.passed);
    if (failed && failed.output) lines.push("", "Your output:", failed.output);
    lines.push("", r.passed ? "All tests passed!" : "Some tests failed.");
    return {
      status: r.passed ? "passed" : "failed",
      label: r.passed ? "All tests passed" : "Tests failed",
      log: lines.join("\n"),
    };
  } catch (err) {
    return {
      status: "failed",
      label: "Server offline",
      log: `Could not reach the code runner at ${BACKEND_URL}.\n${err.message}\nMake sure the backend is running (node server.js).`,
    };
  }
}
 
// MOCK JUDGE for the HDL problems that don't have a backend yet.
function mockJudge({ problem, language }) {
  const slug = problem ? problem.slug : "top";
  const tool = TOOL[language] || "iverilog";
  const ext = EXT[language] || "v";
 
  const log = [
    `$ ${tool} ${slug}.${ext} tb_${slug}.${ext}`,
    `TESTBENCH: ${slug}`,
    `  vector 0  [PASS]`,
    `  vector 1  [PASS]`,
    `  vector 2  [PASS]`,
    `  vector 3  [PASS]`,
    `4/4 test vectors passed`,
    ``,
    `// Mock output \u2014 nothing was actually compiled or simulated.`,
  ].join("\n");
 
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: "passed", log, tool }), 500);
  });
}
 
function submitCode({ problemId, language, code, isSubmit }) {
  const problem = PROBLEMS.find((p) => p.id === problemId);
  if (problem && problem.backend) return submitToBackend({ problem, language, code, isSubmit });
  return mockJudge({ problem, language });
}
