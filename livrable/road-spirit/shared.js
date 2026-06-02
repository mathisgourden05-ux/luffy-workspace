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

/* PWA — enregistre le service worker (rend le site installable + hors-ligne basique).
   Ne s'active qu'en HTTP(S) ; ignoré quand on ouvre le fichier en local (file://). */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
