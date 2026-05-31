/* ═══════════════════════════════════════════════════════════════
   NABLIK — script.js
   Funcionalidades:
     1. Canvas cósmico (estrellas animadas + polvo cósmico)
     2. Menú hamburguesa
     3. Header al hacer scroll
     4. Animación de entrada de tarjetas (IntersectionObserver)
     5. Footer: año dinámico
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   UTILIDADES
──────────────────────────────────────────── */

/** Genera un número aleatorio entre min y max */
const rand  = (min, max) => Math.random() * (max - min) + min;

/** Genera un entero aleatorio entre min y max (inclusive) */
const randI = (min, max) => Math.floor(rand(min, max + 1));


/* ════════════════════════════════════════════
   1. CANVAS CÓSMICO
   ── Tres capas:
      A) Estrellas estáticas que titilan (CSS-like vía alpha)
      B) Estrellas con movimiento de paralaje muy lento
      C) Partículas de polvo cósmico flotando
════════════════════════════════════════════ */

(function initCosmos() {
  const canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let animId;

  // ─── Configuración ───
  const CONFIG = {
    starCount:       280,
    dustCount:       90,
    nebulaCount:     4,
    starColors: [
      'rgba(255,255,255,',
      'rgba(200,180,255,',  // violeta (acento)
      'rgba(180,220,255,',  // azul frío
      'rgba(255,240,210,',  // amarillo cálido
    ],
  };

  // ─── Estrellas ───
  class Star {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x      = rand(0, 1);
      this.y      = rand(0, 1);
      this.size   = rand(0.3, 2.2);
      this.alpha  = rand(0.2, 1.0);
      this.phase  = rand(0, Math.PI * 2);       // fase inicial de parpadeo
      this.speed  = rand(0.003, 0.018);          // velocidad de parpadeo
      this.vx     = rand(-0.00003, 0.00003);     // movimiento sutil X
      this.vy     = rand(-0.00002, 0.00002);     // movimiento sutil Y
      this.color  = CONFIG.starColors[randI(0, CONFIG.starColors.length - 1)];
    }
    update(dt) {
      this.phase += this.speed * dt * 0.06;
      this.x     += this.vx * dt;
      this.y     += this.vy * dt;
      // Wraparound
      if (this.x < 0) this.x = 1;
      if (this.x > 1) this.x = 0;
      if (this.y < 0) this.y = 1;
      if (this.y > 1) this.y = 0;
    }
    draw() {
      // Parpadeo suave: oscilación senoidal del alpha
      const flicker = (Math.sin(this.phase) * 0.35 + 0.65);
      const a       = Math.max(0.05, this.alpha * flicker);

      ctx.beginPath();
      ctx.arc(this.x * W, this.y * H, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();

      // Halo suave para estrellas más grandes
      if (this.size > 1.2) {
        const grad = ctx.createRadialGradient(
          this.x * W, this.y * H, 0,
          this.x * W, this.y * H, this.size * 4
        );
        grad.addColorStop(0,   this.color + (a * 0.4) + ')');
        grad.addColorStop(1,   this.color + '0)');
        ctx.beginPath();
        ctx.arc(this.x * W, this.y * H, this.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
  }

  // ─── Partículas de polvo cósmico ───
  class Dust {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x     = rand(0, 1);
      this.y     = init ? rand(0, 1) : rand(-0.05, 0.05); // reaparecer en bordes
      this.size  = rand(0.5, 2.5);
      this.alpha = rand(0.02, 0.12);
      this.vx    = rand(-0.00012, 0.00012);
      this.vy    = rand( 0.00008, 0.00025);  // deriva lenta hacia abajo
      this.phase = rand(0, Math.PI * 2);
      this.freq  = rand(0.002, 0.006);
    }
    update(dt) {
      this.phase += this.freq * dt * 0.06;
      this.x     += this.vx * dt;
      this.y     += this.vy * dt;
      if (this.y > 1.05) this.reset();
      if (this.x < -0.02 || this.x > 1.02) this.x = Math.random();
    }
    draw() {
      const flicker = (Math.sin(this.phase) * 0.5 + 0.5);
      const a       = this.alpha * flicker;
      ctx.beginPath();
      ctx.arc(this.x * W, this.y * H, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,180,255,${a})`;
      ctx.fill();
    }
  }

  // ─── Nebulosas difusas (manchas de color) ───
  class Nebula {
    constructor() {
      this.x     = rand(0.1, 0.9);
      this.y     = rand(0.1, 0.9);
      this.rX    = rand(0.15, 0.35) * (window.innerWidth  || 1200);
      this.rY    = rand(0.10, 0.25) * (window.innerHeight || 800);
      this.angle = rand(0, Math.PI);
      this.alpha = rand(0.02, 0.07);
      this.phase = rand(0, Math.PI * 2);
      this.freq  = rand(0.0005, 0.002);
      // Colores: mezcla azul / violeta
      const colors = [
        [80,  60, 160],
        [40,  60, 120],
        [100, 60, 180],
        [40,  80, 140],
      ];
      this.rgb = colors[randI(0, colors.length - 1)];
    }
    update(dt) {
      this.phase += this.freq * dt * 0.06;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x * W, this.y * H);
      ctx.rotate(this.angle);

      const flicker = (Math.sin(this.phase) * 0.3 + 0.7);
      const a       = this.alpha * flicker;
      const [r,g,b] = this.rgb;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.rX);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.4})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.scale(1, this.rY / this.rX);
      ctx.beginPath();
      ctx.arc(0, 0, this.rX, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  // ─── Crear entidades ───
  const stars   = Array.from({ length: CONFIG.starCount   }, () => new Star());
  const dust    = Array.from({ length: CONFIG.dustCount    }, () => new Dust());
  const nebulas = Array.from({ length: CONFIG.nebulaCount  }, () => new Nebula());

  // ─── Redimensionar canvas ───
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ─── Bucle de animación ───
  let lastTime = 0;
  function draw(time = 0) {
    const dt = Math.min(time - lastTime, 100); // cap a 100ms para evitar saltos
    lastTime = time;

    // Fondo: gradiente de universo profundo
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#04040d');
    bg.addColorStop(0.4, '#060614');
    bg.addColorStop(1,   '#080820');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Nebulosas (capa base, más difusa)
    nebulas.forEach(n => { n.update(dt); n.draw(); });

    // Polvo cósmico
    dust.forEach(d => { d.update(dt); d.draw(); });

    // Estrellas
    stars.forEach(s => { s.update(dt); s.draw(); });

    animId = requestAnimationFrame(draw);
  }

  // ─── Init ───
  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();

  // Limpiar al desmontar (por si hubiera SPA real)
  window._nablik_cleanupCosmos = () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
})();


/* ════════════════════════════════════════════
   2. MENÚ HAMBURGUESA
════════════════════════════════════════════ */

(function initHamburger() {
  const btn     = document.getElementById('hamburger-btn');
  const menu    = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');
  const navLinks = menu.querySelectorAll('.nav-link');

  if (!btn || !menu || !overlay) return;

  let isOpen = false;

  /** Abre el menú */
  function openMenu() {
    isOpen = true;
    btn.classList.add('is-active');
    menu.classList.add('is-open');
    overlay.classList.add('is-active');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden'; // prevenir scroll de fondo
  }

  /** Cierra el menú */
  function closeMenu() {
    isOpen = false;
    btn.classList.remove('is-active');
    menu.classList.remove('is-open');
    overlay.classList.remove('is-active');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  /** Toggle */
  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  // Eventos
  btn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Cerrar al hacer click en un enlace del menú
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
})();


/* ════════════════════════════════════════════
   3. HEADER — FONDO AL SCROLL
════════════════════════════════════════════ */

(function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const THRESHOLD = 60; // píxeles hasta activar

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Verificar estado inicial
})();


/* ════════════════════════════════════════════
   4. ANIMACIÓN DE ENTRADA — IntersectionObserver
   Las tarjetas aparecen al entrar al viewport
════════════════════════════════════════════ */

(function initCardAnimations() {
  const cards = document.querySelectorAll('.card-inner');
  if (!cards.length || !('IntersectionObserver' in window)) {
    // Fallback: mostrar todo si no hay soporte
    cards.forEach(c => c.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Solo una vez
        }
      });
    },
    {
      root:       null,
      rootMargin: '0px 0px -80px 0px',
      threshold:  0.12,
    }
  );

  cards.forEach(card => observer.observe(card));
})();


/* ════════════════════════════════════════════
   5. FOOTER — AÑO DINÁMICO
════════════════════════════════════════════ */

(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();


/* ════════════════════════════════════════════
   6. ENLACES DE NAVEGACIÓN — Scroll suave mejorado
   (por si el navegador no soporta scroll-behavior: smooth)
════════════════════════════════════════════ */

(function initSmoothScroll() {
  const supportsNativeSmooth = 'scrollBehavior' in document.documentElement.style;
  if (supportsNativeSmooth) return; // El CSS ya lo maneja

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
