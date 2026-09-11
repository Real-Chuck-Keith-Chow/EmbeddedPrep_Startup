// Renders and filters the problem table by calling the FastAPI backend
// (see api.js). Filtering happens server-side: every change re-queries.
document.addEventListener("DOMContentLoaded", () => {
  const rowsEl = document.getElementById("problem-rows");
  const countEl = document.getElementById("result-count");
  const searchEl = document.getElementById("search");
  const langEl = document.getElementById("filter-lang");
  const topicEl = document.getElementById("filter-topic");
  const diffEl = document.getElementById("filter-difficulty");

  let searchDebounce;

  async function loadTopics() {
    try {
      const topics = await fetchTopics();
      topics.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        topicEl.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      // Non-fatal — the topic filter just stays at "All topics".
    }
  }

  async function render() {
    const filters = {
      search: searchEl.value.trim(),
      language: langEl.value,
      topic: topicEl.value,
      difficulty: diffEl.value,
    };

    try {
      const problems = await fetchProblems(filters);
      countEl.textContent = `${problems.length} problem${problems.length === 1 ? "" : "s"}`;
      rowsEl.innerHTML = problems.map(rowHtml).join("");
    } catch (err) {
      console.error(err);
      countEl.textContent = "";
      rowsEl.innerHTML = `<tr><td colspan="6" style="padding:24px 18px; color:var(--text-muted)">
        Something went wrong loading the problem list — check the browser console for details.
      </td></tr>`;
    }
  }

  function rowHtml(p) {
    return `
      <tr onclick="window.location.href='problem.html?slug=${p.slug}'">
        <td class="num">${String(p.id).padStart(2, "0")}</td>
        <td class="title">${p.title}</td>
        <td>${p.topic}</td>
        <td><span class="pip ${p.difficulty}">${capitalize(p.difficulty)}</span></td>
        <td>${p.languages.map((l) => `<span class="lang-tag">${LANG_LABEL[l]}</span>`).join(" ")}</td>
        <td class="rate">${p.success_rate}%</td>
      </tr>`;
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  langEl.addEventListener("change", render);
  topicEl.addEventListener("change", render);
  diffEl.addEventListener("change", render);
  searchEl.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 250);
  });

  loadTopics();
  render();
});
