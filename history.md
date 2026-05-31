# 📜 Historique — Journal des échanges

Journal chronologique des tâches et décisions importantes. **Entrée la plus récente en haut.** Format : `date · sujet · résultat`.

---

## À FAIRE — Prochaine session (priorités)

1. **Connexion boutique ↔ Supabase** : boutique.html et produit.html chargent depuis Supabase. Road Spirit gère son catalogue depuis l'app interne. Importer les 150 produits JSON dans Supabase d'abord.
2. **PWA (Progressive Web App)** : manifest.json + meta tags → l'app s'installe comme une vraie app sur téléphone/tablette/desktop en un clic.
3. **Bouton "Accéder au site web"** dans l'app interne → lien vers le site Road Spirit.

---

## 2026-05-31 · À FAIRE EN PRIORITÉ — Connexion boutique ↔ Supabase

- **Problème identifié :** la boutique charge depuis `catalogue-data.js` (statique), l'app gère les produits dans Supabase → les deux ne sont pas connectés. Road Spirit ne peut pas gérer son catalogue sans toucher au code.
- **Ce qu'il faut faire :**
  1. Créer la table `produits` dans Supabase (Mathis doit le faire côté dashboard)
  2. Importer les 150 produits du JSON dans Supabase
  3. Modifier `boutique.html` et `produit.html` pour charger depuis Supabase
  4. Garder `catalogue-data.js` en fallback si Supabase indisponible
- **Estimation Claude :** ~30 min de code. Bloquant : Mathis doit créer les tables Supabase d'abord.

## 2026-05-31 · App interne — vue vendeur enrichie + fix syntaxe JS

- **Ajouts :** sidebar réorganisée (Commandes / Essais / Catalogue), pages "À préparer", "Expédiées", "Essais du jour", actions rapides inline, démo auto sur file:// et localhost.
- **Bug corrigé :** backtick mal placée ligne 942 bloquait 100% du JS (boutons muets).
- **OUVRIR.html** créé à la racine du workspace pour accès rapide site + app.

## 2026-05-31 · Refonte qualité site Road Spirit v4

- **shared.css/js** créés : palette unifiée (#D4A853), nav partagée, SEO sur toutes les pages, favicon SVG.
- **Hero :** Speed Triple remplace le globe particules (GSAP float + parallax).
- **Équipements :** fond transparent via Cloudinary `e_background_removal`, effet flottant CSS.
- **Boutique :** catalogue embarqué dans `catalogue-data.js` (fonctionne sans serveur).
- **Devis Road Spirit 2026-001** : 6 600 € HT créé (HTML + docx).

---

## 2026-05-31 · Animation équipement Road Spirit + clé Gemini (Nano Banana)

- **Demande :** faire « tourner » le blouson et les gants sur la home en 3D (rendu pro), pour proposer le site à l'entreprise.
- **Action :** d'abord rotation 360° à plat → effet « carte 2D » moche. Remplacé par un **faux-3D** (balancement ±26° avec perspective, flottement, ombre au sol dynamique, pause au survol, `prefers-reduced-motion`). Dans `Road Spirit.html`, classe `.eq-photo-i`. Commit `0abfdfd` poussé.
- **Vrai 360° fidèle (reporté) :** prévu via Nano Banana (Gemini image) = générer 6-8 angles par produit puis les enchaîner. Clé API Gemini de Mathis ajoutée dans `.env` (format `AQ.…`, valide, HTTP 200). **Bloqué :** génération d'images en `quota:0` sur le free tier → exige la **facturation à l'usage** activée sur le projet Google Cloud (≠ abonnement 8 €/mois, qui ne débloque PAS l'API). À faire si l'entreprise valide : activer billing → génération (~<1 € pour 16 images).
- **Note :** Mathis veut proposer ce site à l'entreprise (concession Triumph). Version « clean de A à Z » à prévoir si intérêt.

## 2026-05-31 · Audit + corrections fonctionnelles site Road Spirit

- **Problèmes corrigés :**
  - Boutons "+ Panier" page d'accueil : ajoutent maintenant vraiment au localStorage (étaient purement cosmétiques)
  - Lien "Voir les casques" → renvoyait 0 résultat (catégorie inexistante) → redirige maintenant vers la page casques Triumph × Arai officielle
  - Modal Stripe orphelin dans panier.html supprimé (CSS + HTML + JS)
  - Formulaire contact services.html : vrai formulaire ajouté avec envoi Formspree ou fallback mailto pré-rempli ; option "Demande d'essai" retirée (déjà gérée par bouton Triumph)
  - Anchor motos : hash `#tiger` ne correspondait pas à la clé `tiger-900` → corrigé dans Road Spirit.html et motos.html
  - Stripe Payment Link câblé dans paiement.html via variable `STRIPE_LINK` — prêt à l'emploi dès qu'une URL Stripe est posée
- **À faire par Mathis :**
  - Formspree : formspree.io → créer compte → coller l'ID dans `FORMSPREE_ID` dans services.html
  - Stripe : dashboard stripe.com → Payment Link → coller l'URL dans `STRIPE_LINK` dans paiement.html

## 2026-05-31 · Complétion images produits + page paiement Road Spirit

- **Demande :** corriger toutes les images manquantes sur le site (catalogue + pages), ajouter une page de paiement.
- **Images :** 26 produits avec `image: null` dans `catalogue-roadspirit.json` → tous remplis avec des URLs réelles de `media.triumphmotorcycles.co.uk`. Sources : Triumph FR officiel (polos Lustleigh, casquettes, magnet, sacs). Produits discontinués (coques iPhone/Samsung, magnets x6) → image accessoire Triumph la plus proche.
- **Page paiement :** `livrable/site-web/paiement.html` créée (35 Ko). Contenu : barre de progression 3 étapes, formulaire livraison complet, choix mode de livraison (Colissimo / Chronopost / retrait), paiement par carte (avec détection VISA/MC/AMEX + formatage auto) / PayPal / virement, résumé commande sticky depuis localStorage, calcul total dynamique, validation HTML5, overlay de confirmation avec vidage du panier. Design 100% cohérent avec le reste du site (noir, orange, mêmes typos).
- **Panier :** bouton "Passer commande" redirige désormais vers `paiement.html` au lieu d'ouvrir la modale Stripe.
- **À faire pour la prod :** remplacer la simulation de paiement (setTimeout) par un vrai appel Stripe Checkout / Payment Link.

## 2026-05-30 · À FAIRE — Refaire l'interface de l'appli interne avec Claude Design

- **Rappel explicite de Mathis** : refaire l'UI de `interne/app.html` via Claude Design pour un rendu plus soigné, puis rebrancher le code Supabase dessus.
- À faire après avoir terminé la connexion Supabase + création du compte admin.

## 2026-05-30 · Prompt refonte roadspirit.fr (Claude Design)

- **Demande :** refonte totale du site roadspirit.fr (concessionnaire Triumph Toulon) — moderne, dynamique, belles animations. Recherche préalable des meilleurs skills web + audit sécurité.
- **Action :** analyse du site (secteur moto, e-commerce + showroom, design noir/rouge statique). Recherche de skills : `frontend-design` (officiel Anthropic, déjà installé) retenu. Koomook/claude-frontend-skills écarté (structure inaccessible publiquement). Prompt complet rédigé et sauvegardé dans `livrable/site-web/prompt-refonte-roadspirit.md`.
- **Contenu du prompt :** direction editoriale cinématique, palette noir-charbon + orange Triumph, typos Bebas Neue + Barlow Condensed, 6 animations CSS natives (hero reveal, scroll reveal, nav sticky, card hover, CTA slide, clip-path sections), 7 sections (nav, hero, motos, équipement, services, brand story, footer), HTML single-file deployable.
- **À faire :** coller le prompt dans claude.ai/design → récupérer le HTML → importer dans le workspace.

## 2026-05-30 · Skill `humanizer` installé + rendu obligatoire pour les docs

- **Demande :** cloner, analyser et installer le skill `humanizer` (repo `blader/humanizer`) ; l'utiliser obligatoirement pour toute rédaction/complétion de docs.
- **Action :** skill cloné dans `~/.claude/skills/humanizer` (hors repo workspace). Analyse : sûr (Markdown only, MIT, aucun script/réseau), qualité OK (v2.7.0, 30 patterns anti-« tells » IA). Nettoyé (`.git` + dossier nesté vides supprimés). Règle d'usage obligatoire ajoutée dans `CLAUDE.md` (étape « Livrer »).
- **Limite :** skill anglophone → appliquer l'esprit au français. Skill local machine → à recloner sur le Mac.

## 2026-05-30 · Prompt site web « grenouilles » (Claude Artifacts)

- **Demande :** créer un prompt pour générer via Claude un site vitrine esthétique autour des grenouilles (informer + business de vente), conceptuel mais réalisable.
- **Action :** prompt rédigé puis sauvegardé dans `livrable/site-web/prompt-site-grenouilles.md`. Commit `df436a9` poussé sur `main`.
- **Choix assumés :** angle business = élevage responsable + accessoires (à ajuster). Note réglo CITES intégrée au fichier.

## 2026-05-30 · Git + mise en ligne sur GitHub (sync PC ↔ Mac)

- **Demande :** versionner le workspace et pouvoir le retrouver sur Mac.
- **Action :** `git init` + 1er commit (identité locale du dépôt : Mathis Gourden / mathisgourden05@gmail.com). Dépôt distant créé : **https://github.com/mathisgourden05-ux/luffy-workspace** (Private). Branche `main` poussée. `.env` exclu (non versionné).
- **Infos durables :** pseudo GitHub = `mathisgourden05-ux` (nom d'affichage « Akalix »). `gh` CLI non installé → on fait au git classique.
- **Rappel pour Mathis :** sur Mac → `git clone` puis recréer `.env` à la main (via `.env.example`). Rythme : `git pull` en début de session, `git add -A && git commit -m "..." && git push` en fin.

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
