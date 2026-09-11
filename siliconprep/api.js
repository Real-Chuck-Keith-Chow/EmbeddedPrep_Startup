// Local data layer — no server, no network calls. Everything here reads from
// the PROBLEMS array in problems-data.js and resolves instantly.
//
// This deliberately keeps the exact same function names/return shapes a real
// API client would have (fetchProblems, fetchTopics, fetchProblem,
// submitCode), so reconnecting the FastAPI + SQL backend in /backend later —
// once you build a real judge — just means rewriting the *insides* of these
// functions back into fetch() calls. problems.js, editor.js, and the HTML
// pages don't need to change at all.

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

// MOCK JUDGE — runs entirely in the browser, doesn't actually compile or
// simulate anything. Once you build a real backend judge, replace this
// function's body with a real fetch() POST to /api/submissions.
function submitCode({ problemId, language, code, isSubmit }) {
  const problem = PROBLEMS.find((p) => p.id === problemId);
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
    `// Mock output \u2014 running entirely in your browser, nothing was`,
    `// actually compiled or simulated. See /backend for the real judge.`,
  ].join("\n");

  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: "passed", log, tool }), 500);
  });
}
