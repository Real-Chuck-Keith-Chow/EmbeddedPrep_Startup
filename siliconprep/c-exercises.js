// Renders EXERCISES (see c-exercises-data.js) one at a time with an inline
// fill-in-the-blank input, instant checking, a "Show Answer" escape hatch,
// and Prev/Next + numbered navigation between exercises. No compiler
// involved — this just checks the typed text against the accepted answer(s).
document.addEventListener("DOMContentLoaded", () => {
  const hostEl = document.getElementById("exercise-host");
  const summaryEl = document.getElementById("exercise-summary");
  const paginationEl = document.getElementById("exercise-pagination");
  const solved = {}; // exercise id -> true once correctly answered

  let currentIndex = 0;

  function updateSummary() {
    const total = EXERCISES.length;
    const done = Object.keys(solved).length;
    summaryEl.textContent = `Your score: ${done} / ${total} · Exercise ${currentIndex + 1} of ${total}`;
  }

  function renderExercise(ex) {
    const card = document.createElement("div");
    card.className = "panel quiz-card exercise-card";

    const topic = document.createElement("span");
    topic.className = "tag";
    topic.textContent = ex.topic;

    const prompt = document.createElement("p");
    prompt.className = "quiz-question-text";
    prompt.textContent = ex.prompt;

    const codeEl = document.createElement("pre");
    codeEl.className = "quiz-code";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "exercise-blank";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Fill in the blank");
    const widest = Math.max(...ex.answer.map((a) => a.length), 3);
    input.style.width = `${widest + 2}ch`;

    codeEl.appendChild(document.createTextNode(ex.code_before));
    codeEl.appendChild(input);
    codeEl.appendChild(document.createTextNode(ex.code_after));

    const actions = document.createElement("div");
    actions.className = "exercise-actions";

    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn btn-primary btn-sm";
    submitBtn.textContent = "Submit Answer";

    const showBtn = document.createElement("button");
    showBtn.type = "button";
    showBtn.className = "btn btn-ghost btn-sm";
    showBtn.textContent = "Show Answer";

    actions.appendChild(submitBtn);
    actions.appendChild(showBtn);

    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";

    function checkAnswer() {
      if (input.disabled) return;
      const value = input.value.trim();
      const isCorrect = ex.answer.includes(value);
      input.classList.remove("right", "wrong");
      if (isCorrect) {
        solved[ex.id] = true;
        input.disabled = true;
        input.classList.add("right");
        feedback.innerHTML = '<span class="ok-text">Correct!</span>';
      } else {
        input.classList.add("wrong");
        feedback.innerHTML = '<span class="fail-text">Wrong answer. Try again!</span>';
      }
      updateSummary();
    }

    submitBtn.addEventListener("click", checkAnswer);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });

    showBtn.addEventListener("click", () => {
      if (input.disabled) return;
      input.value = ex.answer[0];
      input.classList.remove("right", "wrong");
      feedback.innerHTML = `<span class="muted-text">Answer: ${ex.answer[0]}</span>`;
    });

    card.appendChild(topic);
    card.appendChild(prompt);
    card.appendChild(codeEl);
    card.appendChild(actions);
    card.appendChild(feedback);
    return card;
  }

  function showExercise(index, { scroll = true } = {}) {
    currentIndex = index;
    hostEl.querySelectorAll(".exercise-card").forEach((card, i) => {
      card.style.display = i === index ? "" : "none";
    });
    renderPagination();
    updateSummary();
    if (scroll) hostEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPagination() {
    paginationEl.innerHTML = "";
    const total = EXERCISES.length;

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "quiz-page-btn";
    prevBtn.textContent = "← Prev";
    prevBtn.disabled = currentIndex === 0;
    prevBtn.addEventListener("click", () => showExercise(currentIndex - 1));
    paginationEl.appendChild(prevBtn);

    for (let i = 0; i < total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-page-btn" + (i === currentIndex ? " active" : "");
      btn.textContent = String(i + 1);
      btn.addEventListener("click", () => showExercise(i));
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "quiz-page-btn";
    nextBtn.textContent = "Next →";
    nextBtn.disabled = currentIndex === total - 1;
    nextBtn.addEventListener("click", () => showExercise(currentIndex + 1));
    paginationEl.appendChild(nextBtn);
  }

  EXERCISES.forEach((ex) => hostEl.appendChild(renderExercise(ex)));
  showExercise(0, { scroll: false });
});
