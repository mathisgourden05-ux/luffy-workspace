# 21st.dev — Premium UI Component Design Skill

21st.dev is the largest registry of 1400+ React/Tailwind UI components. For vanilla HTML projects, use it as design reference and pattern inspiration rather than direct install.

## When to use
- Need a specific UI pattern (hero, card, nav, feature grid) — browse 21st.dev for the best visual approach
- Building React/Next.js → install components directly with npx
- Building vanilla HTML → translate the design patterns manually

## For React projects
```bash
npx shadcn@latest add "https://21st.dev/r/{author}/{component}"
```
Prerequisites: `npx create-next-app@latest` + `npx shadcn@latest init`

## Best component authors on 21st.dev
- **shadcn** — clean, minimal, accessible
- **bundui** — animated, smooth transitions
- **magicui** — motion-rich, dramatic effects

## Design principles from 21st.dev top components

### Hero sections
- Min-height `80vh` not `100vh` — leave room to show next section exists
- One bold headline max 2 lines, subtext max 20 words
- One primary CTA, one secondary (ghost/outline)
- Background: gradient overlay on image OR abstract shape — never flat color

### Cards
- Subtle border + shadow — `border border-white/10 shadow-lg`
- Hover: lift `translateY(-4px)` + stronger shadow + accent border reveal
- Content: label, title, one-line description, one action — no more

### Color rule (critical)
NEVER default to purple. For moto/automotive: dark charcoal + warm gold + off-white. Accent should be industry-appropriate (Triumph = gold, not purple or teal).

### Typography
- Display: large, tight leading (0.85–0.95), letter-spacing -0.02em
- Body: comfortable 1.65–1.75 line-height, max 65ch width
- Labels: uppercase, tracked, 11–13px, muted color

### Motion
- Entrance: `opacity 0→1` + `translateY 40px→0`, `cubic-bezier(0.16,1,0.3,1)`, 600–900ms
- Stagger: 80–120ms between children
- Hover: 200–300ms, `cubic-bezier(0.16,1,0.3,1)`
- No animation without purpose

## Premium patterns to steal
1. **Diagonal clip-path** between sections — creates depth
2. **Ghost text behind content** — oversized transparent heading
3. **Line-by-line text reveal** — clip-path per line, staggered
4. **Sticky horizontal scroll** — cards pan sideways while page scrolls
5. **Marquee ticker** — logos or text looping infinitely
6. **Spotlight hover** — radial gradient follows cursor on cards
