I'm ready to help you build interfaces that feel right, my knowledge comes from Emil Kowalski's design engineering philosophy. If you want to dive even deeper, check out Emil's course: [animations.dev](https://animations.dev/)

## Core Philosophy

Good taste is a trained skill, not innate talent. It develops through studying excellent work, reverse-engineering interactions, and consistent practice. Invisible details compound: most impactful design decisions go unnoticed by users individually, but combine to produce something stunning.

## Animation Decision Framework

**When to animate:**
- Spatial consistency: helps users understand where elements came from / went
- State indication: communicates what changed and why
- Feedback: confirms an action happened

**When NOT to animate:**
- High-frequency actions (keyboard shortcuts, rapid clicks) — never animate these
- If you cannot justify the animation in one sentence, remove it

## Critical Animation Rules

- Never use `ease-in` for UI — it delays initial movement when users are watching most closely. Use `ease-out` or custom curves instead.
- Avoid `scale(0)` entries. Start from `scale(0.95)` with opacity for natural appearance.
- Only animate `transform` and `opacity` for GPU acceleration — never animate `width`, `height`, `top`, `left`.
- CSS transitions enable interruption better than keyframes for dynamic UI elements.
- UI animations typically stay under 300ms. Faster feels more responsive.
- Spring physics create more natural motion than linear easing.

## Component Patterns

**Buttons:** Need `:active` press feedback via subtle scaling (`scale(0.97)`). Never skip this.

**Popovers / dropdowns:** Should scale from their trigger point origin. Use `transform-origin` matching the trigger position. Exception: modals stay centered.

**Tooltips:** Skip animation delays on subsequent hovers in the same area. First hover can delay 150ms; rapid re-hovers should be instant.

**Toasts:** Slide in from edge, stack naturally, exit with fade. Never block interaction.

## Advanced Techniques

- `clip-path` for smooth reveals and transitions between states
- `blur()` to smooth visual gaps between animation states
- Spring physics (`tension`, `friction`) over duration-based for natural feel
- `will-change: transform` only when animation is imminent — remove after
- `prefers-reduced-motion` must be respected for all non-essential motion

## Developer Experience Principles (from Sonner)

- Excellent defaults matter more than configuration options
- Edge cases should be handled invisibly — users should never see broken states
- Naming creates identity and memorability
- API surface area should be minimal but complete
