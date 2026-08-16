/* ============================================================
   THE SOFT MACHINE — Listados de escritos
   Lee data/articulos.json y renderiza las tablas de Inicio,
   Archivo, y las páginas de categoría/etiqueta. Depende de
   rootPath() definido en components.js (cárgalo primero).
   ============================================================ */

const CATEGORY_LABELS = {
  ensayo:   'ensayo',
  articulo: 'artículo',
  opinion:  'opinión',
  cuento:   'cuento',
  misc:     'miscelánea',
};

function escapeHtmlListing(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadArticulos() {
  const root = rootPath();
  const res = await fetch(root + 'data/articulos.json');
  if (!res.ok) throw new Error('No se pudo cargar data/articulos.json (' + res.status + ')');
  const data = await res.json();
  return (data.articulos || []).filter(a => a.published !== false);
}

function sortByDateDesc(list) {
  return list.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function articuloRowHtml(root, a) {
  const label = CATEGORY_LABELS[a.category] || a.category;
  const tagsHtml = (a.tags && a.tags.length)
    ? `<div class="art-tags">${a.tags.map(t =>
        `<a class="tag-chip" href="${root}tag.html?t=${encodeURIComponent(t)}">${escapeHtmlListing(t)}</a>`
      ).join('')}</div>`
    : '';
  return `          <tr>
            <td>
              <a class="art-title" href="${root}articulos/${a.slug}.html">${escapeHtmlListing(a.title)}</a>
              <div class="art-excerpt">${escapeHtmlListing(a.excerpt)}</div>
              ${tagsHtml}
            </td>
            <td><span class="tag ${a.category}">${escapeHtmlListing(label)}</span></td>
            <td class="art-date">${a.date}</td>
            <td class="art-reads">—</td>
          </tr>`;
}

function emptyRowHtml(message) {
  return `          <tr>
            <td colspan="4" style="text-align:center; color:#888; padding:24px 0;">${escapeHtmlListing(message)}</td>
          </tr>`;
}

/* filterFn recibe un artículo y devuelve true/false. limit es opcional. */
async function renderListing(tbodyId, filterFn, emptyMessage, limit) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const root = rootPath();
  try {
    let list = sortByDateDesc(await loadArticulos()).filter(filterFn);
    if (limit) list = list.slice(0, limit);
    tbody.innerHTML = list.length
      ? list.map(a => articuloRowHtml(root, a)).join('\n\n')
      : emptyRowHtml(emptyMessage);
  } catch (err) {
    tbody.innerHTML = emptyRowHtml('No se pudo cargar el listado de escritos.');
  }
}
