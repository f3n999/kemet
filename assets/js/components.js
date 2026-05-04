/* =========================================================
   KEMET — components.js
   Composants partagés : header, footer, scripts communs.
   Évite la duplication du même HTML dans 13+ fichiers.

   Usage :
     <div id="kemet-header" data-active="index"></div>
     <div id="kemet-footer"></div>
     <script src="assets/js/components.js"></script>

   Pour les sous-dossiers (figures/, ebooks/) :
     <div id="kemet-header" data-active="pharaons" data-prefix="../"></div>
     <div id="kemet-footer" data-prefix="../"></div>
   ========================================================= */

(function () {
  'use strict';

  /* ── NAV ITEMS ── */
  const NAV_ITEMS = [
    { href: 'index.html',       label: 'Accueil',     id: 'index' },
    { href: 'histoire.html',    label: 'Récit',       id: 'histoire' },
    { href: 'chronologie.html', label: 'Chronologie', id: 'chronologie' },
    { href: 'pharaons.html',    label: 'Figures',     id: 'pharaons' },
    { href: 'theorie.html',     label: 'Théories',    id: 'theorie' },
    { href: 'ebooks.html',      label: 'Ebooks',      id: 'ebooks' },
    { href: 'contact.html',     label: 'Contact',     id: 'contact' },
  ];

  /* ── ADMIN NAV (simplified) ── */
  const ADMIN_NAV_ITEMS = [
    { href: 'index.html',     label: 'Accueil',   id: 'index' },
    { href: 'ebooks.html',    label: 'Ebooks',    id: 'ebooks' },
    { href: 'dashboard.html', label: 'Dashboard', id: 'dashboard' },
  ];

  /* ── HEADER ── */
  function renderHeader(container) {
    const prefix = container.dataset.prefix || '';
    const active = container.dataset.active || '';
    const variant = container.dataset.variant || 'default';
    const items = variant === 'admin' ? ADMIN_NAV_ITEMS : NAV_ITEMS;

    const navLinks = items.map(item => {
      const cls = item.id === active ? ' class="is-active"' : '';
      return `<li><a href="${prefix}${item.href}"${cls}>${item.label}</a></li>`;
    }).join('\n      ');

    container.outerHTML = `<header class="site-header">
  <nav class="container nav" aria-label="Navigation principale">
    <a href="${prefix}index.html" class="brand">
      <span class="brand-mark">𓋹</span>
      KEMET
    </a>
    <ul class="nav-links">
      ${navLinks}
      <li id="nav-auth-item"><a href="${prefix}login.html" class="nav-cta">Connexion</a></li>
    </ul>
    <button class="menu-toggle" aria-label="Menu" aria-expanded="false">☰</button>
  </nav>
</header>`;
  }

  /* ── FOOTER ── */
  function renderFooter(container) {
    const prefix = container.dataset.prefix || '';

    container.outerHTML = `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="brand" style="color: var(--gold-bright);">
          <span class="brand-mark" style="border-color: var(--gold-bright); color: var(--gold-bright);">𓋹</span>
          KEMET
        </div>
        <p style="margin-top:18px;">
          Le média de niche sur l'Égypte ancienne, pour lecteurs qui en savent déjà un peu
          et qui en veulent plus.
        </p>
      </div>
      <div>
        <h4>Lire</h4>
        <ul>
          <li><a href="${prefix}histoire.html">Récit long</a></li>
          <li><a href="${prefix}chronologie.html">Chronologie</a></li>
          <li><a href="${prefix}pharaons.html">Figures</a></li>
          <li><a href="${prefix}theorie.html">Théories</a></li>
        </ul>
      </div>
      <div>
        <h4>Bibliothèque</h4>
        <ul>
          <li><a href="${prefix}ebooks.html">Tous les ebooks</a></li>
          <li><a href="${prefix}commande.html">Ebook sur mesure</a></li>
          <li><a href="${prefix}dashboard.html">Mon compte</a></li>
        </ul>
      </div>
      <div>
        <h4>Le projet</h4>
        <ul>
          <li><a href="${prefix}contact.html">Contact</a></li>
          <li><a href="#">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Kemet. Tous droits réservés.</span>
      <span>Média indépendant. Sources citées à chaque article.</span>
    </div>
  </div>
</footer>`;
  }

  /* ── AUTO-INIT ── */
  function init() {
    const header = document.getElementById('kemet-header');
    const footer = document.getElementById('kemet-footer');
    if (header) renderHeader(header);
    if (footer) renderFooter(footer);
  }

  // Run immediately (script is loaded after the placeholder divs)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
