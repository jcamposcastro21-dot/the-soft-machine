/* ============================================================
THE SOFT MACHINE — SPA-lite (FIX DEFINITIVO)
============================================================ */

const SITE_NAME     = "The Soft Machine";
const SITE_SUBTITLE = "Artículos · Ensayos · Opiniones · Miscelánea";

/* ── BASE ───────────────────────────────────────── */
function getBase() {
return "/the-soft-machine";
}

/* ── NAV ───────────────────────────────────────── */
const NAV_ITEMS = [
{ label: "Inicio",    href: "index.html" },
{ label: "Archivo",   href: "archivo.html" },
{ label: "Ensayos",   href: "ensayos.html" },
{ label: "Artículos", href: "articulos.html" },
{ label: "Opiniones", href: "opiniones.html" },
{ label: "Miscelánea",href: "miscelaneos.html" },
{ label: "Acerca de", href: "acerca.html" },
];

/* ── ROUTE CLEAN ───────────────────────────────── */
function cleanPath(path) {
return path
.replace(getBase(), "")
.replace(/^/+/, "") || "index.html";
}

/* ── LOAD PAGE ───────────────────────────────── */
async function loadPage(path) {
const base = getBase();
const clean = cleanPath(path);

try {
const res = await fetch(base + "/" + clean);
const html = await res.text();

```
const doc = new DOMParser().parseFromString(html, "text/html");
const content = doc.querySelector("#main-content");

document.querySelector("#app").innerHTML =
  content ? content.innerHTML : "<h1>⚠️ Falta #main-content</h1>";

updateCounter();
startClock();
```

} catch (err) {
document.querySelector("#app").innerHTML = "<h1>404</h1>";
console.error(err);
}
}

/* ── SPA NAV ───────────────────────────────── */
function enableSPA() {
document.addEventListener("click", e => {
const link = e.target.closest("a");
if (!link) return;

```
const href = link.getAttribute("href");

if (!href || href.startsWith("http") || href.startsWith("#")) return;

e.preventDefault();

const clean = cleanPath(href);

// 🔥 CLAVE: NO usar base aquí
history.pushState({}, "", clean);

loadPage(clean);
```

});

window.addEventListener("popstate", () => {
loadPage(location.pathname);
});
}

/* ── HEADER ───────────────────────────────── */
function renderHeader() {
const navHTML = NAV_ITEMS.map(i =>
`<li><a href="${i.href}">${i.label}</a></li>`
).join("");

document.getElementById("site-header").innerHTML = `

<header class="corp-header">
  <div class="corp-header-inner">
    <div>
      <div class="site-title"><a href="index.html">${SITE_NAME}</a></div>
      <div class="site-subtitle">${SITE_SUBTITLE}</div>
    </div>
    <div class="header-meta">
      <strong id="hdr-date">—</strong><br>
      <span id="hdr-time">00:00:00</span>
    </div>
  </div>
</header>

<nav class="corp-nav">
  <ul>${navHTML}</ul>
</nav>
`;
}

/* ── SIDEBAR ───────────────────────────────── */
function renderSidebar() {
const el = document.getElementById("site-sidebar");
if (!el) return;

el.innerHTML = `

<div id="visit-counter">000000</div>
`;
}

/* ── FOOTER ───────────────────────────────── */
function renderFooter() {
document.getElementById("site-footer").innerHTML = `

<footer class="corp-footer">
  © ${SITE_NAME}
</footer>
`;
}

/* ── CLOCK ───────────────────────────────── */
function startClock() {
const el = document.getElementById("hdr-time");
if (!el) return;

setInterval(() => {
const d = new Date();
el.textContent = d.toLocaleTimeString();
}, 1000);
}

/* ── COUNTER ───────────────────────────────── */
function updateCounter() {
const el = document.getElementById("visit-counter");
if (!el) return;

let n = parseInt(localStorage.getItem("visits") || "1000");
n++;
localStorage.setItem("visits", n);
el.textContent = n;
}

/* ── INIT ───────────────────────────────── */
function initSite() {
renderHeader();
renderSidebar();
renderFooter();

enableSPA();

loadPage(location.pathname);
}

