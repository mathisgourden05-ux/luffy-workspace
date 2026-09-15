# Interactive 3D — Web 3D & Immersive Effects Skill

Vanilla JS + CSS 3D transforms + Three.js patterns for immersive, GPU-accelerated 3D effects in the browser. No React required.

## When to use
- 3D hero effects (book opening, card flip, object rotate)
- Parallax depth with CSS perspective
- Three.js scenes: particles, floating objects, shader backgrounds
- Interactive 3D on mouse move (tilt, magnetic, depth)
- CSS 3D transforms: flip cards, fold effects, book pages

## CDN Load (Three.js)
```html
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/" } }
</script>
<script type="module">
import * as THREE from 'three';
</script>
```

---

## CSS 3D — Core Setup

```css
.scene {
  perspective: 1200px;
  perspective-origin: 50% 50%;
}
.object {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.face-back {
  transform: rotateY(180deg);
}
```

## CSS 3D — Book Opening (scroll-driven)

```js
const scene = document.querySelector('.book-scene');
const cover = document.querySelector('.book-cover');

window.addEventListener('scroll', () => {
  const sTop = scene.offsetTop;
  const sH   = scene.offsetHeight - window.innerHeight;
  const p    = Math.max(0, Math.min(1, (window.scrollY - sTop) / sH));
  cover.style.transform = `rotateY(${p * -165}deg)`;
}, { passive: true });
```

## CSS 3D — Mouse Tilt Card

```js
function addTilt(el, depth = 15) {
  el.addEventListener('mousemove', e => {
    const r    = el.getBoundingClientRect();
    const x    = (e.clientX - r.left) / r.width  - 0.5; // -0.5 to 0.5
    const y    = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * depth}deg) rotateY(${x * depth}deg) scale(1.02)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    el.style.transition = 'transform 0.5s ease';
  });
  el.addEventListener('mouseenter', () => el.style.transition = 'none');
}
```

## CSS 3D — Flip Card

```html
<div class="flip-scene" style="perspective:800px">
  <div class="flip-card" style="transform-style:preserve-3d;transition:transform .6s">
    <div class="flip-front" style="backface-visibility:hidden;position:absolute;inset:0">Front</div>
    <div class="flip-back"  style="backface-visibility:hidden;transform:rotateY(180deg);position:absolute;inset:0">Back</div>
  </div>
</div>
<script>
card.addEventListener('click', () => {
  const flipped = card.style.transform === 'rotateY(180deg)';
  card.style.transform = flipped ? 'rotateY(0)' : 'rotateY(180deg)';
});
</script>
```

---

## Three.js — Minimal Scene

```js
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

## Three.js — Particle Cloud

```js
const count = 2000;
const geo   = new THREE.BufferGeometry();
const pos   = new Float32Array(count * 3);
for(let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 10;
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const mat  = new THREE.PointsMaterial({ size: 0.025, color: 0xffffff, transparent: true, opacity: 0.7 });
scene.add(new THREE.Points(geo, mat));
```

## Three.js — Mouse-reactive scene rotation

```js
const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// In animate loop:
scene.rotation.y += (mouse.x * 0.3 - scene.rotation.y) * 0.05;
scene.rotation.x += (-mouse.y * 0.2 - scene.rotation.x) * 0.05;
```

## Three.js — Floating 3D Text (TextGeometry)

```js
import { FontLoader }   from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', font => {
  const geo = new TextGeometry('Hello', {
    font, size: 0.5, depth: 0.1, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.02
  });
  geo.center();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
  scene.add(mesh);
});
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 1), { position: { set: () => {} } }));
```

## Three.js — Shader background (gradient mesh)

```js
const geo = new THREE.PlaneGeometry(2, 2);
const mat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uColor1: { value: new THREE.Color('#C41E2E') }, uColor2: { value: new THREE.Color('#1C1917') } },
  vertexShader:   `void main(){ gl_Position = vec4(position,1.); }`,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1, uColor2;
    void main(){
      float t = sin(uTime * 0.5) * 0.5 + 0.5;
      gl_FragColor = vec4(mix(uColor1, uColor2, t), 1.);
    }
  `
});
scene.add(new THREE.Mesh(geo, mat));
// In animate: mat.uniforms.uTime.value += 0.016;
```

---

## Performance rules
- Always `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- Dispose geometries/materials when removing objects: `geo.dispose(); mat.dispose()`
- Use `requestAnimationFrame` — never `setInterval`
- Prefer `BufferGeometry` over legacy `Geometry`
- Avoid creating new objects inside the render loop (causes GC)
- CSS 3D transforms are GPU-composited — free to animate `transform` and `opacity`
- Respect `prefers-reduced-motion`: skip animations or reduce to instant snaps
