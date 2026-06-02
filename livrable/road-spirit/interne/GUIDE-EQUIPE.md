# 👥 Gestion d'équipe — guide de mise en route

Objectif : le patron gère ses employés **depuis l'app** (page « Équipe »), sans jamais toucher à Supabase. Trois rôles : **Admin** (tous les accès), **Vendeur**, **Atelier**.

Il y a **2 choses à faire une seule fois** (idéalement depuis le Mac demain), puis tout se passe dans l'app.

---

## Étape 1 — SQL (2 min)

1. Supabase → **SQL Editor** → **New query**.
2. Colle tout le contenu de [`SUPABASE-EQUIPE.sql`](SUPABASE-EQUIPE.sql) → **Run**.
3. Ça crée les 3 rôles, la colonne « actif », et les fonctions sécurisées de changement de rôle. (Idempotent : tu peux le relancer sans risque.)

## Étape 2 — Déployer la fonction « create-employee » (5 min)

Cette fonction crée les comptes employés de façon sécurisée. Le code est dans `supabase/functions/create-employee/index.ts` (à la racine du dépôt).

> ℹ️ Les clés (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sont **fournies automatiquement** par Supabase aux fonctions — rien à configurer à la main.

### Option A — En ligne de commande (recommandé sur Mac)
```bash
# 1. Installer le CLI Supabase (une fois)
brew install supabase/tap/supabase

# 2. Se connecter (ouvre le navigateur)
supabase login

# 3. Depuis la racine du dépôt (là où il y a le dossier "supabase/")
supabase link --project-ref ywpduxvpbqkyjjatluts
supabase functions deploy create-employee
```

### Option B — Sans terminal (dashboard)
1. Supabase → menu **Edge Functions** → **Create a function** → nom : `create-employee`.
2. Colle le contenu de `supabase/functions/create-employee/index.ts` dans l'éditeur → **Deploy**.

---

## Utilisation (dans l'app, pour toujours)

1. Connecte-toi à l'app en **admin**.
2. Menu **Équipe**.
3. **+ Ajouter un employé** → prénom, nom, email, rôle, mot de passe temporaire → **Créer le compte**.
4. Donne l'email + le mot de passe temporaire à l'employé (il pourra le changer ensuite).
5. Boutons par ligne : **Rôle** (changer Admin/Vendeur/Atelier) et **Désactiver / Réactiver**.

## Rôles

| Rôle | Accès |
|------|-------|
| **Admin** | Tout : produits (dont suppression), commandes, réservations, équipe |
| **Vendeur** | À définir plus tard (par défaut : comme l'app sans la suppression ni la gestion d'équipe) |
| **Atelier** | À définir plus tard |

> Le détail des accès Vendeur/Atelier sera affiné quand on aura décidé qui voit quoi. Pour l'instant, seul **Admin a tous les accès** ; les autres se connectent mais on restreindra leurs sections ensuite.

## Dépannage
- **« Réservé aux administrateurs »** à la création → le compte connecté n'est pas admin (vérifie son rôle dans la page Équipe ou via le SQL).
- **Erreur fonction introuvable** → l'étape 2 (déploiement) n'a pas été faite.
- **L'employé ne peut pas se connecter** → vérifie qu'il utilise bien l'email + mot de passe temporaire ; le compte est confirmé automatiquement (pas d'email à valider).
