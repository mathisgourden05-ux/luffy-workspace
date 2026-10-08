// Mesures statistiques simples d'un texte (proxy de ce que regardent les détecteurs).
// Usage : node stats.js texte.txt            -> mesures d'un texte
//         node stats.js avant.txt apres.txt  -> comparaison avant / après
const fs = require("fs");

// Mots et tournures qui reviennent beaucoup dans les textes générés (FR + EN)
const TELLS = ["en outre", "par ailleurs", "il convient de", "il est important de", "de plus",
  "en effet", "ainsi", "notamment", "en conclusion", "en résumé", "non seulement", "crucial",
  "essentiel", "incontournable", "véritable", "delve", "moreover", "furthermore", "tapestry"];

function stats(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 1);
  const lens = sentences.map(s => s.split(/\s+/).filter(w => /[\p{L}0-9]/u.test(w)).length).filter(n => n > 0);
  const n = lens.length;
  const mean = lens.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  const words = text.toLowerCase().match(/\p{L}+/gu) || [];
  const low = text.toLowerCase();
  const tells = TELLS.map(t => [t, low.split(t).length - 1]).filter(([, c]) => c > 0);
  return {
    phrases: n, mots: words.length,
    longueur_moy: mean, ecart_type: std, coeff_variation: std / mean,
    plus_courte: Math.min(...lens), plus_longue: Math.max(...lens),
    diversite_lexicale: new Set(words).size / words.length,
    tirets_cadratins: (text.match(/—/g) || []).length,
    mots_signaux: tells.reduce((a, [, c]) => a + c, 0),
    detail_signaux: tells.map(([t, c]) => `${t}×${c}`).join(", ") || "aucun",
  };
}

const files = process.argv.slice(2);
if (!files.length) { console.log("Usage : node stats.js texte.txt [texte2.txt]"); process.exit(1); }
const res = files.map(f => stats(fs.readFileSync(f, "utf8")));
const fmt = v => typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : v;
for (const k of Object.keys(res[0])) {
  console.log(k.padEnd(20) + res.map(r => fmt(r[k]).padStart(12)).join("   "));
}
console.log("\nCoeff. de variation ↑ et diversité ↑ = rythme plus « humain » pour les détecteurs statistiques (ZeroGPT, Compilatio).");
console.log("Ne prédit PAS GPTZero, qui utilise un modèle entraîné.");
