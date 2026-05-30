# Motion (vanilla JS) — Animation Skill

Motion.dev is the vanilla JavaScript evolution of Framer Motion. Works without React. Perfect for micro-interactions, hover effects, and state-change animations that GSAP doesn't need to handle.

## When to use
- Micro-interactions: button hover, card lift, menu open/close
- State transitions: tab switches, accordion, modal appear/disappear
- Leave this to Motion; give scroll-driven/cinematic to GSAP

## CDN Load
```html
<script type="module">
import { animate, hover, inView, scroll } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';
</script>
```

## Core Patterns

### Button hover (magnetic feel)
```js
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => animate(btn, { scale: 1.03 }, { duration: 0.2, easing: [0.16, 1, 0.3, 1] }));
  btn.addEventListener('mouseleave', () => animate(btn, { scale: 1 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] }));
  btn.addEventListener('mousedown', () => animate(btn, { scale: 0.97 }, { duration: 0.1 }));
  btn.addEventListener('mouseup', () => animate(btn, { scale: 1 }, { duration: 0.2 }));
});
```

### Element appear/disappear (modal, drawer)
```js
// Appear
animate(modal, { opacity: [0, 1], y: [20, 0] }, { duration: 0.35, easing: [0.16, 1, 0.3, 1] });
// Disappear
animate(modal, { opacity: [1, 0], y: [0, 10] }, { duration: 0.2, easing: 'ease-in' });
```

### InView trigger (lightweight alternative to ScrollTrigger for simple fades)
```js
inView('.card', ({ target }) => {
  animate(target, { opacity: [0, 1], y: [30, 0] }, { duration: 0.7, easing: [0.16, 1, 0.3, 1] });
});
```

## Rules (Emil Kowalski)
- Hover/tap animations: max 200ms, `easing: [0.16, 1, 0.3, 1]`
- State transitions: max 350ms
- Exit animations: use ease-in, shorter than entry
- Never animate on every scroll event — use IntersectionObserver or inView()
- Spring physics > duration for feel: `{ type: 'spring', stiffness: 300, damping: 30 }`
