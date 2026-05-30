# Lenis Smooth Scroll — Premium Scroll Experience

Lenis creates buttery-smooth, hardware-accelerated scrolling. Used by Apple, Stripe, Linear, and every premium agency site. Replaces native browser scroll with a lerp-based smooth equivalent.

## When to use
Any site where scroll should feel premium — landing pages, portfolios, brand sites. Combine with GSAP ScrollTrigger for the full agency stack.

## CDN Load
```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
```

## Setup (always at page init, before GSAP)
```js
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 1.5,
});

// Required GSAP integration
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```

## Without GSAP
```js
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```

## Rules
- Duration 1.0–1.4: below 1 = too fast, above 1.5 = too sluggish
- Always disable on mobile touch if users report issues: `smoothTouch: false` (default)
- Anchor links: use `lenis.scrollTo('#section')` not native href
- Modals: pause with `lenis.stop()`, resume with `lenis.start()`
- Fixed elements: must be outside the scroll container or use `position: fixed`
- Accessibility: respect `prefers-reduced-motion` — disable Lenis if set

## prefers-reduced-motion respect
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) { /* init Lenis */ }
```
