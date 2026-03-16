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

// Post-Processing: Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
);
composer.addPass(bloomPass);

// Neon Lights
const neonPink = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff2d7b }));
neonPink.position.set(-6, 3, -5);
scene.add(neonPink);

const neonBlue = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00c8ff }));
neonBlue.position.set(6, -2, -5);
scene.add(neonBlue);

const neonGreen = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0x39ff14 }));
neonGreen.position.set(0, -5, -3);
scene.add(neonGreen);

// Particles
const particlesCount = 1000;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const neonColors = [new THREE.Color(0xff2d7b), new THREE.Color(0x00c8ff), new THREE.Color(0x39ff14), new THREE.Color(0xb24dff)];

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  const c = neonColors[Math.floor(Math.random() * neonColors.length)];
  colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
  size: 0.05, vertexColors: true, transparent: true, opacity: 0.8,
  blending: THREE.AdditiveBlending, depthWrite: false,
}));
scene.add(particles);

// Mouse tracking
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
document.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;
  camera.position.x = mouse.x * 0.5;
  camera.position.y = -mouse.y * 0.3;
  camera.lookAt(0, 0, 0);
  particles.rotation.y = t * 0.02;
  neonPink.position.x = -6 + Math.sin(t * 0.5) * 2;
  neonPink.position.y = 3 + Math.cos(t * 0.7) * 1.5;
  neonBlue.position.x = 6 + Math.cos(t * 0.4) * 2;
  neonGreen.position.x = Math.sin(t * 0.3) * 3;
  bloomPass.strength = 1.5 + Math.sin(t * 1.5) * 0.3;
  composer.render();
}
animate();

// ╔══════════════════════════════════════════════════════════════╗
// ║  SCROLL-DRIVEN STORY ENGINE                                  ║
// ║  Drives the story beats, feature panels, and transitions     ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── 1. STORY BEATS: Crossfade text as user scrolls through hero ───
const beats = document.querySelectorAll('.story-beat');
const spacers = document.querySelectorAll('.story-spacer');

spacers.forEach((spacer, i) => {
  ScrollTrigger.create({
    trigger: spacer,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => activateBeat(i),
    onEnterBack: () => activateBeat(i),
  });
});

function activateBeat(index) {
  beats.forEach((beat, i) => {
    if (i === index) {
      beat.classList.add('active');
    } else {
      beat.classList.remove('active');
    }
  });
}

// ─── 2. HERO GLASS: Parallax on mouse + shrink on scroll ─────────
const heroGlass = document.querySelector('.hero-glass');

document.addEventListener('mousemove', (e) => {
  const mx = (e.clientX / window.innerWidth - 0.5);
  const my = (e.clientY / window.innerHeight - 0.5);
  if (heroGlass) {
    heroGlass.style.transform = `translateY(-50%) translate(${mx * 20}px, ${my * 15}px)`;
  }
});

// Glass fades and shrinks as you scroll past the hero
gsap.to('.hero-glass', {
  scale: 0.7, opacity: 0.3,
  scrollTrigger: {
    trigger: '#story-hero',
    start: '60% top',
    end: '90% top',
    scrub: true,
  }
});

// ─── 3. SCROLL INDICATOR: Hide after a bit of scrolling ──────────
const scrollInd = document.querySelector('.scroll-indicator');
if (scrollInd) {
  ScrollTrigger.create({
    trigger: '#story-hero',
    start: '3% top',
    onEnter: () => gsap.to(scrollInd, { opacity: 0, duration: 0.5 }),
    onLeaveBack: () => gsap.to(scrollInd, { opacity: 1, duration: 0.5 }),
  });
}

// ─── 4. STICKY HEADER: Darken on scroll ──────────────────────────
gsap.to('#main-header', {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(20px)',
  scrollTrigger: {
    trigger: '#story-hero',
    start: '10% top',
    end: '20% top',
    scrub: true,
  }
});

// ─── 5. FEATURE CHAPTERS: Text panels appear when in viewport ────
const featurePanels = document.querySelectorAll('.feature-text-panel');
featurePanels.forEach(panel => {
  ScrollTrigger.create({
    trigger: panel,
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => panel.classList.add('in-view'),
    onLeave: () => panel.classList.remove('in-view'),
    onEnterBack: () => panel.classList.add('in-view'),
    onLeaveBack: () => panel.classList.remove('in-view'),
  });
});

// ─── 6. INTERLUDE: Dramatic scale-up entrance ────────────────────
gsap.from('.interlude-text', {
  scale: 0.7, opacity: 0,
  duration: 1.2,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.interlude-section',
    start: 'top 60%',
    toggleActions: 'play none none reverse',
  }
});
gsap.from('.interlude-sub', {
  y: 30, opacity: 0,
  duration: 0.8,
  delay: 0.3,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.interlude-section',
    start: 'top 50%',
    toggleActions: 'play none none reverse',
  }
});

// ─── 7. STANDARD SECTION REVEALS ─────────────────────────────────
gsap.utils.toArray('section h2, .section-subtitle').forEach(el => {
  gsap.from(el, {
    y: 40, opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });
});

// ─── 8. GLASS CARD: 3D tilt on hover ────────────────────────────
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  });
});

// ─── 9. GLASS CARDS: Staggered entrance ──────────────────────────
gsap.utils.toArray('.glass-card').forEach((card, i) => {
  gsap.from(card, {
    y: 50, opacity: 0, scale: 0.95,
    duration: 0.6,
    delay: i * 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });
});

// ─── 10. GALLERY: Staggered fade-up ─────────────────────────────
gsap.utils.toArray('.gallery-item').forEach(item => {
  gsap.from(item, {
    y: 40, opacity: 0, scale: 0.98,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    }
  });
});
