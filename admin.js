/* ============================================================
   THE SOFT MACHINE — Panel de publicación
   Publica artículos y edita páginas directo al repo de GitHub
   usando la API, desde el navegador, sin backend propio. El
   token nunca sale de tu navegador salvo hacia api.github.com.
   ============================================================ */

const OWNER  = 'jcamposcastro21-dot';
const REPO   = 'the-soft-machine';
const BRANCH = 'main';
const GH_API = 'https://api.github.com';

const TOKEN_KEY = 'tsm_admin_token';

const TAG_LABELS = {
  ensayo:  'ensayo',
  opinion: 'opinión',
  misc:    'miscelánea',
  foto:    'foto',
  video:   'video',
  links:   'links',
};

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_CORTOS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const TWITTER_WIDGET_TAG = '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';

/* ── Utilidades de texto ─────────────────────────────────── */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'articulo';
}

function sanitizeFilename(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot !== -1 ? name.slice(dot).toLowerCase() : '';
  const base = (dot !== -1 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (base || 'archivo') + ext;
}

function formatDateEs(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function formatShortEs(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MESES_CORTOS[m - 1]}`;
}

function toRssDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch (e) { return url; }
}

function extractYoutubeId(input) {
  const s = input.trim();
  let m = s.match(/[?&]v=([^&]+)/); if (m) return m[1];
  m = s.match(/youtu\.be\/([^?&]+)/); if (m) return m[1];
  m = s.match(/embed\/([^?&]+)/); if (m) return m[1];
  return s;
}

/* ── Mini-lenguaje del cuerpo del artículo ───────────────────
   Cada bloque (separado por línea en blanco) puede ser:
   - texto normal → se envuelve en <p>
   - HTML crudo (empieza con una etiqueta conocida) → se deja tal cual
   - un atajo [tipo: ...] → se expande a HTML
   ══════════════════════════════════════════════════════════ */

function expandShorthand(block, imageMap, state) {
  const m = block.match(/^\[(\w[\w-]*):\s*([\s\S]*)\]$/);
  if (!m) return null;
  const type = m[1].toLowerCase();
  const parts = m[2].split('|').map(p => p.trim());

  switch (type) {
    case 'img': {
      const [filename, caption] = parts;
      const src = imageMap[filename];
      if (!src) {
        throw new Error(`No se encontró la imagen subida "${filename}". Súbela en "Imágenes para este artículo" con ese mismo nombre de archivo.`);
      }
      return `        <figure class="media-block">\n          <img src="${src}" alt="${escapeHtml(caption || '')}">\n` +
        (caption ? `          <figcaption class="media-caption">${escapeHtml(caption)}</figcaption>\n` : '') +
        `        </figure>`;
    }
    case 'img-url': {
      const [url, caption] = parts;
      return `        <figure class="media-block">\n          <img src="${escapeHtml(url)}" alt="${escapeHtml(caption || '')}">\n` +
        (caption ? `          <figcaption class="media-caption">${escapeHtml(caption)}</figcaption>\n` : '') +
        `        </figure>`;
    }
    case 'tweet':
    case 'x': {
      const [url] = parts;
      state.needsTwitterWidget = true;
      return `        <blockquote class="twitter-tweet"><a href="${escapeHtml(url)}"></a></blockquote>`;
    }
    case 'youtube': {
      const [urlOrId, title] = parts;
      const id = extractYoutubeId(urlOrId);
      return `        <figure class="video-block">\n          <iframe src="https://www.youtube.com/embed/${escapeHtml(id)}" title="${escapeHtml(title || '')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n` +
        (title ? `          <figcaption class="video-caption">${escapeHtml(title)}</figcaption>\n` : '') +
        `        </figure>`;
    }
    case 'vimeo': {
      const [id, title] = parts;
      return `        <figure class="video-block">\n          <iframe src="https://player.vimeo.com/video/${escapeHtml(id)}" title="${escapeHtml(title || '')}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>\n` +
        (title ? `          <figcaption class="video-caption">${escapeHtml(title)}</figcaption>\n` : '') +
        `        </figure>`;
    }
    case 'link': {
      const [url, title, label] = parts;
      return `        <div class="link-block">\n          <div class="link-block-label">${escapeHtml(label || 'Lectura relacionada')}</div>\n` +
        `          <a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title || url)}</a>\n` +
        `          <div class="link-block-url">${escapeHtml(hostnameOf(url))}</div>\n` +
        `        </div>`;
    }
    case 'quote': {
      const [text, source] = parts;
      return `        <blockquote>\n          ${escapeHtml(text)}\n` +
        (source ? `          <cite>— ${escapeHtml(source)}</cite>\n` : '') +
        `        </blockquote>`;
    }
    default:
      return null; // tipo no reconocido: se trata como texto normal
  }
}

function renderBody(text, imageMap) {
  const state = { needsTwitterWidget: false };
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  const html = blocks.map(b => {
    const shorthand = expandShorthand(b, imageMap || {}, state);
    if (shorthand !== null) return shorthand;
    if (/^<(h2|h3|blockquote|figure|div|hr|ul|ol|p|script)[\s>]/i.test(b)) return '        ' + b;
    return `        <p>${b}</p>`;
  }).join('\n\n');

  return { html, needsTwitterWidget: state.needsTwitterWidget };
}

/* ── Codificación / archivos binarios ────────────────────── */

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      resolve(btoa(binary));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/* ── Cliente GitHub API ──────────────────────────────────── */

function ghHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

async function ghRequest(method, path, token, body) {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: ghHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* respuesta vacía */ }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

async function getFileContent(path, token) {
  const data = await ghRequest('GET', `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, token);
  return base64ToUtf8(data.content);
}

async function testConnection(token) {
  const data = await ghRequest('GET', `/repos/${OWNER}/${REPO}`, token);
  const canPush = data.permissions && data.permissions.push;
  if (!canPush) {
    throw new Error('El token es válido pero no tiene permiso de escritura sobre el repo. Revisa que tenga el scope "public_repo" (token clásico).');
  }
  return true;
}

/* ── Helpers para armar el set de cambios de un commit ───── */

function setText(changes, path, content) {
  changes[path] = { content, isBase64: false };
}

function setBinary(changes, path, base64) {
  changes[path] = { content: base64, isBase64: true };
}

async function commitFiles(token, changes, message, log) {
  log(`Creando ${Object.keys(changes).length} archivo(s)...`);
  const blobs = [];
  for (const [path, entry] of Object.entries(changes)) {
    const content = entry.isBase64 ? entry.content : utf8ToBase64(entry.content);
    const blob = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, token, {
      content, encoding: 'base64',
    });
    blobs.push({ path, sha: blob.sha, mode: '100644', type: 'blob' });
  }

  log('Preparando commit...');
  const ref = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, token);
  const latestCommitSha = ref.object.sha;
  const latestCommit = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`, token);

  const newTree = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, token, {
    base_tree: latestCommit.tree.sha,
    tree: blobs,
  });

  const newCommit = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, token, {
    message,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  log('Actualizando la rama main...');
  await ghRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, token, {
    sha: newCommit.sha,
  });
}

function withTwitterWidget(html, needsTwitterWidget) {
  if (!needsTwitterWidget || html.includes('platform.twitter.com/widgets.js')) return html;
  return html.replace('</body>', `${TWITTER_WIDGET_TAG}\n</body>`);
}

/* ── Constructores de contenido: artículos ───────────────── */

function buildArticleHtml({ title, tagClass, tagLabel, dateDisplay, readTime, bodyHtml, needsTwitterWidget }) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — The Soft Machine</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>

<div id="site-header"></div>

<div class="page-wrap">
  <div class="main-layout">
    <main class="content-area">

      <div class="article-header">
        <div class="article-eyebrow">
          <span class="tag ${tagClass}">${escapeHtml(tagLabel)}</span>
        </div>
        <h1 class="article-title">${escapeHtml(title)}</h1>
        <div class="article-meta">
          <span>${dateDisplay}</span>
          <span>Lectura: ~${escapeHtml(String(readTime))} minutos</span>
        </div>
      </div>

      <div class="article-body">

${bodyHtml}

      </div>

      <nav class="article-nav">
        <a class="prev" href="../index.html">Volver al inicio</a>
        <a class="next" href="../archivo.html">Ver todo el archivo</a>
      </nav>

    </main>

    <aside class="sidebar" id="site-sidebar"></aside>
  </div>
</div>

<div id="site-footer"></div>

<script src="../components.js"></script>
<script>
  initSite({
    page: 'archivo',
    breadcrumb: '<a href="../archivo.html">Archivo</a> &rsaquo; <strong>${escapeHtml(title)}</strong>'
  });
</script>
</body>
</html>
`;
  return withTwitterWidget(html, needsTwitterWidget);
}

function buildRow({ title, slug, excerpt, tagClass, tagLabel, dateISO }) {
  return `          <tr>
            <td>
              <a class="art-title" href="articulos/${slug}.html">${escapeHtml(title)}</a>
              <div class="art-excerpt">${escapeHtml(excerpt)}</div>
            </td>
            <td><span class="tag ${tagClass}">${escapeHtml(tagLabel)}</span></td>
            <td class="art-date">${dateISO}</td>
            <td class="art-reads">—</td>
          </tr>`;
}

function insertRowIntoTable(html, rowHtml) {
  html = html.replace(/\s*<tr>\s*<td colspan="4"[\s\S]*?<\/td>\s*<\/tr>\s*\n?/i, '\n');
  const marker = '<tbody>';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('No se encontró <tbody> en la tabla de artículos.');
  const insertAt = idx + marker.length;
  return html.slice(0, insertAt) + '\n\n' + rowHtml + '\n' + html.slice(insertAt);
}

function articleLink(slug) {
  return `https://${OWNER}.github.io/${REPO}/articulos/${slug}.html`;
}

function insertRssItem(xml, { title, slug, excerpt, tagClass, dateISO }) {
  const link = articleLink(slug);
  const item = `  <item>
    <title>${escapeHtml(title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${toRssDate(dateISO)}</pubDate>
    <description>${escapeHtml(excerpt)}</description>
    <category>${tagClass}</category>
  </item>

`;
  const idx = xml.indexOf('<item>\n    <title>');
  if (idx === -1) throw new Error('No se encontró <item> en feed.xml.');
  xml = xml.slice(0, idx) + item + xml.slice(idx);
  xml = xml.replace(/<lastBuildDate>.*?<\/lastBuildDate>/, `<lastBuildDate>${toRssDate(dateISO)}</lastBuildDate>`);
  return xml;
}

function insertAtomEntry(xml, { title, slug, excerpt, tagClass, dateISO }) {
  const link = articleLink(slug);
  const updated = `${dateISO}T00:00:00Z`;
  const entry = `  <entry>
    <title>${escapeHtml(title)}</title>
    <link href="${link}"/>
    <id>${link}</id>
    <updated>${updated}</updated>
    <summary>${escapeHtml(excerpt)}</summary>
    <category term="${tagClass}"/>
  </entry>

`;
  const idx = xml.indexOf('<entry>\n    <title>');
  if (idx === -1) throw new Error('No se encontró <entry> en atom.xml.');
  xml = xml.slice(0, idx) + entry + xml.slice(idx);
  xml = xml.replace(/<updated>.*?<\/updated>/, `<updated>${updated}</updated>`);
  return xml;
}

function insertJsonItem(jsonText, { title, slug, excerpt, tagClass, dateISO }) {
  const feed = JSON.parse(jsonText);
  feed.items.unshift({
    id: articleLink(slug),
    url: articleLink(slug),
    title,
    summary: excerpt,
    date_published: `${dateISO}T00:00:00Z`,
    tags: [tagClass],
  });
  return JSON.stringify(feed, null, 2) + '\n';
}

function insertSidebarRecent(js, { title, slug, tagLabel, dateISO }) {
  const marker = '<ul class="recent-list" id="sidebar-recents">';
  const idxStart = js.indexOf(marker);
  const idxEnd = js.indexOf('</ul>', idxStart);
  if (idxStart === -1 || idxEnd === -1) throw new Error('No se encontró la lista de "Recientes" en components.js.');

  const newLi = '<li><a href="${root}articulos/' + slug + '.html">' + escapeHtml(title) +
    '</a><div class="recent-meta">' + formatShortEs(dateISO) + ' · ' + tagLabel + '</div></li>';

  const existingBlock = js.slice(idxStart + marker.length, idxEnd);
  const existingItems = existingBlock.match(/<li>[\s\S]*?<\/li>/g) || [];
  const combined = [newLi, ...existingItems].slice(0, 4);

  const newBlock = '\n      ' + combined.join('\n      ') + '\n    ';
  return js.slice(0, idxStart + marker.length) + newBlock + js.slice(idxEnd);
}

/* ── Acción: publicar artículo ────────────────────────────── */

async function publishArticle(token, form, log) {
  const slug = slugify(form.title);
  const tagClass = form.tag;
  const tagLabel = TAG_LABELS[tagClass];
  log(`Slug generado: ${slug}`);

  const changes = {};
  const imageMap = {};

  if (form.imageFiles && form.imageFiles.length) {
    log(`Subiendo ${form.imageFiles.length} imagen(es)...`);
    for (const file of form.imageFiles) {
      const b64 = await fileToBase64(file);
      const finalName = `${slug}-${sanitizeFilename(file.name)}`;
      setBinary(changes, `media/${finalName}`, b64);
      imageMap[file.name] = `../media/${finalName}`;
    }
  }

  const { html: bodyHtml, needsTwitterWidget } = renderBody(form.body, imageMap);

  setText(changes, `articulos/${slug}.html`, buildArticleHtml({
    title: form.title,
    tagClass,
    tagLabel,
    dateDisplay: formatDateEs(form.date),
    readTime: form.readtime,
    bodyHtml,
    needsTwitterWidget,
  }));

  const rowInfo = { title: form.title, slug, excerpt: form.excerpt, tagClass, tagLabel, dateISO: form.date };
  const rowHtml = buildRow(rowInfo);

  log('Leyendo index.html...');
  setText(changes, 'index.html', insertRowIntoTable(await getFileContent('index.html', token), rowHtml));

  log('Leyendo archivo.html...');
  setText(changes, 'archivo.html', insertRowIntoTable(await getFileContent('archivo.html', token), rowHtml));

  if (tagClass === 'ensayo') {
    log('Leyendo ensayos.html...');
    setText(changes, 'ensayos.html', insertRowIntoTable(await getFileContent('ensayos.html', token), rowHtml));
  } else if (tagClass === 'opinion') {
    log('Leyendo opiniones.html...');
    setText(changes, 'opiniones.html', insertRowIntoTable(await getFileContent('opiniones.html', token), rowHtml));
  }

  log('Leyendo feed.xml, atom.xml, feed.json...');
  setText(changes, 'feed.xml', insertRssItem(await getFileContent('feed.xml', token), rowInfo));
  setText(changes, 'atom.xml', insertAtomEntry(await getFileContent('atom.xml', token), rowInfo));
  setText(changes, 'feed.json', insertJsonItem(await getFileContent('feed.json', token), rowInfo));

  log('Leyendo components.js (sidebar "Recientes")...');
  setText(changes, 'components.js', insertSidebarRecent(await getFileContent('components.js', token), rowInfo));

  await commitFiles(token, changes, `Publicar: ${form.title}`, log);
  return articleLink(slug);
}

/* ── Acción: editar "Acerca de" ──────────────────────────── */

const ACERCA_START = '<!-- ADMIN:ACERCA:START -->';
const ACERCA_END   = '<!-- ADMIN:ACERCA:END -->';

async function getAcercaCurrent(token, log) {
  log('Leyendo acerca.html...');
  const html = await getFileContent('acerca.html', token);
  const s = html.indexOf(ACERCA_START);
  const e = html.indexOf(ACERCA_END);
  if (s === -1 || e === -1) throw new Error('No se encontraron los marcadores en acerca.html.');
  return html.slice(s + ACERCA_START.length, e).trim();
}

async function updateAcercaDe(token, bodyText, log) {
  log('Leyendo acerca.html...');
  const html = await getFileContent('acerca.html', token);
  const s = html.indexOf(ACERCA_START);
  const e = html.indexOf(ACERCA_END);
  if (s === -1 || e === -1) throw new Error('No se encontraron los marcadores en acerca.html.');

  const { html: rendered, needsTwitterWidget } = renderBody(bodyText, {});
  let newHtml = html.slice(0, s + ACERCA_START.length) + '\n\n' + rendered + '\n\n        ' + html.slice(e);
  newHtml = withTwitterWidget(newHtml, needsTwitterWidget);

  const changes = {};
  setText(changes, 'acerca.html', newHtml);
  await commitFiles(token, changes, 'Actualizar página Acerca de', log);
}

/* ── Acción: agregar foto a la galería ───────────────────── */

async function addFoto(token, file, caption, log) {
  if (!file) throw new Error('Selecciona una imagen.');

  const changes = {};
  log('Subiendo imagen...');
  const b64 = await fileToBase64(file);
  const filename = `foto-${Date.now()}-${sanitizeFilename(file.name)}`;
  setBinary(changes, `media/${filename}`, b64);

  log('Leyendo fotos.html...');
  const html = await getFileContent('fotos.html', token);
  const marker = '<div class="photo-grid">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('No se encontró la galería en fotos.html.');

  const figure = `\n\n        <figure>\n          <img src="media/${filename}" alt="${escapeHtml(caption || '')}">\n          <figcaption>${escapeHtml(caption || '')}</figcaption>\n        </figure>\n`;
  const insertAt = idx + marker.length;
  setText(changes, 'fotos.html', html.slice(0, insertAt) + figure + html.slice(insertAt));

  await commitFiles(token, changes, `Agregar foto: ${caption || file.name}`, log);
}

/* ── Acción: agregar link ────────────────────────────────── */

async function addLink(token, { url, title, desc, date }, log) {
  log('Leyendo links.html...');
  const html = await getFileContent('links.html', token);
  const marker = '<ul class="links-list">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('No se encontró la lista en links.html.');

  const li = `\n\n        <li>\n          <a class="link-title" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title)}</a>\n` +
    `          <div class="link-desc">${escapeHtml(desc)}</div>\n` +
    `          <div class="link-domain">${escapeHtml(hostnameOf(url))} · ${date}</div>\n` +
    `        </li>\n`;
  const insertAt = idx + marker.length;

  const changes = {};
  setText(changes, 'links.html', html.slice(0, insertAt) + li + html.slice(insertAt));
  await commitFiles(token, changes, `Agregar link: ${title}`, log);
}

/* ── UI ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const logBox = $('status-log');

  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) $('f-token').value = savedToken;

  const today = new Date().toISOString().slice(0, 10);
  if ($('f-date')) $('f-date').value = today;
  if ($('f-link-date')) $('f-link-date').value = today;

  function log(msg, cls) {
    logBox.classList.add('visible');
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = msg;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function clearLog() {
    logBox.innerHTML = '';
    logBox.classList.remove('visible');
  }

  function getToken() {
    const token = $('f-token').value.trim();
    if ($('f-remember').checked) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    return token;
  }

  async function runAction(btn, fn) {
    clearLog();
    const token = getToken();
    if (!token) { log('Falta el token de GitHub.', 'status-err'); return; }
    btn.disabled = true;
    try {
      await fn(token);
    } catch (err) {
      log('Error: ' + err.message, 'status-err');
      log('No se publicó nada a medias: el commit solo se crea si todos los pasos anteriores funcionan.', 'status-err');
    } finally {
      btn.disabled = false;
    }
  }

  function resultLink(url, text) {
    const link = document.createElement('a');
    link.className = 'result-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = text;
    logBox.appendChild(link);
  }

  /* — Probar conexión — */
  $('btn-test').addEventListener('click', () => runAction($('btn-test'), async (token) => {
    log('Probando conexión con GitHub...');
    await testConnection(token);
    log('Conexión OK. El token tiene permiso de escritura sobre el repo.', 'status-ok');
  }));

  /* — Publicar artículo — */
  $('btn-publish').addEventListener('click', () => runAction($('btn-publish'), async (token) => {
    const form = {
      title: $('f-title').value.trim(),
      tag: $('f-tag').value,
      date: $('f-date').value,
      readtime: $('f-readtime').value || '5',
      excerpt: $('f-excerpt').value.trim(),
      body: $('f-body').value.trim(),
      imageFiles: $('f-images').files,
    };
    if (!form.title || !form.excerpt || !form.body || !form.date) {
      log('Completa al menos título, fecha, extracto y cuerpo del artículo.', 'status-err');
      return;
    }
    const url = await publishArticle(token, form, log);
    log('¡Publicado!', 'status-ok');
    resultLink(url, 'GitHub Pages tarda 1-2 min en reconstruir. Ver artículo →');
  }));

  /* — Acerca de — */
  $('btn-acerca-load').addEventListener('click', () => runAction($('btn-acerca-load'), async (token) => {
    const current = await getAcercaCurrent(token, log);
    $('f-acerca-current').value = current;
    log('Contenido actual cargado abajo (solo lectura, HTML tal como está en el sitio).', 'status-ok');
  }));

  $('btn-acerca-save').addEventListener('click', () => runAction($('btn-acerca-save'), async (token) => {
    const body = $('f-acerca-new').value.trim();
    if (!body) { log('Escribe el nuevo contenido primero.', 'status-err'); return; }
    await updateAcercaDe(token, body, log);
    log('¡Página "Acerca de" actualizada!', 'status-ok');
    resultLink(`https://${OWNER}.github.io/${REPO}/acerca.html`, 'Ver página →');
  }));

  /* — Fotos — */
  $('btn-foto-add').addEventListener('click', () => runAction($('btn-foto-add'), async (token) => {
    const file = $('f-foto-file').files[0];
    const caption = $('f-foto-caption').value.trim();
    await addFoto(token, file, caption, log);
    log('¡Foto agregada!', 'status-ok');
    resultLink(`https://${OWNER}.github.io/${REPO}/fotos.html`, 'Ver galería →');
  }));

  /* — Links — */
  $('btn-link-add').addEventListener('click', () => runAction($('btn-link-add'), async (token) => {
    const data = {
      url: $('f-link-url').value.trim(),
      title: $('f-link-title').value.trim(),
      desc: $('f-link-desc').value.trim(),
      date: $('f-link-date').value,
    };
    if (!data.url || !data.title || !data.desc) {
      log('Completa URL, título y descripción del link.', 'status-err');
      return;
    }
    await addLink(token, data, log);
    log('¡Link agregado!', 'status-ok');
    resultLink(`https://${OWNER}.github.io/${REPO}/links.html`, 'Ver página →');
  }));
});
