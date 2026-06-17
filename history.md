# 📜 Historique — Journal des échanges

Journal chronologique des tâches et décisions importantes. **Entrée la plus récente en haut.** Format : `date · sujet · résultat`.

---

## 2026-06-17 · Charlemagne — maquette éditoriale mise en ligne

- Maquette `editorial.html` déployée sur Netlify : **https://charlemagne-editorial.netlify.app** (déployée par Luffy via l'API Netlify + token perso fourni par Mathis, usage ponctuel). Vérifié : HTTP 200, logo servi, police Cormorant Garamond présente = bonne maquette.
- La maquette **pop** (`index.html`) a été mise en ligne par Mathis lui-même (Netlify Drop) — URL à récupérer auprès de lui.
- **Token Netlify** utilisé une fois → **Mathis doit le révoquer** (User settings → Applications → Personal access tokens).
- Méthode de déploiement réutilisable : 2 dossiers prêts dans `livrable/librairie-charlemagne/_deploy/` (gitignoré). API Netlify = `POST /api/v1/sites` puis `POST /api/v1/sites/{id}/deploys` avec un zip.
- **Pop aussi déployée par Luffy** (token .env) : **https://charlemagne-pop.netlify.app**. Donc 2 liens propres : charlemagne-pop + charlemagne-editorial. (Le 1er site mélangé déployé par Mathis lui-même peut être supprimé.)
- **Couverture du coup de cœur (Ariol) intégrée en local** : `covers/ariol-vacances.jpg` (récupérée via le CDN Bédéthèque `bedetheque.com/media/Couvertures/Couv_<id>.jpg`, id 539422), référencée en dur dans les 2 maquettes, redéployée. Visible en ligne.
- **⚠️ Couvertures des 12 Edgar Morin = NON récupérables automatiquement** : toutes les sources bloquent cet environnement (Google Books API 429, Google Books images = placeholder gris pour ces ISBN, Decitre/Flammarion/unithèque 403/WAF, epagine = placeholder, OpenLibrary 404). Restent en cartouches. **Solution proposée à Mathis : qu'il enregistre lui-même les 12 images depuis son navigateur (qui, lui, accède à ces sites) → je les câble en local.** Astuce retenue : pour une vraie couv par ISBN, `https://books.google.com/books/content?vid=ISBN<EAN>&printsec=frontcover&img=1&zoom=1` marche (hors rate-limit) MAIS renvoie un placeholder gris si Google n'a pas la couv.
- **Portfolio Digital Project mis à jour** : ajout de Charlemagne en « Réalisation 02 » (visuel 2 maquettes + liens pop & éditorial), redéployé sur https://digit-project.netlify.app (vérifié en ligne).
- Reste : Mathis choisit LA maquette finale ; fournir les couvertures Morin s'il les veut.

## 2026-06-16 · Ménage workspace + portail d'accueil + lancement projet CRM artisans

- **Projet CRM artisans lancé** : créé `livrable/crm-artisans/PLAN.md` (plan de projet complet — fonctionnalités MVP + IA + plus tard, boîte à outils Supabase/Netlify/Stripe/API Claude/GitHub, 8 étapes ordonnées, pièges réglementaires). Idée = CRM SaaS simple + IA vendable à tout artisan (devis/factures/chantiers). **Mis en pause à l'étape 1 (maquette) à la demande de Mathis — à reprendre plus tard.**
- **Portail d'accueil refait** : `OUVRIR.html` (racine) entièrement réécrit → tableau de bord clair de tous les projets avec liens (sites en ligne + fichiers locaux + mémoire). **L'ancien pointait vers `livrable/site-web/…` (mort depuis le renommage en `road-spirit`) → liens corrigés.** C'est le point d'entrée à ouvrir pour retrouver un projet.
- **Ménage (demande Mathis : faire de la place, rien supprimer d'important)** : workspace passé de **39 Mo → 9.8 Mo**. Supprimés (tous sûrs/régénérables) : `node_modules/` (29 Mo, régénérable via `npm install`, hors dépôt), 4× `.DS_Store` (bruit macOS), dossier `interne/` racine (doublon identique de `road-spirit/migration-images.html`). **Gardés** : tous les projets, la mémoire, l'infra (`supabase/`, `netlify/`), et les dossiers de rangement intentionnels (`context/`, `contexte-import/`, `module-installs/` — vides mais avec README explicatif). `.DS_Store` désormais ignoré dans `.gitignore`.
- **Pas encore commité** — à proposer à Mathis.

## 2026-06-16 · Librairies Charlemagne — refonte « pop coloré contemporain »

- **Demande Mathis :** refaire le site `livrable/librairie-charlemagne/index.html` « au goût d'aujourd'hui », avec **exactement le même contenu que le vrai site** https://www.librairiecharlemagne.com.
- **Direction choisie** (via question à previews) : **Pop coloré contemporain** (jaune/rose/bleu/vert/corail sur papier crème, encre noire, bordures épaisses, ombres dures décalées, stickers tournés, formes flottantes, marquee). Typos : Bricolage Grotesque (display) + Hanken Grotesk (corps) + Fraunces italique (citations). L'ancienne version était un style « librairie classique » (Playfair, beige, livre 3D, fleurons) — entièrement remplacé.
- **Identité de marque (demande Mathis : « que le directeur reconnaisse ses couleurs, en mieux ») :** récupéré le **vrai logo** officiel (`static.leslibraires.fr/logos/website/399/main.png` → « Charlemagne » serif blanc sur bloc rouge) → téléchargé en local `logo-charlemagne.png` et intégré dans la nav + footer + favicon (typo du logo préservée telle quelle). Couleur de marque extraite du logo = **rouge #E43133**, posée en **signature** (boutons primaires, bandeau marquee, section coup de cœur, étoile + accents du hero) sans repeindre tout le site — le crème/jaune/touches pop restent pour le côté « moderne ». Le site officiel tourne en réalité sur la plateforme **leslibraires.fr** (template générique 2024), donc l'élément reconnaissable de la marque = le logo rouge.
- **Contenu réel récupéré (WebFetch + WebSearch)** et intégré fidèlement : histoire vraie **fondée 1927** (Ets Rouard, ex-Maison Figard 1860 ; enseigne Charlemagne depuis les années 60) — **l'ancien fichier disait « depuis 1981 » = FAUX, corrigé**. Valeurs **Enthousiasme · Solidarité · Excellence**. **6 villes** : Toulon (50 bd de Strasbourg), Hyères Îles d'Or, La Seyne, La Valette, Six-Fours (47 rue de la République), Fréjus. Enseignes spécialisées : Autographe, Beaux-Arts, La Soupe de l'Espace, Manga. Vrai agenda (Delphine de Vigan/Six-Fours, Guillaume Nail, Mireille Sanchez/Hyères, **Monsieur Z le 11 juil. 2026 — « Colorier le sud », Dessain et Tolra**). Vrai coup de cœur (« Les vacances chez Papi et Mamie », E. Guibert, critique Lucille D. / La Soupe de l'Espace). **Dossier Edgar Morin** (12 titres réels avec éditeurs). Catégories complètes regroupées en 6 univers. Clubs (Club J, Ludo Club, Club BD/Manga). Partenaires (CNL, Label LiR, Région Sud, Libraires Ensemble, Théâtre Liberté–Châteauvallon, FACE Var). Réseaux réels (FB librairie.charlemagne, IG librairies_charlemagne, YT @librairiescharlemagne8564).
- **Technique :** fichier unique, Motion.dev (CDN) pour animations, couvertures réelles via **Google Books API** (coup de cœur + 12 livres Morin), `prefers-reduced-motion` respecté, **filet de sécurité JS** (révèle tout après 1,5 s si le CDN d'animation échoue → jamais de page blanche). Honnêteté : pas de dates inventées pour les 3 events sans date connue, pas d'adresses inventées pour La Seyne/La Valette/Fréjus.
- **2e maquette (demande Mathis : présenter 2 DA au directeur pour réduire le risque de refus) :** `editorial.html` créé dans le même dossier (logo partagé). DA **« éditorial chic / premium »** : serifs Cormorant Garamond + Newsreader, fond crème, filets fins, rouge Charlemagne en accent unique, mise en page magazine (sommaire, numérotation des sections, lettrines, listes éditoriales). Même contenu réel que `index.html`. Donc 2 maquettes au choix : `index.html` = pop coloré, `editorial.html` = éditorial chic. **Mathis doit trancher laquelle garder.**
- **⚠️ Couvertures livres NON résolues :** les couvertures (coup de cœur Ariol + 12 Morin) passent par l'API Google Books, qui rate-limite (429) et matche mal ces livres FR de niche → s'affichent mal. Open Library n'a pas ces ISBN. **À faire une fois la maquette choisie :** récupérer les EAN un par un (recherche web) + télécharger les couvertures en local (CDN epagine `images.epagine.fr/<3 derniers chiffres EAN>/<EAN>_1.jpg`, ou source libraire) → référencer en dur. Placeholders actuels = OK en attendant (sobres sur editorial, colorés sur index).
- **⚠️ À dire à Mathis :** ouvrir en **navigation privée** pour juger les couleurs (extension Dark Reader repeint tout en normal — cf. leçon Road Spirit). Pas encore commité ni mis en ligne.

## 2026-06-02 · Portfolio Digital Project — mis en ligne

- **URL portfolio :** https://digit-project.netlify.app
- **Construit :** site one-page (Nunito 900, dark theme violet+orange, GSAP split-text, dot-grid hero animé, cartes services redesignées avec visuels CSS, section projets dual mockup site+app, compteurs, scroll reveals).
- **Road Spirit redéployé** avec démo automatique (plus de login) + section Équipe supprimée.
- **Lien App démo** sur la carte Road Spirit du portfolio → `/interne/app.html`.
- **À faire :** brancher Formspree (remplacer `XXXXXXXX` dans le formulaire contact).

## 2026-06-02 · Projet Road Spirit — clôture définitive

- **Décision de Mathis :** ne vendra pas le site (contraintes hors de son contrôle). Projet archivé comme **pièce de portfolio** + base de référence pour les prochains sites du même type (aller plus vite la prochaine fois).
- **URL finale :** https://road-spirit.netlify.app (site public) + `/interne/app.html` (app interne).
- **Livrable complet :** site public (boutique Supabase, catalogue 150 produits, pages moto/équipement/services/contact, PWA), app interne (gestion produits + photos, commandes, réservations, équipe 3 rôles), sécurité RGPD OK.
- **Ce projet a servi de template A→Z :** setup Supabase, RLS, Storage, Edge Functions, Netlify, app interne admin, catalogue dynamique. Réutilisable pour tout futur client concession/boutique.

## 2026-06-02 · Gestion d'équipe (3 rôles) — construit, à déployer demain (Mac)

- **Demande Mathis :** que le patron (futur repreneur) gère ses employés depuis l'app, sans toucher Supabase, et que ça fasse pro. 3 rôles : **admin** (tous accès), **vendeur**, **atelier** (accès Vendeur/Atelier à détailler plus tard ; pour l'instant seul admin a tout).
- **Construit (non encore déployé) :**
  - `interne/SUPABASE-EQUIPE.sql` — migre rôles staff→3 rôles (CHECK `admin/vendeur/atelier`), ajoute colonnes `email`+`actif` sur profiles, trigger qui remplit email+rôle depuis metadata, **`is_admin()`** (SECURITY DEFINER, non récursif), RPC **`admin_set_role`** + **`admin_set_active`** (admin only), Mathis=admin.
  - `supabase/functions/create-employee/index.ts` — **Edge Function** : crée le compte employé avec la clé service_role (jamais côté navigateur), après avoir vérifié que l'appelant est admin. Répond toujours en 200 `{ok}`/`{error}`. Clés auto-fournies par Supabase (rien à configurer).
  - `interne/app.html` — page **Équipe** câblée : liste (nom/email/rôle badge/statut), **+ Ajouter un employé** (modale → `db.functions.invoke('create-employee')`), bouton **Rôle** (modale → `admin_set_role`), **Désactiver/Réactiver** (`admin_set_active`). Helpers `roleLabel`/`roleBadge`. Affichage du rôle connecté corrigé (plus de « Staff » figé).
  - `interne/GUIDE-EQUIPE.md` — pas-à-pas déploiement.
- **À FAIRE DEMAIN (Mac) :** 1) exécuter `SUPABASE-EQUIPE.sql` (SQL Editor). 2) déployer la fonction (`supabase functions deploy create-employee`, ou via dashboard Edge Functions). 3) tester dans l'app : Équipe → Ajouter un employé. **Tant que la fonction n'est pas déployée, le bouton « Ajouter » renverra une erreur (normal).** Le changement de rôle/désactivation marche dès le SQL passé.
- **Note :** crée le compte avec un mot de passe temporaire (pas d'email/SMTP requis) → simple pour la démo. Invitation par email = amélioration possible plus tard.

## 2026-06-02 · Correctifs visuels accueil + effets (post-mise en ligne)

- **Bug « couleurs catastrophe » → VRAIE CAUSE = extension Dark Reader de Mathis** (mode sombre navigateur). Elle repeint tout en normal, est coupée en privé → « parfait en privé, cassé en normal ». Le site est en fait correct pour les visiteurs. **Leçon notée dans `context.md` : bug couleur/rendu signalé par Mathis → tester en navigation privée AVANT de toucher au code.** (J'avais d'abord diagnostiqué à tort des « liens visités » et ajouté un fix `:visited` dans `shared.css` — inoffensif, bonne pratique, laissé en place, mais ce n'était pas la cause.)
- **Effet qui scintille tout autour de l'accueil** = le `.grain` (bruit animé plein écran, `steps(3)` toutes les .4s), présent uniquement sur `index.html`. Remplacé par une **lumière d'ambiance** : 2 halos dorés flous (`.grain::before/::after`, `mix-blend-mode:screen`) qui dérivent lentement (24s/30s). Lent + doux = premium, fini le clignotement.
- **Glow titre « est à vous »** : halo doré qui pulse (`@keyframes heroGlow` 3.4s) — halo resserré pour épouser **chaque lettre** (au lieu d'une bande rectangulaire causée par le `overflow:hidden` du reveal qui rognait un gros halo). Coupe retirée après le reveal via `.set('.hero h1 .ln',{overflow:'visible'},1.7)` dans la timeline GSAP. Accent du « à » qui dépassait/poppait → corrigé en démarrant le reveal plus bas (`.ln-i` translateY 110%→**135%**) + marge haute sur la 2e ligne (`.ln+.ln{padding-top:.3em;margin-top:-.3em}`).
- **Tous les effets respectent `prefers-reduced-motion`.** Validé par Mathis (« parfait »). **Reste : redéployer** (Netlify → onglet Deploys → glisser `site-web` → `Ctrl+Maj+R`) pour pousser couleurs+lumière+glow en ligne. Pas encore commité sur GitHub.

## 2026-06-02 · Site Road Spirit MIS EN LIGNE (Netlify)

- **Mise en ligne réussie** via **Netlify Drop** (glisser-déposer du dossier `livrable/site-web`). URL provisoire : **https://sweet-dolphin-a1414f.netlify.app** (nom aléatoire à renommer via Site configuration → Change site name, ex. `road-spirit`).
- **Vérifié par moi (curl)** : home 200 (titre OK, 74 Ko), `shared.css` / `catalogue-data.js` / `catalogue-supabase.js` / `boutique.html` / `produit.html` / `interne/app.html` → tous 200. Site complet et fonctionnel, HTTPS gratuit. App interne accessible à `/interne/app.html` (protégée par login Supabase).
- **Choix Netlify vs Vercel** : Netlify retenu (site 100% statique + débutant → Netlify Drop imbattable ; Vercel plus orienté frameworks).
- **À nettoyer (optionnel, non bloquant)** : les fichiers `interne/*.sql` sont servis publiquement (pas de secret dedans, clé déjà publique, mais négligé) → exclure via un `netlify.toml` ou en ne déployant pas le dossier interne plus tard.
- **Reste** : renommer l'URL Netlify, (plus tard) nom de domaine perso, paiement Stripe réel. Fichier `SUPABASE-FIX-PROFILES.sql` + ces notes pas encore poussés sur GitHub.

## 2026-06-02 · Vérif sécurité Supabase avant mise en ligne

- **Contexte :** Mathis demande s'il peut mettre le site en ligne sans nom de domaine (oui — Netlify/Vercel/GitHub Pages donnent une URL gratuite en HTTPS) et affirme avoir exécuté le SQL sécurité. Demande de vérifier.
- **Test API anonyme** (clé publishable, comme un visiteur) sur `/rest/v1/` : `produits` → 200 + données (normal, catalogue public) ; `commandes` → `[]` ; `reservations` → `[]` → **RLS bien active, fuite RGPD fermée**. `profiles` → **HTTP 500 `42P17` infinite recursion detected in policy**.
- **Diagnostic :** la policy `profiles` du fichier actuel est saine (`using(true)`), le diff du pull ne la touche pas → la récursion vient d'une **ancienne policy auto-référente laissée dans la base** lors d'une exécution antérieure. Impact réel : `app.html:832` lit `profiles` au login → 500 → rôle vu comme « Staff », section admin masquée, et `produits delete admin` (qui relit profiles) cassé. Boutique publique non affectée.
- **Livré + exécuté par Mathis le 2026-06-02 :** `interne/SUPABASE-FIX-PROFILES.sql` — boucle sur `pg_policies` pour drop **toutes** les policies de `profiles` (attrape la fautive quel que soit son nom), réactive la RLS, recrée une seule lecture `to authenticated using(true)`. **Re-test après exécution : `profiles` passe de 500 → `200 + []`. Résolu.**
- **Note :** paiement toujours simulé (pas de Stripe réel) → OK pour démo, pas pour vente réelle.

## 2026-06-01 · Session design + audit — corrections majeures

- **Audit Road Spirit** : 7 critiques (C1-C7) + 8 élevés résolus. SQL sécurité exécuté par Mathis.
- **Performance homepage** : Lenis, VanillaTilt et canvas supprimés → gains CPU significatifs.
- **Design organique** : vagues SVG entre sections, border-radius partout, curseur natif.
- **Glow or** sur tous les gros titres (homepage, pages secondaires, app).
- **Hero Bonneville T100** : remplace Unsplash/Speed Triple, image officielle Triumph CDN MY26.
- **Responsive** : filtre prix boutique visible sur mobile, `--muted` → #9A98A4 (WCAG AA).
- **Reste pour Mathis** : exécuter SUPABASE-IMPORT-PRODUITS.sql, Stripe URL, rôle admin.
- **À faire à la livraison client** : changer l'email Formspree (formspree.io → formulaire Road Spirit → Settings → mettre l'email du client à la place du tien).
- **Vercel à faire** : vercel.com → Sign Up avec GitHub (mathisgourden05-ux) → Add New Project → repo luffy-workspace → Root Directory = `livrable/site-web` → Framework = Other → Deploy. Donne une URL publique pour montrer le site au client.

## À FAIRE — Prochaine session (priorités)

0. ✅ FAIT + vérifié le 2026-06-02 — `SUPABASE-SECURITE.sql` exécuté (RLS OK : `commandes`/`reservations` → `[]` en anonyme, RGPD fermé) ET `SUPABASE-FIX-PROFILES.sql` exécuté → `profiles` ne renvoie plus 500, passe à `200 + []`. Récursion résolue, rôle admin de nouveau reconnu. **Rôle admin attribué le 2026-06-02** (upsert sur profiles avec son UID d70e86f5… → `role=admin` confirmé). Base 100% saine : RGPD OK + profiles OK + Mathis admin.
0b. **Mathis : exécuter `interne/SUPABASE-FIX-IMAGES.sql`** sur la base existante → met les vraies photos (79 produits) sans réimporter.
0c. **7 images restantes** à récupérer après reset WebFetch (21:20) : bottes-tech-7-enduro, gants-peak, t-shirt-melrose-noir, t-shirt-gwynned-blanc, t-shirt-maria-speedmaster, beck-2-wax-cotton-veste-noir, veste-ciree-triumph-beck.
1. **Mathis : créer un compte vendeur** dans Supabase (Authentication → Users → Add user, cocher Auto Confirm) → identifiants pour se connecter à l'app interne (requis pour ajouter produits + uploader photos).
2. **Tester le flux complet** une fois le site en ligne : app interne → Nouveau produit + photo glissée → vérifier qu'il apparaît sur la boutique.
3. **Vérifier visuellement le nouveau hero** (cadrage image Bonneville) ; ajuster `background-position` de `.h-moto` si besoin.
4. **Paiement réel (Stripe) + décrément atomique du stock** à faire ENSEMBLE : au paiement confirmé, fonction Supabase qui décrémente `stock` seulement si `stock >= qté` (anti-survente cas 1 = 2 acheteurs en ligne sur le même dernier article). Le paiement est actuellement simulé → ne pas coder le décrément avant le vrai paiement. Cas 2 (vente en ligne + magasin) non couvert par ça : nécessite la connexion live G8.

### Schéma Supabase réel (constaté le 2026-06-01, à ne pas oublier)
- La table `produits` **préexistait** (pas créée par mon `create table`). Colonnes ajoutées via `alter table add column if not exists`.
- `disponible` est une **colonne générée** (calculée depuis le stock) → ne JAMAIS l'insérer/écrire. L'import et l'app ne doivent pas la fournir.
- `produits` est référencée par une FK depuis `commandes_items` → `truncate` interdit, utiliser `delete from`.
- ✅ Setup SQL exécuté + 150 produits importés (stock=10 chacun).

---

## 2026-06-01 · Audit multi-agents + correction des images + catégories dynamiques

- **Audit complet (workflow 7 agents)** du site + app → rapport `livrable/site-web/AUDIT-2026-06-01.md` (54 findings). Critiques : RLS absente sur commandes/réservations/profils (fuite RGPD), paiement.html plantait (`successOverlay` inexistant), boutons Réservations sans onclick, catégories figées en dur, 86/150 images dupliquées.
- **Images réparées :** WebFetch sur les pages produit roadspirit.fr → vraies photos récupérées pour **79/86** produits à image partagée. Images uniques 97 → 147/150. Appliqué à `catalogue-roadspirit.json` + `catalogue-data.js` (régénéré, source unique) + `interne/SUPABASE-FIX-IMAGES.sql` (UPDATE par slug) + import SQL régénéré. **7 restantes** (WebFetch session limit, reset 21:20) listées dans le À FAIRE.
- **Catégories dynamiques (boutique)** : filtres colonne + select mobile construits depuis les catégories réelles des produits (`buildCategoryFilters`), fini le `CAT_MAP` figé → les catégories créées dans l'app remontent sur le site. + échappement HTML (anti-XSS) sur noms/images.
- **Bugs critiques corrigés en code :** C6 paiement.html (plantage au chargement), C7 boutons Réservations câblés (openModalRes/deleteRes), E4 bouton Modifier (par id au lieu de sérialiser l'objet → cassait sur apostrophe), `esc()` complété + appliqué (stock + réservations), E6 fallback `disponible` en démo.
- **Livré à exécuter par Mathis :** `interne/SUPABASE-SECURITE.sql` (RLS + table profiles + trigger + delete admin) — voir À FAIRE point 0.
- **Reste de l'audit (non bloquant)** documenté dans le rapport : adresse incohérente services.html, paiement Stripe réel, accessibilité/SEO, parsing CSV G8, etc.

## 2026-06-01 · Recherche logiciel G8 + stratégie de vente du site (repreneur)

- **Contexte révélé par Mathis :** il fait son **stage dans la concession Road Spirit** ; l'actuel patron est un **pote**. Les proprios **vont vendre** la concession → Mathis vise le **prochain repreneur** (pas le patron actuel) pour lui proposer son site.
- **Recherche web G8 (logiciel de gestion de la concession) :** G8 = éditeur **Orisha (ex-Futurosoft)**, DMS leader auto/moto France (2000+ clients, 30 ans, caisse certifiée, CRM + stock intégrés, 200-300 interfaces fournisseurs). **A déjà son e-commerce natif `ShopG8`** (synchro stock temps réel) + partenaire EveryParts. Brancher le site de Mathis sur le stock G8 : réaliste via **export CSV** (déjà à moitié codé : bouton « Import CSV G8 », format `ref_g8,nom,type,categorie,prix,stock`) ; API Orisha existe mais verrouillée par contrat ; sinon ShopG8 = leur boutique, pas celle de Mathis.
- **Conseil stratégique donné :** viser le repreneur (page blanche, veut moderniser) ; jouer l'atout « insider + intro chaude via le patron sortant » ; avoir démo + prix prêts AVANT l'arrivée du repreneur (outils choisis dans les 1res semaines) ; pitcher le **résultat** (site premium clé en main, moins cher, maintenu par lui), jamais la technique ; angle face à ShopG8 = design + prix + maintenance.
- **À clarifier (posé à Mathis) :** date prévue de la vente + repreneur déjà connu ou non (→ pitch ciblé vs générique).

## 2026-06-01 · Boutique ↔ Supabase + upload photo vendeur + fond uniforme

- **Objectif :** que le vendeur (zéro compétence info) ajoute un article avec photo depuis l'app, et qu'il s'affiche tout seul sur le site.
- **Loader partagé** `catalogue-supabase.js` : `rsLoadCatalogue()` lit la table `produits` Supabase (temps réel), repli automatique sur le catalogue statique si Supabase tombe/vide. `rsMapRow()` mappe les colonnes vers le format boutique (gère promo/prix barré).
- **boutique.html + produit.html branchés** : chargent via `rsLoadCatalogue`, SDK Supabase ajouté. Id géré en **texte** (compatible entiers statiques ET uuid Supabase) — corrigé bouton + Panier et lookup produit.
- **Upload photo (app interne)** : champ « URL image » remplacé par une **zone de glisser-déposer** → upload vers Supabase Storage bucket `produits` → URL publique remplie automatiquement. Aperçu, spinner, suppression, garde-fous (image only, max 6 Mo, login requis). Défaut type = `equipement`. Corrige aussi un bug latent (l'image n'était pas réinitialisée en « Nouveau produit »).
- **Fond uniforme des articles** (demande Mathis : certains fonds blancs tranchaient) : tuiles claires `#f4f1ea` + `object-fit:contain` + `mix-blend-mode:multiply` sur boutique ET page produit → les fonds blancs des photos se fondent, rendu cohérent. Choix validé par Mathis (vs détourage Cloudinary, écarté car moins fiable).
- **Pour Mathis (livré, à exécuter) :** `interne/SUPABASE-SETUP.sql` (table + bucket + RLS, idempotent), `interne/SUPABASE-IMPORT-PRODUITS.sql` (150 produits, généré depuis le JSON, truncate+insert), `interne/GUIDE-SUPABASE.md` (pas-à-pas copier-coller). Clé Supabase = publishable (lecture publique, écriture réservée aux connectés).

## 2026-06-01 · PWA (site + app interne), bouton site, refonte hero

- **PWA installable** sur les deux : site public et app interne. Créés : `manifest.webmanifest` + `sw.js` (service worker network-first, hors-ligne basique) dans `site-web/` et `site-web/interne/`. Icônes PNG générées (192/512 + maskable, anneau or « RS » sur fond sombre) via PowerShell System.Drawing. Lien manifest + balises Apple ajoutés dans le `<head>` des 11 pages du site + app.html. Enregistrement SW centralisé dans `shared.js` (+ inline sur la home et l'app qui ne le chargent pas). **⚠️ L'install ne marche qu'en ligne (HTTPS, type Netlify), pas en `file://`.**
- **Bouton « Accéder au site web »** ajouté dans le footer de la sidebar de l'app interne (`.btn-site`, or, ouvre `../Road Spirit.html` dans un nouvel onglet).
- **Refonte hero** : image Bonneville (`photo-1495480393121-409eb65c7fbe`, déjà utilisée sur motos.html donc valide — le CDN Triumph officiel renvoie désormais 404, et le réseau du PC est sandboxé donc URLs externes non vérifiables ici). Titre plus grand (clamp max 228px) + glow doré sur « est à vous ». Reflet lumineux qui balaie le chrome (`.h-glint`, animation 8,5 s). Profondeur 3D : la moto suit la souris (parallaxe x + rotationY + rotationZ via `gsap.quickTo`) + flottement vertical continu ; `prefers-reduced-motion` respecté. Entrée plus ample (scale 1.08 → 1).
- **Reste à faire :** Mathis vérifie le cadrage de l'image Bonneville dans le navigateur ; ajuster `.h-moto background-position` si la moto est mal centrée.

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
