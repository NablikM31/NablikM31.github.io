/* ============================================================
   NABLIK — script.js
   Toggle del menú hamburguesa en móvil
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const toggle   = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Cerrar el menú al hacer clic en un enlace (navegación en móvil)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
});
