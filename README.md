# ESMERALDAS GOLD — E-commerce de joyería

Tienda online premium de oro y esmeraldas colombianas: catálogo público,
carrito con persistencia local, pedidos por WhatsApp, checkout con pasarela
Wompi (entorno sandbox con provider mock para desarrollo), panel de
administración con RBAC y SEO optimizado.

## Stack

- **Framework**: Next.js 16.3.4 (App Router, React 19, Turbopack)
- **Base de datos**: PostgreSQL + Prisma 7 (`@/generated/prisma/client`)
- **Autenticación**: Auth.js v5 (`next-auth@5`) con credenciales y RBAC propio
- **UI**: Tailwind CSS v4, Radix Slot, lucide-react, sonner, cva
- **Estado cliente**: zustand 5 con persistencia (carrito y favoritos)
- **Pagos**: Wompi (tarjetas) con proveedor mock para desarrollo
- **Analítica**: GTM / GA4 inyectados solo tras consentimiento de cookies
- **Tests**: Vitest (unit) y Playwright (E2E)

## Requisitos

- Node.js 20+ 
- PostgreSQL 14+ (o Docker: existe `docker-compose.yml` con la base local)

## Puesta en marcha

```bash
npm install                 # ejecuta `prisma generate` (postinstall)
cp .env.example .env        # y completa las variables (ver sección Env)
docker compose up -d        # base de datos local (postgres)
npx prisma migrate dev      # aplicar migraciones
npm run db:seed             # seed inicial (admin + catálogo demo)
npm run dev                 # http://localhost:3000
```

### Credenciales por defecto (seed)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| SUPER_ADMIN | `admin@esmeraldasgold.com` | `Admin#Esmeraldas2026` |

Configura `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` en `.env` antes de sembrar
para cambiar el administrador inicial.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run dev:port` | Dev en `0.0.0.0` |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción (`next start`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright, Chromium) |
| `npm run db:migrate` / `db:migrate:deploy` | Migraciones dev / producción |
| `npm run db:seed` | Seed |
| `npm run db:studio` | Prisma Studio |

## Variables de entorno

Consulta `.env.example` para la lista completa. Las principales:

- `DATABASE_URL` — conexión PostgreSQL.
- `AUTH_SECRET` / `AUTH_TRUST_HOST` — Auth.js.
- `NEXT_PUBLIC_SITE_URL` — URL pública (canonical, OG, sitemap, WhatsApp).
- `WOMPI_PUBLIC_KEY` / `WOMPI_PRIVATE_KEY` / `WOMPI_EVENTS_SECRET` — pasarela.
  Si **no** están definidas (o están vacías), el sistema usa el **provider
  mock** y aprueba pagos con tokens `tok_test_*`.
- `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GA4_ENABLED` —
  analítica; los scripts solo se cargan tras aceptar el banner de cookies.
- `N8N_WEBHOOK_URL` / `N8N_WEBHOOK_SECRET` — notificaciones a n8n tras pagos
  webhook de Wompi.
- `STORAGE_DRIVER` (`local`) con `STORAGE_LOCAL_DIR` y `STORAGE_PUBLIC_URL`.

## Tests

```bash
npm run test        # Vitest: helpers (formato precios, slug, firma Wompi)
npm run test:e2e    # Playwright: flujo público, admin y checkout mock
```

Los E2E levantan su propio servidor de desarrollo con las llaves Wompi en
blanco (provider mock) en el puerto 3100. Bajan solos al terminar.

> En Windows, antes de `npm run build` asegúrate de que no quede un `next`
> corriendo (EBUSY sobre `.next`).

## Estructura

```
src/
  app/                  # Rutas del App Router
    (store)/            # Tienda pública (catálogo, producto, checkout…)
    admin/              # Panel de administración (protegido por RBAC)
    api/                # API routes: auth, products, webhooks/wompi
    actions/            # Server Actions (admin, checkout)
  components/           # UI, catálogo, producto, admin, cookies, layout
  config/               # env.ts / server-env.ts (validación de entrada)
  lib/                  # db, utils, auth, data, payments, analytics, whatsapp
  store/                # zustand: cart, wishlist, UI
  generated/prisma/     # Cliente Prisma generado
tests/e2e/              # Specs Playwright
prisma/                 # Esquema, migraciones, seed
```

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md) — estructura, datos, auth/RBAC, pagos.
- [Deploy en Hostinger](docs/DEPLOY-HOSTINGER.md) — VPS + Node + PostgreSQL.
- [Wompi y n8n](docs/WOMPI-N8N.md) — credenciales, webhooks y flujos de notificación.