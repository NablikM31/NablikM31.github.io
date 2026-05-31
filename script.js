/* =============================================
   NABLIK — script.js
   Lógica principal del sitio
   ============================================= */

/* =============================================
   1. CANVAS STARFIELD
   ============================================= */
(function initStarfield() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], nebulae = [];

  /**
   * Redimensiona el canvas usando window.innerWidth/innerHeight.
   * El canvas tiene position: fixed; width: 100vw; height: 100vh en CSS,
   * por lo que no necesitamos scrollHeight. Esto evita recalcular
   * miles de estrellas cuando el contenido de la página crece.
   */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function initParticles() {
    stars   = [];
    nebulae = [];

    // Densidad basada sólo en el viewport visible
    const count = Math.floor((W * H) / 3000);

    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     randomBetween(0.2, 2.2),
        alpha: randomBetween(0.3, 1),
        speed: randomBetween(0.0003, 0.002),
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.85
          ? `hsl(${randomBetween(200, 260)},80%,90%)`
          : '#fff'
      });
    }

    const NEBULA_COUNT = 6;
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        rx:    randomBetween(120, 350),
        ry:    randomBetween(80, 220),
        hue:   randomBetween(200, 280),
        alpha: randomBetween(0.03, 0.09),
        speed: randomBetween(0.00008, 0.0002),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  let tick = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // — Nebulosas —
    for (const nb of nebulae) {
      const a   = nb.alpha + 0.02 * Math.sin(tick * nb.speed * 60 + nb.phase);
      const grd = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.rx);
      grd.addColorStop(0,   `hsla(${nb.hue},70%,60%,${a})`);
      grd.addColorStop(0.5, `hsla(${nb.hue + 20},60%,40%,${a * 0.4})`);
      grd.addColorStop(1,   `hsla(${nb.hue},50%,20%,0)`);

      ctx.save();
      ctx.scale(1, nb.ry / nb.rx);
      ctx.beginPath();
      ctx.arc(nb.x, nb.y * (nb.rx / nb.ry), nb.rx, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    // — Estrellas —
    for (const s of stars) {
      const alpha = s.alpha * (0.7 + 0.3 * Math.sin(tick * s.speed * 100 + s.phase));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle    = s.color;
      ctx.globalAlpha  = alpha;
      ctx.fill();
      ctx.globalAlpha  = 1;

      // Halo para estrellas brillantes
      if (s.r > 1.5) {
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.3})`);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }

    tick++;
    requestAnimationFrame(draw);
  }

  // Debounce en resize para no recalcular partículas en cada píxel del drag
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 150);
  });

  resize();
  initParticles();
  draw();
})();


/* =============================================
   2. MENÚ HAMBURGUESA
   ============================================= */
(function initHamburgerMenu() {
  const hamburger  = document.getElementById('hamburger');
  const navMenu    = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  if (!hamburger || !navMenu || !navOverlay) return;

  function openMenu() {
    navMenu.classList.add('open');
    hamburger.classList.add('active');
    navOverlay.classList.add('visible');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
    navOverlay.classList.remove('visible');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Cierra al pulsar el overlay
  navOverlay.addEventListener('click', closeMenu);

  // Cierra al pulsar cualquier enlace del menú marcado con data-close-menu
  document.querySelectorAll('[data-close-menu]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();


/* =============================================
   3. REVEAL ON SCROLL (Intersection Observer)
   ============================================= */
(function initRevealObserver() {
  const targets = document.querySelectorAll('.reveal, .card-section');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Una vez visible no necesitamos seguir observando
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


/* =============================================
   4. EFECTO NAVBAR AL HACER SCROLL
   ============================================= */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Llamada inicial por si la página carga scrolleada
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
