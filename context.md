# 🧠 Contexte — Mémoire durable sur Mathis

Ce que Luffy sait de Mathis et qui reste vrai dans le temps. Mis à jour au fil des échanges. Chargé automatiquement au démarrage (importé depuis `CLAUDE.md`).

## Profil

- **Prénom :** Mathis
- **Email :** mathisgourden05@gmail.com
- **Langue de travail :** français
- **Études :** BTS MCO (Management Commercial Opérationnel), fin de 1re année (au 30/05/2026).
- **Situation actuelle :** en stage (BTS) au 30/05/2026.
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
- **Direction qui se précise (2026-06-17) :** devenir **prestataire IA pour les PME locales** — création de sites + automatisations IA (Make/n8n + API Claude) + CRM, vendus en package clé en main. A demandé à Luffy de le **former pour de vrai** (compétence technique + arguments de vente + posture) afin de vendre/transmettre avec assurance. **Pas encore d'auto-entreprise → à créer** (statut micro-entrepreneur ; bon timing = quand un 1er client concret arrive, pas avant). ⚠️ À vérifier avant : cumul avec son statut étudiant BTS + sa convention de stage (clause d'exclusivité ?). Luffy n'est pas juriste → s'appuyer sur sources officielles (URSSAF, service-public.fr, guichet unique INPI), ne pas inventer chiffres/démarches.

## Moyens & contraintes

- **Temps disponible :** variable selon les périodes (études, stage, examens).
- **Présence en ligne :** part de zéro (aucun compte développé).
- **Budget :** non précisé (à demander si une piste nécessite un investissement).

## Préférences de communication

- Réponses **concises et directes**, sans verbiage.
- Minimum de formatage superflu.
- Apprécie qu'on **pointe les tensions/incohérences** dans ses choix plutôt que de tout valider.

## Outils & écosystème

- Pas de connecteur branché par défaut.
- **Consigne de Mathis :** Luffy demande quel connecteur activer au moment où il en a besoin (Google Drive, Gmail, Canva, Slack, etc.), plutôt que de présumer.

## Usages prioritaires de Luffy

1. **Études / BTS MCO** — révisions, synthèses, rapports, prépa d'épreuves, dossier de stage.
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
- *(à compléter au fil des échanges : budget, nom définitif de l'assistant, réseau choisi pour le contenu…)*

---

*Dernière mise à jour : 2026-06-16*
