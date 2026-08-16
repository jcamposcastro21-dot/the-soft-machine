/* ============================================================
   THE SOFT MACHINE — Componentes compartidos
   Header, navegación, sidebar y footer se generan automáticamente
   desde este archivo. Así cambias algo una vez y se actualiza
   en todas las páginas.

   Para cambiar el nombre del sitio, edita SITE_NAME.
   Para añadir páginas al menú, edita NAV_ITEMS.
   ============================================================ */

const SITE_NAME     = "The Soft Machine";
const SITE_SUBTITLE = "Ensayos · Artículos · Opiniones · Cuentos · Miscelánea";
const SITE_TAGLINE  = "Archivo personal de escritura. Sin algoritmo. Sin newsletter.";

const CATEGORY_PAGES = [
  { category: 'ensayo',   label: 'Ensayos',    href: 'ensayos.html'    },
  { category: 'articulo', label: 'Artículos',   href: 'articulos.html' },
  { category: 'opinion',  label: 'Opiniones',   href: 'opiniones.html' },
  { category: 'cuento',   label: 'Cuentos',     href: 'cuentos.html'   },
  { category: 'misc',     label: 'Miscelánea',  href: 'miscelanea.html'},
];

/* Añade o quita items aquí: { label, href, id }
   El href es siempre relativo a la RAÍZ del sitio (empieza con /).
   El id debe coincidir con el "page" que le pasas a initSite(). */
const NAV_ITEMS = [
  { label: "Inicio",     href: "/index.html",      id: "inicio"     },
  { label: "Archivo",    href: "/archivo.html",    id: "archivo"    },
  { label: "Ensayos",    href: "/ensayos.html",    id: "ensayos"    },
  { label: "Artículos",  href: "/articulos.html",  id: "articulos"  },
  { label: "Opiniones",  href: "/opiniones.html",  id: "opiniones"  },
  { label: "Cuentos",    href: "/cuentos.html",    id: "cuentos"    },
  { label: "Miscelánea", href: "/miscelanea.html", id: "miscelanea" },
  { label: "Fotos",      href: "/fotos.html",      id: "fotos"      },
  { label: "Links",      href: "/links.html",      id: "links"      },
  { label: "Acerca de",  href: "/acerca.html",     id: "acerca"     },
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
function escapeHtmlSidebar(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSidebar() {
  const root = rootPath();
  const html = `
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[+]</span> Categorías</div>
  <div class="sidebar-module-body">
    <ul class="cat-list" id="sidebar-categories">
      <li>Cargando…</li>
    </ul>
  </div>
</div>
<div class="sidebar-module">
  <div class="sidebar-module-header"><span class="icon">[*]</span> Recientes</div>
  <div class="sidebar-module-body">
    <ul class="recent-list" id="sidebar-recents">
      <li>Cargando…</li>
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
    loadSidebarDynamic(root);
  }
}

/* Carga data/articulos.json y llena Categorías + Recientes con datos
   reales. Si falla (ej. abriendo el sitio con file:// donde fetch()
   de JSON local queda bloqueado por CORS), se muestra un aviso en
   vez de números inventados. */
async function loadSidebarDynamic(root) {
  const catList = document.getElementById('sidebar-categories');
  const recentList = document.getElementById('sidebar-recents');
  try {
    const res = await fetch(root + 'data/articulos.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const articulos = (data.articulos || []).filter(a => a.published !== false);

    if (catList) {
      catList.innerHTML = CATEGORY_PAGES.map(c => {
        const count = articulos.filter(a => a.category === c.category).length;
        return `<li><a href="${root}${c.href}">${c.label}</a><span class="cat-count">${count}</span></li>`;
      }).join('');
    }

    if (recentList) {
      const recent = articulos.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 4);
      recentList.innerHTML = recent.length
        ? recent.map(a => {
            const d = new Date(a.date + 'T00:00:00Z');
            const dias = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const corta = String(d.getUTCDate()).padStart(2,'0') + ' ' + dias[d.getUTCMonth()];
            return `<li><a href="${root}articulos/${a.slug}.html">${escapeHtmlSidebar(a.title)}</a><div class="recent-meta">${corta} · ${escapeHtmlSidebar(a.category)}</div></li>`;
          }).join('')
        : '<li>Sin publicaciones todavía.</li>';
    }
  } catch (err) {
    if (catList) catList.innerHTML = '<li>No disponible</li>';
    if (recentList) recentList.innerHTML = '<li>No disponible</li>';
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
