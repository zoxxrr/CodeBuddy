const state = { user: null, me: null, paths: [], lessons: [], view: "dashboard", authMode: "login", currentLesson: null, code: "", usedHint: false, leaderboardPeriod: "all", quizChoice: null };
const root = document.querySelector("#view-root");
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const fmt = value => new Intl.NumberFormat().format(value || 0);
const level = xp => Math.floor((xp || 0) / 250) + 1;
const initials = name => (name || "?").slice(0, 1).toUpperCase();
const progressFor = id => state.me?.progress?.find(item => item.lesson_id === id);
const completedCount = () => state.me?.stats?.completedLessons || 0;
const percent = () => state.lessons.length ? Math.round(completedCount() / state.lessons.length * 100) : 0;

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3000);
}
function navigate(view) {
  state.view = view;
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $("#breadcrumb-current").textContent = ({ dashboard: "Overview", learn: "Learning paths", lesson: "Lesson", reviews: "Review queue", leaderboard: "Leaderboard", profile: "Public profile" })[view] || "Overview";
  $("#sidebar").classList.remove("open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function header(eyebrow, title, subtitle, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function button(label, action, kind = "primary") {
  return `<button class="button ${kind}" data-action="${action}">${label}</button>`;
}
function pathCard(path) {
  const items = state.lessons.filter(lesson => lesson.path === path.id);
  const done = items.filter(lesson => progressFor(lesson.id)).length;
  return `<button class="path-card" data-path="${esc(path.id)}" style="text-align:left;color:inherit;width:100%"><div class="path-top"><span class="path-badge">${esc(path.level)}</span><span class="muted">${done}/${items.length} lessons</span></div><h3>${esc(path.title)}</h3><p>${esc(path.description)}</p><div class="progress-track"><div class="progress-fill" style="width:${items.length ? done / items.length * 100 : 0}%"></div></div><div class="path-footer"><span>${items.length} lessons · ${items.reduce((sum, item) => sum + item.xp, 0)} XP available</span><strong>Explore →</strong></div></button>`;
}
function lessonRow(lesson) {
  const done = progressFor(lesson.id);
  return `<div class="lesson-row" role="button" tabindex="0" data-lesson="${esc(lesson.id)}"><div class="lesson-icon">${done ? "✓" : "⌘"}</div><div class="lesson-row-main"><strong>${esc(lesson.title)}</strong><small>${esc(lesson.difficulty)} · ${esc(lesson.duration)} · ${esc(lesson.tags.join(" · "))}</small></div><div class="lesson-row-side">${done ? '<span class="checkmark">✓</span><br>Complete' : `+${lesson.xp} XP`}</div></div>`;
}
function renderDashboard() {
  const firstIncomplete = state.lessons.find(lesson => !progressFor(lesson.id)) || state.lessons[0];
  const due = state.me?.due?.length || 0;
  const xp = state.me?.user?.xp || 0;
  const userName = state.user?.username || "there";
  return `${header("YOUR LEARNING SPACE", `Good to see you, ${esc(userName)}.`, "A little practice today adds up to skills you can use in your own Roblox games.", button("Continue learning →", `lesson:${firstIncomplete?.id || "hello-luau"}`))}
    <div class="hero"><div class="hero-main"><div class="eyebrow">YOUR NEXT LEVEL STARTS HERE</div><h2>Build real Roblox skills, one concept at a time.</h2><p>Understand the code, practice the ideas, and build the confidence to create your own systems.</p><div class="hero-actions">${button("Pick up where I left off →", `lesson:${firstIncomplete?.id || "hello-luau"}`)}${button("Browse learning paths", "learn", "subtle")}</div></div><div class="hero-side"><div><div class="mini-label">UP NEXT FOR YOU</div><div class="next-lesson"><div class="lesson-icon">⌘</div><div><strong>${esc(firstIncomplete?.title || "All starter lessons complete")}</strong><small>${esc(firstIncomplete?.duration || "Choose an advanced topic")} · ${firstIncomplete?.xp || 0} XP</small></div></div><div class="progress-track"><div class="progress-fill" style="width:${percent()}%"></div></div><div class="path-footer"><span>${completedCount()} of ${state.lessons.length} lessons completed</span><strong>${percent()}%</strong></div></div><button class="text-button" data-action="lesson:${firstIncomplete?.id || "hello-luau"}">Start lesson <span>→</span></button></div></div>
    <div class="stat-grid"><div class="stat-card"><div class="stat-top">Total experience <span class="stat-symbol">✦</span></div><div class="stat-value">${fmt(xp)}</div><div class="stat-note">Level ${level(xp)} learner</div></div><div class="stat-card"><div class="stat-top">Lessons completed <span class="stat-symbol">✓</span></div><div class="stat-value">${completedCount()}<span style="font-size:13px;color:var(--muted)"> / ${state.lessons.length}</span></div><div class="stat-note">Keep your momentum going</div></div><div class="stat-card"><div class="stat-top">Current streak <span class="stat-symbol">♨</span></div><div class="stat-value">${state.me?.user?.streak || 0} <span style="font-size:13px;color:var(--muted)">days</span></div><div class="stat-note">Learning days in a row</div></div><div class="stat-card"><div class="stat-top">Ready to review <span class="stat-symbol">◷</span></div><div class="stat-value">${due}</div><div class="stat-note">${due ? "A quick review will help it stick" : "Reviews appear as you learn"}</div></div></div>
    <div class="section-head"><div><h2>Your learning paths</h2><p>Follow a path or jump into a topic that interests you.</p></div><button class="text-button" data-view="learn">View all →</button></div><div class="path-grid">${state.paths.map(pathCard).join("")}</div>
    <div class="section-head" style="margin-top:32px"><div><h2>Keep the momentum</h2><p>Recent lessons from your curriculum.</p></div></div><div class="lesson-list">${state.lessons.slice(0, 4).map(lessonRow).join("")}</div>`;
}
function renderLearn() {
  return `${header("THE CURRICULUM", "Find your next skill.", "From your first print statement to secure, maintainable Roblox systems.")}${state.paths.map(path => `<div style="margin:24px 0 12px"><div class="section-head"><div><h2>${esc(path.title)}</h2><p>${esc(path.description)}</p></div><span class="path-badge">${esc(path.level)}</span></div><div class="lesson-list">${state.lessons.filter(lesson => lesson.path === path.id).map(lessonRow).join("") || '<div class="empty-state">More lessons for this path are being authored.</div>'}</div></div>`).join("")}`;
}
function codeBlock(code, label = "LUAU") {
  return `<div class="code-block"><div class="code-header"><span>${label}</span><button class="text-button" data-action="copy-example">Copy code</button></div><pre>${esc(code)}</pre></div>`;
}
function renderLesson() {
  const lesson = state.currentLesson;
  if (!lesson) return renderLearn();
  const done = progressFor(lesson.id);
  const lines = (lesson.lines || []).map(([code, explanation]) => `<div class="line-explain"><code>${esc(code)}</code><span>${esc(explanation)}</span></div>`).join("");
  const quiz = lesson.quiz ? `<div class="lesson-section"><h2>Quick knowledge check</h2><p>${esc(lesson.quiz.question)}</p><div>${lesson.quiz.options.map((option, index) => `<button class="quiz-option ${state.quizChoice === index ? "selected" : ""}" data-quiz-choice="${index}">${String.fromCharCode(65 + index)}. ${esc(option)}</button>`).join("")}</div><div class="editor-actions"><button class="button" data-action="submit-quiz">Check answer</button><span id="quiz-result" class="quiz-result"></span></div></div>` : "";
  return `${header(esc(lesson.pathTitle || "LESSON"), esc(lesson.title), esc(lesson.intro), button("← All lessons", "learn", "subtle"))}
    <div class="lesson-meta"><span class="meta-pill">${esc(lesson.difficulty)}</span><span class="meta-pill">${esc(lesson.duration)}</span><span class="meta-pill">✦ ${lesson.xp} XP</span><span class="meta-pill">${esc(lesson.tags.join(" · "))}</span></div>
    <div class="lesson-layout"><div class="lesson-content">
      <div class="lesson-section"><h2>The idea</h2><p>${esc(lesson.intro)}</p><h2 style="margin-top:20px">Why it matters</h2><p>${esc(lesson.why)}</p></div>
      <div class="lesson-section"><h2>See it in code</h2>${codeBlock(lesson.example)}<div>${lines}</div></div>
      <div class="lesson-section"><h2>Try it yourself</h2><p>${esc(lesson.exercise.prompt)}</p><textarea class="editor" id="code-editor" spellcheck="false" aria-label="Luau exercise editor">${esc(state.code || lesson.exercise.starter)}</textarea><div class="editor-actions"><button class="button primary" data-action="run-exercise">Run checks →</button><button class="button" data-action="reset-code">Reset</button><button class="button subtle" data-action="show-hint">Hint</button>${done ? '<span class="meta-pill" style="color:var(--green)">✓ Completed</span>' : ""}</div><div id="exercise-output" class="output-panel" aria-live="polite">Your feedback will appear here after you run the checks.</div><div id="hint-box" class="hint-box hidden">${esc(lesson.exercise.hint)}</div><div id="solution-box" class="hint-box hidden"><strong>Example solution</strong>${codeBlock(lesson.exercise.solution)}</div></div>
      ${quiz}
      <div class="lesson-section"><h2>Common mistakes</h2><div class="aside-list">${(lesson.mistakes || []).map(item => `<div><span>↳</span> ${esc(item)}</div>`).join("")}</div></div>
      <div class="lesson-section"><h2>Bring it into Roblox Studio</h2><p>${esc(lesson.studio)}</p><p class="muted">Studio task: Roblox engine behaviour cannot be faithfully simulated by this browser exercise. Run and test this task in Roblox Studio.</p></div>
      <div class="lesson-section"><h2>Remember this</h2><p>${esc(lesson.summary)}</p>${done ? '<p style="color:var(--green)">You have completed this lesson. You can revisit it any time.</p>' : '<p>Pass the exercise checks to complete this lesson and earn its XP.</p>'}</div>
      <div class="editor-actions"><button class="button" data-action="previous-lesson">← Previous</button><button class="button primary" data-action="next-lesson">Next lesson →</button></div>
    </div><aside class="lesson-aside"><div class="aside-card"><h3>In this lesson</h3><div class="aside-list"><button data-scroll="The idea"><span>01</span> The idea</button><button data-scroll="See it in code"><span>02</span> Example</button><button data-scroll="Try it yourself"><span>03</span> Practice</button><button data-scroll="Quick knowledge check"><span>04</span> Knowledge check</button><button data-scroll="Bring it into Roblox Studio"><span>05</span> Studio task</button></div></div><div class="aside-card"><h3>Your progress</h3><div class="stat-top">Lesson completion <strong>${done ? "100%" : "In progress"}</strong></div><div class="progress-track" style="margin:10px 0 15px"><div class="progress-fill" style="width:${done ? 100 : 25}%"></div></div><div class="stat-top">Reward <strong style="color:var(--purple)">+${done ? 0 : lesson.xp} XP</strong></div></div></aside></div>`;
}
function renderReviews() {
  const due = state.me?.due || [];
  const list = due.map(item => {
    const lesson = state.lessons.find(entry => entry.id === item.lesson_id);
    return lesson ? `<div class="lesson-row"><div class="lesson-icon">◷</div><div class="lesson-row-main"><strong>${esc(lesson.title)}</strong><small>Revisit this concept to strengthen recall.</small></div><button class="button" data-action="lesson:${lesson.id}">Review →</button></div>` : "";
  }).join("");
  return `${header("SPACED REPETITION", "Make it stick.", "Short reviews bring old concepts back before they fade from memory.")}${due.length ? `<div class="lesson-list">${list}</div>` : `<div class="empty-state"><div class="sparkle">✦</div><h3>Your review queue is clear.</h3><p>Complete lessons and your review schedule will build automatically.</p>${button("Continue learning →", "learn")}</div>`}`;
}
async function renderLeaderboard() {
  root.innerHTML = `${header("THE COMMUNITY", "A little friendly competition.", "Rankings are based on XP earned by completing lessons and challenges.")}<div class="section-head"><div><h2>Leaderboard</h2><p>Real learners only. No seeded demo accounts.</p></div><div class="segmented"><button data-period="all" class="${state.leaderboardPeriod === "all" ? "active" : ""}">All time</button><button data-period="weekly" class="${state.leaderboardPeriod === "weekly" ? "active" : ""}">This week</button></div></div><div class="table-wrap"><table class="leaderboard"><thead><tr><th>Rank</th><th>Learner</th><th>Level</th><th>Lessons</th><th>XP</th></tr></thead><tbody><tr><td colspan="5" class="muted">Loading rankings…</td></tr></tbody></table></div>`;
  try {
    const data = await api(`/api/leaderboard?period=${state.leaderboardPeriod}`);
    const tbody = $("tbody", root);
    tbody.innerHTML = data.entries.length ? data.entries.map(entry => `<tr><td class="rank">#${entry.rank}</td><td><div class="leader-user"><div class="avatar">${esc(initials(entry.username))}</div><a href="#" data-profile="${esc(entry.username)}">${esc(entry.username)}</a></div></td><td>${entry.level}</td><td>${entry.lessons}</td><td><strong>${fmt(entry.xp)}</strong></td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">No learners on the board yet. Complete a lesson to be the first.</div></td></tr>';
  } catch (error) { $("tbody", root).innerHTML = `<tr><td colspan="5">${esc(error.message)}</td></tr>`; }
}
async function renderProfile(username = state.user?.username) {
  if (!username) {
    root.innerHTML = `${header("YOUR PROFILE", "Your learning identity.", "Create an account to keep your learning history and appear on the leaderboard.")}<div class="empty-state"><h3>Your progress deserves a home.</h3><p>Sign in or create an account to save your journey.</p><button class="button primary" data-action="auth">Create account</button></div>`;
    return;
  }
  root.innerHTML = `${header("LEARNER PROFILE", esc(username), "A public snapshot of learning progress.")}<div class="empty-state">Loading profile…</div>`;
  try {
    const data = await api(`/api/profiles/${encodeURIComponent(username)}`);
    root.innerHTML = `${header("LEARNER PROFILE", esc(data.user.username), "A public snapshot of learning progress.")}<div class="stat-grid"><div class="stat-card"><div class="stat-top">Experience</div><div class="stat-value">${fmt(data.user.xp)}</div><div class="stat-note">Level ${data.user.level}</div></div><div class="stat-card"><div class="stat-top">Lessons completed</div><div class="stat-value">${data.stats.completedLessons}</div></div><div class="stat-card"><div class="stat-top">Current streak</div><div class="stat-value">${data.user.streak} days</div></div><div class="stat-card"><div class="stat-top">Exercises passed</div><div class="stat-value">${data.stats.successfulAttempts}</div></div></div><div class="lesson-section"><h2>Achievements</h2>${data.achievements.length ? data.achievements.map(item => `<span class="meta-pill">${esc(item)}</span>`).join(" ") : '<p class="muted">Achievements will appear as this learner progresses.</p>'}</div>`;
  } catch (error) { root.innerHTML = `<div class="empty-state"><h3>Could not load profile</h3><p>${esc(error.message)}</p></div>`; }
}
function render() {
  if (state.view === "dashboard") root.innerHTML = renderDashboard();
  if (state.view === "learn") root.innerHTML = renderLearn();
  if (state.view === "lesson") root.innerHTML = renderLesson();
  if (state.view === "reviews") root.innerHTML = renderReviews();
  if (state.view === "leaderboard") { renderLeaderboard(); }
  if (state.view === "profile") renderProfile();
  updateShell();
}
function updateShell() {
  $("#top-streak").textContent = `${state.me?.user?.streak || 0} day streak`;
  $("#review-count").textContent = state.me?.due?.length || 0;
  $("#sidebar-user").innerHTML = `<div class="avatar">${esc(initials(state.user?.username || "G"))}</div><div><strong>${esc(state.user?.username || "Guest learner")}</strong><small>${state.user ? `Level ${level(state.user.xp)} · ${fmt(state.user.xp)} XP` : "Sign in to sync your progress"}</small></div><button class="icon-button" id="auth-open" aria-label="${state.user ? "Sign out" : "Sign in"}">${state.user ? "↗" : "＋"}</button>`;
}
async function refreshMe() {
  if (!state.user) { state.me = null; render(); return; }
  try { state.me = await api("/api/me"); state.user = state.me.user; } catch { state.user = null; state.me = null; }
  render();
}
function openAuth(mode = "login") {
  state.authMode = mode;
  $("#auth-title").textContent = mode === "login" ? "Welcome back" : "Create your account";
  $("#auth-subtitle").textContent = mode === "login" ? "Pick up where your curiosity left off." : "Save your progress and keep learning across sessions.";
  $("#username-field").classList.toggle("hidden", mode === "login");
  $("#email-field").classList.toggle("hidden", mode === "login");
  $("#login-field").closest("label").classList.toggle("hidden", mode !== "login");
  $("#auth-form [name=password]").autocomplete = mode === "login" ? "current-password" : "new-password";
  $("#auth-form [name=username]").required = mode === "register";
  $("#auth-form [name=email]").required = mode === "register";
  $("#auth-submit").textContent = mode === "login" ? "Sign in" : "Create account";
  $("#auth-toggle").textContent = mode === "login" ? "New here? Create an account" : "Already have an account? Sign in";
  $("#auth-error").textContent = "";
  $("#auth-dialog").showModal();
}
async function loadLesson(id) {
  try {
    const lesson = await api(`/api/lessons/${encodeURIComponent(id)}`);
    state.currentLesson = lesson;
    state.code = lesson.exercise.starter;
    state.usedHint = false;
    state.quizChoice = null;
    navigate("lesson");
  } catch (error) { toast(error.message); }
}
function moveLesson(direction) {
  const index = state.lessons.findIndex(item => item.id === state.currentLesson?.id);
  const next = state.lessons[index + direction];
  if (next) loadLesson(next.id);
  else { toast("You reached the end of this starter curriculum."); navigate("learn"); }
}
root.addEventListener("click", async event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { event.preventDefault(); navigate(viewButton.dataset.view); return; }
  const pathButton = event.target.closest("[data-path]");
  if (pathButton) { const path = state.paths.find(item => item.id === pathButton.dataset.path); root.innerHTML = `${header("LEARNING PATH", esc(path.title), esc(path.description), button("← All paths", "learn", "subtle"))}<div class="lesson-list">${state.lessons.filter(item => item.path === path.id).map(lessonRow).join("")}</div>`; return; }
  const lessonButton = event.target.closest("[data-lesson]");
  if (lessonButton) { loadLesson(lessonButton.dataset.lesson); return; }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === "auth") { openAuth("register"); return; }
    if (action === "learn") { navigate("learn"); return; }
    if (action.startsWith("lesson:")) { loadLesson(action.split(":")[1]); return; }
    if (action === "show-hint") { state.usedHint = true; $("#hint-box").classList.remove("hidden"); return; }
    if (action === "reset-code") { $("#code-editor").value = state.currentLesson.exercise.starter; $("#exercise-output").textContent = "Editor reset."; $("#exercise-output").className = "output-panel"; state.code = ""; return; }
    if (action === "copy-example") { const text = state.currentLesson?.example || ""; try { await navigator.clipboard.writeText(text); toast("Example copied."); } catch { toast("Clipboard access is not available in this context."); } return; }
    if (action === "run-exercise") {
      const code = $("#code-editor").value;
      state.code = code;
      $("#exercise-output").textContent = "Checking your solution…";
      try {
        const result = await api(`/api/lessons/${state.currentLesson.id}/attempt`, { method: "POST", body: JSON.stringify({ code, usedHint: state.usedHint }) });
        const output = $("#exercise-output");
        output.className = `output-panel ${result.passed ? "success" : "error"}`;
        output.textContent = result.passed ? `${result.feedback}\nChecks passed: ${result.checksPassed}/${result.checksTotal}\n${result.alreadyCompleted ? "This lesson was already completed, so no extra XP was awarded." : `You earned ${result.xpAwarded} XP!`}` : `${result.feedback}\nChecks passed: ${result.checksPassed || 0}/${result.checksTotal || 0}`;
        if (result.passed) { $("#solution-box").classList.remove("hidden"); await refreshMe(); if (!result.alreadyCompleted) toast(`+${result.xpAwarded} XP earned!`); }
      } catch (error) { $("#exercise-output").textContent = error.message; $("#exercise-output").className = "output-panel error"; if (error.message.includes("Sign in")) openAuth("login"); }
      return;
    }
    if (action === "submit-quiz") {
      if (state.quizChoice === null) { $("#quiz-result").textContent = "Choose an answer first."; return; }
      try { const result = await api(`/api/quiz/${state.currentLesson.id}`, { method: "POST", body: JSON.stringify({ answer: state.quizChoice }) }); $("#quiz-result").textContent = `${result.correct ? "Correct!" : "Not quite."} ${result.explanation}`; $("#quiz-result").style.color = result.correct ? "var(--green)" : "var(--red)"; }
      catch (error) { $("#quiz-result").textContent = error.message; }
      return;
    }
    if (action === "previous-lesson") { moveLesson(-1); return; }
    if (action === "next-lesson") { moveLesson(1); return; }
  }
  const choice = event.target.closest("[data-quiz-choice]");
  if (choice) { state.quizChoice = Number(choice.dataset.quizChoice); $$(".quiz-option", root).forEach(item => item.classList.toggle("selected", item === choice)); return; }
  const period = event.target.closest("[data-period]");
  if (period) { state.leaderboardPeriod = period.dataset.period; renderLeaderboard(); return; }
  const profile = event.target.closest("[data-profile]");
  if (profile) { event.preventDefault(); await renderProfile(profile.dataset.profile); state.view = "profile"; return; }
  const scroll = event.target.closest("[data-scroll]");
  if (scroll) { const heading = $$("h2", root).find(item => item.textContent === scroll.dataset.scroll); heading?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
});
root.addEventListener("keydown", event => {
  const row = event.target.closest("[data-lesson]");
  if (row && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); loadLesson(row.dataset.lesson); }
  if (event.target.id === "code-editor" && event.key === "Tab") { event.preventDefault(); const input = event.target; const start = input.selectionStart; input.setRangeText("    ", start, input.selectionEnd, "end"); }
});
document.addEventListener("click", event => {
  if (event.target.closest("#auth-open")) {
    if (state.user) {
      api("/api/auth/logout", { method: "POST" }).then(() => { state.user = null; state.me = null; toast("Signed out."); render(); }).catch(error => toast(error.message));
    } else openAuth("login");
  }
});
$("#profile-button").addEventListener("click", () => navigate("profile"));
$("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#auth-toggle").addEventListener("click", () => openAuth(state.authMode === "login" ? "register" : "login"));
$("#auth-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = state.authMode === "login"
    ? { login: form.get("login"), password: form.get("password") }
    : { username: form.get("username"), email: form.get("email"), password: form.get("password") };
  try {
    const result = await api(`/api/auth/${state.authMode}`, { method: "POST", body: JSON.stringify(payload) });
    state.user = result.user;
    $("#auth-dialog").close();
    event.currentTarget.reset();
    await refreshMe();
    toast(state.authMode === "login" ? "Welcome back." : "Account created. Let's learn.");
  } catch (error) { $("#auth-error").textContent = error.message; }
});
async function init() {
  try {
    const curriculum = await api("/api/curriculum");
    state.paths = curriculum.paths;
    state.lessons = curriculum.lessons;
    try { state.me = await api("/api/me"); state.user = state.me.user; } catch {}
    render();
  } catch (error) {
    root.innerHTML = `<div class="empty-state"><h3>CodeBuddy could not start</h3><p>${esc(error.message)}</p><p>Check that the backend is running and reload the page.</p></div>`;
  }
}
init();
