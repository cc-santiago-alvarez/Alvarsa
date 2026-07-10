# Alvarsa — Frontend (Fase 2)

Next.js (App Router) + TypeScript + Tailwind v4, consumiendo la API Go del backend.
Ver contrato y arquitectura en [`../docs/FRONTEND.md`](../docs/FRONTEND.md) y `../CLAUDE.md`.

## Requisitos

- **pnpm** (nunca npm). Si no está instalado, con Node 20 usa una versión compatible:
  ```bash
  corepack prepare pnpm@9.15.9 --activate
  corepack enable --install-directory ~/.local/bin pnpm   # deja el shim en ~/.local/bin
  export PATH="$HOME/.local/bin:$PATH"
  ```
- El backend corriendo en `:8081` (`cd ../backend && go run ./cmd/seed && go run ./cmd/server`).

## Desarrollo

```bash
pnpm install
pnpm dev        # arranca en http://localhost:3003 (puerto fijado por el CORS del backend)
```

`http://localhost:3003` **es obligatorio**: el backend fija `CORS_ORIGIN=http://localhost:3003`
en `backend/.env`. Si cambias el puerto, actualiza también esa variable.

Config del cliente en `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Estructura

- `lib/` — capa de datos: `api.ts` (fetch central con `credentials:'include'` y manejo del
  error `{ "error": "CODE" }`), módulos por recurso (`products`, `categories`, `auth`,
  `orders`), `types.ts` (espejo de los DTOs), `dict.ts` (i18n ES/EN), `opts.ts`
  (etiquetas de personalización), `format.ts`.
- `providers/` — Context con persistencia en `localStorage`: `Lang`, `Cart`
  (clave `id|metal|madera|medida`), `Favorites`, `Auth` (`/auth/me`), `UI` (overlays/AR).
- `app/` — rutas: `/`, `/catalogo`, `/producto/[id]`, `/taller`, `/contacto`, `/admin`.
- `components/` — Header, Footer, ProductCard, drawers (Cart/Favorites/Account/Menu),
  ARViewer, y `admin/` (ProductForm con subida de imágenes + personalización, ProductTable).

## Auth y admin

- Registro (`/auth/register`) crea siempre un **cliente**. El **admin** es el del seed
  (`admin@alvarsa.com` / `admin123`); desde el panel puede crear más usuarios con rol
  vía `POST /users`.
- `/admin` está protegida por rol (via `GET /auth/me`); un no-admin ve un aviso.

## Notas

- Los productos sin imagen muestran un placeholder; el admin sube imágenes reales
  (`POST /uploads`, multipart campo `file`) que se sirven desde `GET /images/{id}`.
- El formulario de contacto público se envía sin adjuntos (la subida a GridFS es solo-admin).
