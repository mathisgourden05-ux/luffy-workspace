# 📜 Historique — Journal des échanges

Journal chronologique des tâches et décisions importantes. **Entrée la plus récente en haut.** Format : `date · sujet · résultat`.

---

## 2026-05-30 · Structure workspace : livrable/, contexte-import/ et fichiers env/git

- **Demande :** mettre en place un dossier `livrable/` (sous-dossiers `site-web/`, `applications/`, `BTS/`) avec READMEs, et créer `.env`, `.env.example`, `.gitignore`.
- **Action :** créé `livrable/` + 3 sous-dossiers, chacun avec son `README.md` ; README racine de `livrable/` documentant l'organisation + convention de nommage (`AAAA-MM-JJ_nom-du-projet`, kebab-case). Créé `contexte-import/` (avec README) pour matérialiser la règle d'or **inputs → contexte-import / outputs → livrable**. Créé `.env` (clés préremplies vides : Anthropic, OpenAI, HuggingFace, Notion, Google, YouTube, Vercel, GitHub, Stripe + en-tête « ne jamais committer »), `.env.example` (template public), et `.gitignore` (exclut `.env*`, `*.key`/`*.pem`, `node_modules/`, `dist/`/`.next/`, `.vscode/`/`.idea/`, logs, temporaires).
- **Résultat :** workspace structuré ; secrets protégés du versionnement.

## 2026-05-30 · Status line Claude Code (modèle + contexte + usage abonnement)

- **Demande :** afficher dans Claude Code, comme dans la vidéo, le modèle, le mode 1M context, le % de contexte et l'usage de l'abonnement.
- **Action :** créé `~/.claude/statusline.ps1` (PowerShell) et configuré `statusLine` dans `~/.claude/settings.json`. Affiche `Modèle (1M context) | Context: X% | 5h: Y% | 7j: Z%`. Champs basés sur la doc officielle (`context_window.*`, `rate_limits.*`). Testé avec données simulées : OK.
- **Note :** `5h`/`7j` ne s'affichent que pour les abonnés Pro/Max. À voir aussi : commande `/usage`. À faire côté Mathis : redémarrer Claude Code.

## 2026-05-30 · Icônes VS Code + structure type "starter kit"

- **Demande :** que VS Code ressemble à une capture (kit JARVIS) — icônes colorées + arborescence.
- **Action :** installé l'extension **Material Icon Theme** (`PKief.material-icon-theme`) et activée dans les réglages VS Code (`workbench.iconTheme`). Créé `.claude/commands/` (`prime`, `morning`, `update`, `commit`), la skill `recherche-actualites`, `.claude/settings.local.json`, le dossier `context/` et un `README.md`.
- **Choix assumés :** skill placée dans `.claude/skills/` (et non `skills/` racine) pour qu'elle soit détectée ; `module-installs/` non créé (vide = inutile pour Mathis) ; mémoire existante (`context.md`/`history.md`) conservée intacte.
- **Reste à faire côté Mathis :** redémarrer VS Code pour voir les icônes.

---

## 2026-05-30 · Ajout du skill frontend-design

- **Demande :** vérifier puis installer le skill `frontend-design` (repo officiel `anthropics/skills`).
- **Action :** skill vérifié (officiel, qualité OK, sécurité Safe / 0 alerte). Installé via `npx skills add` ; comme le symlink Claude Code ne s'était pas créé, copie posée manuellement dans `.claude/skills/frontend-design/`.
- **Résultat :** skill détecté par Luffy (frontmatter valide), actif à la prochaine session. Sert à créer des interfaces web soignées (landing pages, composants, dashboards).
- **Note :** doublon possible avec le plugin officiel `frontend-design` déjà présent.

---

## 2026-05-30 · Interview de contexte approfondie

- **Demande :** Mathis a trouvé les premières questions trop légères ; demande un vrai questionnaire.
- **Action :** interview en 3 rounds → `contexte.md` enrichi (profil, objectifs, contraintes, usages).
- **Résultat (profil) :** étudiant BTS MCO, en stage, débutant total, temps variable. Objectif 6 mois = premiers euros avec l'IA. Explore 3 pistes (services / contenu / produits), part de zéro en ligne.
- **Prochaine étape :** aider Mathis à prioriser UNE piste réaliste.

---

## 2026-05-30 · Refonte de l'architecture Luffy

- **Demande :** Mathis veut vérifier la qualité des prompts et passer à un setup pro.
- **Action :** `code.md` renommé en `CLAUDE.md` (seul fichier auto-chargé par Claude Code). `contexte.md` et `historique.md` branchés via imports `@` → chargement automatique au démarrage. Règle de sauvegarde mémoire rendue impérative. Capacités rendues réalistes (dépendantes des connecteurs).
- **Résultat :** Luffy lit désormais sa mémoire sans intervention manuelle. Reste à remplir `contexte.md`.
- **Prochaine étape :** interview pour compléter le contexte ; définir le nom définitif.

---

## 2026-05-30 · Installation de Luffy

- **Demande :** créer un assistant personnel "Luffy" (nom provisoire).
- **Action :** création du dossier avec `code.md`, `contexte.md`, `historique.md`, basé sur les bonnes pratiques de fichiers mémoire d'agents.
- **Résultat :** structure de base livrée.

---
