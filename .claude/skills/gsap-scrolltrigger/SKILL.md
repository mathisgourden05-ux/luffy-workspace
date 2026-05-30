# GSAP + ScrollTrigger — Professional Animation Skill

Industry standard for premium agency websites (AKQA, Locomotive, Resn). Works with vanilla HTML, React, Vue, and any framework.

## When to use
Whenever the project needs scroll-driven animations, pinned sections, horizontal scroll, parallax, or cinematic reveals. GSAP is the gold standard — never write manual `window.addEventListener('scroll')` animations.

## CDN Load (always include both)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>gsap.registerPlugin(ScrollTrigger);</script>
```

## Core Patterns

### Fade up on scroll (replace IntersectionObserver)
```js
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    }
  );
});
```

### Pinned horizontal scroll section
```js
const track = document.querySelector('.h-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.h-section',
    start: 'top top',
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
  }
});
```

### Text split reveal (clip-path line by line)
```js
// Use SplitType CDN for this
const split = new SplitType('.hero-title', { types: 'lines' });
gsap.from(split.lines, {
  yPercent: 110,
  clipPath: 'inset(0 0 100% 0)',
  duration: 1.2,
  stagger: 0.08,
  ease: 'power4.out',
  delay: 0.3,
});
```

### Parallax depth effect
```js
gsap.to('.hero-bg', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});
```

### Counter animation on scroll
```js
gsap.from('.counter', {
  textContent: 0,
  duration: 2,
  ease: 'power2.out',
  snap: { textContent: 1 },
  stagger: 0.15,
  scrollTrigger: { trigger: '.stats', start: 'top 70%', once: true }
});
```

## Rules (from Emil Kowalski + GSAP best practices)
- Always animate `transform` and `opacity` only — never layout properties
- Use `ease: 'power3.out'` or `'expo.out'` for entrances — never `ease-in`
- `scrub: 1` for scroll-linked (not `scrub: true` which is instant)
- Always add `once: true` to one-shot animations (prevents re-triggering)
- Cleanup: `ScrollTrigger.getAll().forEach(t => t.kill())` on page destroy
- `will-change: transform` only during animation — remove after

## Easing Reference
- Entrances: `power3.out`, `expo.out`, `back.out(1.4)`
- Exits: `power2.in`
- Scroll-scrubbed: `none` (linear)
- Bouncy: `elastic.out(1, 0.3)` — use sparingly

## Performance
- Batch similar animations: `ScrollTrigger.batch('.card', { onEnter: ... })`
- Refresh on resize: `ScrollTrigger.refresh()` after layout changes
- Avoid animating more than 20 elements at once without batching
