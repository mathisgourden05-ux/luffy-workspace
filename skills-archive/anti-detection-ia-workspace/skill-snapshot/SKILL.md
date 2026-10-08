---
name: anti-detection-ia
description: >
  Labo d'expérimentation sur la détection de texte IA. Réécrit un texte pour réduire les
  marqueurs statistiques que les détecteurs (Compilatio, GPTZero, Turnitin, ZeroGPT…)
  utilisent — perplexité, régularité/burstiness, vocabulaire — afin de tester de son côté
  quelles techniques font bouger les scores et de comprendre comment fonctionnent les
  détecteurs. Inclut un MODE ANALYSE qui explique les signaux exploités (utile pour
  construire son propre détecteur). Usage recherche/hobby de Mathis. À utiliser quand il
  demande d'« humaniser », de « tester la détection », de « faire baisser le score IA »,
  ou d'analyser pourquoi un texte est repéré comme IA.
---

# Anti-détection IA — labo perso

## But et cadre

Skill d'**expérimentation** pour Mathis : comprendre comment les détecteurs de texte IA
repèrent une génération automatique, et tester quelles réécritures font varier leur verdict.
Sert aussi de base à son projet éventuel de **construire son propre détecteur d'IA** (pour
détecter, il faut d'abord comprendre l'évasion).

**Honnêteté d'abord :** aucune réécriture ne garantit de passer un détecteur. C'est un jeu du
chat et de la souris — les détecteurs se mettent à jour, ce qui passe un jour est repéré le
lendemain. Ce skill fait *baisser* les signaux les plus évidents, pas disparaître le risque.
Ne jamais présenter un résultat comme « indétectable à 100 % ».

## Comment un détecteur repère l'IA (les 3 signaux à connaître)

1. **Perplexité (faible = suspect).** Mesure à quel point le mot suivant est *prévisible*.
   Un LLM enchaîne les mots les plus probables → texte très « lisse », perplexité basse.
   Un humain surprend plus souvent (mot inattendu, tournure personnelle) → perplexité haute.
2. **Burstiness / régularité (trop régulier = suspect).** L'humain écrit en dents de scie :
   une phrase de 4 mots, puis une de 30, une question, un fragment. L'IA produit un rythme
   homogène, des phrases de longueur moyenne similaire. Un texte trop régulier = drapeau rouge.
3. **Vocabulaire et tournures « tell ».** Certains mots/structures reviennent beaucoup plus
   dans les textes IA : *delve, tapestry, moreover, furthermore, it's important to note*,
   parallélismes « non seulement… mais aussi », listes systématiques de trois, transitions
   trop propres, tirets cadratins à répétition.

## Les leviers de réécriture (ce que le skill applique)

Pour faire remonter la perplexité et la burstiness, et casser les tells :

- **Casser le rythme.** Alterner volontairement phrases très courtes et phrases longues.
  Glisser un fragment. Poser une question. Ne jamais garder deux phrases de longueur voisine
  à la suite sur un paragraphe entier.
- **Dé-lisser les enchaînements.** Remplacer les tournures ultra-prévisibles par des
  formulations moins attendues, plus parlées. Enlever les connecteurs mécaniques
  (*par ailleurs, en outre, il convient de noter*) au profit de liaisons plus naturelles ou
  d'aucune liaison (juste enchaîner).
- **Injecter de la voix.** Un aparté entre parenthèses, une petite hésitation, une opinion
  assumée, un exemple concret et précis. Le détail spécifique et un peu inattendu est le
  marqueur humain le plus fort (les LLM arrondissent, les humains gardent le détail bizarre).
- **Tuer les tells.** Retirer les mots-signaux IA, les listes de trois systématiques, les
  parallélismes négatifs, les tirets cadratins (—), les emojis décoratifs, la conclusion
  générique « en résumé, l'avenir s'annonce prometteur ».
- **Varier la structure.** Ne pas ouvrir chaque paragraphe pareil. Mélanger phrases simples
  et complexes. Accepter une petite imperfection plutôt qu'un texte parfaitement lisse.

> Ce skill est complémentaire de `humanizer` : `humanizer` traque les 30 « tells » d'écriture
> IA (vocabulaire, rule of three, em dashes…) ; ici on ajoute l'angle **statistique**
> (perplexité + burstiness) que visent les détecteurs. Pour un test sérieux, passer le texte
> par les deux.

## Processus

1. **Recevoir le texte** à travailler (en général une sortie IA).
2. **Réécrire** en appliquant les leviers ci-dessus, sens conservé, longueur comparable.
3. **Livrer la version réécrite**, prête à être collée dans un détecteur pour le test.
4. Rappeler que le résultat doit être **testé** sur le(s) détecteur(s) cible(s) — le skill ne
   remplace pas la mesure réelle.

## Mode analyse (pour le projet « mon propre détecteur »)

Sur demande (« analyse », « pourquoi c'est détecté », « explique les signaux »), au lieu de
réécrire, produire un diagnostic :

- Estimer où le texte est **prévisible** (perplexité basse) et pointer les passages concernés.
- Mesurer la **régularité** : longueurs de phrases, variance, répétitions de structure.
- Lister les **tells de vocabulaire** présents.
- En déduire ce qu'un détecteur exploiterait, et quelles features seraient utiles pour en
  **construire un** (distribution des longueurs de phrases, richesse lexicale, fréquence des
  n-grammes trop probables, taux de mots-signaux, etc.).

C'est ce mode qui nourrit son idée de détecteur maison : chaque signal qu'on sait exploiter
pour évader est un signal qu'un détecteur peut mesurer.

## Rappels

- Toujours dire le vrai taux de confiance : « ça baisse les marqueurs évidents », jamais
  « indétectable ».
- Ne pas produire à la place de Mathis un travail scolaire **noté** destiné à tromper un
  contrôle d'intégrité — il l'a lui-même exclu. Le cadre de ce skill est l'expérimentation,
  le contenu perso/marketing, et la R&D sur la détection.
