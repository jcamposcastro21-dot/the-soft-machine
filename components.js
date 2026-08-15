/* ============================================================
   THE SOFT MACHINE — Componentes compartidos
   Header, navegación, sidebar y footer se generan automáticamente
   desde este archivo. Así cambias algo una vez y se actualiza
   en todas las páginas.

   Para cambiar el nombre del sitio, edita SITE_NAME.
   Para añadir páginas al menú, edita NAV_ITEMS.
   ============================================================ */

const SITE_NAME     = "The Soft Machine";
const SITE_SUBTITLE = "Artículos · Ensayos · Opiniones · Miscelánea";
const SITE_TAGLINE  = "Archivo personal de escritura. Sin algoritmo. Sin newsletter.";

/* Añade o quita items aquí: { label, href, id }
   El href es siempre relativo a la RAÍZ del sitio (empieza con /).
   El id debe coincidir con el "page" que le pasas a initSite(). */
const NAV_ITEMS = [
  { label: "Inicio",    href: "/index.html",     id: "inicio"    },
  { label: "Archivo",   href: "/archivo.html",   id: "archivo"   },
  { label: "Ensayos",   href: "/ensayos.html",   id: "ensayos"   },
  { label: "Opiniones", href: "/opiniones.html", id: "opiniones" },
  { label: "Fotos",     href: "/fotos.html",     id: "fotos"     },
  { label: "Links",     href: "/links.html",     id: "links"     },
  { label: "Acerca de", href: "/acerca.html",    id: "acerca"    },
];

/* ── Detecta cuántos niveles hay que subir para llegar a la raíz ──
   Funciona sirviendo el sitio desde la raíz de un dominio propio,
   desde un subdirectorio de proyecto (ej. GitHub Pages:
   usuario.github.io/the-soft-machine/), o abriendo los archivos
   directamente (file://).                                       */
function rootDepth() {
  let path = location.pathname;
  // normaliza separadores y quita el nombre del archivo si lo hay
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return 0;
  const last = parts[parts.length - 1];
  const hasFile = last.includes('.html') || last.includes('.htm');
  const dirParts = hasFile ? parts.slice(0, -1) : parts;

  // Si el sitio cuelga bajo una carpeta "the-soft-machine" (subdirectorio
  // de proyecto o archivo local), cuenta la profundidad desde ahí.
  const idx = dirParts.lastIndexOf('the-soft-machine');
  if (idx !== -1) return dirParts.length - idx - 1;

  if (location.protocol === 'file:') return 0;

  // Dominio propio servido desde la raíz (ej. thesoftmachine.net/...)
  return dirParts.length;
}

function rootPath() {
  const depth = rootDepth();
  return depth <= 0 ? './' : '../'.repeat(depth);
}

/* ── Reloj en tiempo real ────────────────────────────────── */
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
    if (dateEl) dateEl.textContent = days[now.getDay()] + ' ' + d + '.' + mo + '.' + y;
    if (timeEl) timeEl.textContent = h + ':' + min + ':' + s;
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Contador de visitas (localStorage, solo estético) ──────
   Sube +1 real por sesión de navegador, no por refresh.      */
function updateCounter() {
  const el = document.getElementById('visit-counter');
  if (!el) return;
  const KEY = 'tsm_visits';
  const SESSION_KEY = 'tsm_session_counted';
  let count = parseInt(localStorage.getItem(KEY) || '1', 10);
  if (!sessionStorage.getItem(SESSION_KEY)) {
    count += 1;
    localStorage.setItem(KEY, String(count));
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  el.textContent = String(count).padStart(6, '0');
}

/* ── Inyecta el header ───────────────────────────────────── */
function renderHeader(activePage, breadcrumbExtra) {
  const root = rootPath();
  const navHTML = NAV_ITEMS.map(item => {
    const active = item.id === activePage ? ' class="active"' : '';
    const href   = root + item.href.replace(/^\//, '');
    return `<li${active}><a href="${href}">${item.label}</a></li>`;
  }).join('');

  const activeLabel = (NAV_ITEMS.find(i => i.id === activePage) || {}).label || 'Inicio';
  const bcBase = `<a href="${root}index.html">thesoftmachine.net</a>`;
  const bc     = breadcrumbExtra
    ? `${bcBase} &rsaquo; ${breadcrumbExtra}`
    : `${bcBase} &rsaquo; <strong>${activeLabel}</strong>`;

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
      Portal v2.5 — ES
    </div>
  </div>
</header>
<nav class="corp-nav" aria-label="Navegación principal"><ul>${navHTML}</ul></nav>
<div class="breadcrumb">${bc}</div>`;

  const target = document.getElementById('site-header');
  if (target) target.innerHTML = html;
  startClock();
}

/* ── Inyecta el sidebar ──────────────────────────────────── */
function renderSidebar() {
  const root = rootPath();
  const html = `
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[i]</span> Visitas totales</div>
  <div class="sidebar-module-body">
    <div class="counter-box" id="visit-counter">000001</div>
    <div class="counter-label">desde el lanzamiento</div>
  </div>
</div>
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[+]</span> Categorías</div>
  <div class="sidebar-module-body">
    <ul class="cat-list">
      <li><a href="${root}ensayos.html">Ensayos</a><span class="cat-count">1</span></li>
      <li><a href="${root}opiniones.html">Opiniones</a><span class="cat-count">0</span></li>
      <li><a href="${root}fotos.html">Fotografía</a><span class="cat-count">0</span></li>
      <li><a href="${root}links.html">Links</a><span class="cat-count">3</span></li>
    </ul>
  </div>
</div>
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[*]</span> Recientes</div>
  <div class="sidebar-module-body">
    <ul class="recent-list" id="sidebar-recents">
      <li><a href="${root}articulos/mas-alla-de-la-coincidencia-vinculos-debates-y-controversias.html">Más allá de la coincidencia: vínculos, debates y controversias sobre disforia de género, autismo y autoginefilia</a><div class="recent-meta">15 ago · ensayo</div></li>
      <li><a href="${root}articulos/ejemplo.html">La máquina que aprendió a quejarse</a><div class="recent-meta">12 jun · ensayo</div></li>
    </ul>
  </div>
</div>
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[?]</span> Acerca de</div>
  <div class="sidebar-module-body">
    <div class="about-box">
      <strong>${SITE_NAME}</strong> es un archivo personal de escritura.<br><br>
      ${SITE_TAGLINE}
    </div>
  </div>
</div>
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[~]</span> Sindicación</div>
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

/* ── Inyecta el footer ───────────────────────────────────── */
function renderFooter() {
  const root = rootPath();
  const year = new Date().getFullYear();
  const html = `
<footer class="corp-footer">
  <span>© ${year} ${SITE_NAME} — Todos los derechos reservados</span>
  <span><a href="${root}index.html">thesoftmachine.net</a> &nbsp;|&nbsp; <a href="${root}acerca.html">Contacto</a> &nbsp;|&nbsp; <a href="${root}archivo.html">Mapa del sitio</a></span>
  <span>Generado en 0.042s · HTML estático</span>
</footer>`;

  const target = document.getElementById('site-footer');
  if (target) target.innerHTML = html;
}

/* ── Init: llama todo junto ──────────────────────────────── */
function initSite(opts) {
  opts = opts || {};
  renderHeader(opts.page, opts.breadcrumb);
  renderSidebar();
  renderFooter();
}
