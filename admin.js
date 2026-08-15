/* ============================================================
   THE SOFT MACHINE — Panel de publicación
   Publica artículos directo al repo de GitHub usando la API,
   desde el navegador, sin backend propio. El token nunca sale
   de tu navegador salvo hacia api.github.com.
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

/* ── Utilidades ─────────────────────────────────────────── */

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

function paragraphsToHtml(text) {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(b => {
    if (/^<(h2|h3|blockquote|figure|div|hr|ul|ol|p)[\s>]/i.test(b)) return '        ' + b;
    return `        <p>${b}</p>`;
  }).join('\n\n');
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
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
    throw new Error('El token es válido pero no tiene permiso de escritura sobre el repo. Revisa que el scope "Contents: Read and write" esté activado.');
  }
  return true;
}

/* ── Constructores de contenido ──────────────────────────── */

function buildArticleHtml({ title, tagClass, tagLabel, dateDisplay, readTime, bodyHtml, imageUrl, imageCaption }) {
  const imageBlock = imageUrl ? `

        <figure class="media-block">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageCaption || title)}">
${imageCaption ? `          <figcaption class="media-caption">${escapeHtml(imageCaption)}</figcaption>\n` : ''}        </figure>` : '';

  return `<!DOCTYPE html>
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

${bodyHtml}${imageBlock}

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
  // Si hay una fila de estado vacío ("Todavía no hay..."), la quitamos primero.
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
  const idx = xml.indexOf('<item>');
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
  const idx = xml.indexOf('<entry>');
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

/* ── Publicación (commit atómico vía Git Data API) ───────── */

async function publishArticle(token, form, log) {
  const slug = slugify(form.title);
  const tagClass = form.tag;
  const tagLabel = TAG_LABELS[tagClass];

  log(`Slug generado: ${slug}`);

  const changes = {};

  changes[`articulos/${slug}.html`] = buildArticleHtml({
    title: form.title,
    tagClass,
    tagLabel,
    dateDisplay: formatDateEs(form.date),
    readTime: form.readtime,
    bodyHtml: paragraphsToHtml(form.body),
    imageUrl: form.imageUrl,
    imageCaption: form.imageCaption,
  });

  const rowInfo = { title: form.title, slug, excerpt: form.excerpt, tagClass, tagLabel, dateISO: form.date };
  const rowHtml = buildRow(rowInfo);

  log('Leyendo index.html...');
  changes['index.html'] = insertRowIntoTable(await getFileContent('index.html', token), rowHtml);

  log('Leyendo archivo.html...');
  changes['archivo.html'] = insertRowIntoTable(await getFileContent('archivo.html', token), rowHtml);

  if (tagClass === 'ensayo') {
    log('Leyendo ensayos.html...');
    changes['ensayos.html'] = insertRowIntoTable(await getFileContent('ensayos.html', token), rowHtml);
  } else if (tagClass === 'opinion') {
    log('Leyendo opiniones.html...');
    changes['opiniones.html'] = insertRowIntoTable(await getFileContent('opiniones.html', token), rowHtml);
  }

  log('Leyendo feed.xml, atom.xml, feed.json...');
  changes['feed.xml']  = insertRssItem(await getFileContent('feed.xml', token), rowInfo);
  changes['atom.xml']  = insertAtomEntry(await getFileContent('atom.xml', token), rowInfo);
  changes['feed.json'] = insertJsonItem(await getFileContent('feed.json', token), rowInfo);

  log('Leyendo components.js (sidebar "Recientes")...');
  changes['components.js'] = insertSidebarRecent(await getFileContent('components.js', token), rowInfo);

  log(`Creando ${Object.keys(changes).length} archivos/blobs...`);
  const blobs = [];
  for (const [path, content] of Object.entries(changes)) {
    const blob = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, token, {
      content: utf8ToBase64(content),
      encoding: 'base64',
    });
    blobs.push({ path, sha: blob.sha, mode: '100644', type: 'blob' });
  }

  log('Preparando commit...');
  const ref = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, token);
  const latestCommitSha = ref.object.sha;
  const latestCommit = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`, token);
  const baseTreeSha = latestCommit.tree.sha;

  const newTree = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, token, {
    base_tree: baseTreeSha,
    tree: blobs,
  });

  const newCommit = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, token, {
    message: `Publicar: ${form.title}`,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  log('Actualizando la rama main...');
  await ghRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, token, {
    sha: newCommit.sha,
  });

  return articleLink(slug);
}

/* ── UI ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const logBox = $('status-log');
  const publishBtn = $('btn-publish');
  const testBtn = $('btn-test');

  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) $('f-token').value = savedToken;

  const today = new Date().toISOString().slice(0, 10);
  $('f-date').value = today;

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

  testBtn.addEventListener('click', async () => {
    clearLog();
    const token = getToken();
    if (!token) { log('Falta el token.', 'status-err'); return; }
    testBtn.disabled = true;
    try {
      log('Probando conexión con GitHub...');
      await testConnection(token);
      log('Conexión OK. El token tiene permiso de escritura sobre el repo.', 'status-ok');
    } catch (err) {
      log(err.message, 'status-err');
    } finally {
      testBtn.disabled = false;
    }
  });

  publishBtn.addEventListener('click', async () => {
    clearLog();

    const form = {
      title: $('f-title').value.trim(),
      tag: $('f-tag').value,
      date: $('f-date').value,
      readtime: $('f-readtime').value || '5',
      excerpt: $('f-excerpt').value.trim(),
      body: $('f-body').value.trim(),
      imageUrl: $('f-img').value.trim(),
      imageCaption: $('f-img-caption').value.trim(),
    };
    const token = getToken();

    if (!token) { log('Falta el token de GitHub.', 'status-err'); return; }
    if (!form.title || !form.excerpt || !form.body || !form.date) {
      log('Completa al menos título, fecha, extracto y cuerpo del artículo.', 'status-err');
      return;
    }

    publishBtn.disabled = true;
    try {
      const url = await publishArticle(token, form, log);
      log('¡Publicado!', 'status-ok');
      const link = document.createElement('a');
      link.className = 'result-link';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'GitHub Pages tarda 1-2 min en reconstruir. Ver artículo →';
      logBox.appendChild(link);
    } catch (err) {
      log('Error: ' + err.message, 'status-err');
      log('No se publicó nada a medias: el commit solo se crea si todos los pasos anteriores funcionan.', 'status-err');
    } finally {
      publishBtn.disabled = false;
    }
  });
});
