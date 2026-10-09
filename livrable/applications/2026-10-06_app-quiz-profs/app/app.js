import { api, ONLINE, device, defaultSettings } from "./data.js";
import { aiSettings, generateQuiz } from "./ai.js";
import { readFile, readLink, isGoogleLink, ACCEPT, MAX_SOURCE } from "./files.js";

/* ===================== Outils ===================== */
const $app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LETTERS = "ABCDEF";
const MSG = {
  QUIZ_INTROUVABLE: "Aucun quiz ouvert avec ce code. Vérifie les 6 caractères.",
  CLASSE_INTROUVABLE: "Aucune classe avec ce code.",
  PSEUDO_PRIS: "Ce pseudo est déjà pris dans cette classe (ou utilisé depuis un autre appareil). Choisis-en un autre.",
  PSEUDO_INVALIDE: "Choisis un pseudo de 1 à 24 caractères.",
  CLASSE_REQUISE: "Choisis ta classe.",
  TENTATIVE_INVALIDE: "Cette partie n'existe plus (le prof a peut-être effacé les résultats).",
  EMAIL_PRIS: "Un compte existe déjà avec cet e-mail.",
  CONNEXION_REFUSEE: "E-mail ou mot de passe incorrect.",
  EMAIL_A_CONFIRMER: "Confirme d'abord ton e-mail (clique sur le lien reçu).",
};
const errMsg = (e) => MSG[e?.message] || e?.message || "Une erreur est survenue.";
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}
const fmtTime = (s) => { s = Math.max(0, Math.round(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const fmtDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const qid = () => crypto.randomUUID().slice(0, 8);
const go = (h) => { location.hash = h; };
const on = (sel, ev, fn, root = $app) => root.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));

let cleanup = [];
function setCleanup(fn) { cleanup.push(fn); }
function runCleanup() { cleanup.forEach((f) => { try { f(); } catch {} }); cleanup = []; }
function every(ms, fn) { const id = setInterval(fn, ms); setCleanup(() => clearInterval(id)); }

const TYPES = { single: "QCM (1 réponse)", multi: "QCM (plusieurs réponses)", tf: "Vrai / Faux", short: "Réponse courte" };

/* ===================== Mise en page ===================== */
function banner() {
  return ONLINE ? "" : `<div class="banner">Mode démo : les données restent dans ce navigateur. Pour l'utiliser avec de vrais élèves, il faut brancher Supabase (voir LISEZMOI).</div>`;
}
function profShell(active, inner) {
  const link = (h, k, t) => `<a href="${h}" class="${active === k ? "on" : ""}">${t}</a>`;
  return `${banner()}<header class="topbar">
    <a class="brand" href="#/prof"><span class="dot">Q</span>QuizClasse</a>
    <nav>${link("#/prof", "quiz", "Mes quiz")}${link("#/prof/classes", "classes", "Mes classes")}${link("#/prof/reglages", "reglages", "Réglages")}<a href="#/prof/sortir">Se déconnecter</a></nav>
  </header><main class="wrap">${inner}</main>`;
}
function eleveShell(inner) {
  return `${banner()}<header class="topbar"><a class="brand" href="#/e"><span class="dot">Q</span>QuizClasse</a>
    <nav><a href="#/e">Mon espace</a></nav></header><main class="wrap narrow">${inner}</main>`;
}

/* ===================== Routeur ===================== */
const routes = [
  [/^\/?$/, home],
  [/^\/prof\/connexion$/, profLogin],
  [/^\/prof\/sortir$/, async () => { await api.signOut(); go("#/"); }],
  [/^\/prof$/, needProf(profHome)],
  [/^\/prof\/nouveau$/, needProf(() => newQuiz())],
  [/^\/prof\/ia$/, needProf(aiPage)],
  [/^\/prof\/quiz\/([\w-]+)$/, needProf(editQuiz)],
  [/^\/prof\/quiz\/([\w-]+)\/resultats$/, needProf(results)],
  [/^\/prof\/classes$/, needProf(classesPage)],
  [/^\/prof\/classe\/([\w-]+)$/, needProf(classPage)],
  [/^\/prof\/reglages$/, needProf(settingsPage)],
  [/^\/e$/, eleveHome],
  [/^\/e\/classe\/([\w-]+)$/, eleveClass],
  [/^\/q\/([A-Za-z0-9]+)$/, playQuiz],
];
function needProf(fn) {
  return async (...a) => { if (!(await api.session())) return go("#/prof/connexion"); return fn(...a); };
}
async function router() {
  runCleanup();
  document.body.classList.remove("no-select");
  const path = location.hash.replace(/^#/, "") || "/";
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      try { await fn(...m.slice(1)); } catch (e) { console.error(e); $app.innerHTML = eleveShell(`<div class="card"><h2>Oups</h2><p>${esc(errMsg(e))}</p><a class="btn" href="#/">Accueil</a></div>`); }
      window.scrollTo(0, 0);
      return;
    }
  }
  go("#/");
}
window.addEventListener("hashchange", router);

/* ===================== Accueil ===================== */
function home() {
  const params = new URLSearchParams(location.search);
  if (params.get("code")) { const c = params.get("code"); history.replaceState(null, "", location.pathname); return go(`#/q/${c.toUpperCase()}`); }
  $app.innerHTML = `${banner()}<main class="wrap narrow">
    <div class="hero"><div class="brand" style="justify-content:center;font-size:1.5rem"><span class="dot" style="width:40px;height:40px">Q</span>QuizClasse</div>
    <h1 style="margin-top:20px">Le quiz de ta classe, en 30 secondes</h1></div>
    <div class="card"><h2>Je suis élève</h2>
      <form id="f-code"><label for="code">Code du quiz</label>
      <input id="code" class="code-input" type="text" maxlength="6" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="ABC123" required>
      <button class="btn big block" style="margin-top:12px">Rejoindre</button></form>
      <p class="small muted" style="margin:12px 0 0">Pas de compte, juste un pseudo. <a href="#/e">Mes classes et mon classement</a></p>
    </div>
    <div class="card"><h2>Je suis prof</h2><p class="muted">Créez un quiz à la main ou avec l'IA, partagez un code, suivez les résultats en direct.</p>
      <a class="btn ghost block" href="#/prof">Accéder à mon espace prof</a></div>
    ${isStandalone() ? "" : `<p style="text-align:center"><button class="btn line small" id="inst">📲 Installer l'appli sur ce téléphone</button></p>`}
  </main>`;
  on("#inst", "click", installApp);
  on("#f-code", "submit", (e) => { e.preventDefault(); const c = document.getElementById("code").value.trim().toUpperCase(); if (c) go(`#/q/${c}`); });
}

/* ===================== Prof : connexion ===================== */
function profLogin() {
  let mode = "in";
  const render = () => {
    $app.innerHTML = `${banner()}<main class="wrap narrow"><div class="hero"><a class="brand" href="#/" style="justify-content:center"><span class="dot">Q</span>QuizClasse</a></div>
    <div class="card"><h2>${mode === "in" ? "Connexion prof" : "Créer mon compte prof"}</h2>
    <form id="f"><div class="field"><label for="em">E-mail</label><input id="em" type="email" required autocomplete="email"></div>
    <div class="field"><label for="pw">Mot de passe</label><input id="pw" type="password" required minlength="6" autocomplete="${mode === "in" ? "current-password" : "new-password"}"></div>
    <button class="btn block">${mode === "in" ? "Se connecter" : "Créer mon compte"}</button></form>
    <p class="small" style="margin:14px 0 0;text-align:center"><a href="#" id="sw">${mode === "in" ? "Pas encore de compte ? Créer un compte" : "J'ai déjà un compte"}</a></p></div></main>`;
    on("#sw", "click", (e) => { e.preventDefault(); mode = mode === "in" ? "up" : "in"; render(); });
    on("#f", "submit", async (e) => {
      e.preventDefault();
      const em = document.getElementById("em").value.trim(), pw = document.getElementById("pw").value;
      try {
        if (mode === "in") { await api.signIn(em, pw); go("#/prof"); }
        else { const r = await api.signUp(em, pw); if (r.needsConfirm) { toast("Compte créé. Ouvre le lien reçu par e-mail, puis connecte-toi."); mode = "in"; render(); } else go("#/prof"); }
      } catch (err) { toast(errMsg(err)); }
    });
  };
  render();
}

/* ===================== Prof : bibliothèque ===================== */
async function profHome() {
  const [quizzes, classes] = await Promise.all([api.listQuizzes(), api.listClasses()]);
  const subjects = [...new Set(quizzes.map((q) => q.subject).filter(Boolean))].sort();
  let fSubject = "", fClass = "";
  const className = (id) => classes.find((c) => c.id === id)?.name;
  const render = () => {
    const list = quizzes.filter((q) => (!fSubject || q.subject === fSubject) && (!fClass || (q.class_ids || []).includes(fClass)));
    $app.innerHTML = profShell("quiz", `
      <div class="row between"><h1>Mes quiz</h1>
        <div class="row"><a class="btn" href="#/prof/ia">✨ Créer avec l'IA</a><a class="btn ghost" href="#/prof/nouveau">+ Créer à la main</a></div></div>
      ${quizzes.length ? `<div class="row" style="margin:8px 0 16px">
        <select id="fs" style="max-width:220px"><option value="">Toutes les matières</option>${subjects.map((s) => `<option ${s === fSubject ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
        <select id="fc" style="max-width:220px"><option value="">Toutes les classes</option>${classes.map((c) => `<option value="${c.id}" ${c.id === fClass ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>` : ""}
      ${list.length ? `<div class="grid">${list.map((q) => `
        <div class="card stack" style="margin:0">
          <div class="row between"><span class="tag ${q.published ? "ok" : "grey"}">${q.published ? "Ouvert · " + q.code : "Brouillon"}</span>${q.settings?.exam?.enabled ? '<span class="tag warn">Mode examen</span>' : ""}</div>
          <h3 style="margin:0">${esc(q.title)}</h3>
          <div class="small muted">${esc(q.subject || "Sans matière")} · ${q.questions.length} question${q.questions.length > 1 ? "s" : ""}${(q.class_ids || []).length ? " · " + q.class_ids.map(className).filter(Boolean).map(esc).join(", ") : ""}</div>
          <div class="row"><a class="btn small" href="#/prof/quiz/${q.id}/resultats">Résultats</a><a class="btn small ghost" href="#/prof/quiz/${q.id}">Modifier</a>
          <button class="btn small line" data-dup="${q.id}">Dupliquer</button></div>
        </div>`).join("")}</div>`
        : `<div class="card empty">${quizzes.length ? "Aucun quiz avec ces filtres." : "Aucun quiz pour l'instant.<br>Commencez par en créer un, avec l'IA c'est moins d'une minute."}</div>`}`);
    on("#fs", "change", (e) => { fSubject = e.target.value; render(); });
    on("#fc", "change", (e) => { fClass = e.target.value; render(); });
    on("[data-dup]", "click", async (e) => {
      const q = quizzes.find((x) => x.id === e.currentTarget.dataset.dup);
      const copy = await api.saveQuiz({ ...structuredClone(q), id: undefined, code: undefined, title: q.title + " (copie)", published: false });
      toast("Quiz dupliqué."); go(`#/prof/quiz/${copy.id}`);
    });
  };
  render();
}

/* ===================== Prof : éditeur ===================== */
function blankQuestion(type = "single") {
  if (type === "single" || type === "multi") return { id: qid(), type, text: "", choices: ["", "", "", ""], correct: [0], explanation: "" };
  if (type === "tf") return { id: qid(), type, text: "", choices: [], correct: true, explanation: "" };
  return { id: qid(), type: "short", text: "", choices: [], correct: [""], explanation: "" };
}
let draft = null; // quiz en cours de création (IA ou manuel) pas encore enregistré
function newQuiz(fromAi) {
  draft = fromAi || { title: "", subject: "", level: "", questions: [blankQuestion()], settings: defaultSettings(), published: false, class_ids: [] };
  return editQuiz(null);
}

async function editQuiz(id) {
  const classes = await api.listClasses();
  let quiz = id ? await api.getQuiz(id) : draft;
  if (!quiz) return go("#/prof");
  quiz = structuredClone(quiz);
  quiz.settings = { ...defaultSettings(), ...quiz.settings, exam: { ...defaultSettings().exam, ...(quiz.settings?.exam || {}) }, timer: { ...defaultSettings().timer, ...(quiz.settings?.timer || {}) } };
  let dirty = false;
  const markDirty = () => { dirty = true; };
  const beforeUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
  window.addEventListener("beforeunload", beforeUnload);
  setCleanup(() => window.removeEventListener("beforeunload", beforeUnload));

  const qHtml = (q, i) => {
    let body = "";
    if (q.type === "single" || q.type === "multi") {
      body = `<div class="small muted" style="margin-bottom:6px">Cochez ${q.type === "single" ? "la bonne réponse" : "les bonnes réponses"}</div>
        ${q.choices.map((c, j) => `<div class="choice-row">
          <input class="mark" type="${q.type === "single" ? "radio" : "checkbox"}" name="c-${q.id}" data-q="${i}" data-correct="${j}" ${q.correct.includes(j) ? "checked" : ""} aria-label="Bonne réponse ${LETTERS[j]}">
          <input type="text" data-q="${i}" data-choice="${j}" value="${esc(c)}" placeholder="Réponse ${LETTERS[j]}">
          ${q.choices.length > 2 ? `<button class="icon-btn" data-q="${i}" data-delchoice="${j}" title="Retirer">✕</button>` : ""}</div>`).join("")}
        ${q.choices.length < 6 ? `<button class="btn small line" data-q="${i}" data-addchoice>+ Ajouter une réponse</button>` : ""}`;
    } else if (q.type === "tf") {
      body = `<div class="row"><label class="check"><input type="radio" name="tf-${q.id}" data-q="${i}" data-tf="1" ${q.correct === true ? "checked" : ""}> Vrai</label>
        <label class="check"><input type="radio" name="tf-${q.id}" data-q="${i}" data-tf="0" ${q.correct === false ? "checked" : ""}> Faux</label></div>`;
    } else {
      body = `<label class="small">Réponses acceptées (une par ligne, majuscules et accents ignorés)</label>
        <textarea data-q="${i}" data-short style="min-height:70px">${esc(q.correct.join("\n"))}</textarea>`;
    }
    return `<div class="card q-card"><div class="q-head"><strong>Question ${i + 1}</strong>
      <div class="row"><select data-q="${i}" data-type style="width:auto">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === q.type ? "selected" : ""}>${v}</option>`).join("")}</select>
      ${i > 0 ? `<button class="icon-btn" data-up="${i}" title="Monter">↑</button>` : ""}
      <button class="icon-btn" data-delq="${i}" title="Supprimer la question">🗑</button></div></div>
      <div class="field"><input type="text" data-q="${i}" data-text value="${esc(q.text)}" placeholder="Écrivez la question"></div>
      ${body}
      <div class="field" style="margin:12px 0 0"><input type="text" data-q="${i}" data-expl value="${esc(q.explanation)}" placeholder="Explication affichée après (facultatif)"></div></div>`;
  };

  const render = () => {
    const s = quiz.settings;
    $app.innerHTML = profShell("quiz", `
      <div class="row between"><h1>${id ? "Modifier le quiz" : "Nouveau quiz"}</h1>
        <div class="row">${id ? `<button class="btn danger small" id="del">Supprimer</button>` : ""}<button class="btn line" id="save-draft">Enregistrer en brouillon</button><button class="btn" id="save-pub">${quiz.published ? "Enregistrer" : "Enregistrer et ouvrir"}</button></div></div>
      ${draft && !id && draft._fromAi ? `<div class="note" style="margin-bottom:16px">✨ Quiz proposé par l'IA. Relisez chaque question, corrigez ou supprimez avant d'ouvrir le quiz aux élèves.</div>` : ""}
      <div class="card"><div class="grid" style="grid-template-columns:2fr 1fr 1fr">
        <div><label for="t">Titre</label><input id="t" type="text" value="${esc(quiz.title)}" placeholder="Ex. La Révolution française"></div>
        <div><label for="sub">Matière</label><input id="sub" type="text" value="${esc(quiz.subject)}" placeholder="Histoire"></div>
        <div><label for="lvl">Niveau</label><input id="lvl" type="text" value="${esc(quiz.level)}" placeholder="4e"></div></div></div>
      <div id="qs">${quiz.questions.map(qHtml).join("")}</div>
      <div class="row" style="margin-bottom:24px">${Object.entries(TYPES).map(([k, v]) => `<button class="btn ghost small" data-addq="${k}">+ ${v}</button>`).join("")}</div>

      <div class="card"><h2>Pour qui ?</h2>
        ${classes.length ? classes.map((c) => `<label class="check"><input type="checkbox" data-class="${c.id}" ${(quiz.class_ids || []).includes(c.id) ? "checked" : ""}> ${esc(c.name)}</label>`).join("")
          + `<p class="small muted" style="margin:6px 0 0">Les élèves choisiront leur classe et leur pseudo. Leurs points comptent dans le classement de la classe.</p>`
          : `<p class="muted">Aucune classe : le quiz sera ouvert à tous ceux qui ont le code. <a href="#/prof/classes">Créer une classe</a></p>`}</div>

      <div class="card"><h2>Réglages</h2>
        <label class="check"><input type="checkbox" id="s-corr" ${s.showCorrections ? "checked" : ""}> Montrer les corrections aux élèves à la fin</label>
        <label class="check"><input type="checkbox" id="s-shuf" ${s.shuffle ? "checked" : ""}> Mélanger l'ordre des questions</label>
        <div class="field" style="margin-top:12px"><label for="s-timer">Minuteur</label>
          <div class="row"><select id="s-timer" style="max-width:260px"><option value="none" ${s.timer.mode === "none" ? "selected" : ""}>Pas de minuteur</option><option value="total" ${s.timer.mode === "total" ? "selected" : ""}>Temps total pour le quiz</option><option value="question" ${s.timer.mode === "question" ? "selected" : ""}>Temps par question</option></select>
          ${s.timer.mode !== "none" ? `<input id="s-sec" type="number" min="5" max="7200" value="${s.timer.mode === "total" ? Math.round(s.timer.seconds / 60) : s.timer.seconds}" style="max-width:110px"> <span class="muted">${s.timer.mode === "total" ? "minutes" : "secondes"}</span>` : ""}</div></div>
        <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
        <label class="check"><input type="checkbox" id="s-exam" ${s.exam.enabled ? "checked" : ""}> <strong>Mode examen</strong></label>
        ${s.exam.enabled ? `<div style="margin-left:30px">
          <p class="small muted">Le quiz s'ouvre en plein écran, sans copier-coller ni clic droit. Si l'élève quitte la page :</p>
          <label class="check"><input type="radio" name="leave" value="lock" ${s.exam.onLeave === "lock" ? "checked" : ""}> Verrouiller le quiz (vous le débloquez depuis l'écran des résultats)</label>
          <label class="check"><input type="radio" name="leave" value="flag" ${s.exam.onLeave === "flag" ? "checked" : ""}> Seulement le signaler</label>
          <div class="note warn" style="margin-top:8px">À savoir : une appli web ne peut pas empêcher un téléphone de changer d'application. Elle le détecte et réagit (verrouillage ou signalement). Vous voyez chaque sortie en direct.</div></div>` : ""}
      </div>`);
    bind();
  };

  const bind = () => {
    const val = (sel) => $app.querySelector(sel)?.value ?? "";
    on("#t", "input", (e) => { quiz.title = e.target.value; markDirty(); });
    on("#sub", "input", (e) => { quiz.subject = e.target.value; markDirty(); });
    on("#lvl", "input", (e) => { quiz.level = e.target.value; markDirty(); });
    on("[data-text]", "input", (e) => { quiz.questions[e.target.dataset.q].text = e.target.value; markDirty(); });
    on("[data-expl]", "input", (e) => { quiz.questions[e.target.dataset.q].explanation = e.target.value; markDirty(); });
    on("[data-choice]", "input", (e) => { quiz.questions[e.target.dataset.q].choices[+e.target.dataset.choice] = e.target.value; markDirty(); });
    on("[data-short]", "input", (e) => { quiz.questions[e.target.dataset.q].correct = e.target.value.split("\n"); markDirty(); });
    on("[data-tf]", "change", (e) => { quiz.questions[e.target.dataset.q].correct = e.target.dataset.tf === "1"; markDirty(); });
    on("[data-correct]", "change", (e) => {
      const q = quiz.questions[e.target.dataset.q], j = +e.target.dataset.correct;
      if (q.type === "single") q.correct = [j];
      else q.correct = e.target.checked ? [...new Set([...q.correct, j])] : q.correct.filter((x) => x !== j);
      markDirty();
    });
    on("[data-addchoice]", "click", (e) => { quiz.questions[e.target.dataset.q].choices.push(""); markDirty(); render(); });
    on("[data-delchoice]", "click", (e) => {
      const q = quiz.questions[e.target.dataset.q], j = +e.target.dataset.delchoice;
      q.choices.splice(j, 1); q.correct = q.correct.filter((x) => x !== j).map((x) => (x > j ? x - 1 : x));
      if (!q.correct.length) q.correct = [0];
      markDirty(); render();
    });
    on("[data-type]", "change", (e) => {
      const i = +e.target.dataset.q, old = quiz.questions[i], n = blankQuestion(e.target.value);
      n.text = old.text; n.explanation = old.explanation; n.id = old.id;
      if ((n.type === "single" || n.type === "multi") && old.choices?.length) { n.choices = old.choices; n.correct = n.type === "single" ? [old.correct?.[0] ?? 0] : old.correct; }
      quiz.questions[i] = n; markDirty(); render();
    });
    on("[data-delq]", "click", (e) => { quiz.questions.splice(+e.currentTarget.dataset.delq, 1); markDirty(); render(); });
    on("[data-up]", "click", (e) => { const i = +e.currentTarget.dataset.up; [quiz.questions[i - 1], quiz.questions[i]] = [quiz.questions[i], quiz.questions[i - 1]]; markDirty(); render(); });
    on("[data-addq]", "click", (e) => { quiz.questions.push(blankQuestion(e.target.dataset.addq)); markDirty(); render(); $app.querySelectorAll("[data-text]").forEach((x, i, all) => i === all.length - 1 && x.focus()); });
    on("[data-class]", "change", (e) => { const c = e.target.dataset.class; quiz.class_ids = e.target.checked ? [...(quiz.class_ids || []), c] : quiz.class_ids.filter((x) => x !== c); markDirty(); });
    on("#s-corr", "change", (e) => { quiz.settings.showCorrections = e.target.checked; markDirty(); });
    on("#s-shuf", "change", (e) => { quiz.settings.shuffle = e.target.checked; markDirty(); });
    on("#s-timer", "change", (e) => { quiz.settings.timer.mode = e.target.value; quiz.settings.timer.seconds = e.target.value === "total" ? 600 : 30; markDirty(); render(); });
    on("#s-sec", "input", (e) => { const v = Math.max(1, +e.target.value || 1); quiz.settings.timer.seconds = quiz.settings.timer.mode === "total" ? v * 60 : v; markDirty(); });
    on("#s-exam", "change", (e) => { quiz.settings.exam.enabled = e.target.checked; markDirty(); render(); });
    on("[name=leave]", "change", (e) => { quiz.settings.exam.onLeave = e.target.value; markDirty(); });
    on("#del", "click", async () => {
      if (!confirm("Supprimer ce quiz et tous ses résultats ?")) return;
      await api.deleteQuiz(id); dirty = false; toast("Quiz supprimé."); go("#/prof");
    });
    const save = async (publish) => {
      const problems = validate(quiz);
      if (problems.length) return toast(problems[0]);
      quiz.title = quiz.title.trim() || "Quiz sans titre";
      quiz.questions.forEach((q) => { if (q.type === "short") q.correct = q.correct.map((s) => s.trim()).filter(Boolean); });
      if (publish) quiz.published = true;
      const { _fromAi, ...clean } = quiz;
      try {
        const saved = await api.saveQuiz(clean);
        dirty = false; draft = null;
        toast(publish ? `Quiz ouvert. Code : ${saved.code}` : "Enregistré.");
        go(publish ? `#/prof/quiz/${saved.id}/resultats` : `#/prof/quiz/${saved.id}`);
        if (!publish && id) render();
      } catch (e) { toast(errMsg(e)); }
    };
    on("#save-draft", "click", () => save(false));
    on("#save-pub", "click", () => save(true));
    void val;
  };
  render();
}
function validate(quiz) {
  const out = [];
  if (!quiz.questions.length) out.push("Ajoutez au moins une question.");
  quiz.questions.forEach((q, i) => {
    const n = `Question ${i + 1} : `;
    if (!q.text.trim()) out.push(n + "le texte est vide.");
    if (q.type === "single" || q.type === "multi") {
      if (q.choices.some((c) => !c.trim())) out.push(n + "une réponse est vide (remplissez-la ou retirez-la).");
      if (!q.correct.length) out.push(n + "cochez au moins une bonne réponse.");
    }
    if (q.type === "short" && !q.correct.some((s) => s.trim())) out.push(n + "indiquez au moins une réponse acceptée.");
  });
  return out;
}

/* ===================== Prof : création IA ===================== */
function aiPage() {
  const ready = aiSettings.ready();
  $app.innerHTML = profShell("quiz", `<div class="narrow" style="margin:0 auto">
    <h1>✨ Créer un quiz avec l'IA</h1>
    ${ready ? "" : `<div class="note warn" style="margin-bottom:16px">Aucune clé d'IA n'est réglée. <a href="#/prof/reglages">Ajouter une clé</a> (gratuit avec Gemini), ou <a href="#/prof/nouveau">créer le quiz à la main</a>.</div>`}
    <form id="f" class="card">
      <label>Votre cours <span class="muted small">(facultatif)</span></label>
      <div class="drop" id="drop" tabindex="0" role="button" aria-label="Déposer ou choisir un fichier de cours">
        <div class="drop-ico">📄</div>
        <strong>Glissez votre cours ici</strong>
        <span class="small muted">ou touchez pour choisir · PDF, Word, PowerPoint, OpenDocument, texte</span>
        <input type="file" id="file" accept="${ACCEPT}" multiple hidden>
      </div>
      ${ONLINE ? `<div class="row link-row"><input id="lnk" type="url" placeholder="ou un lien Google Docs" aria-label="Lien Google Docs ou Google Slides"><button type="button" class="btn line" id="addLnk">Ajouter</button></div>` : ""}
      <div id="docs"></div>
      <div class="field" style="margin-top:14px"><label for="src" id="srcLbl">Ou collez un cours, un texte, ou écrivez juste un thème</label>
        <textarea id="src" placeholder="Ex. La Révolution française, niveau 4e&#10;ou collez ici le texte de votre cours…" style="min-height:140px"></textarea></div>
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr">
        <div class="field"><label for="n">Questions</label><select id="n">${[5, 8, 10, 15, 20].map((n) => `<option ${n === 10 ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="field"><label for="d">Difficulté</label><select id="d"><option>facile</option><option selected>moyenne</option><option>difficile</option></select></div>
        <div class="field"><label for="lv">Niveau</label><input id="lv" type="text" placeholder="4e, BTS…"></div></div>
      <label>Types de questions</label>
      <div class="row">${Object.entries(TYPES).map(([k, v]) => `<label class="check"><input type="checkbox" data-t="${k}" ${k !== "multi" ? "checked" : ""}> ${v}</label>`).join("")}</div>
      <button class="btn big block" id="go" style="margin-top:16px" ${ready ? "" : "disabled"}>Générer le quiz</button>
      <p class="small muted" style="margin:10px 0 0;text-align:center">L'IA propose, vous relisez. Rien n'est envoyé aux élèves avant votre validation.</p>
    </form></div>`);
  // Documents chargés : { name, text }. Le texte reste dans la page, rien n'est stocké.
  const docs = [];
  const $docs = document.getElementById("docs"), $drop = document.getElementById("drop"), $file = document.getElementById("file");
  const total = () => docs.reduce((n, d) => n + d.text.length, 0);
  const renderDocs = () => {
    const t = total();
    $docs.innerHTML = docs.length ? `<div class="doc-list">${docs.map((d, i) => `<div class="doc">
        <span class="doc-name">${d.loading ? `<span class="spinner"></span>` : "📄"} ${esc(d.name)}</span>
        <span class="small muted">${d.loading ? "lecture…" : `${Math.max(1, Math.round(d.text.length / 2000))} p.`}</span>
        ${d.loading ? "" : `<button type="button" class="doc-x" data-rm="${i}" aria-label="Retirer ${esc(d.name)}">✕</button>`}</div>`).join("")}</div>
      ${t > MAX_SOURCE ? `<div class="note warn small">Documents longs (≈ ${Math.round(t / 2000)} pages) : l'IA n'en lira que les ${Math.round(MAX_SOURCE / 2000)} premières pages. Retirez un fichier ou gardez le chapitre utile.</div>`
        : `<p class="small muted" style="margin:6px 0 0">L'IA ne posera que des questions dont la réponse est dans ces documents.</p>`}` : "";
    document.getElementById("srcLbl").textContent = docs.length ? "Consignes pour l'IA (facultatif)" : "Ou collez un cours, un texte, ou écrivez juste un thème";
    document.getElementById("src").placeholder = docs.length ? "Ex. Insiste sur le chapitre 2, évite les dates…" : "Ex. La Révolution française, niveau 4e\nou collez ici le texte de votre cours…";
    on("[data-rm]", "click", (e) => { docs.splice(+e.currentTarget.dataset.rm, 1); renderDocs(); }, $docs);
  };
  const addDoc = async (name, read) => {
    const d = { name, text: "", loading: true };
    docs.push(d); renderDocs();
    try { d.text = await read(); d.loading = false; }
    catch (err) { docs.splice(docs.indexOf(d), 1); toast(errMsg(err)); }
    renderDocs();
  };
  const addFiles = (files) => [...files].forEach((f) => addDoc(f.name, () => readFile(f)));
  $drop.addEventListener("click", () => $file.click());
  $drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $file.click(); } });
  $file.addEventListener("change", () => { addFiles($file.files); $file.value = ""; });
  const form = document.getElementById("f");
  form.addEventListener("dragover", (e) => { e.preventDefault(); $drop.classList.add("over"); });
  form.addEventListener("dragleave", (e) => { if (!form.contains(e.relatedTarget)) $drop.classList.remove("over"); });
  form.addEventListener("drop", (e) => {
    e.preventDefault(); $drop.classList.remove("over");
    if (e.dataTransfer.files.length) return addFiles(e.dataTransfer.files);
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (isGoogleLink(url)) addDoc("Document Google", () => readLink(url));
  });
  const addLink = () => {
    const $l = document.getElementById("lnk"), url = $l.value.trim();
    if (!url) return;
    if (!isGoogleLink(url)) return toast("Collez un lien Google Docs ou Google Slides (docs.google.com/…).");
    $l.value = "";
    addDoc(/presentation/.test(url) ? "Présentation Google" : "Document Google", () => readLink(url));
  };
  on("#addLnk", "click", addLink);
  on("#lnk", "keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } });

  on("#f", "submit", async (e) => {
    e.preventDefault();
    const types = [...$app.querySelectorAll("[data-t]:checked")].map((x) => x.dataset.t);
    if (!types.length) return toast("Choisissez au moins un type de question.");
    if (docs.some((d) => d.loading)) return toast("Patientez, la lecture du document n'est pas finie.");
    const extra = document.getElementById("src").value.trim();
    if (!docs.length && !extra) return toast("Déposez un cours, collez un texte ou écrivez un thème.");
    // Texte des documents d'abord, consignes du prof ensuite (elles ne doivent pas être coupées par la limite).
    const course = docs.map((d) => `=== ${d.name} ===\n${d.text}`).join("\n\n");
    const source = docs.length
      ? (extra ? `Consignes du prof : ${extra}\n\n` : "") + course.slice(0, MAX_SOURCE - extra.length - 30)
      : extra;
    const btn = document.getElementById("go");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> L'IA rédige le quiz…`;
    try {
      const level = document.getElementById("lv").value.trim();
      const res = await generateQuiz({ source, count: +document.getElementById("n").value, difficulty: document.getElementById("d").value, types, level });
      if (res.remaining !== null) toast(res.remaining > 0 ? `IA incluse : encore ${res.remaining} quiz aujourd'hui.` : "C'était votre dernier quiz IA inclus aujourd'hui.");
      newQuiz({ title: res.title, subject: "", level, questions: res.questions, settings: defaultSettings(), published: false, class_ids: [], _fromAi: true });
    } catch (err) { toast(errMsg(err)); btn.disabled = false; btn.textContent = "Générer le quiz"; }
  });
}

/* ===================== Prof : réglages ===================== */
function settingsPage() {
  const s = aiSettings.get();
  $app.innerHTML = profShell("reglages", `<div class="narrow" style="margin:0 auto"><h1>Réglages</h1>
    <form id="f" class="card"><h2>IA</h2>
      <p class="muted small">${ONLINE
        ? `<strong>L'IA est incluse</strong>, rien à régler (nombre de quiz IA limité par jour). Pour ne plus avoir de limite, vous pouvez ajouter votre propre clé ci-dessous : elle reste sur cet appareil.`
        : `Sans clé, tout fonctionne en mode manuel. La clé reste sur cet appareil.`}</p>
      <div class="field"><label for="p">Fournisseur</label><select id="p">
        <option value="gemini" ${s.provider === "gemini" ? "selected" : ""}>Google Gemini (offre gratuite)</option>
        <option value="claude" ${s.provider === "claude" ? "selected" : ""}>Claude (Anthropic, payant à l'usage)</option></select></div>
      <div class="field"><label for="k">Clé d'API${ONLINE ? " (facultatif)" : ""}</label><input id="k" type="password" value="${esc(s.key)}" autocomplete="off" placeholder="Collez votre clé ici"></div>
      <p class="small muted" id="help"></p>
      <div class="row"><button class="btn">Enregistrer</button>${s.key ? `<button type="button" class="btn line" id="rm">Retirer la clé</button>` : ""}</div>
    </form>
    <div class="card"><h2>Installer l'appli</h2><p class="muted small">Sur téléphone : menu du navigateur → « Ajouter à l'écran d'accueil ». Sur ordinateur : l'icône d'installation dans la barre d'adresse.</p>
      <button class="btn ghost" id="inst">📲 Installer l'appli</button></div>
    <div class="card"><h2>Données</h2><p class="muted small">Mode actuel : <strong>${ONLINE ? "en ligne (Supabase)" : "démo locale (ce navigateur uniquement)"}</strong>. Les élèves ne donnent qu'un pseudo : aucun nom, aucun e-mail.</p></div></div>`);
  const help = () => {
    document.getElementById("help").innerHTML = document.getElementById("p").value === "gemini"
      ? `Clé gratuite sur <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> (compte Google, pas de carte bancaire).`
      : `Clé sur <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. Coût : quelques centimes par quiz.`;
  };
  help();
  on("#p", "change", help);
  on("#f", "submit", (e) => { e.preventDefault(); aiSettings.set({ provider: document.getElementById("p").value, key: document.getElementById("k").value.trim() }); toast("Réglages enregistrés."); settingsPage(); });
  on("#rm", "click", () => { aiSettings.set({ provider: s.provider, key: "" }); toast("Clé retirée."); settingsPage(); });
  on("#inst", "click", installApp);
}

/* ===================== Installation (PWA) ===================== */
// Chrome/Edge/Android proposent l'installation directe (beforeinstallprompt).
// Safari (iPhone/iPad) et certains navigateurs ne le permettent pas : on explique la marche à suivre.
let installEvt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; });
window.addEventListener("appinstalled", () => { installEvt = null; toast("QuizClasse est installée sur l'écran d'accueil."); });
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
async function installApp() {
  if (isStandalone()) return toast("L'appli est déjà installée : vous l'utilisez en ce moment.");
  if (installEvt) {
    const evt = installEvt; installEvt = null;
    evt.prompt();
    const { outcome } = await evt.userChoice.catch(() => ({}));
    if (outcome === "dismissed") installEvt = evt;
    return;
  }
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const how = ios
    ? (/CriOS|FxiOS|EdgiOS/.test(ua)
      ? `Ouvrez cette page dans <strong>Safari</strong>, puis touchez <strong>Partager</strong> (le carré avec une flèche) → <strong>Sur l'écran d'accueil</strong> → Ajouter.`
      : `Touchez <strong>Partager</strong> (le carré avec une flèche, en bas de l'écran) → <strong>Sur l'écran d'accueil</strong> → Ajouter.`)
    : /Android/.test(ua)
      ? `Touchez le menu <strong>⋮</strong> en haut à droite → <strong>Installer l'application</strong> (ou « Ajouter à l'écran d'accueil »).`
      : `Cliquez sur l'icône d'installation à droite de la barre d'adresse (un écran avec une flèche), ou menu <strong>⋮</strong> → <strong>Installer QuizClasse</strong>.`;
  const box = document.createElement("div");
  box.className = "modal";
  box.innerHTML = `<div class="card modal-card" role="dialog" aria-modal="true" aria-label="Installer l'appli">
    <h2>📲 Installer QuizClasse</h2><p>${how}</p>
    <p class="small muted">L'icône QuizClasse apparaît ensuite avec vos autres applis et s'ouvre en plein écran.</p>
    <button class="btn block" id="ok-inst">J'ai compris</button></div>`;
  document.body.append(box);
  const close = () => box.remove();
  box.addEventListener("click", (e) => { if (e.target === box || e.target.id === "ok-inst") close(); });
}

/* ===================== Prof : résultats en direct ===================== */
async function results(id) {
  const quiz = await api.getQuiz(id);
  if (!quiz) return go("#/prof");
  const classes = await api.listClasses();
  const qClasses = classes.filter((c) => (quiz.class_ids || []).includes(c.id));
  let tab = "live", fClass = "";
  const link = `${location.origin}${location.pathname}?code=${quiz.code}`;

  const render = async () => {
    const all = await api.listAttempts(id);
    const atts = all.filter((a) => !fClass || a.class_id === fClass);
    const done = atts.filter((a) => a.status === "finished");
    const avg = done.length ? done.reduce((s, a) => s + a.score, 0) / done.length : 0;
    const n = quiz.questions.length;
    const statusTag = (a) => a.status === "finished" ? `<span class="tag ok">Terminé</span>` : a.status === "locked" ? `<span class="tag bad">🔒 Verrouillé</span>` : `<span class="tag">En cours</span>`;
    const dur = (a) => a.finished_at ? (new Date(a.finished_at) - new Date(a.started_at)) / 1000 : null;
    const ranked = [...done].sort((a, b) => b.score - a.score || dur(a) - dur(b));
    const cname = (cid) => classes.find((c) => c.id === cid)?.name || "";

    let body = "";
    if (tab === "live") {
      const sorted = [...atts].sort((a, b) => (a.status === "locked" ? -1 : 0) - (b.status === "locked" ? -1 : 0) || a.pseudo.localeCompare(b.pseudo));
      body = sorted.length ? `<div class="table-wrap"><table><thead><tr><th>Pseudo</th>${qClasses.length > 1 ? "<th>Classe</th>" : ""}<th>Avancée</th><th>Note</th><th>Sorties de page</th><th>État</th><th></th></tr></thead><tbody>
        ${sorted.map((a) => `<tr><td><strong>${esc(a.pseudo)}</strong></td>${qClasses.length > 1 ? `<td>${esc(cname(a.class_id))}</td>` : ""}
          <td>${Object.keys(a.answers).length}/${n}</td><td>${a.status === "finished" ? `${a.score}/${a.max_score}` : "–"}</td>
          <td>${a.leaves ? `<span class="tag warn" title="${esc((a.leave_log || []).map((l) => `question ${l.q + 1} à ${new Date(l.at).toLocaleTimeString("fr-FR")}`).join(", "))}">${a.leaves} · Q${(a.leave_log || []).map((l) => l.q + 1).join(", Q")}</span>` : "0"}</td>
          <td>${statusTag(a)}</td><td>${a.status === "locked" ? `<button class="btn small" data-unlock="${a.id}">Débloquer</button>` : ""}</td></tr>`).join("")}
        </tbody></table></div>` : `<div class="empty">En attente des élèves… Donnez-leur le code ci-dessus.</div>`;
    } else if (tab === "questions") {
      body = quiz.questions.map((q, i) => {
        const answered = atts.filter((a) => a.answers[q.id]);
        const ok = answered.filter((a) => a.answers[q.id].ok).length;
        const p = pct(ok, answered.length);
        const col = p >= 70 ? "var(--ok)" : p >= 40 ? "var(--warn)" : "var(--bad)";
        return `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div style="flex:1;min-width:200px"><strong>${i + 1}.</strong> ${esc(q.text)}</div>
          <div class="row" style="min-width:200px"><div class="bar" style="flex:1"><i style="width:${p}%;background:${col}"></i></div><strong style="width:48px;text-align:right">${answered.length ? p + "%" : "–"}</strong><span class="small muted">${ok}/${answered.length}</span></div></div>`;
      }).join("") + `<p class="small muted" style="margin-top:12px">En rouge : les questions les moins réussies, à revoir en classe.</p>`;
    } else {
      body = ranked.length ? podium(ranked.map((a) => ({ pseudo: a.pseudo, score: a.score, max: a.max_score, duration: dur(a) }))) + rankTable(ranked.map((a, i) => ({ rank: i + 1, pseudo: a.pseudo, score: a.score, max: a.max_score, duration: dur(a) })), true)
        : `<div class="empty">Le classement apparaît dès que des élèves ont fini.</div>`;
    }

    $app.innerHTML = profShell("quiz", `
      <div class="row between"><div><a href="#/prof" class="small">← Mes quiz</a><h1 style="margin-top:4px">${esc(quiz.title)}</h1></div>
        <div class="row"><a class="btn line small" href="#/prof/quiz/${id}">Modifier</a><button class="btn line small" id="csv">Exporter (CSV)</button><button class="btn danger small" id="wipe">Effacer les résultats</button></div></div>
      ${quiz.published ? `<div class="card" style="text-align:center">
        <div class="muted">Code à donner aux élèves</div><div class="code-big">${quiz.code}</div>
        <div class="small muted">ou le lien <a href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a> <button class="btn small ghost" id="copy">Copier le lien</button></div>
        ${quiz.settings?.exam?.enabled ? `<div class="note warn" style="margin-top:12px;text-align:left">Mode examen actif : ${quiz.settings.exam.onLeave === "lock" ? "un élève qui quitte la page est verrouillé jusqu'à ce que vous cliquiez sur « Débloquer »." : "les sorties de page sont signalées ci-dessous."}</div>` : ""}
        <div class="row" style="justify-content:center;margin-top:12px"><button class="btn small line" id="close">Fermer le quiz</button></div></div>`
        : `<div class="card note warn">Ce quiz est fermé : les élèves ne peuvent pas le rejoindre. <button class="btn small" id="open">Ouvrir le quiz</button></div>`}
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-bottom:16px">
        <div class="card" style="margin:0"><div class="muted small">Participants</div><div style="font-size:1.8rem;font-weight:700">${atts.length}</div></div>
        <div class="card" style="margin:0"><div class="muted small">Ont terminé</div><div style="font-size:1.8rem;font-weight:700">${done.length}</div></div>
        <div class="card" style="margin:0"><div class="muted small">Moyenne</div><div style="font-size:1.8rem;font-weight:700">${done.length ? `${avg.toFixed(1)}/${n}` : "–"}</div></div>
        <div class="card" style="margin:0"><div class="muted small">Verrouillés</div><div style="font-size:1.8rem;font-weight:700;color:${atts.some((a) => a.status === "locked") ? "var(--bad)" : "inherit"}">${atts.filter((a) => a.status === "locked").length}</div></div></div>
      <div class="row between"><div class="tabs">${[["live", "Élèves en direct"], ["questions", "Réussite par question"], ["rank", "Classement"]].map(([k, v]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${v}</button>`).join("")}</div>
        ${qClasses.length > 1 ? `<select id="fc" style="max-width:200px;margin-bottom:16px"><option value="">Toutes les classes</option>${qClasses.map((c) => `<option value="${c.id}" ${fClass === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>` : ""}</div>
      <div class="card">${body}</div>`);

    on("[data-tab]", "click", (e) => { tab = e.target.dataset.tab; render(); });
    on("#fc", "change", (e) => { fClass = e.target.value; render(); });
    on("[data-unlock]", "click", async (e) => { await api.unlockAttempt(e.target.dataset.unlock); toast("Élève débloqué."); render(); });
    on("#copy", "click", async () => { try { await navigator.clipboard.writeText(link); toast("Lien copié."); } catch { toast(link); } });
    on("#close", "click", async () => { quiz.published = false; await api.saveQuiz(quiz); toast("Quiz fermé."); render(); });
    on("#open", "click", async () => { quiz.published = true; await api.saveQuiz(quiz); toast("Quiz ouvert."); render(); });
    on("#wipe", "click", async () => { if (!confirm("Effacer toutes les réponses des élèves pour ce quiz ? C'est définitif.")) return; await api.deleteAttempts(id); toast("Résultats effacés."); render(); });
    on("#csv", "click", () => exportCsv(quiz, atts, cname));
  };
  await render();
  every(3000, () => { if (!document.hidden && !document.activeElement?.matches("select")) render(); });
}
function exportCsv(quiz, atts, cname) {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Pseudo", "Classe", "Note", "Sur", "Statut", "Sorties de page", "Début", "Fin", ...quiz.questions.map((q, i) => `Q${i + 1}`)];
  const rows = atts.map((a) => [a.pseudo, cname(a.class_id), a.score, a.max_score, a.status === "finished" ? "terminé" : a.status === "locked" ? "verrouillé" : "en cours", a.leaves,
    new Date(a.started_at).toLocaleString("fr-FR"), a.finished_at ? new Date(a.finished_at).toLocaleString("fr-FR") : "",
    ...quiz.questions.map((q) => (a.answers[q.id] ? (a.answers[q.id].ok ? "1" : "0") : ""))]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${quiz.title.replace(/[^\w\- ]+/g, "").trim() || "quiz"}-resultats.csv` });
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ===================== Classement (partagé) ===================== */
function podium(rows) {
  const top = rows.slice(0, 3);
  if (top.length < 1) return "";
  const step = (r, cls, medal) => r ? `<div class="step ${cls}"><span class="medal">${medal}</span><span class="name">${esc(r.pseudo)}</span><span class="pts">${r.score}${r.max ? "/" + r.max : " pts"}</span></div>` : "<div></div>";
  return `<div class="podium">${step(top[1], "p2", "🥈")}${step(top[0], "p1", "🥇")}${step(top[2], "p3", "🥉")}</div>`;
}
function rankTable(rows, withTime, quizzesCol) {
  return `<div class="table-wrap"><table><thead><tr><th>Rang</th><th>Pseudo</th><th>${quizzesCol ? "Points" : "Note"}</th>${quizzesCol ? "<th>Quiz faits</th>" : ""}${withTime ? "<th>Temps</th>" : ""}</tr></thead><tbody>
    ${rows.map((r) => `<tr class="${r.isMe ? "me" : ""}"><td>${r.rank}</td><td>${esc(r.pseudo)}${r.isMe ? " (toi)" : ""}</td><td>${r.score}${r.max ? "/" + r.max : ""}</td>${quizzesCol ? `<td>${r.quizzes}</td>` : ""}${withTime ? `<td>${fmtTime(r.duration)}</td>` : ""}</tr>`).join("")}
  </tbody></table></div>`;
}
function studentBoard(lb, quizzesCol) {
  const vis = lb.visibility;
  let html = "";
  if (vis !== "self") html += podium(lb.rows);
  if (vis === "full") html += rankTable(lb.rows, !quizzesCol, quizzesCol);
  if (vis === "top3" && lb.rows.length) html += rankTable(lb.rows, !quizzesCol, quizzesCol);
  if (lb.me && (vis !== "full")) html += `<div class="note" style="margin-top:12px;text-align:center">Ta place : <strong>${lb.me.rank}<sup>${lb.me.rank === 1 ? "er" : "e"}</sup></strong> avec ${lb.me.score}${lb.me.max ? "/" + lb.me.max : " points"}</div>`;
  if (!lb.rows.length && !lb.me) html += `<div class="empty">Pas encore de classement.</div>`;
  return html;
}

/* ===================== Prof : classes ===================== */
async function classesPage() {
  const classes = await api.listClasses();
  $app.innerHTML = profShell("classes", `<h1>Mes classes</h1>
    <form id="f" class="card row"><input id="nm" type="text" placeholder="Nom de la classe, ex. 2nde B" required style="flex:1;min-width:200px"><button class="btn">Créer la classe</button></form>
    ${classes.length ? `<div class="grid">${classes.map((c) => `<a class="card" href="#/prof/classe/${c.id}" style="text-decoration:none;color:inherit;margin:0">
      <h3>${esc(c.name)}</h3><div class="muted small">Code de la classe</div><div style="font-size:1.4rem;font-weight:700;letter-spacing:.1em;color:var(--primary)">${c.code}</div></a>`).join("")}</div>`
      : `<div class="card empty">Créez une classe pour suivre les élèves d'un quiz à l'autre et afficher un classement général.</div>`}`);
  on("#f", "submit", async (e) => { e.preventDefault(); const c = await api.saveClass({ name: document.getElementById("nm").value.trim() }); toast(`Classe créée. Code : ${c.code}`); classesPage(); });
}

async function classPage(id) {
  const classes = await api.listClasses();
  const cl = classes.find((c) => c.id === id);
  if (!cl) return go("#/prof/classes");
  const render = async () => {
    const [members, atts, quizzes] = await Promise.all([api.listMembers(id), api.listClassAttempts(id), api.listQuizzes()]);
    const since = cl.reset_at || "";
    const done = atts.filter((a) => a.status === "finished");
    const dur = (a) => (new Date(a.finished_at) - new Date(a.started_at)) / 1000;
    const rows = members.map((m) => {
      const mine = done.filter((a) => a.member_id === m.id && a.finished_at >= since);
      return { id: m.id, pseudo: m.pseudo, score: mine.reduce((s, a) => s + a.score, 0), quizzes: mine.length, duration: mine.reduce((s, a) => s + dur(a), 0) };
    }).sort((a, b) => b.score - a.score || a.duration - b.duration);
    rows.forEach((r, i) => (r.rank = i + 1));
    const perQuiz = quizzes.filter((q) => done.some((a) => a.quiz_id === q.id))
      .map((q) => { const d = done.filter((a) => a.quiz_id === q.id); return { q, avg: d.reduce((s, a) => s + a.score / a.max_score, 0) / d.length, n: d.length, date: d.map((a) => a.finished_at).sort()[0] }; })
      .sort((a, b) => a.date.localeCompare(b.date));

    $app.innerHTML = profShell("classes", `<a href="#/prof/classes" class="small">← Mes classes</a>
      <div class="row between"><h1 style="margin-top:4px">${esc(cl.name)}</h1><button class="btn danger small" id="delc">Supprimer la classe</button></div>
      <div class="card row between"><div><div class="muted small">Code de la classe (à donner une seule fois)</div><div class="code-big" style="font-size:2.2rem">${cl.code}</div></div>
        <div class="small muted" style="max-width:360px">Les élèves le tapent dans « Mon espace » → « Rejoindre une classe ». Leur pseudo est réservé dans la classe, ils retrouvent leurs points d'un quiz à l'autre.</div></div>

      <div class="card"><h2>Moyenne de la classe par quiz</h2>${perQuiz.length ? evolutionChart(perQuiz) : `<p class="muted">Aucun quiz terminé pour l'instant.</p>`}</div>

      <div class="card"><div class="row between"><h2>Classement général</h2>
        <div class="row"><label for="vis" class="small muted" style="margin:0">Les élèves voient</label>
        <select id="vis" style="width:auto"><option value="full" ${cl.visibility === "full" ? "selected" : ""}>Le classement complet</option><option value="top3" ${cl.visibility === "top3" ? "selected" : ""}>Seulement le top 3</option><option value="self" ${cl.visibility === "self" ? "selected" : ""}>Seulement leur rang</option></select>
        <button class="btn line small" id="reset">Remettre à zéro</button></div></div>
        ${since ? `<p class="small muted">Points comptés depuis le ${new Date(since).toLocaleDateString("fr-FR")}.</p>` : ""}
        ${rows.some((r) => r.quizzes) ? podium(rows.filter((r) => r.quizzes)) + rankTable(rows, false, true) : `<p class="muted">Le classement se remplit quand les élèves terminent des quiz.</p>`}</div>

      <div class="card"><div class="row between"><h2>Élèves (${members.length})</h2><button class="btn danger small" id="wipe">Effacer toutes les données des élèves</button></div>
        ${members.length ? `<div class="row">${members.map((m) => `<span class="tag" style="font-size:.9rem">${esc(m.pseudo)} <button class="icon-btn" data-rm="${m.id}" title="Retirer" style="padding:0 4px">✕</button></span>`).join("")}</div>` : `<p class="muted">Aucun élève pour l'instant.</p>`}
        <p class="small muted" style="margin:12px 0 0">Seuls le pseudo, les réponses et les sorties de page sont enregistrés.</p></div>`);
    on("#vis", "change", async (e) => { cl.visibility = e.target.value; await api.saveClass(cl); toast("Réglage enregistré."); });
    on("#reset", "click", async () => { if (!confirm("Remettre le classement général à zéro ? Les résultats des quiz sont gardés.")) return; cl.reset_at = new Date().toISOString(); await api.saveClass(cl); toast("Classement remis à zéro."); render(); });
    on("#wipe", "click", async () => { if (!confirm("Effacer tous les élèves et toutes leurs réponses dans cette classe ? C'est définitif.")) return; await api.deleteClassData(id); toast("Données effacées."); render(); });
    on("[data-rm]", "click", async (e) => { if (!confirm("Retirer cet élève et ses réponses ?")) return; await api.removeMember(e.currentTarget.dataset.rm); render(); });
    on("#delc", "click", async () => { if (!confirm("Supprimer la classe, ses élèves et leurs résultats ?")) return; await api.deleteClass(id); toast("Classe supprimée."); go("#/prof/classes"); });
  };
  await render();
}
function evolutionChart(items) {
  const w = 640, h = 220, pad = 36, bw = Math.min(60, (w - pad * 2) / items.length - 12);
  const x = (i) => pad + (i + 0.5) * ((w - pad * 2) / items.length);
  const y = (v) => h - pad - v * (h - pad * 2);
  const pts = items.map((it, i) => `${x(i)},${y(it.avg)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto" role="img" aria-label="Moyenne par quiz">
    ${[0, 0.5, 1].map((v) => `<line x1="${pad}" x2="${w - pad}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pad - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v * 100}%</text>`).join("")}
    ${items.map((it, i) => `<rect x="${x(i) - bw / 2}" y="${y(it.avg)}" width="${bw}" height="${y(0) - y(it.avg)}" rx="6" fill="var(--primary-soft)"/>
      <text x="${x(i)}" y="${y(it.avg) - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${Math.round(it.avg * 100)}%</text>
      <text x="${x(i)}" y="${h - 14}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(it.q.title.slice(0, 14))}</text>`).join("")}
    ${items.length > 1 ? `<polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2.5"/>` : ""}
    ${items.map((it, i) => `<circle cx="${x(i)}" cy="${y(it.avg)}" r="4" fill="var(--primary)"><title>${esc(it.q.title)} : ${Math.round(it.avg * 100)}% (${it.n} élèves)</title></circle>`).join("")}
  </svg>`;
}

/* ===================== Élève : espace ===================== */
async function eleveHome() {
  const dv = device.get();
  $app.innerHTML = eleveShell(`<h1>Mon espace</h1>
    <form id="fq" class="card"><label for="code">Code du quiz</label><input id="code" class="code-input" type="text" maxlength="6" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="ABC123" required>
      <button class="btn big block" style="margin-top:12px">Jouer</button></form>
    <div class="card"><h2>Mes classes</h2>
      ${dv.classes.length ? dv.classes.map((c) => `<a class="row between" href="#/e/classe/${c.class_id}" style="padding:12px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit"><span><strong>${esc(c.class_name)}</strong><br><span class="small muted">Pseudo : ${esc(c.pseudo)}</span></span><span class="tag">Classement →</span></a>`).join("") : `<p class="muted">Tu n'as encore rejoint aucune classe.</p>`}
      <form id="fj" style="margin-top:16px"><h3>Rejoindre une classe</h3>
        <div class="grid" style="grid-template-columns:1fr 1fr"><input id="cc" class="code-input" type="text" autocapitalize="characters" autocorrect="off" spellcheck="false" style="font-size:1.2rem" maxlength="6" placeholder="Code classe" required><input id="ps" type="text" maxlength="24" placeholder="Ton pseudo" required></div>
        <button class="btn ghost block" style="margin-top:10px">Rejoindre</button></form></div>
    <p class="small muted" style="text-align:center">Tes classes sont retenues sur cet appareil. Installe l'appli (menu du navigateur → « Ajouter à l'écran d'accueil ») pour les retrouver en un clic.</p>`);
  on("#fq", "submit", (e) => { e.preventDefault(); go(`#/q/${document.getElementById("code").value.trim().toUpperCase()}`); });
  on("#fj", "submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("cc").value.trim().toUpperCase();
    const pseudo = document.getElementById("ps").value.trim();
    try {
      const existing = device.get().classes.find((c) => c.pseudo.toLowerCase() === pseudo.toLowerCase());
      const r = await api.joinClass(code, pseudo, existing?.member_token || null);
      device.addClass(r); toast(`Bienvenue dans ${r.class_name} !`); eleveHome();
    } catch (err) { toast(errMsg(err)); }
  });
}
async function eleveClass(classId) {
  const c = device.get().classes.find((x) => x.class_id === classId);
  if (!c) return go("#/e");
  try {
    const lb = await api.leaderboardClass(c.member_token);
    $app.innerHTML = eleveShell(`<a href="#/e" class="small">← Mon espace</a><h1 style="margin-top:4px">${esc(lb.class_name)}</h1>
      <p class="muted">Classement général · tu joues en tant que <strong>${esc(lb.pseudo)}</strong></p>
      <div class="card">${studentBoard(lb, true)}</div>
      <button class="btn line small" id="leave">Retirer cette classe de cet appareil</button>`);
    on("#leave", "click", () => { if (confirm("Retirer la classe de cet appareil ? Ton pseudo reste réservé.")) { device.removeClass(classId); go("#/e"); } });
  } catch (e) {
    if (e.message === "MEMBRE_INCONNU") { device.removeClass(classId); toast("Le prof t'a retiré de cette classe."); return go("#/e"); }
    throw e;
  }
}

/* ===================== Élève : passer un quiz ===================== */
function shuffled(arr, seed) {
  const a = [...arr]; let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
async function playQuiz(code) {
  code = code.toUpperCase();
  let quiz;
  try { quiz = await api.getQuizPublic(code); }
  catch (e) {
    $app.innerHTML = eleveShell(`<div class="card" style="text-align:center"><h2>Quiz introuvable</h2><p class="muted">${esc(errMsg(e))}</p><a class="btn" href="#/e">Retour</a></div>`);
    return;
  }
  const saved = device.attempt(code);
  if (saved) {
    try {
      const st = await api.status(saved.attempt_id, saved.token);
      if (st.status !== "finished") return runQuiz(quiz, saved, st);
      return startForm(quiz, saved);
    } catch { device.saveAttempt(code, null); }
  }
  startForm(quiz);
}
function startForm(quiz, done) {
  const dv = device.get();
  const mine = quiz.classes.map((c) => dv.classes.find((x) => x.class_id === c.id)).filter(Boolean);
  const pre = mine[0];
  const s = quiz.settings;
  $app.innerHTML = eleveShell(`${done ? `<div class="card note row between"><span>${done.pseudo ? `<strong>${esc(done.pseudo)}</strong> a` : "Quelqu'un a"} déjà terminé ce quiz sur cet appareil.</span><button class="btn small" id="mine">Voir mon résultat</button></div>` : ""}<div class="card stack">
    <div class="row between"><span class="tag">${esc(quiz.subject || "Quiz")}</span><span class="small muted">${quiz.questions.length} questions</span></div>
    <h1>${esc(quiz.title)}</h1>
    ${s.timer?.mode === "total" ? `<p class="muted">⏱ ${Math.round(s.timer.seconds / 60)} minutes pour tout le quiz.</p>` : s.timer?.mode === "question" ? `<p class="muted">⏱ ${s.timer.seconds} secondes par question.</p>` : ""}
    ${s.exam?.enabled ? `<div class="note warn"><strong>Mode examen.</strong> Le quiz s'ouvre en plein écran. Si tu quittes la page (autre onglet, autre appli, accueil du téléphone), ${s.exam.onLeave === "lock" ? "ton quiz sera <strong>verrouillé</strong> et seul le prof pourra le débloquer" : "le prof sera prévenu"}.</div>` : ""}
    <form id="f">
      ${quiz.classes.length ? `<div class="field"><label for="cl">Ta classe</label><select id="cl" required>${quiz.classes.length > 1 ? `<option value="">Choisis…</option>` : ""}${quiz.classes.map((c) => `<option value="${c.id}" ${pre?.class_id === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>` : ""}
      <div class="field"><label for="ps">Ton pseudo</label><input id="ps" type="text" maxlength="24" required value="${esc(pre?.pseudo || "")}" placeholder="Ex. Léa B."></div>
      <button class="btn big block">Commencer</button></form></div>`);
  on("#mine", "click", () => showResult(quiz, done));
  const sel = document.getElementById("cl");
  sel?.addEventListener("change", () => { const m = device.get().classes.find((x) => x.class_id === sel.value); if (m) document.getElementById("ps").value = m.pseudo; });
  on("#f", "submit", async (e) => {
    e.preventDefault();
    const classId = sel?.value || null;
    const pseudo = document.getElementById("ps").value.trim();
    const mem = device.get().classes.find((x) => x.class_id === classId && x.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (s.exam?.enabled) enterFullscreen();
    try {
      const r = await api.start(quiz.code, classId, pseudo, mem?.member_token || null);
      if (r.member_token) device.addClass({ class_id: r.class_id, class_name: quiz.classes.find((c) => c.id === r.class_id)?.name || "", member_token: r.member_token, pseudo: r.pseudo });
      const att = { attempt_id: r.attempt_id, token: r.token, pseudo: r.pseudo };
      device.saveAttempt(quiz.code, att);
      runQuiz(quiz, att, r);
    } catch (err) { toast(errMsg(err)); }
  });
}
function enterFullscreen() {
  const el = document.documentElement;
  try { (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {}); } catch {}
}
const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function runQuiz(quiz, att, st) {
  const s = quiz.settings;
  const exam = !!s.exam?.enabled;
  const order = s.shuffle ? shuffled(quiz.questions, att.attempt_id) : quiz.questions;
  let idx = Math.min(st.current_q || 0, order.length);
  let status = st.status;
  let selected = null;
  let busy = false;
  const storeKey = `qc_deadline_${att.attempt_id}`;
  let deadline = null;
  if (s.timer?.mode === "total") {
    deadline = +localStorage.getItem(storeKey) || Date.now() + s.timer.seconds * 1000;
    localStorage.setItem(storeKey, deadline);
  }
  let qDeadline = null;

  if (status === "finished") return showResult(quiz, att);

  // --- Surveillance du mode examen
  let lastLeave = 0, blurTimer = null, wasFs = isFullscreen();
  const reportLeave = async () => {
    if (!exam || status !== "in_progress" || Date.now() - lastLeave < 1500) return;
    lastLeave = Date.now();
    try { const r = await api.leave(att.attempt_id, att.token, idx); status = r.status; if (status === "locked") render(); else toast("⚠️ Sortie de page signalée au prof."); } catch {}
  };
  const onVis = () => { if (document.hidden) reportLeave(); };
  const onBlur = () => { clearTimeout(blurTimer); blurTimer = setTimeout(() => { if (!document.hasFocus()) reportLeave(); }, 1200); };
  const onFocus = () => clearTimeout(blurTimer);
  const onFs = () => { const fs = isFullscreen(); if (wasFs && !fs) reportLeave(); wasFs = fs; };
  const block = (e) => e.preventDefault();
  if (exam) {
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    ["copy", "cut", "paste", "contextmenu", "dragstart"].forEach((ev) => document.addEventListener(ev, block));
    document.body.classList.add("no-select");
    setCleanup(() => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      ["copy", "cut", "paste", "contextmenu", "dragstart"].forEach((ev) => document.removeEventListener(ev, block));
      clearTimeout(blurTimer);
      if (isFullscreen()) document.exitFullscreen?.().catch(() => {});
    });
  }

  const finish = async () => {
    if (busy) return; busy = true;
    try {
      const r = await api.finish(att.attempt_id, att.token);
      if (r.status === "locked") { status = "locked"; busy = false; return render(); }
      localStorage.removeItem(storeKey);
      runCleanup();
      document.body.classList.remove("no-select");
      showResult(quiz, att, r);
    } catch (e) { busy = false; toast(errMsg(e)); }
  };
  const submit = async (auto) => {
    if (busy || status !== "in_progress") return;
    const q = order[idx];
    let ans = selected;
    if (q.type === "short") ans = document.getElementById("short")?.value.trim() || null;
    if (ans === null || (Array.isArray(ans) && !ans.length)) { if (!auto) return toast("Choisis une réponse."); ans = null; }
    busy = true;
    try {
      const r = await api.answer(att.attempt_id, att.token, q.id, ans);
      busy = false;
      if (r.status === "locked") { status = "locked"; return render(); }
      idx += 1; selected = null; qDeadline = null;
      if (idx >= order.length) return finish();
      render();
    } catch (e) { busy = false; toast(errMsg(e)); }
  };

  // Minuteur
  const tick = () => {
    const el = document.getElementById("timer");
    if (status !== "in_progress") return;
    if (deadline) {
      const left = (deadline - Date.now()) / 1000;
      if (el) { el.textContent = fmtTime(left); el.classList.toggle("low", left < 30); }
      if (left <= 0) { toast("Temps écoulé !"); (async () => { if (idx < order.length && selected !== null) await submit(true); finish(); })(); deadline = null; }
    } else if (s.timer?.mode === "question" && qDeadline) {
      const left = (qDeadline - Date.now()) / 1000;
      if (el) { el.textContent = fmtTime(left); el.classList.toggle("low", left < 6); }
      if (left <= 0) { qDeadline = null; submit(true); }
    }
  };
  every(250, tick);

  // Pendant le verrouillage : on attend le prof
  every(2000, async () => {
    if (status !== "locked") return;
    try { const r = await api.status(att.attempt_id, att.token); if (r.status !== "locked") { status = r.status; if (status === "finished") { runCleanup(); return showResult(quiz, att); } render(); } } catch {}
  });

  const render = () => {
    if (status === "locked") {
      $app.innerHTML = `<div class="play"><main class="wrap narrow"><div class="card lock-screen"><div class="big-icon">🔒</div>
        <h1>Quiz verrouillé</h1><p class="muted">Tu as quitté la page pendant le mode examen.<br>Lève la main : ton prof doit débloquer ton quiz depuis son écran.</p>
        <div class="row" style="justify-content:center"><span class="spinner" style="color:var(--primary)"></span><span class="muted">En attente du prof…</span></div></div></main></div>`;
      return;
    }
    if (idx >= order.length) return finish();
    const q = order[idx];
    if (s.timer?.mode === "question" && !qDeadline) qDeadline = Date.now() + s.timer.seconds * 1000;
    const showTimer = s.timer?.mode && s.timer.mode !== "none";
    let answers = "";
    if (q.type === "single" || q.type === "multi") {
      answers = `${q.type === "multi" ? `<p class="small muted" style="margin-top:-10px">Plusieurs réponses possibles</p>` : ""}<div class="answers">${q.choices.map((c, j) => `<button class="answer ${Array.isArray(selected) && selected.includes(j) ? "sel" : ""}" data-j="${j}"><span class="letter">${LETTERS[j]}</span><span>${esc(c)}</span></button>`).join("")}</div>`;
    } else if (q.type === "tf") {
      answers = `<div class="answers tf"><button class="answer ${selected === true ? "sel" : ""}" data-tf="1">Vrai</button><button class="answer ${selected === false ? "sel" : ""}" data-tf="0">Faux</button></div>`;
    } else {
      answers = `<input id="short" type="text" autocomplete="off" placeholder="Ta réponse" style="font-size:1.2rem" ${exam ? 'onpaste="return false"' : ""}>`;
    }
    $app.innerHTML = `<div class="play">
      <div class="play-top"><span class="small muted">${idx + 1}/${order.length}</span><div class="progress"><i style="width:${(idx / order.length) * 100}%"></i></div>
        ${showTimer ? `<span class="timer" id="timer"></span>` : ""}${exam ? `<span class="tag warn" title="Mode examen">🔒 Examen</span>` : ""}</div>
      <main class="wrap narrow" style="flex:1">
        <div class="question">${esc(q.text)}</div>
        ${answers}
        <button class="btn big block" id="next" style="margin-top:20px">${idx === order.length - 1 ? "Terminer" : "Valider"}</button>
        ${exam && !isFullscreen() && document.fullscreenEnabled ? `<button class="btn line small block" id="fs" style="margin-top:10px">Repasser en plein écran</button>` : ""}
      </main></div>`;
    tick();
    on("[data-j]", "click", (e) => {
      const j = +e.currentTarget.dataset.j;
      if (q.type === "single") selected = [j];
      else { selected = Array.isArray(selected) ? selected : []; selected = selected.includes(j) ? selected.filter((x) => x !== j) : [...selected, j]; }
      $app.querySelectorAll("[data-j]").forEach((b) => b.classList.toggle("sel", selected.includes(+b.dataset.j)));
    });
    on("[data-tf]", "click", (e) => { selected = e.currentTarget.dataset.tf === "1"; $app.querySelectorAll("[data-tf]").forEach((b) => b.classList.toggle("sel", (b.dataset.tf === "1") === selected)); });
    on("#short", "keydown", (e) => { if (e.key === "Enter") submit(); });
    document.getElementById("short")?.focus();
    on("#next", "click", () => submit());
    on("#fs", "click", () => { enterFullscreen(); setTimeout(render, 300); });
  };
  render();
}

async function showResult(quiz, att, r) {
  if (!r) r = await api.finish(att.attempt_id, att.token);
  let lb = null;
  try { lb = await api.leaderboardQuiz(att.attempt_id, att.token); } catch {}
  const p = pct(r.score, r.max);
  const ring = `<svg class="score-ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" stroke-width="12"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke="${p >= 70 ? "var(--ok)" : p >= 40 ? "var(--warn)" : "var(--bad)"}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(p / 100) * 326.7} 326.7" transform="rotate(-90 60 60)"/>
    <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="700" fill="var(--ink)">${r.score}/${r.max}</text><text x="60" y="80" text-anchor="middle" font-size="13" fill="var(--muted)">${p}%</text></svg>`;
  const showAns = (c, a) => {
    if (a === null || a === undefined) return "<em>pas de réponse</em>";
    if (c.type === "tf") return a ? "Vrai" : "Faux";
    if (c.type === "short") return esc(a);
    return (Array.isArray(a) ? a : []).map((j) => esc(c.choices[j])).join(", ");
  };
  const showGood = (c) => c.type === "tf" ? (c.correct ? "Vrai" : "Faux") : c.type === "short" ? esc(c.correct[0]) : c.correct.map((j) => esc(c.choices[j])).join(", ");
  const mem = device.get().classes.find((c) => quiz.classes.some((x) => x.id === c.class_id));
  $app.innerHTML = eleveShell(`<div class="card" style="text-align:center"><h1>${p >= 80 ? "Bravo !" : p >= 50 ? "Bien joué !" : "Quiz terminé"}</h1>${ring}
      <p class="muted">${esc(quiz.title)} · ${fmtTime(r.duration)}</p></div>
    ${lb && (lb.rows.length || lb.me) ? `<div class="card"><h2>Classement du quiz</h2>${studentBoard(lb, false)}</div>` : ""}
    ${r.corrections ? `<div class="card"><h2>Corrections</h2>${r.corrections.map((c, i) => `<div class="corr ${c.isCorrect ? "good" : "wrong"}">
      <div><strong>${i + 1}. ${esc(c.text)}</strong> ${c.isCorrect ? "✅" : "❌"}</div>
      <div class="small">Ta réponse : ${showAns(c, c.yourAnswer)}</div>${c.isCorrect ? "" : `<div class="small">Bonne réponse : <strong>${showGood(c)}</strong></div>`}
      ${c.explanation ? `<div class="small muted" style="margin-top:4px">${esc(c.explanation)}</div>` : ""}</div>`).join("")}</div>` : `<p class="muted" style="text-align:center">Le prof affichera les corrections en classe.</p>`}
    <div class="row" style="justify-content:center">${mem ? `<a class="btn ghost" href="#/e/classe/${mem.class_id}">Classement de ma classe</a>` : ""}<a class="btn" href="#/e">Mon espace</a></div>`);
}

/* ===================== Accueil prof / démarrage ===================== */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
router();
