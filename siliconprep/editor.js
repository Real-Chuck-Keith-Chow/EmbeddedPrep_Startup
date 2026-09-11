// Loads a problem from the API (via ?slug=... in the URL, falling back to a
// default demo problem) and wires up the CodeMirror editor + Run/Submit.
const DEFAULT_SLUG = "2-to-1-multiplexer";
const MIME = { verilog: "text/x-verilog", sv: "text/x-systemverilog", vhdl: "text/x-vhdl" };

let editor;
let currentLang = "verilog";
let currentProblem = null;

document.addEventListener("DOMContentLoaded", async () => {
  const slug = new URLSearchParams(window.location.search).get("slug") || DEFAULT_SLUG;

  editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    mode: MIME.verilog,
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    matchBrackets: true,
    viewportMargin: Infinity,
  });

  try {
    currentProblem = await fetchProblem(slug);
  } catch (err) {
    console.error(err);
    document.getElementById("problem-title").textContent = "Problem not found";
    document.getElementById("problem-description").textContent =
      `Couldn't find a problem with slug "${slug}". Open problems.html and click ` +
      `into one from the list, or check problems-data.js for the correct slug.`;
    return;
  }

  renderProblem(currentProblem);
  setupLangTabs(currentProblem);
  loadLanguage(currentProblem.languages[0] || "verilog");

  document.getElementById("run-btn").addEventListener("click", () => runJudge(false));
  document.getElementById("submit-btn").addEventListener("click", () => runJudge(true));
});

function renderProblem(p) {
  document.title = `${p.title} — SiliconPrep`;
  document.getElementById("problem-title").textContent = p.title;
  document.getElementById("problem-eyebrow").textContent =
    `${String(p.id).padStart(2, "0")} · ${p.topic}`;

  const pip = document.getElementById("problem-pip");
  pip.textContent = capitalize(p.difficulty);
  pip.className = `pip ${p.difficulty}`;

  const tags = [p.topic, ...p.languages.map((l) => LANG_LABEL[l])];
  document.getElementById("problem-tags").innerHTML = tags
    .map((t) => `<span class="tag">${t}</span>`)
    .join("");

  document.getElementById("problem-description").textContent = p.description;
  document.getElementById("problem-constraints").textContent = p.constraints;
}

function setupLangTabs(p) {
  document.querySelectorAll(".lang-tab").forEach((tab) => {
    const lang = tab.dataset.lang;
    const supported = p.languages.includes(lang);
    tab.disabled = !supported;
    tab.classList.remove("active");
    if (supported) {
      tab.addEventListener("click", () => loadLanguage(lang));
    }
  });
}

function loadLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll(".lang-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.lang === lang);
  });
  editor.setOption("mode", MIME[lang]);
  editor.setValue((currentProblem.starter_code && currentProblem.starter_code[lang]) || "");
  resetConsole();
}

function resetConsole() {
  const badge = document.getElementById("run-status");
  badge.textContent = "Not run yet";
  badge.className = "status-badge";
  document.getElementById("console-body").innerHTML =
    '<span class="muted">Click Run to compile and simulate against the hidden testbench.</span>';
}

async function runJudge(isSubmit) {
  const consoleBody = document.getElementById("console-body");
  const badge = document.getElementById("run-status");

  consoleBody.innerHTML = '<span class="muted">Compiling…</span>';
  badge.textContent = "Running";
  badge.className = "status-badge";

  try {
    const result = await submitCode({
      problemId: currentProblem.id,
      language: currentLang,
      code: editor.getValue(),
      isSubmit,
    });
    consoleBody.innerHTML = formatLog(result.log);
    badge.textContent = isSubmit ? "Submission accepted" : "All tests passed";
    badge.className = `status-badge ${result.status === "passed" ? "pass" : "fail"}`;
  } catch (err) {
    console.error(err);
    consoleBody.innerHTML = `<span class="fail">Something went wrong running the judge — check the browser console for details.</span>`;
    badge.textContent = "Error";
    badge.className = "status-badge fail";
  }
}

// Turns the plain-text judge log into lightly colored HTML.
function formatLog(text) {
  return text
    .split("\n")
    .map((line) => {
      if (line.includes("[PASS]")) return `<span class="ok">${escapeHtml(line)}</span>`;
      if (line.includes("[FAIL]")) return `<span class="fail">${escapeHtml(line)}</span>`;
      if (line.trim().startsWith("//")) return `<span class="muted">${escapeHtml(line)}</span>`;
      return escapeHtml(line);
    })
    .join("\n");
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
