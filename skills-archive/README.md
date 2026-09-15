# 📦 Skills archivés

Skills retirés du chargement actif (`.claude/skills/`) le **2026-09-15** lors du ménage de la bibliothèque de skills, mais **conservés ici au cas où**. Ce dossier n'est PAS chargé par Claude Code (seul `.claude/skills/` l'est), donc ces skills sont inactifs tant qu'ils restent ici.

## Pourquoi archivés ?

- **9 skills design/animation redondants** : `ui-ux-pro-max`, `21st-dev`, `taste-skill`, `impeccable`, `emil-kowalski`, `gsap-scrolltrigger`, `motion-framer`, `lenis-smooth-scroll`, `interactive-3d`. Ils se chevauchent tous (rendu web « anti-slop », animations). Pour les sites clients (projet prestataire IA, en pause), `frontend-design` (version officielle Anthropic) suffit comme base. Ceux-là resserviront quand les sites clients reprendront.
- **`mon-equipe-ia`** : skill perso (équipe de 5 assistants Léa/Théo/Sophie/Marco/Nadia). Était **cassé** (mauvaise structure `mon-equipe-ia/mon-equipe-ia/SKILL.md` → jamais chargé) et faisait doublon avec le système Luffy actuel. Abandonné, mais gardé ici.
- **`humanizer-doublon-user`** : 2ᵉ copie de humanizer (elle était chez l'utilisateur). L'originale reste active dans `.claude/skills/humanizer`.
- **`frontend-design-old-mai2026`** : ancienne copie figée (mai 2026). Remplacée par la version officielle maintenue du marketplace.

## Réactiver un skill

Déplacer son dossier de `skills-archive/` vers `.claude/skills/`, puis redémarrer Claude Code.
