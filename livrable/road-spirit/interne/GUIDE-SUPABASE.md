# Brancher la boutique sur Supabase — guide pas à pas

Objectif : que le vendeur ajoute un article depuis l'app (avec une photo) et qu'il apparaisse tout seul sur le site, sans toucher au code.

Tout est déjà codé. Il te reste 3 manips dans Supabase + 1 test. Compte 10 minutes.

---

## Étape 1 — Créer la table et le stockage des photos

1. Va sur [supabase.com](https://supabase.com) → ouvre ton projet Road Spirit.
2. Menu de gauche → **SQL Editor** → bouton **New query**.
3. Ouvre le fichier `SUPABASE-SETUP.sql` (dans ce dossier), copie **tout**, colle dans l'éditeur.
4. Clique **Run** (en bas à droite). Tu dois voir « Success ».

Ça crée la table des produits, l'espace de stockage des photos et les droits d'accès.

## Étape 2 — Importer les 150 produits existants

1. Toujours dans **SQL Editor** → **New query**.
2. Ouvre `SUPABASE-IMPORT-PRODUITS.sql`, copie tout, colle, **Run**.
3. « Success. 150 rows ». C'est fait.

> Si tu relances ce fichier plus tard, il vide d'abord la table puis réimporte : pas de doublon.

## Étape 3 — Créer le compte du vendeur

Le vendeur doit être connecté pour ajouter des produits et envoyer des photos.

1. Menu de gauche → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Mets un email + un mot de passe, coche « Auto Confirm User ».
3. Donne ces identifiants au vendeur : c'est avec ça qu'il se connecte à l'app interne.

---

## Test final

1. Ouvre la **boutique** du site (`boutique.html`) : les 150 produits s'affichent, tous sur le même fond clair.
2. Ouvre l'**app interne** (`interne/app.html`), connecte-toi avec le compte de l'étape 3.
3. Onglet **Catalogue** → **Nouveau produit** : remplis le nom, le prix, **glisse une photo** dans la zone prévue, **Enregistre**.
4. Rafraîchis la boutique : le nouvel article est là.

Si ça marche, le vendeur est autonome : il gère son catalogue sans jamais voir une ligne de code.

---

## Bon à savoir

- **Photos** : le vendeur dépose n'importe quelle photo (JPG/PNG, max 6 Mo). Le site la met automatiquement sur le même fond clair que les autres. Conseil : une photo nette du produit sur fond clair rend le mieux.
- **Hébergement** : tout ça suppose le site mis en ligne (Netlify, etc.). En ouvrant les fichiers en local (`file://`), l'upload de photos ne marche pas — c'est normal.
- **Sécurité** : la clé Supabase présente dans le code est la clé « publique » (lecture seule côté visiteurs). Ajouter ou supprimer un produit exige d'être connecté. Rien de sensible n'est exposé.
- **Panne Supabase** : si Supabase ne répond pas, le site réaffiche automatiquement l'ancien catalogue figé. La boutique n'est jamais vide.
