# 🏴‍☠️ Luffy — Assistant personnel de Mathis

Assistant IA personnel construit avec Claude Code.

## Structure
- `CLAUDE.md` — règles de fonctionnement (chargé automatiquement au démarrage).
- `context.md` — mémoire durable sur Mathis.
- `history.md` — journal chronologique des échanges.
- `.claude/commands/` — commandes rapides (tape `/` dans Claude Code).
- `.claude/skills/` — compétences spécialisées (veille, design…).
- `context/` — documents de référence à garder sous la main.

## Commandes dispo
| Commande   | Ce qu'elle fait                                  |
|------------|--------------------------------------------------|
| `/prime`   | Charge le contexte en début de session.          |
| `/morning` | Briefing du matin + priorités du jour.           |
| `/update`  | Met à jour la mémoire (context.md / history.md). |
| `/commit`  | Commit git propre (si dépôt git).                |

## Skills dispo
- `recherche-actualites` — veille IA et opportunités de monétisation.
- `frontend-design` — création d'interfaces web soignées.
