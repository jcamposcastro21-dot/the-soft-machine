# The Soft Machine — Instrucciones de edición

Sitio web estático. Sin servidor, sin base de datos, sin dependencias externas.
Abre los `.html` en cualquier navegador o súbelos a cualquier hosting.

---

## Estructura de archivos

```
the-soft-machine/
├── index.html          ← Homepage (lista de artículos)
├── archivo.html        ← Archivo completo
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

1. **Copia** `articulos/PLANTILLA.html` y renómbrala:
   ```
   articulos/mi-articulo.html
   ```

2. **Edita** los 7 puntos marcados con comentarios numerados:
   - `<title>` en el `<head>`
   - Tipo de tag (ensayo / opinión / foto / video / links / misc)
   - Título `<h1>`
   - Fecha y tiempo de lectura
   - El texto del artículo
   - Links de navegación anterior/siguiente
   - Texto del breadcrumb en el `<script>` al final

3. **Añade la fila** en `index.html` y en `archivo.html`:
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

Luego en tu nueva página, pasa el id correcto a `initSite`:
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
