---
name: feedback-skill-usage
description: Détecter le besoin avant d'activer un skill, ne jamais sacrifier les performances
metadata:
  type: feedback
---

Détecter le besoin réel avant d'activer un skill. Ne jamais activer un skill si ça peut dégrader la qualité ou la précision des réponses.

**Why:** Mathis veut toujours le meilleur niveau de performance. Un skill qui réduit la qualité pour économiser des tokens n'est pas acceptable.

**How to apply:**
- `caveman` / `token-efficient` : uniquement si la session est longue et que la question est simple. Jamais sur du code complexe, de l'architecture, ou des tâches importantes.
- Skills design (gsap, lenis, impeccable...) : uniquement si la tâche concerne du frontend/design.
- Ne jamais empiler plusieurs skills contradictoires.
- Priorité absolue : être performant et précis. L'économie de tokens est secondaire.
