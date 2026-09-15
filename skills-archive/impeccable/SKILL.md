# impeccable — Production-Grade Frontend Design System

A comprehensive system for designing and iterating production-grade frontend interfaces. Builds on Anthropic's frontend-design skill. Licensed Apache 2.0 by @pbakaus.

## Scope

Handles: website redesigns, dashboards, component polish, UX reviews, accessibility, performance, theming, visual effects.
Does NOT handle: backend-only work, non-UI tasks.

## Design Principles

### Color
- Maintain ≥4.5:1 contrast for body text at all times
- Avoid washed-out gray on color backgrounds
- Use OKLCH color space throughout for perceptual uniformity
- Never use pure black (#000) or pure white (#fff) — use near-values

### Typography
- Cap line length at 65–75ch for body text
- Enforce ≥1.25 ratio between adjacent scale steps
- Limit fonts to three families maximum
- Hero headline max 6rem (96px)
- Display letter-spacing minimum -0.04em (tight, not loose)
- Never default to Inter — it signals AI-generated output

### Layout
- Vary spacing for visual rhythm — identical gutters everywhere = dead
- Use flexbox for 1D layouts, grid for 2D
- Responsive grids: `repeat(auto-fit, minmax(280px, 1fr))`
- Never center-align body text beyond 2 lines

### Motion
- Animations must be intentional — if you can't justify it in one sentence, remove it
- Use exponential ease-out curves (`cubic-bezier(0.16, 1, 0.3, 1)`)
- Always support `prefers-reduced-motion`
- Never animate `<img>` elements directly
- Only animate `transform` and `opacity` — never layout properties

## Absolute Bans (never use without deliberate justification)

- Side-stripe colored borders on cards
- Gradient text (the `background-clip: text` trick)
- Default glassmorphism (`backdrop-filter: blur` with white overlay)
- Hero-metric templates (big number + label grid)
- Identical 3-column card grids with same height and same content pattern
- Eyebrows (small uppercase labels) on every section
- Numbered markers used as visual scaffolding instead of real design
- Text overflow / truncation as a design choice

## Available Commands (23 total)

**Build:** craft, shape, init, document, extract
**Evaluate:** critique, audit
**Refine:** polish, bolder, quieter, distill, harden, onboard
**Enhance:** animate, colorize, typeset, layout, delight, overdrive
**Fix:** clarify, adapt, optimize
**Iterate:** live (visual iteration mode)

Use these as directives: "use the impeccable skill to polish this component" or "/impeccable audit".

## Pre-Delivery Checklist

- [ ] Contrast ≥4.5:1 for all body text
- [ ] Line length ≤75ch
- [ ] Max 3 font families
- [ ] No absolute bans present
- [ ] `prefers-reduced-motion` respected
- [ ] Animations justified — each one
- [ ] No layout properties animated
- [ ] Responsive grid uses auto-fit pattern
- [ ] Spacing has rhythm variation (not uniform)
- [ ] No Inter as default font
