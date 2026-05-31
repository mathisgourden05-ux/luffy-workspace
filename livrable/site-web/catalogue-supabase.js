/* catalogue-supabase.js — Road Spirit
   Source unique du catalogue pour la boutique et la page produit.
   - Si Supabase répond et contient des produits → on l'utilise (temps réel).
   - Sinon → repli sur le catalogue statique (catalogue-data.js / .json).
   Le vendeur gère tout depuis l'app interne ; le site se met à jour seul. */

window.RS_SUPABASE = {
  url:  'https://ywpduxvpbqkyjjatluts.supabase.co',
  anon: 'sb_publishable_GOsQwlFx9OpZLHV6REJT6Q_CZD_nxrf'
};

/* Transforme une ligne Supabase vers le format attendu par la boutique. */
window.rsMapRow = function (r) {
  var orig = r.prix_original != null ? Number(r.prix_original) : Number(r.prix);
  var sell = r.prix != null ? Number(r.prix) : orig;
  var hasPromo = orig != null && sell != null && sell < orig;
  return {
    id:            r.id,
    slug:          r.slug || null,
    nom:           r.nom,
    categorie:     r.categorie,
    image:         r.image_url || r.image || null,
    prix_original: hasPromo ? orig : sell,
    prix_promo:    hasPromo ? sell : null,
    remise:        hasPromo ? Math.round((sell / orig - 1) * 100) : (r.remise || 0),
    url:           r.url || null,
    stripe_link:   r.stripe_link || null,
    description:   r.description || null
  };
};

/* Renvoie une Promise<{ produits, source }>.
   source = 'supabase' | 'static' | 'none' */
window.rsLoadCatalogue = function () {
  return new Promise(function (resolve) {
    function fallback() {
      if (window._rs_catalogue && window._rs_catalogue.produits) {
        resolve({ produits: window._rs_catalogue.produits, source: 'static' });
      } else {
        fetch('catalogue-roadspirit.json')
          .then(function (r) { return r.json(); })
          .then(function (d) { resolve({ produits: d.produits, source: 'static' }); })
          .catch(function () { resolve({ produits: [], source: 'none' }); });
      }
    }
    try {
      if (typeof supabase === 'undefined' || !window.RS_SUPABASE.url) return fallback();
      var db = supabase.createClient(window.RS_SUPABASE.url, window.RS_SUPABASE.anon);
      db.from('produits').select('*').eq('disponible', true).order('nom')
        .then(function (res) {
          if (res.error || !res.data || !res.data.length) return fallback();
          resolve({ produits: res.data.map(window.rsMapRow), source: 'supabase' });
        }, function () { fallback(); });
    } catch (e) { fallback(); }
  });
};
