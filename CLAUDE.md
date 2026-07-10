# Alvarsa

E-commerce para un taller de muebles industriales (Itagüí, Antioquia, Colombia).
Bilingüe ES/EN. Este repositorio es la reconstrucción del producto real a partir de
un prototipo de diseño.

## Estado

- **`backend/`** — API REST en Go (arquitectura hexagonal) + MongoDB. **Implementado.**
- **`frontend/`** — Next.js + Tailwind (pnpm). **Fase 2, aún no.**
  Especificación completa + contrato de la API para construirlo: **`docs/FRONTEND.md`**.

## Origen: el prototipo de diseño

La UI original existe como export de la herramienta `dc-runtime` (fuera de este repo,
en `~/Descargas/E-commerce minimalista muebles industrial/Alvarsa.dc.html`): una
plantilla `<x-dc>` + un componente monolítico `class Component extends DCLogic`
compilado a React en el navegador. Era 100% client-side, sin backend ni persistencia
y con auth falsa. De ahí se derivan el modelo de datos y las features:

- **Catálogo** por categorías con filtro y búsqueda; **ficha** de producto con galería
  y personalización (metal / madera / medida); **carrito → cotización**; **favoritos**;
  **contacto** con adjuntos; **panel admin** para crear productos; **AR** (cámara).
- **Categorías (5):** Mesas, Estanterías, Sofás, Dormitorio, Almacenaje.
- **Personalización (OPTS):** metal (negro/crudo/óxido), madera (roble/nogal/pino),
  medida (estándar/ampliada/a medida).
- Las **imágenes del prototipo eran solo demo**: en el producto real las sube el admin
  y se sirven desde la BD (GridFS).

## Arquitectura del backend (hexagonal)

```
backend/
  cmd/server/    main: composition root (wiring) y arranque HTTP
  cmd/seed/      datos mínimos de PRUEBA (idempotente)
  internal/
    core/
      domain/    entidades + reglas de negocio (sin deps externas)
      ports/     interfaces: in_*.go (casos de uso) y out_*.go (repos/almacén/hasher)
      services/  casos de uso que orquestan los puertos
    adapters/
      http/      driving: router, handlers, middleware (auth/RBAC), DTOs
      mongo/     driven: repos MongoDB + GridFS (mapeo BSON vive solo aquí)
      auth/      driven: hashing bcrypt
    config/      carga de .env
```

**Flujo:** `adapters/http` → puerto de entrada → `core/services` → puerto de salida →
`adapters/mongo`. El core no conoce Mongo ni HTTP; se testea con mocks de los puertos.

## Convenciones (IMPORTANTES)

- **pnpm siempre, nunca npm** (frontend, fase 2).
- **Roles y autorización viven en el backend.** RBAC en dos niveles: rutas admin-only
  (`requireAdmin`) y **moldeo de campos por rol** — los campos internos de producto
  (`admin`: costo, notas de taller, proveedor) los decide el core y nunca llegan a
  usuarios generales/anónimos.
- **Todos los `_id` son UUID** generados por la app (no ObjectID de Mongo). El core es
  dueño de la identidad (`services/id.go`).
- **Soft-delete en todas las colecciones:** cada entidad tiene `IsRemove` (bool) +
  `CreatedAt`/`UpdatedAt`. Las lecturas filtran `is_remove:false`; "borrar" = marcar,
  nunca eliminar físicamente.
- **Relaciones por id:** `Product.CategoryID` (UUID) referencia a `Category.ID`.
- **Códigos de error:** inglés, MAYÚSCULAS con guiones bajos
  (`RESOURCE_NOT_FOUND`, `INVALID_INPUT`, `FORBIDDEN`, ...). Ver `core/domain/errors.go`.
- **Creación de datos vía endpoints, no vía seed.** El seed es solo un bootstrap de
  prueba (admin + 5 categorías + 4 productos); usuarios/categorías/productos reales se
  crean por la API.
- Puertos y entidades separados por concern en archivos propios (product, category, ...).

## Base de datos

- MongoDB **existente** (no docker-compose). Conexión por `MONGO_URI` en `backend/.env`
  (gitignored); base de datos `alvarsa`.
- **Colecciones:** `products`, `categories`, `users`, `sessions`, `quotes`,
  `contact_requests`, y GridFS bucket `images` (`images.files` / `images.chunks`).
- **Índices:** `users.email` único parcial (solo activos), `products.category_id`,
  **TTL** en `sessions.expires_at` (expiración automática de sesiones).

## Auth

Sesiones de servidor + cookie httpOnly (`alv_session`), no JWT. Login inserta una
sesión y emite la cookie; middleware `resolveSession` la resuelve en cada request para
conocer el rol; `requireAuth`/`requireAdmin` protegen rutas. Contraseñas con bcrypt.

## API (prefijo `/api`)

Públicos: `GET /health`, `GET /categories`, `GET /products`, `GET /products/{id}`
(campos moldeados por rol), `GET /images/{id}`, `POST /quotes`, `POST /contact`,
`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.

Solo admin: `POST/PUT/DELETE /products`, `POST /categories`, `POST /users`,
`POST /uploads`, `GET /quotes`, `GET /contact-requests`.

## Desarrollo

```bash
cd backend
go run ./cmd/seed     # bootstrap de prueba (idempotente)
go run ./cmd/server   # API en :8080
go test ./...
```

Variables en `backend/.env` (ver `.env.example`). Admin de prueba por defecto:
`admin@alvarsa.com` / `admin123` (configurable con `SEED_ADMIN_*`).
