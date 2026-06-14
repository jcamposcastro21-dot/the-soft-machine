/* ============================================================
   THE SOFT MACHINE — Componentes compartidos (FIX FINAL NAV)
   ============================================================ */

const SITE_NAME     = "The Soft Machine";
const SITE_SUBTITLE = "Artículos · Ensayos · Opiniones · Miscelánea";
const SITE_TAGLINE  = "Archivo personal de escritura. Sin algoritmo. Sin newsletter.";

/* 🔴 SIN "/" AL INICIO */
const NAV_ITEMS = [
  { label: "Inicio",    href: "index.html",       id: "inicio"    },
  { label: "Archivo",   href: "archivo.html",     id: "archivo"   },
  { label: "Ensayos",   href: "ensayos.html",     id: "ensayos"   },
  { label: "Artículos", href: "articulos.html",   id: "articulos" },
  { label: "Opiniones", href: "opiniones.html",   id: "opiniones" },
  { label: "Miscelánea",href: "miscelaneos.html", id: "miscelaneos"},
  { label: "Acerca de", href: "acerca.html",      id: "acerca"    },
];

/* ── ROOT PATH (SOLUCIÓN REAL) ─────────────────────────── */
function rootPath() {
  const path = location.pathname;
  const segments = path.split('/').filter(Boolean);

  // Si estás dentro de subcarpeta (ej: /articulos/ejemplo.html)
  if (segments.length > 1) {
    return '../';
  }

  // Si estás en raíz
  return './';
}

/* ── Detectar página actual ───────────────────────────── */
function getCurrentPage() {
  let path = location.pathname.toLowerCase();

  if (path.includes('/articulos/')) return 'articulos.html';
  if (path.includes('/ensayos/')) return 'ensayos.html';
  if (path.includes('/opiniones/')) return 'opiniones.html';
  if (path.includes('/miscelaneos/')) return 'miscelaneos.html';

  path = path.split('/').pop();
  return path || 'index.html';
}

/* ── Reloj ───────────────────────────────────────────── */
function startClock() {
  const days = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

  function tick() {
    const now  = new Date();
    const d    = String(now.getDate()).padStart(2,'0');
    const mo   = String(now.getMonth()+1).padStart(2,'0');
    const y    = now.getFullYear();
    const h    = String(now.getHours()).padStart(2,'0');
    const min  = String(now.getMinutes()).padStart(2,'0');
    const s    = String(now.getSeconds()).padStart(2,'0');

    const dateEl = document.getElementById('hdr-date');
    const timeEl = document.getElementById('hdr-time');

    if (dateEl) dateEl.textContent = `${days[now.getDay()]} ${d}.${mo}.${y}`;
    if (timeEl) timeEl.textContent = `${h}:${min}:${s}`;
  }

  tick();
  setInterval(tick, 1000);
}

/* ── Contador ────────────────────────────────────────── */
function updateCounter() {
  const el = document.getElementById('visit-counter');
  if (!el) return;

  let count = parseInt(localStorage.getItem('tsm_visits') || '48291');
  count += Math.floor(Math.random() * 3);

  localStorage.setItem('tsm_visits', count);
  el.textContent = String(count).padStart(6,'0');
}

/* ── Header ─────────────────────────────────────────── */
function renderHeader(breadcrumbExtra) {
  const root = rootPath();
  const current = getCurrentPage();

  const navHTML = NAV_ITEMS.map(item => {
    const isActive = current === item.href.toLowerCase();
    const active = isActive ? ' class="active"' : '';
    const href   = root + item.href;

    return `<li${active}><a href="${href}">${item.label}</a></li>`;
  }).join('');

  const bcBase = `<a href="${root}index.html">thesoftmachine.net</a>`;

  const currentItem = NAV_ITEMS.find(i => i.href.toLowerCase() === current);
  const currentLabel = currentItem ? currentItem.label : 'Inicio';

  const bc = breadcrumbExtra
    ? `${bcBase} &rsaquo; ${breadcrumbExtra}`
    : `${bcBase} &rsaquo; <strong>${currentLabel}</strong>`;

  const html = `
<header class="corp-header">
  <div class="corp-header-inner">
    <div>
      <div class="site-title"><a href="${root}index.html">${SITE_NAME}</a></div>
      <div class="site-subtitle">${SITE_SUBTITLE}</div>
    </div>
    <div class="header-meta">
      <strong id="hdr-date">—</strong><br>
      <span id="hdr-time">00:00:00</span><br>
      Portal v2.4 — ES
    </div>
  </div>
</header>

<nav class="corp-nav">
  <ul>${navHTML}</ul>
</nav>

<div class="breadcrumb">${bc}</div>`;

  document.getElementById('site-header').innerHTML = html;
  startClock();
}

/* ── Sidebar ─────────────────────────────────────────── */
function renderSidebar() {
  const root = rootPath();

  const html = `
<div class="sidebar-module">
  <div class="sidebar-module-header">👁 Visitas totales</div>
  <div class="sidebar-module-body">
    <div class="counter-box" id="visit-counter">048291</div>
    <div class="counter-label">desde enero 2024</div>
  </div>
</div>

<div class="sidebar-module">
  <div class="sidebar-module-header">📁 Categorías</div>
  <div class="sidebar-module-body">
    <ul class="cat-list">
      <li><a href="${root}ensayos.html">Ensayos</a><span class="cat-count">14</span></li>
      <li><a href="${root}articulos.html">Artículos</a><span class="cat-count">9</span></li>
      <li><a href="${root}opiniones.html">Opiniones</a><span class="cat-count">23</span></li>
      <li><a href="${root}miscelaneos.html">Miscelánea</a><span class="cat-count">5</span></li>
    </ul>
  </div>
</div>

<div class="sidebar-module">
  <div class="sidebar-module-header">🕐 Recientes</div>
  <div class="sidebar-module-body">
    <ul class="recent-list">
      <li><a href="${root}articulos/ejemplo.html">La máquina que aprendió a quejarse</a><div class="recent-meta">12 jun · ensayo</div></li>
      <li><a href="#">El problema no es la IA</a><div class="recent-meta">05 jun · opinión</div></li>
      <li><a href="#">Burroughs nunca tuvo newsletter</a><div class="recent-meta">28 may · ensayo</div></li>
    </ul>
  </div>
</div>

<div class="sidebar-module">
  <div class="sidebar-module-header">ℹ Acerca de</div>
  <div class="sidebar-module-body">
    <div class="about-box">
      <strong>${SITE_NAME}</strong> es un archivo personal de escritura.<br><br>
      ${SITE_TAGLINE}
    </div>
  </div>
</div>

<div class="sidebar-module">
  <div class="sidebar-module-header">📡 Sindicación</div>
  <div class="sidebar-module-body">
    <div class="syndication-links">
      <a href="${root}feed.xml">[ RSS 2.0 ]</a><br>
      <a href="${root}atom.xml">[ Atom ]</a><br>
      <a href="${root}feed.json">[ JSON Feed ]</a>
    </div>
  </div>
</div>`;

  const el = document.getElementById('site-sidebar');
  if (el) {
    el.innerHTML = html;
    updateCounter();
  }
}

/* ── Footer ─────────────────────────────────────────── */
function renderFooter() {
  const root = rootPath();

  const html = `
<footer class="corp-footer">
  <span>© ${SITE_NAME} — Todos los derechos reservados</span>
  <span>
    <a href="${root}index.html">thesoftmachine.net</a> |
    <a href="${root}acerca.html">Contacto</a> |
    <a href="${root}archivo.html">Mapa del sitio</a>
  </span>
  <span>Generado en 0.042s · HTML estático</span>
</footer>`;

  document.getElementById('site-footer').innerHTML = html;
}

/* ── Init ───────────────────────────────────────────── */
function initSite(opts = {}) {
  renderHeader(opts.breadcrumb);
  renderSidebar();
  renderFooter();
}
