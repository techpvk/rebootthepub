import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

// ╔══════════════════════════════════════════════════════════════╗
// ║  FULL-PAGE WEBGL ATMOSPHERIC LAYER                          ║
// ║  Renders bloom particles + volumetric neon light over the   ║
// ║  entire page as a fixed overlay                              ║
// ╚══════════════════════════════════════════════════════════════╝

const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

// ─── Post-Processing: Bloom ─────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,   // strength
  0.4,   // radius
  0.85   // threshold
);
composer.addPass(bloomPass);

// ─── Neon Lights in 3D Space ────────────────────────────────
// These glow through the bloom pass creating volumetric light effect
const neonPinkGeo = new THREE.SphereGeometry(0.3, 16, 16);
const neonPinkMat = new THREE.MeshBasicMaterial({ color: 0xff2d7b });
const neonPink = new THREE.Mesh(neonPinkGeo, neonPinkMat);
neonPink.position.set(-6, 3, -5);
scene.add(neonPink);

const neonBlueGeo = new THREE.SphereGeometry(0.25, 16, 16);
const neonBlueMat = new THREE.MeshBasicMaterial({ color: 0x00c8ff });
const neonBlue = new THREE.Mesh(neonBlueGeo, neonBlueMat);
neonBlue.position.set(6, -2, -5);
scene.add(neonBlue);

const neonGreenGeo = new THREE.SphereGeometry(0.15, 16, 16);
const neonGreenMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
const neonGreen = new THREE.Mesh(neonGreenGeo, neonGreenMat);
neonGreen.position.set(0, -5, -3);
scene.add(neonGreen);

// ─── Particle Field (Neon dust motes) ───────────────────────
const particlesCount = 1200;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const sizes = new Float32Array(particlesCount);

const neonColors = [
  new THREE.Color(0xff2d7b),
  new THREE.Color(0x00c8ff),
  new THREE.Color(0x39ff14),
  new THREE.Color(0xb24dff),
  new THREE.Color(0xffb000),
];

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

  const c = neonColors[Math.floor(Math.random() * neonColors.length)];
  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;

  sizes[i] = Math.random() * 0.08 + 0.02;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ─── Mouse Tracking for Parallax ────────────────────────────
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
document.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── Resize ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Render Loop ────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Camera responds to mouse (parallax depth)
  camera.position.x = mouse.x * 0.5;
  camera.position.y = -mouse.y * 0.3;
  camera.lookAt(0, 0, 0);

  // Particle drift
  particles.rotation.y = t * 0.02;
  particles.rotation.x = Math.sin(t * 0.08) * 0.05;

  // Neon light movement
  neonPink.position.x = -6 + Math.sin(t * 0.5) * 2;
  neonPink.position.y = 3 + Math.cos(t * 0.7) * 1.5;
  neonBlue.position.x = 6 + Math.cos(t * 0.4) * 2;
  neonBlue.position.y = -2 + Math.sin(t * 0.6) * 1.5;
  neonGreen.position.x = Math.sin(t * 0.3) * 3;

  // Pulsing bloom
  bloomPass.strength = 1.5 + Math.sin(t * 1.5) * 0.3;

  composer.render();
}
animate();

// ╔══════════════════════════════════════════════════════════════╗
// ║  3D MOUSE-REACTIVE CARDS                                     ║
// ║  Cards tilt in 3D based on cursor position                   ║
// ╚══════════════════════════════════════════════════════════════╝

document.querySelectorAll('.glass-card, .exp-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  });
});

// ╔══════════════════════════════════════════════════════════════╗
// ║  HERO PARALLAX DEPTH LAYERS                                  ║
// ║  Beer glass and background move at different rates            ║
// ╚══════════════════════════════════════════════════════════════╝

const heroGlass = document.querySelector('.hero-glass');
const heroText = document.querySelector('.hero-content');
const heroBg = document.querySelector('.hero-bg');

document.addEventListener('mousemove', (e) => {
  const mx = (e.clientX / window.innerWidth - 0.5);
  const my = (e.clientY / window.innerHeight - 0.5);

  if (heroGlass) {
    heroGlass.style.transform = `translateY(-50%) translate(${mx * 30}px, ${my * 20}px) rotateY(${mx * 5}deg) rotateX(${-my * 3}deg)`;
  }
  if (heroText) {
    heroText.style.transform = `translateY(-50%) translate(${mx * -15}px, ${my * -10}px)`;
  }
  if (heroBg) {
    heroBg.style.transform = `translate(${mx * -10}px, ${my * -8}px) scale(1.05)`;
  }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║  GSAP SCROLL ANIMATIONS                                      ║
// ╚══════════════════════════════════════════════════════════════╝

// 1. Sticky header
gsap.to('#main-header', {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(20px)',
  scrollTrigger: {
    trigger: '#hero',
    start: '10% top',
    end: '20% top',
    scrub: true,
  }
});

// 2. Hero glass parallax on scroll (moves up and back)
gsap.to('.hero-glass', {
  y: -150,
  scale: 0.8,
  opacity: 0.5,
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  }
});

// 3. Hero content parallax
gsap.to('.hero-content', {
  y: -100,
  opacity: 0,
  scrollTrigger: {
    trigger: '#hero',
    start: '30% top',
    end: '60% top',
    scrub: true,
  }
});

// 4. Scroll indicator hide
const scrollInd = document.querySelector('.scroll-indicator');
if (scrollInd) {
  ScrollTrigger.create({
    trigger: '#hero',
    start: '5% top',
    onEnter: () => gsap.to(scrollInd, { opacity: 0, duration: 0.5 }),
    onLeaveBack: () => gsap.to(scrollInd, { opacity: 1, duration: 0.5 }),
  });
}

// 5. Section headings and text reveals
gsap.utils.toArray('section h2, .section-subtitle, .about-text').forEach(el => {
  gsap.from(el, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
});

// 6. Experience cards staggered entrance
gsap.utils.toArray('.exp-card').forEach((card, i) => {
  gsap.from(card, {
    y: 60, opacity: 0, rotateX: 5,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
});

// 7. Glass cards staggered entrance
gsap.utils.toArray('.glass-card').forEach((card, i) => {
  gsap.from(card, {
    y: 50, opacity: 0, scale: 0.95,
    duration: 0.6,
    delay: i * 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
});

// 8. Gallery items fade up with stagger
gsap.utils.toArray('.gallery-item').forEach((item, i) => {
  gsap.from(item, {
    y: 40, opacity: 0, scale: 0.98,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    }
  });
});

// 9. Floating tooltips around the glass image
gsap.to('.tooltip-1', {
  y: -60, x: 30, opacity: 1,
  scrollTrigger: { trigger: '#hero', start: 'top top', end: '40% top', scrub: true }
});
gsap.to('.tooltip-2', {
  y: 20, x: -60, opacity: 1,
  scrollTrigger: { trigger: '#hero', start: '10% top', end: '50% top', scrub: true }
});
gsap.to('.tooltip-3', {
  y: 60, x: 40, opacity: 1,
  scrollTrigger: { trigger: '#hero', start: '20% top', end: '60% top', scrub: true }
});
