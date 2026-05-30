# Prompt — Refonte roadspirit.fr (Claude Design)

> Coller ce prompt tel quel dans Claude Design (claude.ai/design ou artifacts).  
> Objectif : obtenir une page HTML complète, prête à importer.

---

## PROMPT

You are redesigning **roadspirit.fr**, a French e-commerce website for a Triumph motorcycle dealership in Toulon (Road Spirit). The site sells motorcycle gear (jackets, pants, helmets, gloves, shoes), new Triumph motorcycles, and offers services (test rides, workshop, customization).

**Design direction: cinematic editorial — dark luxury meets raw road energy.**  
Think Triumph's British heritage fused with modern high-performance aesthetics. The result must feel like a premium moto lifestyle brand, not a generic e-shop.

---

### Visual identity

**Color system:**
- Background: near-black `#0a0a0a` with subtle dark charcoal `#111111` for sections
- Primary accent: Triumph orange-red `#E8431A`
- Secondary accent: warm chrome silver `#C0C0C0`
- Text: off-white `#F5F5F0` for headlines, `#999999` for secondary

**Typography:**
- Headlines: Bebas Neue (Google Font) — uppercase, ultra-bold, wide tracking
- Subheadings: Barlow Condensed Semi-Bold
- Body: Inter or DM Sans, regular weight, generous line-height

**Tone:** Powerful. Editorial. No roundness. Sharp edges, strong contrasts.

---

### Animations (mandatory — all CSS-native, no dependencies)

1. **Hero section:** Full-viewport background with a dark overlay. Headline text splits in from left/right with a 0.8s ease-out. A thin orange underline draws left-to-right under the tagline (stroke animation). CTA button pulses subtly on load.

2. **Scroll reveal:** Every section fades up (`translateY(40px) → 0`, `opacity: 0 → 1`) when entering the viewport via `IntersectionObserver`. Stagger children with `animation-delay: 0.1s` increments.

3. **Navigation:** Starts fully transparent over hero. On scroll > 80px: smoothly transitions to `rgba(10,10,10,0.95)` with a 1px bottom border in orange.

4. **Product cards:** On hover — card lifts `translateY(-6px)`, shadow intensifies, a thin orange border fades in on the bottom edge. Image scales to `1.04`. Duration: 300ms ease.

5. **Section dividers:** Diagonal cut between sections (CSS `clip-path: polygon`) in alternating dark tones — creates depth and visual momentum.

6. **CTA buttons:** Filled orange base. On hover: background slides left-to-right to reveal a dark/outline version (CSS `::after` pseudo-element slide trick). No JavaScript.

---

### Page structure (single scrollable page)

**1. NAVIGATION**
- Logo "ROAD SPIRIT" in Bebas Neue, left-aligned, orange
- Links: Motos / Équipements / Services / Contact — centered, letter-spaced
- Cart icon (SVG) + "Essai gratuit" CTA button — right side
- Full-width, position: fixed, z-index: 1000

**2. HERO**
- 100vh full screen
- Background: dark gradient overlay over a motorcycle racing/road image (use `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920` as placeholder)
- Massive headline (Bebas Neue, 120px+): "LA ROUTE EST À VOUS"
- Subline: "Concession Triumph officielle — Toulon" in chrome silver
- Two CTAs: [DÉCOUVRIR LES MOTOS] (filled orange) [VOIR L'ÉQUIPEMENT] (outline white)
- Scroll indicator: thin animated line pulsing downward

**3. FEATURED MOTORCYCLES — "NOS TRIUMPH"**
- Dark section `#0f0f0f`
- Section label: "/ NOUVEAUTÉS 2024" in small orange uppercase
- 3-column grid — each card: full-bleed motorcycle image, model name (Bebas Neue), price tag, hover animation
- Models: Speed Triple RR / Tiger 900 / Bonneville T120
- "Voir toutes les motos →" link at bottom right in orange

**4. EQUIPMENT CATEGORIES — "L'ÉQUIPEMENT"**
- Alternating layout (image left/text right, then flip) — not a grid
- Categories: Blousons / Casques / Gants & Chaussures
- Each block: category name in giant Bebas Neue (40% opacity background text) + foreground product image + 3 bullet features + CTA
- Diagonal clip-path cut between this and next section

**5. SERVICES STRIP**
- Full-width dark charcoal band
- 3 blocks side-by-side (border-right separators):
  - 🏍️ ESSAI ROUTIER GRATUIT
  - 🔧 ATELIER & CUSTOMISATION
  - 🚀 LIVRAISON NATIONALE
- Each: icon (SVG inline), bold title, one-line description
- Counter animation: numbers count up on scroll (0 → real number)

**6. BRAND STORY — "L'ESPRIT ROAD SPIRIT"**
- Full-width cinematic section with dark background
- Large pull-quote: *"Nous ne vendons pas des motos. Nous vendons l'envie de partir."*
- Text block: 2–3 lines on the Road Spirit story/philosophy
- Side image: rider on open road (use `https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1200`)

**7. FOOTER**
- Dark `#080808`
- 4 columns: Logo + tagline / Navigation / Contact (adresse Toulon, tel, email) / Réseaux sociaux
- Bottom bar: copyright + mentions légales
- Thin orange top border

---

### Technical constraints

- Single HTML file, all CSS inline in `<style>` tag, all JS inline in `<script>` tag
- Zero external CSS frameworks (no Bootstrap, no Tailwind CDN)
- Google Fonts loaded via `<link>` (Bebas Neue + Barlow Condensed + DM Sans)
- Unsplash images as placeholders (direct URLs, no API key needed)
- All animations: CSS keyframes + IntersectionObserver (vanilla JS only)
- Mobile-first: fully responsive (hamburger menu on mobile, stacked layout)
- Must pass basic accessibility: alt text, aria-labels on nav, sufficient color contrast on body text

---

### Output

Produce **one complete, deployable HTML file**. No comments explaining what to do — just the working code. The design must be immediately impressive, not a wireframe.
