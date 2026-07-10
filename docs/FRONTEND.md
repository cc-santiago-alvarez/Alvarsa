# Frontend de Alvarsa — especificación y contrato de API (Fase 2)

Documento de arranque para construir el **frontend** en un chat nuevo. El backend
(Go hexagonal + MongoDB) ya está hecho y verificado; este doc describe qué construir
y **cómo consumir la API existente**. Contexto general del proyecto en `../CLAUDE.md`.

## Stack y convenciones

- **Next.js (App Router) + TypeScript + Tailwind CSS.**
- **Gestor: pnpm — NUNCA npm.** (`pnpm create next-app`, `pnpm install`, `pnpm dev`).
- El frontend corre en **http://localhost:3003** (el backend ya tiene el CORS configurado
  para ese origen; ver más abajo). Ubicación: `/home/dev13/projects/Alvarsa/frontend`.
- Data layer aislada en `lib/` tras funciones (`getProducts()`, etc.) que hacen `fetch`
  a la API, para no acoplar componentes al transporte.

## Backend / API

- **Base URL:** `http://localhost:8081/api` (arranca con `cd backend && go run ./cmd/server`;
  seed de prueba con `go run ./cmd/seed`). Definir `NEXT_PUBLIC_API_URL=http://localhost:8081`.
- **Auth por cookie de sesión httpOnly** (`alv_session`). En TODOS los `fetch` usar
  `credentials: 'include'`. El backend ya permite CORS con credenciales para
  `http://localhost:3003` (`CORS_ORIGIN` en `backend/.env`). Si cambias el puerto del
  frontend, actualiza `CORS_ORIGIN`.
- **Roles:** el backend decide autorización y **moldea los campos por rol**. El frontend
  solo adapta la UI (oculta acciones/campos admin), nunca es la fuente de verdad.

### Endpoints (prefijo `/api`)

Públicos:
- `GET /health`
- `GET /categories`
- `GET /products?categoryId=<uuid>&q=<texto>` (ambos opcionales)
- `GET /products/{id}`
- `GET /images/{id}` → binario de la imagen (usar directo como `src`)
- `POST /quotes` (checkout del carrito)
- `POST /contact`
- `POST /auth/register` (cliente; abre sesión) · `POST /auth/login` · `POST /auth/logout` · `GET /auth/me`

Solo admin (requieren sesión admin; 401/403 si no):
- `POST /products` · `PUT /products/{id}` · `DELETE /products/{id}`
- `POST /categories`
- `POST /users` (crear usuario con rol)
- `POST /uploads` (multipart, campo **`file`**) → `{ id, filename, contentType, size }`
- `GET /quotes` · `GET /contact-requests`

### Formas JSON (camelCase)

```jsonc
// Product (el bloque "admin" solo aparece si la sesión es admin)
{ "id": "uuid", "name": "Mesa Fábrica", "categoryId": "uuid", "price": 1890000,
  "dims": "180 × 90 × 76 cm", "materialsEs": "...", "materialsEn": "...",
  "descriptionEs": "...", "descriptionEn": "...", "imageIds": ["uuid"],
  "customization": { "metal": ["negro","crudo","oxido"], "madera": ["roble","nogal","pino"], "medida": ["s","l","custom"] },
  "custom": false,
  "admin": { "internalCost": 700000, "workshopNotes": "...", "supplierRef": "SUP-9" } }

// Category
{ "id": "uuid", "nameEs": "Mesas", "nameEn": "Tables", "imageId": "" }

// /auth/me y respuesta de login/register
{ "authenticated": true, "role": "admin" | "customer", "userId": "uuid" }

// POST /quotes  (request)
{ "items": [ { "productId": "uuid", "name": "Mesa", "price": 1000, "qty": 2,
               "options": { "metal": "negro", "madera": "roble", "medida": "s" } } ],
  "contact": { "name": "Ana", "phone": "300...", "email": "a@a.com" } }

// POST /contact (request)
{ "name": "Ana", "phone": "300...", "reason": "quiero una mesa", "attachments": ["imageId?"] }

// Errores: { "error": "CODIGO_EN_MAYUSCULAS" }  (p.ej. INVALID_CREDENTIALS, FORBIDDEN)
```

Imágenes: `products.imageIds` son ids de GridFS → mostrar con
`<img src="http://localhost:8081/api/images/{id}">` (o `next/image`). Las del prototipo
eran solo demo; las reales las sube el admin por `POST /uploads`.

## Rutas (reemplazan el estado `view` del prototipo)

| Prototipo | Ruta Next.js |
|---|---|
| home | `/` |
| catalog | `/catalogo` (filtros/búsqueda vía `searchParams`: `?categoryId=`, `?q=`) |
| product | `/producto/[id]` |
| about | `/taller` |
| contact | `/contacto` |
| admin | `/admin` (protegida: requiere rol admin vía `GET /auth/me`) |

## Componentes (mapeo 1:1 desde el prototipo)

Fuente del prototipo (solo referencia de UI/estilos, NO ejecutar):
`~/Descargas/E-commerce minimalista muebles industrial/Alvarsa.dc.html`
(secciones marcadas con comentarios `<!-- HEADER -->`, `<!-- HOME -->`, etc.).

- **Layout:** `Header` (búsqueda, selector idioma, favoritos, cuenta, carrito), `MobileMenu`, `Footer`.
- **Overlays:** `CartDrawer`, `FavoritesDrawer`, `AccountDrawer`, `ARViewer`.
- **Home:** `Hero`, `Categories`, `Featured`, `ARBand`, `Moment`, `CraftQuote`.
- **Catálogo:** `FilterChips`, `ProductGrid`, `ProductCard`.
- **Ficha:** `Gallery`, `ProductInfo`, `OptionGroups` (metal/madera/medida), `RelatedProducts`.
- **Contacto:** `ContactForm` → `POST /contact`.
- **Admin:** `ProductForm` → `POST /products` (+ subida de imágenes por `POST /uploads`),
  y gestión de categorías/usuarios. Ocultar todo esto a no-admins.

## Estado cliente

- `CartProvider`, `FavoritesProvider`, `LangProvider` (React Context + `localStorage`).
- Carrito: clave por variante `id|metal|madera|medida`, inc/dec/remove, subtotal; al hacer
  checkout → `POST /quotes`.

## Estilos / design tokens (del CSS del prototipo)

- Colores: fondo `#FFFFFF`, texto `#17181A`, negro `#141414`, dorado/acento `#D6A81F`,
  enlace `#9A7512`/hover `#8A6410`, gris `#6E6E6E`, panel `#F2F2F0`.
- Tipografías: **Archivo** (display) + **Manrope** (cuerpo) vía `next/font`.
- Animaciones: `alvOverlay`, `alvDrawer`, `alvUp` como keyframes de Tailwind.

## i18n (ES/EN)

Portar el diccionario `DICT` del prototipo (bloque `DICT = { es: {...}, en: {...} }`)
a archivos de mensajes; usar **next-intl** o un Context propio, con selector en el header.

## AR (realidad aumentada)

Portar `openAr`/`arPointerDown`/`arScaleBy` del prototipo a un componente cliente con
`navigator.mediaDevices.getUserMedia`, arrastre/escalado por punteros y fallback de
"cámara no disponible".

## Cómo continuar en el chat nuevo

1. Abre Claude Code con el directorio de trabajo en `/home/dev13/projects/Alvarsa`
   (carga `CLAUDE.md` automáticamente).
2. Pídele: **"lee `docs/FRONTEND.md` y construye el frontend en `frontend/` siguiendo esa
   especificación"**.
3. Verificación: `cd backend && go run ./cmd/server` (API en :8081) + `cd frontend && pnpm dev`
   (en :3003); recorrer catálogo, ficha, carrito→cotización, login admin y panel.
