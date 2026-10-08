// Génération de quiz par IA (optionnelle). Deux façons :
// - IA incluse (mode en ligne) : la fonction serveur qz-generate utilise la clé de l'appli,
//   avec une limite de quiz par jour et par prof. Le prof n'a rien à régler.
// - Clé perso : le prof colle sa propre clé (gardée sur son appareil, envoyée seulement
//   au fournisseur choisi). Pas de limite côté appli. Seule option en mode démo.
import { ONLINE, serverGenerate } from "./data.js";

export const aiSettings = {
  get() {
    try { return JSON.parse(localStorage.getItem("qc_ai")) || { provider: "gemini", key: "" }; }
    catch { return { provider: "gemini", key: "" }; }
  },
  set(v) { localStorage.setItem("qc_ai", JSON.stringify(v)); },
  ready() { return ONLINE || !!aiSettings.get().key; },
  included() { return ONLINE && !aiSettings.get().key; },
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "questions"],
  properties: {
    title: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "text", "choices", "correct_indexes", "tf_answer", "accepted_answers", "explanation"],
        properties: {
          type: { type: "string", enum: ["single", "multi", "tf", "short"] },
          text: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          correct_indexes: { type: "array", items: { type: "integer" } },
          tf_answer: { type: "boolean" },
          accepted_answers: { type: "array", items: { type: "string" } },
          explanation: { type: "string" },
        },
      },
    },
  },
};

// Même schéma au format Gemini (sans lui, Gemini invente ses propres noms de champs).
// Copie de SCHEMA dans supabase/functions/qz-generate/index.ts.
const STR = { type: "STRING" }, STRS = { type: "ARRAY", items: STR };
const GEMINI_SCHEMA = {
  type: "OBJECT",
  required: ["title", "questions"],
  properties: {
    title: STR,
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["type", "text", "choices", "correct_indexes", "tf_answer", "accepted_answers", "explanation"],
        properties: {
          type: { type: "STRING", enum: ["single", "multi", "tf", "short"] },
          text: STR,
          choices: STRS,
          correct_indexes: { type: "ARRAY", items: { type: "INTEGER" } },
          tf_answer: { type: "BOOLEAN" },
          accepted_answers: STRS,
          explanation: STR,
        },
      },
    },
  },
};

// Même texte que dans supabase/functions/qz-generate/index.ts : à modifier aux deux endroits.
function buildPrompt({ source, count, difficulty, types, level }) {
  const typeNames = { single: "QCM à une bonne réponse", multi: "QCM à plusieurs bonnes réponses", tf: "vrai/faux", short: "réponse courte (un mot ou un nombre)" };
  return `Tu es un professeur expérimenté. Rédige un quiz en français.

Contenu ou thème fourni par le prof :
"""
${source}
"""

Contraintes :
- ${count} questions exactement, difficulté : ${difficulty}${level ? `, niveau : ${level}` : ""}.
- Types autorisés : ${types.map((t) => typeNames[t]).join(", ")}. Varie-les.
- Si un texte de cours est fourni, ne pose que des questions dont la réponse se trouve dans ce texte. Reprends son vocabulaire, ses définitions et ses exemples, et répartis les questions sur tout le document, pas seulement le début.\n- Si le prof donne des consignes, respecte-les.
- QCM : 4 propositions plausibles, une seule évidence à éviter. "correct_indexes" = positions (à partir de 0) des bonnes réponses.
- Vrai/faux : "choices" vide, réponse dans "tf_answer".
- Réponse courte : "choices" vide, toutes les formulations acceptables dans "accepted_answers".
- Pour les champs qui ne s'appliquent pas au type, mets [] ou false.
- "explanation" : une phrase qui explique la bonne réponse.
- "title" : un titre court pour le quiz.
Réponds uniquement avec le JSON demandé.`;
}

// Noms de types que l'IA renvoie parfois malgré le format demandé.
const TYPE_ALIASES = { qcm: "single", multiple_choice: "single", mcq: "single", true_false: "tf", vrai_faux: "tf", boolean: "tf", short_answer: "short", text: "short" };

function toQuestions(json) {
  if (Array.isArray(json)) json = { title: json[0]?.title, questions: json };
  const out = [];
  for (const raw of json?.questions || []) {
    const q = { ...raw, type: TYPE_ALIASES[raw.type] || raw.type, text: raw.text ?? raw.question };
    if (q.type === "single" && (q.correct_indexes || []).length > 1) q.type = "multi";
    const base = { id: crypto.randomUUID().slice(0, 8), type: q.type, text: String(q.text || "").trim(), explanation: q.explanation || "" };
    if (!base.text) continue;
    if (q.type === "single" || q.type === "multi") {
      const choices = (q.choices || []).map(String).filter(Boolean).slice(0, 6);
      let correct = (q.correct_indexes || []).filter((i) => i >= 0 && i < choices.length);
      if (choices.length < 2 || !correct.length) continue;
      if (q.type === "single") correct = [correct[0]];
      out.push({ ...base, choices, correct });
    } else if (q.type === "tf") {
      out.push({ ...base, choices: [], correct: !!q.tf_answer });
    } else if (q.type === "short") {
      const acc = (q.accepted_answers || []).map(String).filter(Boolean);
      if (!acc.length) continue;
      out.push({ ...base, choices: [], correct: acc });
    }
  }
  return { title: json?.title || "Quiz", questions: out };
}

async function viaClaude(key, prompt) {
  const { default: Anthropic } = await import("https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm");
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal") throw new Error("L'IA a refusé cette demande. Reformule le thème.");
    if (res.stop_reason === "max_tokens") throw new Error("Réponse trop longue : demande moins de questions.");
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return JSON.parse(text);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("Clé Claude refusée. Vérifie-la dans les réglages.");
    if (e instanceof Anthropic.RateLimitError) throw new Error("Trop de demandes d'un coup. Réessaie dans une minute.");
    if (e instanceof Anthropic.APIError) throw new Error(`Erreur Claude (${e.status}) : ${e.message}`);
    throw e;
  }
}

async function viaGemini(key, prompt) {
  // Alias "latest" : suit automatiquement le modèle Flash le plus récent (les anciens noms sont retirés).
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
  const call = () => fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA, temperature: 0.7 },
    }),
  });
  // L'offre gratuite est souvent saturée (503) : on retente tout seul avant d'abandonner.
  let r = await call();
  for (let i = 1; r.status === 503 && i <= 4; i++) {
    await new Promise((ok) => setTimeout(ok, 2000 * i));
    r = await call();
  }
  if (r.status === 400 || r.status === 403) throw new Error("Clé Gemini refusée. Vérifie-la dans les réglages.");
  if (r.status === 429) throw new Error("Quota Gemini gratuit atteint pour l'instant. Réessaie un peu plus tard.");
  if (r.status === 503) throw new Error("Gemini est saturé en ce moment. Réessaie dans quelques secondes.");
  if (!r.ok) throw new Error(`Erreur Gemini (${r.status}).`);
  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return JSON.parse(text.replace(/^```json\s*|```$/g, ""));
}

// Renvoie { title, questions, remaining } (remaining = quiz IA encore permis aujourd'hui, ou null si clé perso).
export async function generateQuiz(opts) {
  const { provider, key } = aiSettings.get();
  let json, remaining = null;
  if (key) {
    const prompt = buildPrompt(opts);
    json = provider === "claude" ? await viaClaude(key, prompt) : await viaGemini(key, prompt);
  } else if (ONLINE) {
    const data = await serverGenerate(opts);
    json = data.quiz;
    remaining = data.remaining;
  } else {
    throw new Error("Aucune clé d'IA : ajoute-la dans Réglages, ou crée le quiz à la main.");
  }
  const res = toQuestions(json);
  if (!res.questions.length) throw new Error("L'IA n'a pas renvoyé de question utilisable. Réessaie.");
  return { ...res, remaining };
}
