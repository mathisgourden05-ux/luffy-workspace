// Couche de données : une seule interface, deux moteurs.
//  - Supabase (en ligne) si config.js est rempli
//  - Local (localStorage) sinon : mode démo, un seul navigateur
// Les "fonctions élève" (start, answer, leave, finish, classements) imitent
// exactement les fonctions SQL de supabase.sql.

const CFG = window.QUIZ_CONFIG || {};
export const ONLINE = !!(CFG.supabaseUrl && CFG.supabaseKey);

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function makeCode(n = 6) {
  let s = "";
  const r = crypto.getRandomValues(new Uint32Array(n));
  for (let i = 0; i < n; i++) s += ALPHA[r[i] % ALPHA.length];
  return s;
}
const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

export function norm(s) {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "").trim();
}
export function grade(q, a) {
  if (a === null || a === undefined) return false;
  if (q.type === "single" || q.type === "multi") {
    if (!Array.isArray(a)) return false;
    const c = [...new Set(q.correct.map(Number))].sort((x, y) => x - y);
    const x = [...new Set(a.map(Number))].sort((p, r) => p - r);
    return c.length === x.length && c.every((v, i) => v === x[i]);
  }
  if (q.type === "tf") return a === q.correct;
  if (q.type === "short") return (q.correct || []).some((s) => norm(s) === norm(a));
  return false;
}
export function defaultSettings() {
  return {
    showCorrections: true,
    shuffle: false,
    exam: { enabled: false, onLeave: "lock" },
    timer: { mode: "none", seconds: 600 },
  };
}
function publicQuiz(quiz, classes) {
  return {
    id: quiz.id, code: quiz.code, title: quiz.title, subject: quiz.subject,
    settings: quiz.settings,
    classes: classes.filter((c) => (quiz.class_ids || []).includes(c.id)).map((c) => ({ id: c.id, name: c.name })),
    questions: quiz.questions.map((q) => ({ id: q.id, type: q.type, text: q.text, choices: q.choices || [] })),
  };
}
function duration(a) {
  if (!a.finished_at) return null;
  return (new Date(a.finished_at) - new Date(a.started_at)) / 1000;
}
function rankRows(rows) {
  rows.sort((a, b) => b.score - a.score || a.duration - b.duration);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
function applyVisibility(rows, vis, meId) {
  const me = rows.find((r) => r.id === meId) || null;
  let shown = rows;
  if (vis === "top3") shown = rows.slice(0, 3);
  if (vis === "self") shown = me ? [me] : [];
  return { visibility: vis, me, rows: shown.map(({ id, ...r }) => ({ ...r, isMe: id === meId })) };
}
function corrections(quiz, att) {
  return quiz.questions.map((q) => {
    const ans = att.answers[q.id];
    return {
      id: q.id, type: q.type, text: q.text, choices: q.choices || [],
      yourAnswer: ans ? ans.a : null, isCorrect: !!(ans && ans.ok),
      correct: q.correct, explanation: q.explanation || "",
    };
  });
}

/* ======================= MOTEUR LOCAL ======================= */
const KEY = "qc_db_v1";
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
function db() {
  const d = load() || { users: [], classes: [], members: [], quizzes: [], attempts: [] };
  return d;
}
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function fail(code) { throw new Error(code); }

const local = {
  // --- Auth prof
  async session() {
    const id = localStorage.getItem("qc_session");
    const u = db().users.find((x) => x.id === id);
    return u ? { id: u.id, email: u.email } : null;
  },
  async signUp(email, password) {
    const d = db();
    if (d.users.some((u) => u.email === email.toLowerCase())) fail("EMAIL_PRIS");
    const u = { id: uid(), email: email.toLowerCase(), password };
    d.users.push(u); save(d);
    localStorage.setItem("qc_session", u.id);
    return { needsConfirm: false };
  },
  async signIn(email, password) {
    const u = db().users.find((x) => x.email === email.toLowerCase() && x.password === password);
    if (!u) fail("CONNEXION_REFUSEE");
    localStorage.setItem("qc_session", u.id);
  },
  async signOut() { localStorage.removeItem("qc_session"); },

  // --- Prof : quiz
  async listQuizzes() {
    const me = await local.session();
    return db().quizzes.filter((q) => q.owner === me.id).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },
  async getQuiz(id) { return db().quizzes.find((q) => q.id === id) || null; },
  async saveQuiz(quiz) {
    const me = await local.session();
    const d = db();
    const i = d.quizzes.findIndex((q) => q.id === quiz.id);
    const row = { ...quiz, owner: me.id, updated_at: nowIso() };
    if (i >= 0) d.quizzes[i] = row;
    else {
      row.id = row.id || uid();
      row.created_at = nowIso();
      do { row.code = makeCode(); } while (d.quizzes.some((q) => q.code === row.code));
      d.quizzes.push(row);
    }
    save(d); return row;
  },
  async deleteQuiz(id) {
    const d = db();
    d.quizzes = d.quizzes.filter((q) => q.id !== id);
    d.attempts = d.attempts.filter((a) => a.quiz_id !== id);
    save(d);
  },

  // --- Prof : classes
  async listClasses() {
    const me = await local.session();
    return db().classes.filter((c) => c.owner === me.id).sort((a, b) => a.name.localeCompare(b.name));
  },
  async saveClass(c) {
    const me = await local.session();
    const d = db();
    const i = d.classes.findIndex((x) => x.id === c.id);
    if (i >= 0) d.classes[i] = { ...d.classes[i], ...c };
    else {
      const row = { id: uid(), owner: me.id, name: c.name, visibility: "full", reset_at: null, created_at: nowIso() };
      do { row.code = makeCode(); } while (d.classes.some((x) => x.code === row.code));
      d.classes.push(row); c = row;
    }
    save(d); return c;
  },
  async deleteClass(id) {
    const d = db();
    d.classes = d.classes.filter((c) => c.id !== id);
    d.members = d.members.filter((m) => m.class_id !== id);
    d.attempts = d.attempts.filter((a) => a.class_id !== id);
    d.quizzes.forEach((q) => (q.class_ids = (q.class_ids || []).filter((x) => x !== id)));
    save(d);
  },
  async listMembers(classId) { return db().members.filter((m) => m.class_id === classId); },
  async deleteClassData(classId) {
    const d = db();
    d.members = d.members.filter((m) => m.class_id !== classId);
    d.attempts = d.attempts.filter((a) => a.class_id !== classId);
    save(d);
  },
  async removeMember(memberId) {
    const d = db();
    d.members = d.members.filter((m) => m.id !== memberId);
    d.attempts = d.attempts.filter((a) => a.member_id !== memberId);
    save(d);
  },

  // --- Prof : résultats
  async listAttempts(quizId) { return db().attempts.filter((a) => a.quiz_id === quizId); },
  async listClassAttempts(classId) { return db().attempts.filter((a) => a.class_id === classId); },
  async unlockAttempt(id) {
    const d = db(); const a = d.attempts.find((x) => x.id === id);
    if (a && a.status === "locked") a.status = "in_progress";
    save(d);
  },
  async deleteAttempts(quizId) {
    const d = db(); d.attempts = d.attempts.filter((a) => a.quiz_id !== quizId); save(d);
  },

  // --- Élève (imite les fonctions SQL)
  async getQuizPublic(code) {
    const d = db();
    const q = d.quizzes.find((x) => x.code === code.trim().toUpperCase() && x.published);
    if (!q) fail("QUIZ_INTROUVABLE");
    return publicQuiz(q, d.classes);
  },
  _member(d, classId, pseudo, token) {
    let m = d.members.find((x) => x.class_id === classId && x.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (m) { if (m.token !== token) fail("PSEUDO_PRIS"); }
    else { m = { id: uid(), class_id: classId, pseudo, token: uid(), created_at: nowIso() }; d.members.push(m); }
    return m;
  },
  async joinClass(code, pseudo, token) {
    pseudo = (pseudo || "").trim();
    if (pseudo.length < 1 || pseudo.length > 24) fail("PSEUDO_INVALIDE");
    const d = db();
    const c = d.classes.find((x) => x.code === code.trim().toUpperCase());
    if (!c) fail("CLASSE_INTROUVABLE");
    const m = local._member(d, c.id, pseudo, token);
    save(d);
    return { class_id: c.id, class_name: c.name, member_token: m.token, pseudo: m.pseudo };
  },
  async start(code, classId, pseudo, memberToken) {
    pseudo = (pseudo || "").trim();
    if (pseudo.length < 1 || pseudo.length > 24) fail("PSEUDO_INVALIDE");
    const d = db();
    const q = d.quizzes.find((x) => x.code === code.trim().toUpperCase() && x.published);
    if (!q) fail("QUIZ_INTROUVABLE");
    let m = null, att = null;
    if ((q.class_ids || []).length) {
      if (!classId || !q.class_ids.includes(classId)) fail("CLASSE_REQUISE");
      m = local._member(d, classId, pseudo, memberToken);
      att = d.attempts.find((a) => a.quiz_id === q.id && a.member_id === m.id);
    } else {
      if (d.attempts.some((a) => a.quiz_id === q.id && a.pseudo.toLowerCase() === pseudo.toLowerCase())) fail("PSEUDO_PRIS");
    }
    if (!att) {
      att = {
        id: uid(), token: uid(), quiz_id: q.id, class_id: m ? classId : null, member_id: m ? m.id : null,
        pseudo: m ? m.pseudo : pseudo, answers: {}, score: 0, max_score: q.questions.length, current_q: 0,
        status: "in_progress", leaves: 0, leave_log: [], started_at: nowIso(), finished_at: null,
      };
      d.attempts.push(att);
    }
    save(d);
    return { attempt_id: att.id, token: att.token, status: att.status, current_q: att.current_q, member_token: m ? m.token : null, class_id: att.class_id, pseudo: att.pseudo };
  },
  _att(d, id, token) {
    const a = d.attempts.find((x) => x.id === id && x.token === token);
    if (!a) fail("TENTATIVE_INVALIDE");
    return a;
  },
  async answer(attemptId, token, qid, ans) {
    const d = db(); const a = local._att(d, attemptId, token);
    if (a.status !== "in_progress") return { status: a.status };
    const quiz = d.quizzes.find((q) => q.id === a.quiz_id);
    const idx = quiz.questions.findIndex((q) => q.id === qid);
    if (idx < 0) fail("QUESTION_INCONNUE");
    a.answers[qid] = { a: ans, ok: grade(quiz.questions[idx], ans) };
    a.current_q = Math.max(a.current_q, idx + 1);
    a.score = Object.values(a.answers).filter((x) => x.ok).length;
    save(d); return { status: a.status };
  },
  async leave(attemptId, token, qIndex) {
    const d = db(); const a = local._att(d, attemptId, token);
    const quiz = d.quizzes.find((q) => q.id === a.quiz_id);
    if (a.status === "in_progress" && quiz.settings.exam?.enabled) {
      a.leaves += 1; a.leave_log.push({ at: nowIso(), q: qIndex });
      if (quiz.settings.exam.onLeave === "lock") a.status = "locked";
      save(d);
    }
    return { status: a.status, leaves: a.leaves };
  },
  async status(attemptId, token) {
    const a = local._att(db(), attemptId, token);
    return { status: a.status, current_q: a.current_q, leaves: a.leaves };
  },
  async finish(attemptId, token) {
    const d = db(); const a = local._att(d, attemptId, token);
    if (a.status === "locked") return { status: "locked" };
    const quiz = d.quizzes.find((q) => q.id === a.quiz_id);
    if (a.status !== "finished") { a.status = "finished"; a.finished_at = nowIso(); save(d); }
    return {
      status: "finished", score: a.score, max: a.max_score, duration: duration(a),
      corrections: quiz.settings.showCorrections ? corrections(quiz, a) : null,
    };
  },
  async leaderboardQuiz(attemptId, token) {
    const d = db(); const a = local._att(d, attemptId, token);
    const cls = d.classes.find((c) => c.id === a.class_id);
    const rows = rankRows(d.attempts
      .filter((x) => x.quiz_id === a.quiz_id && x.class_id === a.class_id && x.status === "finished")
      .map((x) => ({ id: x.id, pseudo: x.pseudo, score: x.score, max: x.max_score, duration: duration(x) })));
    return applyVisibility(rows, cls ? cls.visibility : "full", a.id);
  },
  async leaderboardClass(memberToken) {
    const d = db();
    const m = d.members.find((x) => x.token === memberToken);
    if (!m) fail("MEMBRE_INCONNU");
    const c = d.classes.find((x) => x.id === m.class_id);
    const since = c.reset_at || "0";
    const agg = {};
    d.members.filter((x) => x.class_id === c.id).forEach((x) => (agg[x.id] = { id: x.id, pseudo: x.pseudo, score: 0, quizzes: 0, duration: 0 }));
    d.attempts.filter((x) => x.class_id === c.id && x.status === "finished" && x.finished_at >= since && agg[x.member_id])
      .forEach((x) => { const r = agg[x.member_id]; r.score += x.score; r.quizzes += 1; r.duration += duration(x); });
    const rows = rankRows(Object.values(agg).filter((r) => r.quizzes > 0 || r.id === m.id));
    return { class_name: c.name, pseudo: m.pseudo, ...applyVisibility(rows, c.visibility, m.id) };
  },
};

/* ======================= MOTEUR SUPABASE ======================= */
let sb = null;
async function client() {
  if (!sb) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    sb = createClient(CFG.supabaseUrl, CFG.supabaseKey);
  }
  return sb;
}
function chk({ data, error }) {
  if (error) {
    const m = String(error.message || "");
    const code = (m.match(/[A-Z_]{5,}/) || [m])[0];
    throw new Error(code);
  }
  return data;
}
async function rpc(fn, args) { return chk(await (await client()).rpc(fn, args)); }

// IA incluse : la fonction serveur qz-generate appelle Gemini avec la clé de l'appli
// (jamais visible dans le navigateur) et compte les quiz générés par prof et par jour.
export async function serverGenerate(opts) {
  const { data, error } = await (await client()).functions.invoke("qz-generate", { body: opts });
  if (error) throw new Error("Le service d'IA ne répond pas. Réessaie dans un instant.");
  if (data?.error) throw new Error(data.error);
  return data;
}

// Texte d'un Google Docs / Slides partagé par lien (lu par la même fonction serveur, sans compter de quiz).
export async function serverReadLink(url) {
  const { data, error } = await (await client()).functions.invoke("qz-generate", { body: { action: "link", url } });
  if (error) throw new Error("Le serveur ne répond pas. Réessayez dans un instant.");
  if (data?.error) throw new Error(data.error);
  return data;
}

const online = {
  async session() {
    const { data } = await (await client()).auth.getSession();
    const u = data.session?.user;
    return u ? { id: u.id, email: u.email } : null;
  },
  async signUp(email, password) {
    const data = chk(await (await client()).auth.signUp({ email, password }));
    return { needsConfirm: !data.session };
  },
  async signIn(email, password) {
    const { error } = await (await client()).auth.signInWithPassword({ email, password });
    if (error) throw new Error(/confirm/i.test(error.message) ? "EMAIL_A_CONFIRMER" : "CONNEXION_REFUSEE");
  },
  async signOut() { await (await client()).auth.signOut(); },

  async listQuizzes() { return chk(await (await client()).from("qz_quizzes").select("*").order("updated_at", { ascending: false })); },
  async getQuiz(id) { return chk(await (await client()).from("qz_quizzes").select("*").eq("id", id).maybeSingle()); },
  async saveQuiz(quiz) {
    const c = await client();
    const fields = { title: quiz.title, subject: quiz.subject, level: quiz.level, questions: quiz.questions, settings: quiz.settings, published: quiz.published, class_ids: quiz.class_ids || [], updated_at: nowIso() };
    if (quiz.id) return chk(await c.from("qz_quizzes").update(fields).eq("id", quiz.id).select().single());
    for (let i = 0; i < 5; i++) {
      const r = await c.from("qz_quizzes").insert({ ...fields, code: makeCode() }).select().single();
      if (!r.error) return r.data;
      if (r.error.code !== "23505") chk(r);
    }
    fail("CODE_IMPOSSIBLE");
  },
  async deleteQuiz(id) { chk(await (await client()).from("qz_quizzes").delete().eq("id", id)); },

  async listClasses() { return chk(await (await client()).from("qz_classes").select("*").order("name")); },
  async saveClass(cl) {
    const c = await client();
    if (cl.id) return chk(await c.from("qz_classes").update({ name: cl.name, visibility: cl.visibility, reset_at: cl.reset_at }).eq("id", cl.id).select().single());
    for (let i = 0; i < 5; i++) {
      const r = await c.from("qz_classes").insert({ name: cl.name, code: makeCode() }).select().single();
      if (!r.error) return r.data;
      if (r.error.code !== "23505") chk(r);
    }
    fail("CODE_IMPOSSIBLE");
  },
  async deleteClass(id) { chk(await (await client()).rpc("qz_delete_class", { p_class: id })); },
  async listMembers(classId) { return chk(await (await client()).from("qz_members").select("id,class_id,pseudo,created_at").eq("class_id", classId)); },
  async deleteClassData(classId) {
    const c = await client();
    chk(await c.from("qz_attempts").delete().eq("class_id", classId));
    chk(await c.from("qz_members").delete().eq("class_id", classId));
  },
  async removeMember(memberId) { chk(await (await client()).from("qz_members").delete().eq("id", memberId)); },

  async listAttempts(quizId) { return chk(await (await client()).from("qz_attempts").select("*").eq("quiz_id", quizId)); },
  async listClassAttempts(classId) { return chk(await (await client()).from("qz_attempts").select("*").eq("class_id", classId)); },
  async unlockAttempt(id) { chk(await (await client()).from("qz_attempts").update({ status: "in_progress" }).eq("id", id).eq("status", "locked")); },
  async deleteAttempts(quizId) { chk(await (await client()).from("qz_attempts").delete().eq("quiz_id", quizId)); },

  getQuizPublic: (code) => rpc("qz_get_quiz", { p_code: code }),
  joinClass: (code, pseudo, token) => rpc("qz_join_class", { p_code: code, p_pseudo: pseudo, p_token: token || null }),
  start: (code, classId, pseudo, token) => rpc("qz_start", { p_code: code, p_class: classId || null, p_pseudo: pseudo, p_member_token: token || null }),
  answer: (id, token, qid, a) => rpc("qz_answer", { p_attempt: id, p_token: token, p_qid: qid, p_answer: a }),
  leave: (id, token, q) => rpc("qz_leave", { p_attempt: id, p_token: token, p_q: q }),
  status: (id, token) => rpc("qz_status", { p_attempt: id, p_token: token }),
  finish: (id, token) => rpc("qz_finish", { p_attempt: id, p_token: token }),
  leaderboardQuiz: (id, token) => rpc("qz_lb_quiz", { p_attempt: id, p_token: token }),
  leaderboardClass: (token) => rpc("qz_lb_class", { p_member_token: token }),
};

export const api = ONLINE ? online : local;

/* ============ Mémoire de l'appareil de l'élève (pas de compte) ============ */
export const device = {
  get() { try { return JSON.parse(localStorage.getItem("qc_device")) || { classes: [], attempts: {} }; } catch { return { classes: [], attempts: {} }; } },
  set(v) { localStorage.setItem("qc_device", JSON.stringify(v)); },
  addClass(c) { const v = device.get(); v.classes = v.classes.filter((x) => x.class_id !== c.class_id); v.classes.push(c); device.set(v); },
  removeClass(id) { const v = device.get(); v.classes = v.classes.filter((x) => x.class_id !== id); device.set(v); },
  tokenFor(classId) { return device.get().classes.find((x) => x.class_id === classId)?.member_token || null; },
  saveAttempt(code, a) { const v = device.get(); v.attempts[code] = a; device.set(v); },
  attempt(code) { return device.get().attempts[code] || null; },
};
