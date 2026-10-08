# QuizClasse (nom provisoire)

Appli de quiz pour les profs, faite à partir de `../prompt.md` et de la maquette du 06/10.

## Tester tout de suite (mode démo)

Double-clic sur `lancer-demo.bat`. L'appli s'ouvre sur http://localhost:4848.

En mode démo, tout reste dans le navigateur. Pour jouer le prof et l'élève en même temps, ouvre deux onglets : un sur l'espace prof, l'autre avec le code du quiz. Ça ne marche pas d'un téléphone à un ordinateur, il faut pour ça le mode en ligne.

## Ce qui est dedans

- Prof : compte par e-mail, quiz à la main ou par IA (relecture obligatoire), QCM 1 ou plusieurs réponses, vrai/faux, réponse courte, explications, bibliothèque avec filtres matière/classe, duplication.
- Partage : code de 6 caractères ou lien direct.
- Résultats en direct (rafraîchis toutes les 3 s) : notes, avancée, sorties de page, déblocage, réussite par question, classement, export CSV, effacement en un clic.
- Classes : code de classe, pseudo réservé, classement général (podium + tableau), visibilité réglable (tout / top 3 / son rang), remise à zéro, moyenne par quiz dans le temps.
- Mode examen : plein écran, copier-coller et clic droit bloqués, détection des sorties de page (onglet, appli, plein écran quitté). Selon le réglage du prof, le quiz se verrouille ou la sortie est seulement signalée. Une appli web ne peut pas empêcher l'élève de changer d'appli, et l'écran le dit au prof.
- Minuteur facultatif : temps total ou temps par question.
- PWA installable (icône sur l'écran d'accueil), pour les profs comme pour les élèves.
- Les corrections restent sur le serveur : un élève ne peut pas les lire dans le code de la page.

## Mettre en ligne (gratuit)

1. **Supabase** : créer un projet sur supabase.com (le gratuit en permet 2). Ouvrir SQL Editor, coller tout `supabase.sql`, cliquer sur Run. Les tables commencent par `qz_` : on peut aussi les mettre dans le projet Road Spirit sans rien casser, mais un projet séparé est plus propre.
2. Dans Project Settings → API, copier l'**URL** et la clé **anon/publishable** dans `config.js`.
3. Authentication → Sign In / Providers → Email : décocher « Confirm email » pour tester plus vite (sinon le prof doit cliquer sur un lien reçu par mail).
4. **Netlify** : glisser le dossier `app` sur app.netlify.com/drop. L'appli est en ligne 24h/24, en HTTPS.
5. Dans Supabase → Authentication → URL Configuration, mettre l'adresse Netlify comme Site URL.

## IA

Réglages → coller une clé. Gemini est gratuit (clé sur aistudio.google.com/apikey), Claude est payant à l'usage. La clé reste sur l'appareil du prof. Sans clé, tout marche en manuel.
