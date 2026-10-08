# Prompt — App de quiz pour les profs

> À coller tel quel dans un outil de création d'app par IA (Claude, Claude Design, Lovable, Bolt…).

---

Crée une application web simple qui permet à n'importe quel professeur, quelle que soit sa matière et son niveau (collège, lycée, BTS, fac), de créer des quiz rapidement et de les faire passer à ses élèves.

## Pour qui

Des profs qui ne sont pas à l'aise avec l'informatique. Tout doit se comprendre sans mode d'emploi : gros boutons, peu d'écrans, vocabulaire simple, en français.

## Ce que le prof doit pouvoir faire

1. **Créer un quiz de deux façons, au choix :**
   - **À la main** : il ajoute ses questions une par une.
   - **Avec l'IA** : il colle un cours, un texte ou juste un thème (« la Révolution française, niveau 4e, 10 questions »), choisit le nombre de questions et la difficulté, et l'IA propose un quiz complet.
   L'IA ne publie jamais rien toute seule : le prof relit, modifie, supprime ou ajoute des questions avant de valider.
2. **Types de questions** : QCM (une ou plusieurs bonnes réponses), vrai/faux, réponse courte. Pour chaque question, une explication facultative qui s'affiche après la réponse.
3. **Partager le quiz** avec un lien ou un code court (6 caractères) que les élèves tapent sur leur téléphone ou ordinateur, sans créer de compte.
4. **Voir les résultats** : note de chaque élève, taux de réussite par question (pour repérer ce qui n'est pas compris), export en CSV.
5. **Retrouver ses quiz** dans une bibliothèque, les dupliquer, les modifier, les ranger par matière ou par classe.

## Ce que l'élève voit

Il ouvre le lien ou tape le code, entre un **pseudo**, répond aux questions une par une, puis voit son score et les corrections (si le prof l'a autorisé).

## Classes et classement

- Le prof crée ses **classes** (ex. « 2nde B », « BTS MCO 2 ») ; chaque classe a son propre code d'accès.
- L'élève rejoint une classe une seule fois avec son pseudo : le pseudo est réservé dans la classe, pour retrouver ses scores d'un quiz à l'autre (toujours sans compte ni e-mail).
- Le prof publie un quiz pour une ou plusieurs classes.
- **Classement** : un classement par quiz (score, puis temps en cas d'égalité) et un **classement général de la classe** qui cumule les points sur tous les quiz, affiché sous forme de podium + tableau.
- Le prof choisit ce que voient les élèves : classement complet, seulement le top 3, ou seulement leur propre rang (pour ne pas décourager les derniers). Il peut remettre le classement à zéro (par trimestre par exemple).
- Côté prof : moyenne de la classe par quiz et évolution dans le temps.

## Mode examen (option activable par le prof, quiz par quiz)

But : éviter que l'élève aille chercher les réponses sur Internet pendant le quiz.
- Le quiz s'ouvre en plein écran.
- Dès que l'élève quitte la page (changement d'onglet, d'application, retour à l'accueil du téléphone, sortie du plein écran), l'app le détecte : le quiz se **verrouille** et l'élève ne peut plus continuer sans que le prof le débloque depuis son écran (réglage au choix du prof : verrouiller, ou seulement signaler).
- Le prof voit en direct, pour chaque pseudo, le nombre de sorties de page et à quelle question.
- Pas de copier-coller ni de clic droit pendant le quiz.
- Un minuteur optionnel (temps total ou par question).
Note technique : une app web ne peut pas empêcher physiquement le téléphone de changer d'appli, elle peut seulement le détecter et réagir (verrouiller / signaler). Le dire clairement au prof dans l'interface.

## Contraintes

- **Simple avant tout** : créer un quiz à la main doit prendre moins de 5 minutes, avec l'IA moins d'1 minute.
- **Responsive** : marche sur téléphone, tablette et ordinateur.
- **Toujours disponible, comme une vraie appli** : hébergée en ligne 24h/24 (front sur Netlify ou Vercel, données sur Supabase, offres gratuites au départ), et installable en **PWA** : icône sur l'écran d'accueil du téléphone, ouverture en plein écran sans barre de navigateur, sans passer par l'App Store ni le Play Store. **Valable pour les profs ET les élèves** : un élève peut répondre directement par le lien ou le code (sans rien installer), ou installer l'appli sur son téléphone pour retrouver ses classes et son classement d'un clic. Une seule appli, deux accès.
- **Compte prof** par e-mail. Pas de compte élève.
- **Données des élèves (RGPD)** : on ne collecte que le pseudo et les réponses (+ les sorties de page en mode examen), rien d'autre. Le prof peut tout supprimer en un clic.
- **IA optionnelle et branchable** : prévoir un emplacement pour une clé d'API IA (Claude ou Gemini) dans les réglages. Sans clé, l'app fonctionne entièrement en mode manuel.
- **Design** : moderne, clair, rassurant, couleurs douces. Pas d'effets inutiles.

## Livrable attendu

Une première version fonctionnelle (MVP) avec : création manuelle, création par IA, partage par code, passage du quiz par l'élève avec pseudo, classes et classement, mode examen, page de résultats. Commence par me montrer les écrans principaux avant de tout coder.
