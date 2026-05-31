/* ================================================================
   NABLIK — script.js
   1. Starfield canvas animation (twinkling stars + cosmic dust)
   2. Hamburger menu toggle
   3. Scroll-triggered card reveal
   4. Footer year
   ================================================================ */

'use strict';

/* ── 1. STARFIELD ──────────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  let W, H, stars, nebulae;

  /* ── Resize handler ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildScene();
  }

  /* ── Create star + nebula data ── */
  function buildScene() {
    const COUNT = Math.floor((W * H) / 2800);

    /* Stars */
    stars = Array.from({ length: COUNT }, () => ({
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      Math.random() * 1.4 + 0.2,
      base:   Math.random() * 0.6 + 0.15,       // base opacity
      alpha:  0,
      speed:  Math.random() * 0.008 + 0.003,     // twinkle speed
      phase:  Math.random() * Math.PI * 2,        // twinkle offset
      /* Tiny drift (parallax feel) */
      driftX: (Math.random() - 0.5) * 0.015,
      driftY: (Math.random() - 0.5) * 0.008,
      /* Color tint: most white/blue, some warm amber */
      hue:    Math.random() < 0.15 ? 38 : 220,
      sat:    Math.random() < 0.15 ? 60 : 40,
    }));

    /* Nebula blobs — soft glowing regions */
    nebulae = [
      { x: W * 0.22, y: H * 0.18, r: W * 0.28, clr: '44,90,200', a: 0.045 },
      { x: W * 0.78, y: H * 0.65, r: W * 0.22, clr: '120,60,200', a: 0.035 },
      { x: W * 0.55, y: H * 0.42, r: W * 0.18, clr: '30,120,200', a: 0.028 },
    ];
  }

  /* ── Draw one frame ── */
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Nebulae (subtle coloured glows) */
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0,   `rgba(${n.clr},${n.a})`);
      g.addColorStop(0.5, `rgba(${n.clr},${n.a * 0.4})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Cosmic dust — tiny pixel scatter */
    if (t % 3 === 0) {                            // update every 3rd frame
      const dustCount = 40;
      for (let i = 0; i < dustCount; i++) {
        const dx = Math.random() * W;
        const dy = Math.random() * H;
        ctx.fillStyle = `rgba(150,180,255,${Math.random() * 0.025})`;
        ctx.beginPath();
        ctx.arc(dx, dy, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* Stars */
    stars.forEach(s => {
      /* Twinkle: sinusoidal opacity */
      s.alpha = s.base + Math.sin(t * s.speed + s.phase) * (s.base * 0.65);
      s.alpha = Math.max(0, Math.min(1, s.alpha));

      /* Slow drift */
      s.x = (s.x + s.driftX + W) % W;
      s.y = (s.y + s.driftY + H) % H;

      /* Draw star */
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},${s.sat}%,92%,${s.alpha})`;
      ctx.fill();

      /* Bright stars get a tiny cross-diffraction spike */
      if (s.r > 1.1 && s.alpha > 0.6) {
        const spike = s.r * 3.5;
        const sg = ctx.createLinearGradient(
          s.x - spike, s.y, s.x + spike, s.y
        );
        sg.addColorStop(0,   'rgba(180,210,255,0)');
        sg.addColorStop(0.5, `rgba(200,220,255,${s.alpha * 0.35})`);
        sg.addColorStop(1,   'rgba(180,210,255,0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(s.x - spike, s.y);
        ctx.lineTo(s.x + spike, s.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - spike);
        ctx.lineTo(s.x, s.y + spike);
        ctx.stroke();
      }
    });

    t++;
    requestAnimationFrame(draw);
  }

  /* Init */
  window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(resize, 150);
  });
  resize();
  draw();
})();


/* ── 2. HAMBURGER MENU ─────────────────────────────────────────── */
(function initMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const overlay   = document.getElementById('navOverlay');

  function openMenu() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    navMenu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';   // prevent scroll behind
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    navMenu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    navMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  /* Toggle on button click */
  hamburger.addEventListener('click', toggleMenu);

  /* Close on overlay click */
  overlay.addEventListener('click', closeMenu);

  /* Close on nav link click (smooth scroll + close) */
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  /* Close on Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) closeMenu();
  });
})();


/* ── 3. SCROLL REVEAL FOR CARDS ────────────────────────────────── */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.card');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach(card => observer.observe(card));
})();


/* ── 4. FOOTER YEAR ────────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ── 5. HEADER SCROLL EFFECT ───────────────────────────────────── */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    /* Add shadow when scrolled */
    if (y > 20) {
      header.style.background = 'rgba(3, 6, 15, 0.85)';
    } else {
      header.style.background = 'rgba(3, 6, 15, 0.55)';
    }

    lastY = y;
  }, { passive: true });
})();
