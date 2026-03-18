/* ═══════════════════════════════════════════════════════════════
   REBOOT THE PUB — Mobile JS Enhancements
   Add this block INSIDE main.js (or paste before </body>)
   ═══════════════════════════════════════════════════════════════ */

// ─── 1. HAMBURGER MENU TOGGLE ─────────────────────────────────
(function initMobileNav() {
  const header = document.getElementById('main-header');
  const nav    = header.querySelector('nav');
  if (!nav) return;

  // Inject hamburger button into header (before nav)
  const burger = document.createElement('button');
  burger.className = 'hamburger';
  burger.setAttribute('aria-label', 'Toggle navigation');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = `<span></span><span></span><span></span>`;
  header.insertBefore(burger, nav);

  // Close menu helper
  function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('mobile-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Toggle on hamburger click
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('mobile-open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when resizing back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
})();


// ─── 2. DISABLE FEATURE-CHAPTER GSAP PINNING ON MOBILE ───────
//  (feature-text-panel must stay visible, not fade in/out on mobile)
(function patchMobileScrollTrigger() {
  if (typeof ScrollTrigger === 'undefined') return;

  const isMobile = () => window.innerWidth <= 768;

  // Re-run on resize
  window.addEventListener('resize', () => {
    if (isMobile()) {
      document.querySelectorAll('.feature-text-panel').forEach(panel => {
        panel.classList.add('in-view');
      });
    }
  });

  // On load
  if (isMobile()) {
    document.querySelectorAll('.feature-text-panel').forEach(panel => {
      panel.classList.add('in-view');
    });
  }
})();


// ─── 3. MOBILE STORY HERO — shorten pinned scroll height ──────
(function adjustHeroHeight() {
  const hero = document.getElementById('story-hero');
  if (!hero) return;

  function setHeight() {
    hero.style.height = window.innerWidth <= 768 ? '280vh' : '400vh';
  }

  setHeight();
  window.addEventListener('resize', setHeight);
})();


// ─── 4. PREVENT iOS DOUBLE-TAP ZOOM ON BUTTONS ───────────────
document.querySelectorAll('button, .btn-primary').forEach(el => {
  el.addEventListener('touchend', e => e.preventDefault(), { passive: false });
});
