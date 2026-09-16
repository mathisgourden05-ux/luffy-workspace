# 🧠 Contexte — Mémoire durable sur Mathis

Ce que Luffy sait de Mathis et qui reste vrai dans le temps. Mis à jour au fil des échanges. Chargé automatiquement au démarrage (importé depuis `CLAUDE.md`).

## Profil

- **Prénom :** Mathis
- **Email :** mathisgourden05@gmail.com
- **Langue de travail :** français
- **Études :** BTS MCO (Management Commercial Opérationnel), **2e (dernière) année** depuis la rentrée de septembre 2026. Examen final en fin d'année scolaire (mi-2027).
- **Situation actuelle (au 15/09/2026) :** en 2e année de BTS MCO — année d'examen, donc charge scolaire à prendre en compte dans le temps dispo.
- **Niveau technique :** débutant total — veut des solutions simples, sans code ; ouvert à apprendre au passage.
- **Centre d'intérêt fort :** l'intelligence artificielle.

## Objectifs

- **But général :** gagner de l'argent grâce à l'IA.
- **Objectif court terme (≈ 6 mois) :** faire ses **premiers euros** pour valider qu'une approche fonctionne.
- **Pistes de monétisation envisagées (encore à arbitrer) :**
  1. Services / freelance assistés par l'IA (rédaction, automatisation, community management…).
  2. Création de contenu & audience (à monétiser).
  3. Produits / automatisations (templates, agents, systèmes).
- ⚠️ **Point d'attention :** vise les 3 pistes à la fois alors qu'il est débutant avec un temps variable → Luffy doit l'aider à **prioriser une piste réaliste** plutôt que tout mener de front.
- **⚠️ Statut au 15/09/2026 — TOUS les projets IA en STANDBY.** Mathis met en pause l'ensemble des pistes ci-dessous (prestataire IA, formation Make+IA, CRM artisans, app réseaux, Charlemagne). Aucune avancée depuis juin 2026. Priorité du moment = sa 2e année de BTS (examen). Ne pas relancer ces chantiers de sa part : attendre qu'il redonne le signal. Les notes ci-dessous restent valables pour quand il reprendra.
- **Direction (en pause) qui s'était précisée (2026-06-17) :** devenir **prestataire IA pour les PME locales** — création de sites + automatisations IA (Make/n8n + API Claude) + CRM, vendus en package clé en main. A demandé à Luffy de le **former pour de vrai** (compétence technique + arguments de vente + posture) afin de vendre/transmettre avec assurance. **Pas encore d'auto-entreprise → à créer** (statut micro-entrepreneur ; bon timing = quand un 1er client concret arrive, pas avant). ⚠️ À vérifier avant : cumul avec son statut étudiant BTS + sa convention de stage (clause d'exclusivité ?). Luffy n'est pas juriste → s'appuyer sur sources officielles (URSSAF, service-public.fr, guichet unique INPI), ne pas inventer chiffres/démarches.

## Moyens & contraintes

- **Temps disponible :** variable selon les périodes (études, stage, examens).
- **Présence en ligne :** part de zéro (aucun compte développé).
- **Budget :** serré — **pas de budget à mettre pour l'instant** (juin 2026) sur des outils/API payants. → Pour la formation et le prototypage, privilégier le **gratuit** : API IA gratuite (Google Gemini via AI Studio, pas de carte requise), tier gratuit de Make, etc. **Logique retenue :** ne passer au payant (API Claude, agents Anthropic) que **quand un client paie** (le coût en centimes est couvert par sa facture — Mathis ne sort jamais d'argent de sa poche).

## Préférences de communication

- Réponses **concises et directes**, sans verbiage.
- Minimum de formatage superflu.
- Apprécie qu'on **pointe les tensions/incohérences** dans ses choix plutôt que de tout valider.

## Outils & écosystème

- Pas de connecteur branché par défaut.
- **Consigne de Mathis :** Luffy demande quel connecteur activer au moment où il en a besoin (Google Drive, Gmail, Canva, Slack, etc.), plutôt que de présumer.
- **Connecteurs MCP (état au 2026-09-15) :**
  - **Playwright (navigateur automatisé) INSTALLÉ** sur le PC — scope user, via `claude mcp add-json playwright '{"command":"cmd","args":["/c","npx","-y","@playwright/mcp@latest"]}' --scope user` (lancé depuis **Bash**, pas PowerShell qui casse le parsing des guillemets/`--`). Chromium téléchargé (`npx playwright install chromium`). Serveur testé « ✓ Connected ». ⚠️ **Les outils MCP ne se chargent qu'au DÉMARRAGE d'une session** → après install, il faut **relancer Claude Code** pour que Luffy puisse piloter le navigateur (ouvrir un site, cliquer, lire). **À refaire sur le Mac** (comme Canva) : même commande, mais `command:"npx"` sans le `cmd /c` (spécifique Windows).
  - **Déjà présents via le compte claude.ai (en « Needs authentication », à authentifier via `/mcp`) :** Google Drive, Gmail, Canva, Slack, Cloudinary, Hugging Face, Adobe, LunarCrush, Morningstar, Crypto.com, FMP. → Pour le **Google Drive** que Mathis voulait : PAS besoin d'installer, juste lancer l'auth OAuth (via `/mcp` dans Claude Code, ou côté app claude.ai).
- **🔜 À FAIRE encore :** élargir les **permissions Claude Code** (`settings.json`) pour bosser hors du dossier de travail avec moins de confirmations. ⚠️ Conseil : élargir aux dossiers de travail (Drive, projets, bureau), PAS au système entier.
- **Éditeur de docs préféré = Google Docs** (préférence exprimée le 2026-09-15). Sur son **PC, Microsoft Word n'est PAS installé** ; seul **LibreOffice** l'est (les `.docx` s'ouvrent donc dans LibreOffice Writer). → Quand je livre un document Word, rappeler à Mathis qu'il peut l'**importer dans Google Docs** (drive.google.com → glisser le `.docx` → « Ouvrir avec Google Docs », la mise en forme est conservée). Le format `.docx` reste le bon livrable (il s'importe proprement dans Google Docs). Piste pour plus tard : brancher le connecteur Google Drive pour déposer les livrables directement dans son Drive.

## Usages prioritaires de Luffy

1. **Études / BTS MCO** — révisions, synthèses, prépa d'épreuves, entraînement sur des cas.
   - **⚠️ Mathis ne fait JAMAIS appel à Luffy pour un travail NOTÉ** (précisé le 2026-09-15) — il rend ses devoirs officiels lui-même. Ce qu'on fait ensemble en BTS = **entraînement, compréhension, méthode, révision**, jamais un rendu qui compte. → La mémoire de Luffy ne reflète donc **qu'une petite partie** de son travail BTS réel : ne rien en déduire sur son niveau, et ne jamais présumer un usage « triche ».
2. **Veille IA** — suivre l'actu, repérer outils et opportunités de monétisation.
3. **Organisation / productivité** — planifier, structurer les idées, gérer les tâches.

## Ton & style attendus dans les livrables

- **Variable selon le contexte.** Luffy demande ou propose le ton adapté selon le type de livrable (post réseaux ≠ rapport scolaire ≠ email pro).

## Faits utiles à retenir

- **GitHub :** pseudo `mathisgourden05-ux` (nom d'affichage « Akalix »). Workspace versionné et poussé sur https://github.com/mathisgourden05-ux/luffy-workspace (dépôt privé, branche `main`). `gh` CLI pas installé.
- **Multi-machines :** travaille sur PC + Mac → sync via GitHub. `.env` n'est jamais versionné (à recréer à la main sur chaque machine via `.env.example`).
- **Déploiement Netlify par Luffy :** Mathis a fourni un **token Netlify perso**, stocké dans `.env` (clé `NETLIFY_TOKEN`) — il veut que Luffy le garde pour redéployer ses sites **à la demande**, sans regénérer de token. Méthode = API Netlify (`POST /api/v1/sites` puis `POST /api/v1/sites/{id}/deploys` avec un zip du dossier) en lisant le token depuis `.env`. ⚠️ Ne JAMAIS écrire ce token dans un fichier versionné (context/history/MEMORY) ni l'afficher. Sur le PC, le token devra être recopié dans `.env` (comme les autres clés).
- **MCP Canva :** ajouté sur Mac (2026-06-02) via `claude mcp add --scope user canva npx -- -y mcp-remote@latest https://mcp.canva.com/mcp`. À refaire sur le PC au même endroit. Première utilisation = authentification OAuth Canva dans le navigateur.
- **Matières BTS MCO de Mathis (ordre de son emploi du temps) :** Management / ADOC / DRCV / CEJM / Gestion Opérationnelle. Fichier skill réorganisé dans cet ordre.
- **⚠️ Navigateur — extension Dark Reader (mode sombre) active.** Elle repeint les couleurs des sites en navigation NORMALE, mais est coupée en navigation privée. → **Si Mathis signale un bug de couleurs / de rendu sur un site : faire d'abord ouvrir en navigation privée. Si c'est parfait en privé mais cassé en normal = c'est l'extension, PAS le code.** (S'est produit le 2026-06-02 sur le site Road Spirit : 45 min perdues à corriger un faux bug « liens visités » avant d'identifier Dark Reader.)
- **Portfolio — Road Spirit :** site concession Triumph réalisé de A à Z (Supabase, Netlify, app interne, catalogue, PWA). Archivé comme référence + pièce de portfolio. URL : https://road-spirit.netlify.app. Template réutilisable pour futurs clients boutique/concession.
- **Projet Librairies Charlemagne :** maquette de site vitrine dans `livrable/librairie-charlemagne/` — **2 maquettes au choix** : `index.html` (DA pop coloré) et `editorial.html` (DA éditorial chic), même contenu réel calqué sur https://www.librairiecharlemagne.com (librairie indép. du Var, 6 magasins, fondée 1927, valeurs Enthousiasme/Solidarité/Excellence), même **logo officiel** (`logo-charlemagne.png`) + **rouge marque #E43133**. Pièce de portfolio / démarchage. Mathis doit choisir 1 des 2 ; couvertures livres à finaliser en local (API Google Books capricieuse).
- **Piste produit (formulée le 2026-06-16, stade idée) :** créer un **CRM/outil de gestion vertical pour les artisans du bâtiment** (devis, facturation, suivi clients/chantiers) avec **IA intégrée** (génération de devis, comptes-rendus, relances). Angle différenciant visé = simplicité + IA + couplage avec les sites qu'il crée (leads du site → CRM). ⚠️ À creuser avant de coder : **conformité facturation électronique FR** (réforme PDP / Factur-X qui se déploie 2026-2027 → une vraie facture conforme n'est pas un simple PDF) + concurrents établis (Tolteck, Obat, EBP/Sage Bâtiment). Conseil donné : valider auprès de 3-5 artisans réels AVANT de construire.
- **2e idée produit (formulée le 2026-06-17, stade idée) :** une **app de publication réseaux sociaux** ultra-simple — ajouter une photo + texte déjà rédigé ou généré par IA → publier en 1 clic sur plusieurs réseaux. ⚠️ Piège technique majeur signalé : la **publication multi-réseaux via API** (Meta/Instagram Graph API, TikTok, LinkedIn…) est la partie LA PLUS DURE (API restrictives, validation app par Meta, OAuth, maintenance constante) — c'est la vraie valeur des Buffer/Later, pas l'IA. Marché déjà saturé (Buffer, Later, Metricool, Publer, qui intègrent déjà l'IA). → 2 idées produits maintenant (CRM artisans + app réseaux) : **rappeler à Mathis de n'en construire qu'UNE** quand le moment viendra (son point faible = se disperser).
- **Bibliothèque de skills (nettoyée le 2026-09-15) :** 12 skills actifs dans `.claude/skills/` — `bts-mco`, `docx`, `pptx`, `xlsx`, `humanizer`, `frontend-design` (version officielle marketplace), `recherche-actualites`, `skill-creator`, `claude-md-improver`, `anti-detection-ia` (labo perso, créé le 2026-09-15), `caveman`, `token-efficient`. Les skills design/animation redondants + `mon-equipe-ia` (abandonné) sont dans `skills-archive/` (non chargé, réversible). **Le marketplace officiel Anthropic est installé** (`~/.claude/plugins/marketplaces/claude-plugins-official`) = source de référence pour (ré)installer un skill. ⚠️ Les skills ne sont pas branchés en git → pour en mettre un à jour, re-copier depuis le marketplace.
- **Détection de texte IA — hobby/R&D de Mathis :** Mathis s'amuse (loisir) à tester différents détecteurs d'IA (Compilatio, GPTZero…) et à voir quelles techniques d'humanisation font bouger les scores. **Piste future : construire son propre détecteur d'IA.** Cadre = expérimentation + R&D, **PAS** de la triche (il exclut lui-même de s'en servir pour un rendu noté). → Skill maison créé pour ça : **`anti-detection-ia`** (réécrit un texte pour réduire les marqueurs statistiques — perplexité, burstiness, vocabulaire — + un mode ANALYSE qui explique les signaux, utile pour son projet de détecteur). Complète `humanizer`. ⚠️ Leçon Luffy : 1re réaction = a présumé à tort un usage de triche et a refusé deux fois → **ne pas refaire ce procès d'intention**, répondre à la demande. Seule ligne rouge (que Mathis partage) : ne pas fabriquer/maquiller à sa place un travail scolaire **noté**.
- **Organisation du PC (rangée le 2026-09-16) :** 3 disques — **C:** (930 Go, ~90 % plein : Windows + jeux Steam/Epic/Riot/Battle.net), **D:** (465 Go : Sea of Thieves + WoW), **E:** = Seagate **externe** 1,8 To (Genshin, MTGA, clips Medal, fichiers perso). **Tous les fichiers perso de Mathis sont dans `E:\Mathis`** : `Cours BTS 2/` (Management, ADOC, DRCV, CEJM, Gestion Opérationnelle), `Cours BTS 1/` (CEJM, DM, Divers), `Administratif/` (Mathis {Identité, CV & candidatures, École, Factures & attestations, Autres}, Lauralie, Céline, Appart, Autres), `Projets/4L Trophy`, `Perso/` (Photos, Vidéos, Musique), `Divers/` (Informatique, Web). Raccourci « Mes fichiers (E) » sur le bureau. **Bureau** = 2 dossiers (Jeux, Applications) + ce raccourci ; les raccourcis créés par les installeurs (bureau Public) y sont rangés aussi. **Clips Medal** déplacés sur `E:\Medal` (chemin changé dans `%APPDATA%\Medal\store\settings.json`, sauvegarde `.bak-luffy`). → Quand je livre un fichier perso/cours à Mathis, le ranger dans `E:\Mathis` au bon endroit. ⚠️ E: est externe : s'il est débranché, ses fichiers sont inaccessibles. **Mathis a refusé de désinstaller des jeux** (2026-09-16) : ne pas relancer. Lauralie et Céline = proches de Mathis (leurs papiers admin sont rangés dans `Administratif/`).
- **Génération d'images — solutions validées (2026-09-16) :** (1) **Pollinations** marche sans compte ni clé : `https://image.pollinations.ai/prompt/<prompt urlencodé>?width=1024&height=640&model=flux&nologo=true&seed=N` via `curl` → JPEG (qualité moyenne, petit filigrane). Livrer les images dans `E:\Mathis\Perso\Images IA\` (à créer). (2) **Clé Gemini renouvelée** dans `.env` (`GEMINI_API_KEY`, format `AQ.…`, valide) : OK pour texte/vision, mais **génération d'images = quota 0 en gratuit** (429, exige facturation Google Cloud) — ne pas réessayer sans billing. (3) Pistes prêtes à activer quand Mathis voudra : **Hugging Face** (compte gratuit → token Read → `HUGGINGFACE_API_KEY` dans `.env` → FLUX via Inference API) ou **Gemini web via Playwright** (login Google une fois dans le Chromium Playwright, puis gemini.google.com). Mathis est **OK pour créer des comptes et brancher des connecteurs** : il faut juste lui dire quoi faire, étape par étape.
- **⚠️ Règle de posture (2026-09-16) :** ne jamais répondre « je ne peux pas, pas de connecteur ». Chercher une solution (API publique, script, Playwright, compte gratuit à créer) et guider Mathis. Mentionner la limite seulement après avoir proposé le chemin.
- *(à compléter au fil des échanges : budget, nom définitif de l'assistant, réseau choisi pour le contenu…)*

---

*Dernière mise à jour : 2026-09-16*
