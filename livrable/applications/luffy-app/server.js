// Serveur local de l'appli Luffy : sert la page et fait le lien avec Claude Code (via le SDK officiel).
// Lancement : node server.js  →  http://localhost:4747
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 4747;
const APP_DIR = __dirname;
const WORKSPACE = path.resolve(__dirname, '..', '..', '..'); // C:\Dossier Claude\Luffy.zip
const IMPORT_DIR = path.join(WORKSPACE, 'contexte-import');  // fichiers joints (hors images)
const sdkReady = import('@anthropic-ai/claude-agent-sdk');

// Dossiers ouvrables depuis les raccourcis (liste fermée)
const FOLDERS = {
  bts: 'E:\\Mathis\\Cours BTS 2',
  admin: 'E:\\Mathis\\Administratif',
  projets: 'E:\\Mathis\\Projets',
  luffy: WORKSPACE,
  imports: IMPORT_DIR,
};

// En mode vocal, la consigne est collée devant le message (la réponse sera lue à voix haute)
const VOICE_TAG = "[Mode vocal : Mathis te parle à voix haute et ta réponse sera lue par une synthèse vocale. Réponds en 1 à 4 phrases courtes, à l'oral, sans markdown, sans liste, sans emoji, sans lien.]\n\n";

// Équipe d'agents : Luffy (souvent un modèle léger en vocal) délègue le vrai travail à des agents
// sur des modèles plus forts, puis résume. Chaque agent a son domaine et son modèle.
const AGENTS = {
  chercheur: {
    model: 'sonnet',
    background: false,
    description: "Recherche web, veille IA, comparaison d'outils ou d'offres, vérification de faits, collecte d'infos sur une entreprise ou un site. À utiliser dès qu'il faut chercher ou vérifier une information.",
    prompt: "Tu es l'agent chercheur de Luffy, l'assistant de Mathis. Tu cherches, recoupes et vérifies. Cite tes sources (URL), distingue les faits des suppositions, n'invente jamais de chiffre. Rends un compte rendu court et structuré à Luffy, en français.",
  },
  redacteur: {
    model: 'opus',
    background: false,
    skills: ['humanizer', 'docx'],
    description: "Rédaction et mise en forme : emails, posts, rapports, synthèses, documents Word, réécriture. À utiliser pour tout texte à livrer.",
    prompt: "Tu es l'agent rédacteur de Luffy, l'assistant de Mathis. Tu rédiges en français, adapté au destinataire, puis tu passes le texte par l'esprit du skill humanizer avant de le rendre. Si tu crées un fichier, donne son chemin exact. Ne régénère jamais un fichier que Mathis a modifié : applique par-dessus.",
  },
  prof_bts: {
    model: 'opus',
    background: false,
    skills: ['bts-mco'],
    description: "BTS MCO de Mathis : révisions, fiches, quiz, exercices de calcul, cas pratiques, droit, préparation des épreuves. À utiliser pour tout ce qui touche à ses cours.",
    prompt: "Tu es l'agent prof BTS de Luffy. Appuie-toi sur le skill bts-mco. En exercice, quiz ou cas pratique, Mathis cherche d'abord : ne donne la correction que s'il la demande. Jamais de rendu noté à sa place.",
  },
  technicien: {
    model: 'opus',
    background: false,
    description: "Informatique et code : diagnostic et réglage du PC, scripts, installations, sites web, applis, dépannage. À utiliser pour toute tâche technique en plusieurs étapes.",
    prompt: "Tu es l'agent technicien de Luffy. Tu travailles méthodiquement : diagnostiquer, agir, vérifier. Tu ne fais rien d'irréversible sans accord, tu sauvegardes avant de modifier une config. Rends à Luffy ce qui a été fait, vérifié, et ce qui reste.",
  },
  createur: {
    model: 'sonnet',
    background: false,
    description: "Création visuelle fixe : images (générées en local avec ComfyUI sur D:\\IA quand il tourne, sinon Pollinations), visuels Canva, maquettes. À utiliser pour produire une image ou un visuel. Pour toute vidéo, passer par l'agent realisateur.",
    prompt: "Tu es l'agent créateur de Luffy. Pour générer une image en local : lance D:\\IA\\lancer-ia-locale.ps1 si ComfyUI (http://127.0.0.1:8188) ne répond pas, puis powershell -File D:\\IA\\outils\\generer-image.ps1 -Prompt \"<prompt en anglais>\" -Modele flux -Largeur <l> -Hauteur <h> -Sortie \"<chemin.png>\". Tu écris des prompts d'image précis, tu génères, tu vérifies le résultat en le regardant, et tu ranges les images dans E:\\Mathis\\Perso\\Images IA\\. Donne le chemin du fichier final.",
  },
  realisateur: {
    model: 'opus',
    background: false,
    skills: ['remotion-best-practices', 'montage-video'],
    description: "Vidéo : génération de clips par IA en local (Wan 2.2), montage (couper, assembler, musique, textes, transitions, formats TikTok/YouTube) et motion design (titres animés, intros, textes animés avec Remotion). À utiliser pour toute demande de vidéo, d'animation ou de montage.",
    prompt: `Tu es l'agent réalisateur de Luffy, l'assistant de Mathis. Tu fabriques des vidéos sur son PC, sans service payant.
Tes outils :
1. Clips générés par IA (modèle local Wan 2.2) : powershell -File D:\\IA\\outils\\generer-video.ps1 -Prompt "<scène en anglais, avec le mouvement et la caméra>" -Duree <s> [-PromptsSuite "<clip 2>","<clip 3>"] [-Format portrait] [-ImageDepart <png>] -Sortie "<chemin.mp4>". 5 s max par clip : au-delà, le script enchaîne les clips (la dernière image de l'un démarre le suivant) ; utilise -PromptsSuite pour faire avancer l'action d'un clip à l'autre. Compte environ 2 à 3 min de calcul par seconde de vidéo : préviens Mathis du temps avant de lancer, et lance la commande avec un délai long. Prérequis : ComfyUI (http://127.0.0.1:8188) qui tourne (sinon lance D:\\IA\\lancer-ia-locale.ps1 et attends qu'il réponde) et le disque E: branché. Pour un départ précis (un personnage, un décor), génère d'abord une image avec D:\\IA\\outils\\generer-image.ps1 -Modele flux puis passe-la en -ImageDepart.
2. Montage : ffmpeg (skill montage-video). Ne jamais écraser une vidéo de Mathis : nouveau nom de sortie.
3. Motion design : projet Remotion dans D:\\IA\\motion (skill remotion-best-practices). Une animation = un fichier dans src/compositions/ + une <Composition> dans src/Root.tsx ; rendu : cd D:\\IA\\motion ; npx remotion render src/index.ts <Id> "<sortie.mp4>" (props via un fichier JSON : --props=chemin.json). Exemple existant : composition « Titre ».
Limites à dire honnêtement : les clips IA locaux font des visages et des gestes approximatifs, pas de son généré, résolution 832×480. Range les vidéos dans E:\\Mathis\\Perso\\Videos IA\\ et donne le chemin final. Ouvre la vidéo finie pour Mathis avec Start-Process.`,
  },
};
const ORCHESTRATION = `
# Ton rôle : chef d'équipe
Tu disposes d'une équipe d'agents (outil Agent) : chercheur, redacteur, prof_bts, technicien, createur (images), realisateur (vidéo, montage, motion design).
- Question simple, conversation, info déjà connue, petite tâche : réponds toi-même, vite, sans rien demander.
- Tâche complexe qui serait plus simple ou meilleure avec plusieurs agents (plusieurs métiers à la fois, parties indépendantes à faire en parallèle, ou travail long qui gagne à être confié à un spécialiste) : AVANT de lancer l'équipe, demande l'accord de Mathis avec l'outil AskUserQuestion. Dans la question, dis en une ou deux phrases quels agents tu lancerais et pourquoi ce serait mieux (gain de temps en parallèle, règles du métier, qualité, modèle plus fort…). Deux options : « Oui, lance l'équipe » et « Non, fais-le toi-même ». Si oui : délègue à chaque agent avec une consigne complète (contexte, objectif, format attendu), en mode premier plan (run_in_background: false), puis résume les résultats. Si non : fais le travail toi-même, sans agent.
- Ne pose cette question que pour une vraie tâche complexe, jamais pour une demande simple, et une seule fois par demande.
- En mode vocal : la question doit tenir en une phrase courte à l'oral ; une fois l'équipe lancée, annonce qui travaille, puis donne le résultat en quelques phrases.`;

// Une erreur imprévue ne doit jamais faire tomber le serveur (la page afficherait « network error ») :
// on la note dans erreurs.log et on continue.
const ERR_FILE = path.join(APP_DIR, 'erreurs.log');
function logError(where, e) {
  const line = `[${new Date().toLocaleString('fr-FR')}] ${where} : ${(e && e.stack) || e}\n`;
  try { fs.appendFileSync(ERR_FILE, line); } catch {}
}
process.on('uncaughtException', e => logError('uncaughtException', e));
process.on('unhandledRejection', e => logError('unhandledRejection', e));

// Seule exception aux cartes d'accord : ouvrir un lien web ou un document pour Mathis (il l'a demandé).
// Uniquement « Start-Process <lien ou fichier> » seul : pas de programme (.exe, .bat…), pas d'option, pas de 2e commande.
const OPEN_EXT = /\.(html?|pdf|docx?|xlsx?|pptx?|odt|ods|odp|txt|md|csv|png|jpe?g|gif|webp|svg|mp4|webm|mov|mp3|wav)$/i;
function isSafeOpen(name, input) {
  if (name !== 'PowerShell') return false;
  const m = String(input?.command || '').trim().match(/^Start-Process\s+(?:-FilePath\s+)?(["'])([^"'`$;|&\r\n]+)\1$/i);
  if (!m) return false;
  const target = m[2].trim();
  if (/^https?:\/\/[^\s]+$/i.test(target)) return true;
  return /^[A-Za-z]:\\/.test(target) && OPEN_EXT.test(target);
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.ico': 'image/x-icon', '.css': 'text/css' };

// Derniers connecteurs et quota vus (pour l'affichage)
const CONN_FILE = path.join(APP_DIR, 'connecteurs.json');
let connectors = [];
try { connectors = JSON.parse(fs.readFileSync(CONN_FILE, 'utf8')); } catch {}
const USAGE_FILE = path.join(APP_DIR, 'quota.json');
let usage = null;
try { usage = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8')); } catch {}
// Modèles disponibles (lus auprès de Claude Code après chaque réponse)
const MODELS_FILE = path.join(APP_DIR, 'modeles.json');
let models = [];
try { models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8')); } catch {}

// Discussion en cours : une seule à la fois
let current = null; // { q, pending: Map<id, resolve> }

// Accords « Toujours dans cette discussion » : par discussion, par outil (et par commande pour le terminal)
const always = new Map(); // id de discussion → Set de clés
const ruleKey = (name, input) => (name === 'Bash' || name === 'PowerShell') ? name + ':' + String(input.command || '').trim().split(/s+/)[0] : name;

function recent() {
  try {
    const h = fs.readFileSync(path.join(WORKSPACE, 'history.md'), 'utf8');
    return [...h.matchAll(/^## (\d{4})-(\d{2})-(\d{2}) · (.+)$/gm)]
      .slice(0, 5)
      .map(m => ({ date: `${m[3]}/${m[2]}`, title: m[4].trim() }));
  } catch { return []; }
}

function readBody(req, max = 40e6) {
  return new Promise((resolve, reject) => {
    let size = 0; const parts = [];
    req.on('data', c => { size += c.length; if (size > max) { reject(new Error('trop gros')); req.destroy(); } else parts.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}')); } catch (e) { reject(e); } });
  });
}

const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };

// Résumé lisible de ce qu'un outil veut faire, pour la demande d'autorisation
function describe(name, input) {
  const s = v => String(v ?? '').slice(0, 400);
  if (name === 'Bash' || name === 'PowerShell') return { action: 'lancer une commande', detail: s(input.command) };
  if (name === 'Write') return { action: 'créer ou remplacer un fichier', detail: s(input.file_path) };
  if (name === 'Edit' || name === 'MultiEdit' || name === 'NotebookEdit') return { action: 'modifier un fichier', detail: s(input.file_path || input.notebook_path) };
  if (name === 'WebFetch') return { action: 'ouvrir une page web', detail: s(input.url) };
  if (name === 'WebSearch') return { action: 'chercher sur le web', detail: s(input.query) };
  if (name.startsWith('mcp__')) {
    const [, server, tool] = name.split('__');
    return { action: `utiliser ${server.replace(/^claude_ai_/, '').replace(/_/g, ' ')} (${tool})`, detail: s(JSON.stringify(input)) };
  }
  return { action: `utiliser l'outil ${name}`, detail: s(JSON.stringify(input)) };
}

async function chat(req, res) {
  let body;
  try { body = await readBody(req); } catch { return json(res, 400, { error: 'requête illisible ou fichiers trop gros' }); }
  const { message = '', session, voice, attachments = [], model, effort } = body;
  if (!message.trim() && !attachments.length) return json(res, 400, { error: 'message vide' });
  if (current) return json(res, 409, { error: 'Luffy est déjà en train de répondre' });

  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
  const send = obj => { if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n'); };

  // Pièces jointes : images envoyées telles quelles, autres fichiers rangés dans contexte-import/
  const content = [];
  const saved = [];
  for (const a of attachments) {
    if (!a || !a.data) continue;
    if (IMAGE_TYPES.includes(a.type)) {
      content.push({ type: 'image', source: { type: 'base64', media_type: a.type, data: a.data } });
    } else {
      fs.mkdirSync(IMPORT_DIR, { recursive: true });
      const stamp = new Date().toISOString().slice(0, 10);
      const safe = path.basename(String(a.name || 'fichier')).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
      const dest = path.join(IMPORT_DIR, `${stamp}_${safe}`);
      fs.writeFileSync(dest, Buffer.from(a.data, 'base64'));
      saved.push(dest);
    }
  }
  let text = message.trim();
  if (saved.length) text += `\n\n[Fichiers joints par Mathis, enregistrés ici : ${saved.join(' ; ')}]`;
  if (voice) text = VOICE_TAG + text;
  content.push({ type: 'text', text: text || 'Regarde la pièce jointe.' });

  const { query } = await sdkReady;
  const pending = new Map();
  let n = 0;
  let sid = session && /^[0-9a-f-]{36}$/i.test(session) ? session : null;
  const allowedHere = () => { if (!sid) return null; if (!always.has(sid)) always.set(sid, new Set()); return always.get(sid); };

  // Chaque demande d'autorisation ou question à choix part vers la page et attend la réponse de Mathis
  const canUseTool = (name, input, opts) => new Promise(resolve => {
    if (name !== 'AskUserQuestion' && allowedHere()?.has(ruleKey(name, input))) return resolve({ behavior: 'allow', updatedInput: input });
    if (isSafeOpen(name, input)) return resolve({ behavior: 'allow', updatedInput: input });
    const id = 'a' + (++n);
    if (name === 'AskUserQuestion') {
      pending.set(id, answers => resolve(answers
        ? { behavior: 'allow', updatedInput: { ...input, answers } }
        : { behavior: 'deny', message: "Mathis n'a pas répondu à la question." }));
      send({ t: 'question', id, questions: input.questions });
    } else {
      pending.set(id, decision => resolve(
        decision === 'allow' ? { behavior: 'allow', updatedInput: input } :
        decision === 'always' ? (allowedHere()?.add(ruleKey(name, input)), { behavior: 'allow', updatedInput: input }) :
        { behavior: 'deny', message: 'Mathis a refusé cette action. Demande-lui comment il veut procéder.' }));
      send({ t: 'permission', id, tool: name, ...describe(name, input) });
    }
    opts.signal?.addEventListener('abort', () => { if (pending.has(id)) { pending.delete(id); resolve({ behavior: 'deny', message: 'Interrompu.' }); } });
  });

  async function* prompt() {
    yield { type: 'user', message: { role: 'user', content }, parent_tool_use_id: null, session_id: '' };
  }

  const q = query({
    prompt: prompt(),
    options: {
      cwd: WORKSPACE,
      // Même consignes de base que Claude Code dans VS Code (sans ça, le SDK part d'un prompt minimal)
      systemPrompt: { type: 'preset', preset: 'claude_code', append: ORCHESTRATION },
      agents: AGENTS,
      // Outils qui ne font que lire : pas de carte d'accord (le reste demande toujours)
      allowedTools: ['Agent', 'Skill', 'WebSearch', 'WebFetch', 'Read', 'Glob', 'Grep', 'TodoWrite'],
      resume: session && /^[0-9a-f-]{36}$/i.test(session) ? session : undefined,
      model: typeof model === 'string' && /^[\w.\-[\]]{1,60}$/.test(model) ? model : undefined,
      // Niveau de réflexion choisi dans la page (rapide → max)
      effort: ['low', 'medium', 'high', 'xhigh', 'max'].includes(effort) ? effort : undefined,
      permissionMode: 'acceptEdits',
      includePartialMessages: true,
      canUseTool,
    },
  });
  current = { q, pending };

  // Fenêtre fermée en cours de réponse : on arrête Claude Code
  let finished = false;
  res.on('close', () => { if (!finished && current && current.q === q) q.interrupt().catch(() => {}); });
  // Petit signal toutes les 20 s pendant les longs travaux (agents, vidéo) pour garder la connexion vivante
  const ping = setInterval(() => send({ t: 'ping' }), 20000);

  try {
    for await (const ev of q) {
      if (ev.type === 'system' && ev.subtype === 'init' && ev.session_id) {
        // Une discussion reprise garde ses accords ; une nouvelle hérite de ceux donnés avant que son id soit connu
        if (!sid) sid = ev.session_id;
        else if (sid !== ev.session_id) { always.set(ev.session_id, always.get(sid) || new Set()); sid = ev.session_id; }
      }
      const out = translate(ev);
      if (Array.isArray(out)) out.forEach(send); else if (out) send(out);
      // Réponse finie : on libère la page tout de suite, puis on relit le statut des connecteurs
      // (au démarrage certains, comme Wix, sont encore « en connexion »)
      if (ev.type === 'result') {
        finished = true;
        if (current && current.q === q) current = null;
        res.end();
        try { models = (await q.supportedModels()).map(m => ({ value: m.value, name: m.displayName || m.value, desc: m.description || '' })); fs.writeFile(MODELS_FILE, JSON.stringify(models), () => {}); } catch {}
        for (let i = 0; i < 10; i++) {
          try { saveConnectors(await q.mcpServerStatus()); } catch { break; }
          if (!connectors.some(c => c.status === 'pending')) break;
          await new Promise(r => setTimeout(r, 1500));
        }
        break;
      }
    }
  } catch (e) {
    logError('chat', e);
    send({ t: 'error', text: String(e.message || e).slice(0, 400) });
  } finally {
    clearInterval(ping);
    for (const r of pending.values()) r(null);
    if (current && current.q === q) current = null;
    res.end();
  }
}

// Réduit les messages du SDK à ce dont la page a besoin
function saveConnectors(list) {
  connectors = (list || []).filter(m => !m.name.startsWith('plugin:')).map(m => ({ name: m.name.replace(/^claude\.ai /, ''), status: m.status }));
  fs.writeFile(CONN_FILE, JSON.stringify(connectors), () => {});
}

// Quel agent tourne derrière chaque appel de l'outil Agent (pour afficher « technicien · Bash »)
const agentOf = new Map();

// Quelques mots sur la cible d'un outil : nom de fichier, recherche, site, description de la commande
const short = (s, n = 38) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
function toolDetail(name, i) {
  const file = i.file_path || i.notebook_path || i.path;
  if (/^(Read|Write|Edit|NotebookEdit)$/.test(name) && file) return path.basename(String(file));
  if (/^(Bash|PowerShell)$/.test(name)) return short(i.description ? i.description.charAt(0).toLowerCase() + i.description.slice(1) : String(i.command || '').split(/\s+/)[0]);
  if (name === 'WebSearch') return short(i.query);
  if (name === 'WebFetch') { try { return new URL(i.url).hostname.replace(/^www\./, ''); } catch { return ''; } }
  if (name === 'Grep' || name === 'Glob') return short(i.pattern, 28);
  if (name === 'Skill') return short(i.skill);
  if (name.startsWith('mcp__')) return short(i.title || i.name || i.query || i.fileId || '', 30);
  return '';
}

function translate(ev) {
  if (ev.type === 'system' && ev.subtype === 'init') {
    saveConnectors(ev.mcp_servers);
    return { t: 'session', id: ev.session_id, connectors };
  }
  // Message complet : on connaît l'outil ET ce qu'il vise (fichier, recherche, commande…) → « Luffy écrit index.html »
  if (ev.type === 'assistant') {
    const uses = (ev.message?.content || []).filter(b => b.type === 'tool_use');
    if (!uses.length) return null;
    return uses.map(u => {
      if (!ev.parent_tool_use_id && (u.name === 'Agent' || u.name === 'Task')) {
        const who = u.input?.subagent_type || 'agent'; agentOf.set(u.id, who);
        return { t: 'tool', name: `Agent ${who}`, detail: short(u.input?.description) };
      }
      const name = ev.parent_tool_use_id ? `${agentOf.get(ev.parent_tool_use_id) || 'agent'} · ${u.name}` : u.name;
      return { t: 'tool', name, detail: toolDetail(u.name, u.input || {}) };
    });
  }
  if (ev.type === 'stream_event') {
    const e = ev.event;
    if (ev.parent_tool_use_id) return null; // travail d'un agent : affiché via le message complet
    if (e.type === 'content_block_delta' && e.delta?.type === 'text_delta') return { t: 'text', text: e.delta.text };
    if (e.type === 'message_start') return { t: 'turn' };
  }
  if (ev.type === 'rate_limit_event') { usage = { ...ev.rate_limit_info, at: Date.now() }; fs.writeFile(USAGE_FILE, JSON.stringify(usage), () => {}); return { t: 'usage', usage }; }
  if (ev.type === 'result') return { t: 'done', id: ev.session_id, error: ev.is_error ? (ev.result || ev.subtype) : null };
  return null;
}

// Liste et contenu des anciennes discussions (celles de VS Code comprises)
async function sessions(res) {
  const { listSessions } = await sdkReady;
  const list = await listSessions({ dir: WORKSPACE, limit: 60 });
  json(res, 200, list.map(s => ({ id: s.sessionId, title: (s.customTitle || s.summary || s.firstPrompt || 'Discussion').slice(0, 90), at: s.lastModified })));
}

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter(b => b.type === 'text').map(b => b.text).join('\n');
}

async function sessionMessages(id, res) {
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return json(res, 400, []);
  const { getSessionMessages } = await sdkReady;
  const msgs = await getSessionMessages(id, { dir: WORKSPACE });
  const out = [];
  for (const m of msgs) {
    if (m.parent_tool_use_id) continue;
    const c = m.message?.content;
    if (m.type === 'user') {
      if (Array.isArray(c) && c.some(b => b.type === 'tool_result')) continue;
      let t = textOf(c).replace(VOICE_TAG, '');
      t = t.replace(/<(ide_selection|system-reminder|ide_opened_file)>[\s\S]*?<\/\1>/g, '').trim();
      if (!t || /^<(command|local-command)/.test(t)) continue;
      out.push({ role: 'me', text: t, images: Array.isArray(c) ? c.filter(b => b.type === 'image').length : 0 });
    } else if (m.type === 'assistant') {
      const t = textOf(c).trim();
      if (!t) continue;
      // Chaque message de Luffy reste une bulle à part (comme en direct)
      out.push({ role: 'bot', text: t });
    }
  }
  json(res, 200, out.slice(-80));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'POST' && url.pathname === '/api/chat') return await chat(req, res);
    if (req.method === 'POST' && url.pathname === '/api/answer') {
      const { id, value } = await readBody(req, 1e5);
      const r = current && current.pending.get(id);
      if (r) { current.pending.delete(id); r(value); }
      return json(res, 200, { ok: !!r });
    }
    if (req.method === 'POST' && url.pathname === '/api/stop') {
      if (current) { for (const r of current.pending.values()) r(null); current.pending.clear(); await current.q.interrupt().catch(() => {}); }
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/sessions') return await sessions(res);
    if (url.pathname === '/api/session') return await sessionMessages(url.searchParams.get('id'), res);
    if (url.pathname === '/api/recent') return json(res, 200, recent());
    if (url.pathname === '/api/connectors') return json(res, 200, connectors);
    if (url.pathname === '/api/models') return json(res, 200, models);
    if (url.pathname === '/api/agents') return json(res, 200, Object.entries(AGENTS).map(([id, a]) => ({ id, model: a.model, desc: a.description })));
    if (url.pathname === '/api/usage') return json(res, 200, usage);
    if (url.pathname === '/api/connecteurs-claude') {
      exec('start "" "https://claude.ai/settings/connectors"');
      res.writeHead(204); return res.end();
    }
    if (url.pathname === '/api/open') {
      const dir = FOLDERS[url.searchParams.get('k')];
      if (dir) { fs.mkdirSync(dir, { recursive: true }); exec(`explorer "${dir}"`); }
      res.writeHead(204); return res.end();
    }
  } catch (e) {
    logError(url.pathname, e);
    if (!res.headersSent) return json(res, 500, { error: String(e.message || e) });
    return res.end();
  }
  // Fichiers statiques du dossier de l'appli uniquement
  const file = path.join(APP_DIR, url.pathname === '/' ? 'index.html' : path.normalize(decodeURIComponent(url.pathname)));
  if (!file.startsWith(APP_DIR) || file.includes('node_modules')) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, data) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Luffy prêt sur http://localhost:${PORT}`));
