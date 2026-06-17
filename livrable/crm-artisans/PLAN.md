# 🛠️ CRM Artisans — Plan de projet

> Nom de travail : « CRM Artisans » (à remplacer par un vrai nom plus tard).
> Objectif : un logiciel en ligne, simple, vendu en abonnement à n'importe quel artisan. Devis, factures, clients et chantiers au même endroit — avec l'IA qui remplit la paperasse à sa place.

---

## 1. Ce que le produit doit faire

### MVP — la version 1, l'essentiel (à construire en premier)
- [ ] Comptes & connexion — chaque artisan son espace, ses données isolées
- [ ] Fiche client — particuliers et pros, avec historique
- [ ] Devis — création rapide, export PDF, envoi, statut (accepté / refusé)
- [ ] Factures — générées depuis un devis accepté, statut (payé / impayé)
- [ ] Suivi d'affaires — le pipeline : prospect → devis → en cours → terminé → payé
- [ ] Relances — rappels pour les devis sans réponse et les factures impayées
- [ ] Tableau de bord — chiffre d'affaires, devis en attente, impayés

### L'IA — ce qui te démarque des concurrents (Tolteck, Obat…)
- [ ] Devis généré depuis une simple description écrite
- [ ] Dictée vocale depuis le chantier → devis ou compte-rendu
- [ ] Relances d'impayés rédigées automatiquement

### Plus tard — version 2 et au-delà (NE PAS faire au début)
- [ ] Facturation électronique conforme (réforme PDP / Factur-X) ⚠️ obligatoire avant la vente large
- [ ] Paiement en ligne des factures par le client de l'artisan
- [ ] Planning / agenda des chantiers
- [ ] Photos de chantier → compte-rendu automatique
- [ ] Multi-utilisateurs (artisan + ses salariés)
- [ ] Application mobile

---

## 2. La boîte à outils (ce qu'on va utiliser)

| Pour quoi | Outil | Compte à créer ? |
|---|---|---|
| Base de données + connexion | **Supabase** (déjà connu via Road Spirit) | oui |
| Interface (écrans) | HTML / CSS / JS (puis framework si besoin) | non |
| Hébergement en ligne | **Netlify** ou **Vercel** | oui (déjà) |
| Abonnements / paiement | **Stripe** | oui |
| Intelligence artificielle | **API Claude (Anthropic)** | oui (clé API) |
| Sauvegarde du code | **GitHub** | déjà en place |
| Facture conforme (plus tard) | service PDP partenaire (via API) | à choisir le moment venu |

---

## 3. Les étapes, dans l'ordre

- [ ] **Étape 0 — Valider l'idée** *(toi, sur le terrain)* : parler à 3-5 artisans → leur douleur n°1, ce qu'ils utilisent, ce qu'ils paieraient.
- [ ] **Étape 1 — Maquette des écrans** : dessiner le tableau de bord, l'écran « nouveau devis », la fiche client. Cliquable, à montrer aux artisans + sert d'argument de vente. *(pas de code back, juste le visuel)*
- [ ] **Étape 2 — Base de données** : définir les tables (clients, devis, lignes de devis, factures, affaires).
- [ ] **Étape 3 — MVP fonctionnel** : connexion + clients + devis + factures + pipeline qui marchent pour de vrai.
- [ ] **Étape 4 — IA** : devis généré + relances automatiques.
- [ ] **Étape 5 — Abonnement** : Stripe + page d'inscription + gestion des comptes.
- [ ] **Étape 6 — Pilotes** : 1-2 artisans l'utilisent en vrai → on corrige selon leurs retours.
- [ ] **Étape 7 — Conformité facturation** : branchement PDP avant d'ouvrir la vente.
- [ ] **Étape 8 — Lancement** : page de vente, premiers clients payants.

---

## 4. À garder en tête
- **Différenciation** = simplicité + IA + prix + proximité. Pas « comme les gros, en moins bien ».
- **Piège réglementaire** : une vraie facture conforme n'est pas un simple PDF (réforme 2026-2027). On la traite à l'étape 7, via un partenaire, pas en la réinventant.
- **Anti-dispersion** : on finit une étape avant d'ouvrir la suivante. L'étape 0 (parler aux artisans) se fait en parallèle du reste.

---

*Créé le 2026-06-16. Prochaine étape : Étape 1 — maquette des écrans.*
