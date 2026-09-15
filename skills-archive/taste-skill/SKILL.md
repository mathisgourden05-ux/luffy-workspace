# tasteskill: Anti-Slop Frontend Skill

This is a comprehensive design system for building landing pages, portfolios, and redesigns that avoid common AI-generated design clichés.

## Core Methodology

**Brief Inference First** – Before any code, read the room. Identify the page type, audience, aesthetic signals, and constraints. Output a one-line "Design Read" declaring your interpretation.

**Three Control Dials** – Every project operates at specific levels:
- `DESIGN_VARIANCE` (1–10): symmetry to asymmetry
- `MOTION_INTENSITY` (1–10): static to cinematic
- `VISUAL_DENSITY` (1–10): airy to packed

These dials gate all layout, animation, and spacing decisions downstream.

**Real Design Systems Over Invention** – When the brief maps to an official system (Material Web, Fluent UI, Carbon, Polaris, GOV.UK Frontend, USWDS, shadcn/ui), use the official package. Do not hand-roll CSS for things with documented tokens and components.

## Hard Anti-Patterns

**Em-dash ban (Section 9.G)** – The character `—` is completely forbidden. It appears nowhere: headlines, eyebrows, body copy, quotes, captions, buttons. Use periods, commas, colons, or line breaks instead. This is the single most reliable AI-design tell.

**Typography discipline** – Inter is discouraged as default; rotate toward Geist, Outfit, Cabinet Grotesk. Serif is only acceptable when the brand explicitly requires it or the aesthetic is genuinely editorial/luxury. Specifically banned serifs: Fraunces and Instrument_Serif (the LLM defaults).

**Premium-consumer palette lock** – The "warm beige + brass + oxblood + espresso" palette is banned as a default for cookware/wellness/artisan briefs. It is the identical palette every AI model defaults to. If you used it last project, use a different palette this time.

**Layout mechanics** – Hero must fit the viewport; headline ≤ 2 lines, subtext ≤ 20 words. Navigation on one line at desktop. No more than one horizontal marquee per page. Eyebrows (small uppercase labels) appear max once per three sections. Three consecutive sections with identical image+text-split layouts = failure.

**Button and form accessibility** – Every CTA text must pass WCAG AA contrast (4.5:1). Form inputs, labels, and helper text must all pass contrast checks. Button labels cannot wrap to 2+ lines at desktop.

**Content cuts ruthlessly** – No data dumps. Long lists get card layouts, tabs, or carousels instead of default `<ul>` with bullets. Quotes max 3 lines. Spec sheets should be 2-column cards or grouped chunks, not a 10-row table with hairlines under every row.

## Design System Mapping

| Brief reads as | Reach for |
|---|---|
| Microsoft / enterprise SaaS | `@fluentui/react-components` |
| Material 3 / Google | `@material/web` |
| IBM B2B analytics | `@carbon/react` |
| GitHub devtool / community | `@primer/css` or `@primer/react-brand` |
| Shopify app surfaces | `polaris.js` web components |
| Public-sector UK service | `govuk-frontend` |
| US public-sector trust-first | `uswds` |
| Modern accessible React | `@radix-ui/themes` |
| SaaS where you own components | `shadcn/ui` |
| Tailwind-based indie / AI marketing | Tailwind v4 utilities + `dark:` variant |

For aesthetics without a single system (glassmorphism, brutalism, kinetic typography, bento grids), build with native CSS + Tailwind + a component library, and label borrowed inspiration honestly.

## Animation Discipline

GSAP is for scroll-hijack and pinned stacks. Motion library is for state-change interactions. Never mix both in the same component tree.

**Forbidden:** `window.addEventListener("scroll", ...)`. It runs on every frame, causing jank. Use Motion's `useScroll()`, GSAP's `ScrollTrigger`, `IntersectionObserver`, or CSS `scroll-driven-animations`.

**Sticky-Stack pattern (canonical):** `start: "top top"`, `pin: true`, each card except the last shrinks as the next one arrives.

**Horizontal-Pan pattern (canonical):** `start: "top top"`, `pin: true`, `end: "+=${distance}"` to match the horizontal travel needed.

Every animation must communicate one thing: hierarchy, storytelling, feedback, or state transition. If you cannot articulate the reason in one sentence, drop it.

## Redesign Protocol

Detect mode first: greenfield, preserve-and-modernize, or overhaul. If ambiguous, ask once.

**Always audit before touching.** Extract brand colors, IA, content blocks, signature patterns, and perf traps. Preserve slug structure, nav labels, and form field names (for SEO and analytics). Apply modernization levers in order: typography, spacing, color, motion, hero recomposition, block replacement.

## Pre-Flight Checklist

Before shipping, verify:
- Brief inference stated in one line
- Dial values explicit and reasoned
- Design system chosen or aesthetic labeled honestly
- **ZERO em-dashes anywhere**
- One page theme (no mid-page light/dark flip)
- One accent color used consistently across all sections
- One corner-radius system applied consistently
- All CTAs pass WCAG AA contrast; labels do not wrap at desktop
- All form elements pass contrast
- Hero fits viewport; headline ≤ 2 lines, subtext ≤ 20 words
- Hero top padding max `pt-24` at desktop
- Hero stack max 4 text elements (no tiny tagline below CTAs)
- Eyebrow count ≤ ceil(sectionCount / 3)
- No split-header pattern (left headline / right explainer text)
- No 3+ consecutive zigzag image+text sections
- No duplicate CTA intent on same page
- Bento grids have real visual variation (image, gradient, pattern)
- "Trusted by" logos use real SVG (Simple Icons or generated marks), not text
- Copy audit complete; no grammatically broken or hallucinated phrases
- Every animation justified; no GSAP-for-show
- Max one marquee per page
- Navigation fits one line at desktop, height ≤ 80px
- Long lists (> 5 items) use card grid or carousel, not `<ul>`
- Real images present (generated first, Picsum-seeded second, then placeholder slots)
- No pills overlaid on images; no photo-credit captions as decoration
- No version footers, no decoration text strips, no floating sub-text in headers
- No locale/time/weather strips unless brief is place-focused
- No scroll cues, no version labels in hero (V0.6, BETA)
- No section-numbering eyebrows, no decorative status dots by default
- Motion claimed = motion shown; if `MOTION_INTENSITY > 4`, page actually moves
- GSAP sticky-stack / horizontal-pan use canonical skeletons
- No `window.addEventListener('scroll')` — Motion, ScrollTrigger, IntersectionObserver, or CSS only
- `prefers-reduced-motion` honored for everything `> MOTION_INTENSITY 3`
- Dark mode tokens defined and tested in both modes
- Mobile collapse explicit for high-variance layouts
- `min-h-[100dvh]` used, never `h-screen`
- `useEffect` animations have cleanup functions
- Empty/loading/error states provided
- Icons from allowed library only (Phosphor, HugeIcons, Radix, Tabler)
- Motion isolated in client-leaf components with `'use client'`
- No AI tells present (Inter default, AI-purple, three-equal cards, Jane Doe, Acme, "Quietly in use at")
- Core Web Vitals plausibly hit (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- One design system per project (no mixing Material + shadcn)

If a single item cannot be ticked honestly, the page is incomplete. Fix before delivering.
