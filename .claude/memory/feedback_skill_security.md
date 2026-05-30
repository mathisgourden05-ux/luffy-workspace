---
name: feedback-skill-security
description: Toujours auditer la sécurité d'un skill avant de l'installer, sans attendre que Mathis le demande
metadata:
  type: feedback
---

Avant d'installer n'importe quel skill, toujours faire l'audit de sécurité automatiquement (sans attendre qu'on le demande) :
- Licence (MIT, Apache 2.0 = OK / sans licence = signaler)
- Contenu : Markdown pur ou scripts exécutables ?
- Scripts shell ou postinstall npm : lire et expliquer ce qu'ils font
- Appels réseau à l'installation : signaler si présents

**Why:** Mathis a demandé explicitement que ce soit automatique à chaque fois, pas une procédure manuelle.

**How to apply:** Dès qu'un skill est mentionné pour installation, lancer l'audit avant toute autre action, même si Mathis ne le demande pas.
