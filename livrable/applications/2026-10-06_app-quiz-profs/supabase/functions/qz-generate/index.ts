// QuizClasse — IA incluse.
// Génère un quiz avec la clé Gemini de l'appli (secret GEMINI_API_KEY, jamais envoyé au navigateur)
// et limite le nombre de quiz par prof et par jour (secret QZ_AI_DAILY_LIMIT, 7 par défaut).
// Le prompt est construit ICI : un prof ne peut pas se servir de la clé pour autre chose qu'un quiz.
// Répond toujours en 200 avec { quiz, remaining } ou { error } (message lisible pour le prof).
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const reply = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...CORS, "Content-Type": "application/json" } });

const TYPE_NAMES: Record<string, string> = {
  single: "QCM à une bonne réponse",
  multi: "QCM à plusieurs bonnes réponses",
  tf: "vrai/faux",
  short: "réponse courte (un mot ou un nombre)",
};
const DIFFICULTIES = ["facile", "moyenne", "difficile"];
const MAX_SOURCE = 60000; // ~ une trentaine de pages de cours (même limite que app/files.js)

// Texte d'un Google Docs / Slides partagé « à toute personne disposant du lien ».
async function readGoogleLink(url: string) {
  const m = url.match(/docs\.google\.com\/(document|presentation)\/d\/([\w-]+)/);
  if (!m) throw new Error("Ce lien n'est pas un Google Docs ou Google Slides.");
  const exportUrl = m[1] === "document"
    ? `https://docs.google.com/document/d/${m[2]}/export?format=txt`
    : `https://docs.google.com/presentation/d/${m[2]}/export/txt`;
  const r = await fetch(exportUrl, { redirect: "follow" });
  const type = r.headers.get("content-type") || "";
  if (!r.ok || !type.startsWith("text/plain")) {
    throw new Error("Impossible de lire ce document. Dans Google Docs : Partager → « Tous les utilisateurs disposant du lien », puis réessayez. Ou téléchargez-le en PDF et déposez le fichier.");
  }
  const text = (await r.text()).replace(/^﻿/, "").trim();
  if (!text) throw new Error("Ce document est vide.");
  return text.slice(0, MAX_SOURCE);
}

// Même texte que buildPrompt() dans app/ai.js : à modifier aux deux endroits.
function buildPrompt(source: string, count: number, difficulty: string, types: string[], level: string) {
  return `Tu es un professeur expérimenté. Rédige un quiz en français.

Contenu ou thème fourni par le prof :
"""
${source}
"""

Contraintes :
- ${count} questions exactement, difficulté : ${difficulty}${level ? `, niveau : ${level}` : ""}.
- Types autorisés : ${types.map((t) => TYPE_NAMES[t]).join(", ")}. Varie-les.
- Si un texte de cours est fourni, ne pose que des questions dont la réponse se trouve dans ce texte. Reprends son vocabulaire, ses définitions et ses exemples, et répartis les questions sur tout le document, pas seulement le début.\n- Si le prof donne des consignes, respecte-les.
- QCM : 4 propositions plausibles, une seule évidence à éviter. "correct_indexes" = positions (à partir de 0) des bonnes réponses.
- Vrai/faux : "choices" vide, réponse dans "tf_answer".
- Réponse courte : "choices" vide, toutes les formulations acceptables dans "accepted_answers".
- Pour les champs qui ne s'appliquent pas au type, mets [] ou false.
- "explanation" : une phrase qui explique la bonne réponse.
- "title" : un titre court pour le quiz.
Réponds uniquement avec le JSON demandé.`;
}

// Modèle principal, puis modèle plus léger si le premier est saturé (fréquent sur l'offre gratuite).
const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];

// Format imposé à Gemini (sans lui, il invente ses propres noms de champs). Même schéma que GEMINI_SCHEMA dans app/ai.js.
const STR = { type: "STRING" }, STRS = { type: "ARRAY", items: STR };
const SCHEMA = {
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

async function gemini(key: string, prompt: string) {
  const call = (model: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.7 },
    }),
  });
  let r!: Response;
  outer: for (const model of MODELS) {
    for (let i = 0; i < 2; i++) {
      if (i) await new Promise((ok) => setTimeout(ok, 2000));
      r = await call(model);
      if (r.status !== 503 && r.status !== 429) break outer;
    }
  }
  if (r.status === 429) throw new Error("L'IA incluse est très demandée en ce moment. Réessaie dans quelques minutes, ou ajoute ta propre clé dans Réglages.");
  if (r.status === 503) throw new Error("L'IA est saturée en ce moment. Réessaie dans quelques secondes.");
  if (!r.ok) throw new Error(`Le service d'IA a renvoyé une erreur (${r.status}).`);
  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  try { return JSON.parse(text.replace(/^```json\s*|```$/g, "")); }
  catch { throw new Error("L'IA a renvoyé une réponse illisible. Réessaie."); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const limit = Number(Deno.env.get("QZ_AI_DAILY_LIMIT") || 7);

    // Qui appelle ? (un prof connecté, sinon refus)
    const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return reply({ error: "Connecte-toi pour utiliser l'IA." });

    const b = await req.json().catch(() => ({}));

    // Lecture d'un lien Google Docs / Slides (ne compte pas dans la limite de quiz)
    if (b.action === "link") return reply({ text: await readGoogleLink(String(b.url || "")) });

    // Vérifie la demande
    const source = String(b.source || "").trim().slice(0, MAX_SOURCE);
    const count = Math.min(Math.max(parseInt(b.count) || 10, 1), 20);
    const difficulty = DIFFICULTIES.includes(b.difficulty) ? b.difficulty : "moyenne";
    const types = (Array.isArray(b.types) ? b.types : []).filter((t: string) => t in TYPE_NAMES);
    const level = String(b.level || "").slice(0, 40);
    if (!source) return reply({ error: "Colle un cours ou écris un thème." });
    if (!types.length) return reply({ error: "Choisis au moins un type de question." });
    if (!geminiKey) return reply({ error: "L'IA incluse n'est pas encore activée sur ce site. Ajoute ta propre clé dans Réglages." });

    // Compteur du jour (table qz_ai_usage, lisible seulement par le serveur)
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const day = new Date().toISOString().slice(0, 10);
    const { data: row } = await admin.from("qz_ai_usage").select("n").eq("owner", user.id).eq("day", day).maybeSingle();
    const used = row?.n || 0;
    if (used >= limit) {
      return reply({ error: `Tu as utilisé tes ${limit} quiz IA d'aujourd'hui. Reviens demain, crée le quiz à la main, ou ajoute ta propre clé dans Réglages (sans limite).` });
    }

    const quiz = await gemini(geminiKey, buildPrompt(source, count, difficulty, types, level));

    // On ne compte que les quiz réussis
    await admin.from("qz_ai_usage").upsert({ owner: user.id, day, n: used + 1 });
    return reply({ quiz, remaining: limit - used - 1 });
  } catch (e) {
    return reply({ error: e instanceof Error ? e.message : "Erreur inattendue du service d'IA." });
  }
});
