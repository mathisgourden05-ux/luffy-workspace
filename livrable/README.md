# 📦 Livrable — Organisation & conventions

Ce dossier contient **tout ce que Luffy produit pour Mathis** : fichiers finis, prêts à l'emploi.

## 🥇 Règle d'or — Inputs vs Outputs

- **Inputs** (ce que *tu* me fournis : documents, briefs, données, exemples) → vont dans **`contexte-import/`** (à la racine du workspace).
- **Outputs** (ce que *je* produis pour toi) → vont **ici, dans `livrable/`**.

> En clair : tes documents entrent par `contexte-import/`, mes résultats sortent par `livrable/`. On ne mélange jamais les deux.

## 🗂️ Sous-dossiers thématiques

| Dossier | Ce qui y va |
|---|---|
| `site-web/` | Landing pages, sites vitrines, composants web, maquettes HTML/CSS. |
| `applications/` | Apps, scripts, automatisations, agents, outils. |
| `BTS/` | Travaux scolaires : synthèses, rapports, dossier de stage, prépa d'épreuves. |

Chaque sous-dossier contient son propre `README.md` qui précise ce qu'on y range.

## 🏷️ Convention de nommage des projets

Un dossier par projet, nommé ainsi :

```
AAAA-MM-JJ_nom-du-projet
```

- **Date** au format `AAAA-MM-JJ` (ex. `2026-05-30`) = date de création, pour trier chronologiquement.
- **Nom** en `kebab-case` : minuscules, tirets, pas d'espaces ni d'accents.

Exemples :
- `site-web/2026-05-30_landing-freelance/`
- `applications/2026-06-01_bot-veille-ia/`
- `BTS/2026-05-30_rapport-stage/`

### Versions

Si plusieurs versions d'un même livrable :
```
nom-du-fichier_v1.docx
nom-du-fichier_v2.docx
nom-du-fichier_final.docx
```

---

*Maintenu par Luffy. Dernière mise à jour : 2026-05-30.*
