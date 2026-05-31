/* shared.js — Road Spirit
   Fix : réinitialise l'overlay de transition quand le navigateur
   restaure une page depuis son cache (bouton retour/suivant).
   Sans ça, l'overlay noir reste collé et masque tout le contenu. */

window.addEventListener('pageshow', function (e) {
  if (e.persisted) {
    var overlay = document.querySelector('.page-overlay');
    if (overlay) {
      overlay.classList.remove('out');
    }
  }
});
