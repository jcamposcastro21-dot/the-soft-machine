# The Soft Machine — Instrucciones de edición

Sitio web estático (HTML + CSS + JS, sin build step, sin servidor propio).
Los listados de escritos (Inicio, Archivo, categorías, etiquetas) se arman
en el navegador a partir de `data/articulos.json`. Las páginas de cada
escrito son HTML normal.

Repo: https://github.com/jcamposcastro21-dot/the-soft-machine
Sitio en vivo: https://jcamposcastro21-dot.github.io/the-soft-machine/

⚠️ Por el paso anterior (listados vía `fetch()` de un JSON), **abrir los
`.html` directamente con doble clic (`file://`) ya no muestra los listados**
— la mayoría de los navegadores bloquean `fetch()` de archivos locales por
CORS. Para probar el sitio completo localmente hace falta un servidor
estático simple (ej. `npx serve` o la extensión Live Server); si no,
publícalo y pruébalo en la URL de GitHub Pages. Los artículos individuales
(`articulos/*.html`) sí se ven bien abiertos directo, porque no dependen del
JSON.

---

## Panel de webmaster — `/admin.html`

`https://jcamposcastro21-dot.github.io/the-soft-machine/admin.html`

Corre en tu navegador y publica directo al repo de GitHub vía su API — sin
pasar por mí ni por una terminal. Es "privado" en el sentido de que nadie
puede publicar/editar/borrar sin tu token; la página en sí no tiene link
en el menú, pero no hay nada sensible en ella si alguien la encuentra sin
token (no puede hacer nada sin uno válido).

**Primera vez**: la página trae las instrucciones para generar un
**Personal Access Token clásico** de GitHub, scope `public_repo` (los
tokens "fine-grained" no funcionan — dan error 403). El token se guarda
solo en tu navegador (`localStorage`) si marcas "recordar"; nunca se envía
a otro lado que no sea `api.github.com`.

### Publicar / editar un escrito

1. Completa título, categoría, fecha, tiempo de lectura, autor (opcional),
   etiquetas (opcional), extracto y cuerpo.
2. Click **Publicar artículo**. Esto, en un solo commit:
   - Crea `articulos/<slug>.html`.
   - Agrega/actualiza la entrada en `data/articulos.json` (de ahí leen
     Inicio, Archivo, las páginas de categoría y las de etiqueta).
   - Actualiza `feed.xml`, `atom.xml`, `feed.json`.
3. GitHub Pages reconstruye el sitio en 1–2 minutos.

**Categorías**: ensayo, artículo, opinión, cuento, miscelánea. Cada una
tiene su propia página (`ensayos.html`, `articulos.html`, `opiniones.html`,
`cuentos.html`, `miscelanea.html`); si está vacía, la página lo dice en vez
de inventar contenido.

**Editar un escrito ya publicado**: sección "Escritos publicados" → "Cargar
lista" → "Editar". Se rellena el mismo formulario; al guardar, se
sobreescribe el mismo archivo y la misma entrada del JSON (mismo slug =
misma URL, no se duplica nada). Si el escrito se publicó antes de que
existiera esta función, el cuerpo se reconstruye desde el HTML — revísalo
antes de guardar, el panel te avisa cuando pasa esto.

**Eliminar un escrito**: mismo listado → "Eliminar" → confirmación. Borra
el archivo, la entrada del JSON y las entradas de los 3 feeds. No borra
imágenes que hayas subido para ese escrito (quedan huérfanas en `media/`
por si las quieres conservar o reusar).

### Etiquetas

Se escriben libremente en el campo "Etiquetas" al publicar/editar (sin
lista predefinida — se crean con solo usarlas). Cada etiqueta enlaza a
`tag.html?t=<etiqueta>`, que lista todos los escritos que la usan. Sección
"Etiquetas" del panel: ver todas las etiquetas en uso con su conteo,
renombrarlas o eliminarlas de todos los escritos a la vez.

### Imágenes y contenido incrustado en el cuerpo

En "Imágenes para este escrito" subes los archivos, y luego los insertas
donde quieras dentro del texto con atajos de una línea (cada uno en su
propio bloque, separado por línea en blanco):

| Atajo | Resultado |
|---|---|
| `[img: archivo.jpg \| pie de foto]` | Imagen que subiste, en ese punto del texto |
| `[img-url: https://... \| pie de foto]` | Imagen externa por URL |
| `[tweet: https://x.com/usuario/status/123]` | Post de X / Twitter incrustado |
| `[youtube: URL o ID \| título]` | Video de YouTube |
| `[vimeo: ID \| título]` | Video de Vimeo |
| `[link: https://... \| Título \| Etiqueta]` | Link externo destacado |
| `[quote: Texto \| Autor, Obra, año]` | Cita con fuente |

También puedes pegar HTML crudo (`<h2>`, `<blockquote>`, etc.) directo en
un bloque.

### Otras páginas editables desde el panel

- **Acerca de**: reemplaza el texto completo de la página (mismo formato
  de párrafos/atajos). Usa "Ver contenido actual" antes de sobrescribir.
- **Fotos**: sube una imagen + pie de foto, se agrega a la galería.
- **Links**: agrega un link nuevo (URL, título, descripción, fecha) a la
  página de curaduría.

Cada acción es su propio commit independiente.

### Alternativa: pedírselo a Claude Code

Si prefieres, puedes traer el `.docx` a una sesión de Claude Code en esta
carpeta y pedir:
> "Convierte `articulos/mi-articulo.docx` en un escrito del sitio y publícalo"

Claude hace el mismo trabajo que el panel y hace `git commit` + `git push`
si confirmas.

---

## Publicar el sitio (GitHub Pages)

El repo ya está en GitHub y con Pages activado. Cada `git push` a `main`
(o cada publicación desde `/admin.html`) vuelve a publicar el sitio solo,
en 1–2 minutos: `https://jcamposcastro21-dot.github.io/the-soft-machine/`

### Cuando compres el dominio thesoftmachine.net

1. En tu proveedor de DNS, crea un registro `CNAME` apuntando
   `thesoftmachine.net` → `jcamposcastro21-dot.github.io`.
2. En GitHub: **Settings → Pages → Custom domain**, escribe
   `thesoftmachine.net` y guarda (esto crea un archivo `CNAME` en el repo).
3. Actualiza las URLs absolutas en `feed.xml`, `atom.xml`, `feed.json` y
   las constantes `OWNER`/`REPO` en `admin.js` (reemplaza
   `jcamposcastro21-dot.github.io/the-soft-machine` por `thesoftmachine.net`).

---

## Estructura de archivos

```
the-soft-machine/
├── index.html          ← Homepage (últimos 8 escritos, vía listings.js)
├── archivo.html        ← Todos los escritos
├── ensayos.html        ← Categoría: ensayo
├── articulos.html      ← Categoría: artículo
├── opiniones.html      ← Categoría: opinión
├── cuentos.html         ← Categoría: cuento
├── miscelanea.html     ← Categoría: miscelánea
├── tag.html             ← Escritos por etiqueta (?t=nombre)
├── fotos.html           ← Galería de fotos (independiente de "escritos")
├── links.html           ← Curaduría de links externos
├── acerca.html          ← Página "acerca de"
├── admin.html/admin.js  ← Panel de webmaster (publicar/editar/borrar/etc.)
├── style.css             ← Todos los estilos
├── components.js         ← Header, nav, sidebar y footer automáticos
├── listings.js            ← Renderiza las tablas de escritos desde el JSON
├── data/articulos.json    ← Fuente de verdad: metadatos de cada escrito
├── media/                 ← Imágenes/videos subidos
└── articulos/
    ├── PLANTILLA.html     ← Referencia manual (el panel ya genera esto solo)
    └── <slug-del-escrito>.html
```

Los listados (Inicio/Archivo/categorías/etiquetas) **no se editan a mano**:
se generan solos desde `data/articulos.json`. Publica/edita/borra siempre
desde `/admin.html` (o pídeselo a Claude), para que el JSON, el HTML del
escrito y los feeds queden sincronizados en un solo commit.

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

## Estadísticas (visitas / lecturas)

No implementadas todavía. GitHub Pages no puede contarlas por sí solo (es
hosting puramente estático, sin código en el servidor); requeriría un
servicio externo con cuenta propia. Se dejó fuera de esta ronda a
propósito — mejor sin contador que con uno inventado. Cuando quieras
retomarlo, dímelo.

---

*Generado con ayuda de Claude — thesoftmachine.net*
