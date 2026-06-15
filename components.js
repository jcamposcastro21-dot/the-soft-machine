/* ============================================================
   THE SOFT MACHINE — Componentes + SPA-lite (FIX FINAL)
   ============================================================ */

const SITE_NAME     = "The Soft Machine";
const SITE_SUBTITLE = "Artículos · Ensayos · Opiniones · Miscelánea";
const SITE_TAGLINE  = "Archivo personal de escritura. Sin algoritmo. Sin newsletter.";

/* ── BASE PATH ───────────────────────────────────────── */
function getBase() {
  return '/the-soft-machine/';
}

/* ── NAV ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Inicio",    href: "index.html",       id: "inicio"    },
  { label: "Archivo",   href: "archivo.html",     id: "archivo"   },
  { label: "Ensayos",   href: "ensayos.html",     id: "ensayos"   },
  { label: "Artículos", href: "articulos.html",   id: "articulos" },
  { label: "Opiniones", href: "opiniones.html",   id: "opiniones" },
  { label: "Miscelánea",href: "miscelaneos.html", id: "miscelaneos"},
  { label: "Acerca de", href: "acerca.html",      id: "acerca"    },
];

/* ── ROUTER: resolver ruta ───────────────────────────── */
function resolveRoute() {
  const redirect = sessionStorage.getItem("redirect");

  if (redirect) {
    sessionStorage.removeItem("redirect");
    return redirect.replace(getBase(), '').replace(/^\/+/, '');
  }

  return location.pathname
    .replace(getBase(), '')
    .replace(/^\/+/, '') || 'index.html';
}

/* ── ROUTER: cargar página ───────────────────────────── */
async function loadPage(path) {
  const base = getBase();
  const cleanPath = (path || 'index.html').replace(/^\/+/, '');

  try {
    const res = await fetch(base + cleanPath);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const content = doc.querySelector('#main-content');

    if (!content) {
      document.querySelector('#app').innerHTML = "<h1>⚠️ Falta #main-content</h1>";
      return;
    }

    document.querySelector('#app').innerHTML = content.innerHTML;

    /* 🔥 RE-RENDER COMPLETO */
    renderHeader();
    renderSidebar();
    renderFooter();

    startClock();
    updateCounter();

  } catch (err) {
    document.querySelector('#app').innerHTML = "<h1>Contenido no encontrado</h1>";
    console.error(err);
  }
}

/* ── SPA navegación ─────────────────────────────────── */
function enableSPA() {
  document.body.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;

    if (a.target === "_blank") return;

    let href = a.getAttribute('href');

    if (!href || href.startsWith('http') || href.startsWith('#')) return;

    e.preventDefault();

    href = href.replace(/^\/+/, '');

    history.pushState({}, '', getBase() + href);
    loadPage(href);
  });

  window.addEventListener('popstate', () => {
    loadPage(resolveRoute());
  });
}

/* ── Detectar página actual ─────────────────────────── */
function getCurrentPage() {
  let path = location.pathname
    .replace(getBase(), '')
    .replace(/^\/+/, '')
    .toLowerCase();

  return path || 'index.html';
}

/* ── Reloj ─────────────────────────────────────────── */
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

/* ── Contador ─────────────────────────────────────── */
function updateCounter() {
  const el = document.getElementById('visit-counter');
  if (!el) return;

  let count = parseInt(localStorage.getItem('tsm_visits') || '48291');
  count += Math.floor(Math.random() * 3);

  localStorage.setItem('tsm_visits', count);
  el.textContent = String(count).padStart(6,'0');
}

/* ── Header ───────────────────────────────────────── */
function renderHeader(breadcrumbExtra) {
  const base = getBase();
  const current = getCurrentPage();

  const navHTML = NAV_ITEMS.map(item => {
    const isActive = current === item.href.toLowerCase();
    const active = isActive ? ' class="active"' : '';

    return `<li${active}><a href="${item.href}">${item.label}</a></li>`;
  }).join('');

  const bcBase = `<a href="${base}index.html">thesoftmachine.net</a>`;

  const currentItem = NAV_ITEMS.find(i => i.href.toLowerCase() === current);
  const currentLabel = currentItem ? currentItem.label : 'Inicio';

  const bc = breadcrumbExtra
    ? `${bcBase} &rsaquo; ${breadcrumbExtra}`
    : `${bcBase} &rsaquo; <strong>${currentLabel}</strong>`;

  const html = `
<header class="corp-header">
  <div class="corp-header-inner">
    <div>
      <div class="site-title"><a href="index.html">${SITE_NAME}</a></div>
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
}

/* ── Sidebar ─────────────────────────────────────── */
function renderSidebar() {
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
      <li><a href="ensayos.html">Ensayos</a></li>
      <li><a href="articulos.html">Artículos</a></li>
      <li><a href="opiniones.html">Opiniones</a></li>
      <li><a href="miscelaneos.html">Miscelánea</a></li>
    </ul>
  </div>
</div>
`;

  const el = document.getElementById('site-sidebar');
  if (el) {
    el.innerHTML = html;
    updateCounter();
  }
}

/* ── Footer ───────────────────────────────────────── */
function renderFooter() {
  const html = `
<footer class="corp-footer">
  <span>© ${SITE_NAME} — Todos los derechos reservados</span>
  <span>
    <a href="index.html">thesoftmachine.net</a> |
    <a href="acerca.html">Contacto</a> |
    <a href="archivo.html">Mapa del sitio</a>
  </span>
  <span>HTML estático · SPA-lite</span>
</footer>`;

  document.getElementById('site-footer').innerHTML = html;
}

/* ── INIT ─────────────────────────────────────────── */
function initSite(opts = {}) {
  renderHeader(opts.breadcrumb);
  renderSidebar();
  renderFooter();

  enableSPA();
  loadPage(resolveRoute());
}
