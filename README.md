# The Soft Machine — Instrucciones de edición

Sitio web estático. Sin servidor, sin base de datos, sin dependencias externas.
Abre los `.html` directamente en el navegador o súbelos a cualquier hosting.

Repo: https://github.com/jcamposcastro21-dot/the-soft-machine
Sitio en vivo: https://jcamposcastro21-dot.github.io/the-soft-machine/

---

## Cómo subir un artículo que ya escribiste (desde un .docx)

Este es el flujo pensado para cuando tengas tus artículos en Word en otro
computador:

1. Copia el `.docx` del artículo a la carpeta `articulos/` de este repo
   (o a cualquier carpeta local, y avísame la ruta).
2. Abre Claude Code en la carpeta del proyecto y pide algo como:
   > "Convierte `articulos/mi-articulo.docx` en un artículo del sitio y publícalo"
3. Claude:
   - Lee el `.docx` y arma el HTML del artículo a partir de
     `articulos/PLANTILLA.html` (título, fecha, tipo, párrafos, imágenes si
     las incluías).
   - Añade la fila correspondiente en `index.html`, `archivo.html` y en
     `ensayos.html`/`opiniones.html` según el tipo.
   - Añade la entrada nueva en `feed.xml`, `atom.xml` y `feed.json`.
   - Hace `git commit` y (si confirmas) `git push` — GitHub Pages
     republica el sitio solo, en 1–2 minutos.
4. Borra o archiva el `.docx` una vez publicado (no se sube al sitio, solo
   se usa como fuente).

Si prefieres hacerlo a mano en vez de pedírselo a Claude, sigue la sección
"Cómo publicar un artículo nuevo" más abajo.

---

## Publicar el sitio (GitHub Pages)

El repo ya está inicializado localmente. Para dejarlo en vivo:

1. Crea el repo vacío en GitHub: https://github.com/new
   - Nombre: `the-soft-machine`
   - Público (necesario para GitHub Pages gratis)
   - No agregues README/gitignore/license (ya existen en este proyecto)
2. Conecta y sube este repo local:
   ```
   git remote add origin https://github.com/jcamposcastro21-dot/the-soft-machine.git
   git branch -M main
   git push -u origin main
   ```
   (Te pedirá iniciar sesión en GitHub la primera vez — usa el navegador o un
   Personal Access Token si te lo pide como contraseña.)
3. En GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `/ (root)`**.
4. En 1–2 minutos el sitio queda en:
   `https://jcamposcastro21-dot.github.io/the-soft-machine/`

Cada `git push` a `main` después de esto vuelve a publicar el sitio
automáticamente.

### Cuando compres el dominio thesoftmachine.net

1. En tu proveedor de DNS, crea un registro `CNAME` apuntando
   `thesoftmachine.net` → `jcamposcastro21-dot.github.io`.
2. En GitHub: **Settings → Pages → Custom domain**, escribe
   `thesoftmachine.net` y guarda (esto crea un archivo `CNAME` en el repo).
3. Actualiza las URLs absolutas en `feed.xml`, `atom.xml` y `feed.json`
   (reemplaza `jcamposcastro21-dot.github.io/the-soft-machine` por
   `thesoftmachine.net`).

---

## Estructura de archivos

```
the-soft-machine/
├── index.html          ← Homepage (lista de artículos)
├── archivo.html        ← Archivo completo
├── ensayos.html        ← Solo ensayos
├── opiniones.html      ← Solo opiniones
├── fotos.html          ← Galería de fotos
├── links.html          ← Curaduría de links externos
├── acerca.html         ← Página "acerca de"
├── style.css           ← Todos los estilos (colores, fuentes, layout)
├── components.js       ← Header, sidebar y footer automáticos
├── media/              ← Pon aquí tus imágenes y videos locales
└── articulos/
    ├── PLANTILLA.html  ← Copia esto para cada artículo nuevo
    └── ejemplo.html    ← Artículo de ejemplo con todos los bloques
```

---

## Cómo publicar un artículo nuevo

1. **Copia** `articulos/PLANTILLA.html` y renómbrala, por ejemplo:
   ```
   articulos/mi-articulo.html
   ```

2. **Edita** los 7 puntos marcados con comentarios numerados dentro del archivo:
   - `<title>` en el `<head>`
   - Tipo de tag (ensayo / opinión / foto / video / links / misc)
   - Título `<h1>`
   - Fecha y tiempo de lectura
   - El texto del artículo
   - Links de navegación anterior/siguiente
   - Texto del breadcrumb en el `<script>` al final

3. **Añade una fila** en `index.html` y en `archivo.html` (y en `ensayos.html`
   u `opiniones.html` si corresponde):
   ```html
   <tr>
     <td>
       <a class="art-title" href="articulos/mi-articulo.html">Título del artículo</a>
       <div class="art-excerpt">Breve descripción.</div>
     </td>
     <td><span class="tag ensayo">ensayo</span></td>
     <td class="art-date">2025-MM-DD</td>
     <td class="art-reads">0</td>
   </tr>
   ```

---

## Bloques disponibles en un artículo

### Párrafo
```html
<p>Tu texto aquí.</p>
```

### Subtítulo de sección
```html
<h2>Nombre de la sección</h2>
```

### Cita
```html
<blockquote>
  Texto de la cita.
  <cite>— Autor, <em>Obra</em>, año</cite>
</blockquote>
```

### Imagen local
```html
<figure class="media-block">
  <img src="../media/tu-imagen.jpg" alt="descripción">
  <figcaption class="media-caption">Pie de foto.</figcaption>
</figure>
```

### Imagen externa (URL)
```html
<figure class="media-block">
  <img src="https://url-de-la-imagen.jpg" alt="descripción">
  <figcaption class="media-caption">Pie de foto.</figcaption>
</figure>
```

### Video de YouTube
```html
<figure class="video-block">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Título"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
  <figcaption class="video-caption">Descripción del video.</figcaption>
</figure>
```
> El VIDEO_ID es la parte después de `?v=` en la URL de YouTube.
> Ejemplo: `https://www.youtube.com/watch?v=oRkNaF0QvnI` → ID: `oRkNaF0QvnI`

### Video de Vimeo
```html
<figure class="video-block">
  <iframe
    src="https://player.vimeo.com/video/VIDEO_ID"
    title="Título"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen>
  </iframe>
  <figcaption class="video-caption">Descripción.</figcaption>
</figure>
```

### Video local (.mp4)
```html
<figure class="video-block">
  <video controls>
    <source src="../media/tu-video.mp4" type="video/mp4">
  </video>
  <figcaption class="video-caption">Descripción.</figcaption>
</figure>
```

### Link externo destacado
```html
<div class="link-block">
  <div class="link-block-label">Lectura relacionada</div>
  <a href="https://enlace.com" target="_blank" rel="noopener">
    Título del enlace
  </a>
  <div class="link-block-url">dominio.com</div>
</div>
```

### Separador horizontal
```html
<hr>
```

---

## Añadir una foto a la galería

Abre `fotos.html` y duplica un bloque `<figure>`:
```html
<figure>
  <img src="media/tu-foto.jpg" alt="descripción">
  <figcaption>Pie de foto, año</figcaption>
</figure>
```

## Añadir un link a la página de Links

Abre `links.html` y duplica un `<li>`:
```html
<li>
  <a class="link-title" href="https://enlace.com" target="_blank" rel="noopener">Título</a>
  <div class="link-desc">Por qué vale la pena.</div>
  <div class="link-domain">dominio.com · AAAA-MM-DD</div>
</li>
```

---

## Cambiar colores

Abre `style.css` y edita las variables en `:root`:

```css
:root {
  --azul:       #1A3A5C;   /* color principal, header */
  --azul-nav:   #2C5282;   /* navegación, sidebar headers */
  --rojo:       #8B1A1A;   /* acento, borde inferior del header */
  --crema:      #F5F3EE;   /* fondo del contenido */
  --gris-bg:    #E8E6E0;   /* fondo de página */
}
```

---

## Añadir páginas al menú

Abre `components.js` y edita el array `NAV_ITEMS`:

```javascript
const NAV_ITEMS = [
  { label: "Inicio",    href: "/index.html",    id: "inicio"   },
  { label: "Mi página", href: "/mipagina.html", id: "mipagina" },
  // ...
];
```

Luego, en tu nueva página, pasa el id correcto a `initSite`:
```javascript
initSite({ page: 'mipagina' });
```

---

## Hosting gratuito recomendado

- **Netlify**: arrastra la carpeta `the-soft-machine/` a netlify.com/drop
- **GitHub Pages**: sube el repo y activa Pages en Settings
- **Vercel**: conecta el repo y despliega automáticamente

---

*Generado con ayuda de Claude — thesoftmachine.net*
