/* catalogue-supabase.js — Road Spirit
   Source unique du catalogue pour la boutique et la page produit.
   - Si Supabase répond et contient des produits → on l'utilise (temps réel).
   - Sinon → repli sur le catalogue statique (catalogue-data.js / .json).
   Le vendeur gère tout depuis l'app interne ; le site se met à jour seul. */

window.RS_SUPABASE = {
  url:  'https://ywpduxvpbqkyjjatluts.supabase.co',
  anon: 'sb_publishable_GOsQwlFx9OpZLHV6REJT6Q_CZD_nxrf'
};

/* Évite qu'une requête Supabase qui traîne ne bloque la page indéfiniment. */
function rsWithTimeout(promise, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; resolve(null); } }, ms);
    Promise.resolve(promise).then(
      function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
      function () { if (!done) { done = true; clearTimeout(t); resolve(null); } }
    );
  });
}

function rsClient() {
  try {
    if (typeof supabase === 'undefined' || !window.RS_SUPABASE.url) return null;
    return supabase.createClient(window.RS_SUPABASE.url, window.RS_SUPABASE.anon);
  } catch (e) { return null; }
}

function rsStaticList() {
  return new Promise(function (resolve) {
    if (window._rs_catalogue && window._rs_catalogue.produits) {
      resolve(window._rs_catalogue.produits);
    } else {
      fetch('catalogue-roadspirit.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { resolve(d.produits || []); })
        .catch(function () { resolve([]); });
    }
  });
}

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

/* Catalogue complet → Promise<{ produits, source }>. */
window.rsLoadCatalogue = function () {
  return new Promise(function (resolve) {
    var db = rsClient();
    function fallback() { rsStaticList().then(function (l) { resolve({ produits: l, source: 'static' }); }); }
    if (!db) return fallback();
    rsWithTimeout(db.from('produits').select('*').eq('disponible', true).order('nom'), 5000)
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.length) return fallback();
        resolve({ produits: res.data.map(window.rsMapRow), source: 'supabase' });
      });
  });
};

/* Un seul produit par id (uuid Supabase OU id entier statique) → Promise<produit|null>.
   Cherche d'abord Supabase par id exact, puis se rabat sur le catalogue statique.
   Ainsi la page produit retrouve l'article quelle que soit la source de la boutique. */
window.rsLoadProduct = function (id) {
  return new Promise(function (resolve) {
    function staticFind() {
      rsStaticList().then(function (list) {
        resolve(list.find(function (p) { return String(p.id) === String(id); }) || null);
      });
    }
    var db = rsClient();
    if (!db) return staticFind();
    rsWithTimeout(db.from('produits').select('*').eq('id', id).limit(1), 5000)
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.length) return staticFind();
        resolve(window.rsMapRow(res.data[0]));
      });
  });
};
