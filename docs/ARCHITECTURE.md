# Arquitectura

Vista general de la plataforma ESMERALDAS GOLD (Next.js App Router).

## Capas

```
Navegador (tienda pública / panel admin / API client)
   │
   │ React Server Components + Server Actions + next-auth
   ▼
Next.js App Router (src/app)
   ├─ (store)/...        personas públicas
   ├─ admin/...          panel protegido por RBAC
   ├─ api/...            rutas de API (auth, products, webhooks/wompi)
   └─ actions/...        Server Actions (validación zod + permisos)
   │
   ▼
Servicios (src/lib)
   ├─ db.ts            cliente Prisma (PostgreSQL)
   ├─ auth/            guards y permisos
   ├─ data/            consultas de catálogo (public + admin)
   ├─ payments/        providers: wompi (real) y mock
   └─ utils, analytics, whatsapp, consent
```

## Contextos de la tienda pública

- `(store)/catalogo` — listado con filtros (búsqueda, categoría, colección,
  precio máximo, orden) mediante `getProducts()`.
- `(store)/producto/[slug]` — detalle con galería, atributos de joya (nunca se
  inventan: si faltan, "Consultar"), SEO/JSON-LD y relacionados.
- Carrito y favoritos — zustand con `persist` en `localStorage`
  (`esmeraldas-gold-cart` / `esmeraldas-gold-wishlist`). El carrito solo
  persiste los `items`, no el estado del drawer (`partialize`).
- Checkout — servido en `(store)/checkout` (componente cliente) y respaldado
  por Server Actions en `src/app/actions/checkout.ts`:
  1. `createOrder` valida líneas vs. catálogo activo, crea/actualiza cliente,
     dirección y pedido (con pago PENDING) en una transacción.
  2. `getAcceptanceTokenAction` expone token/`mock` al cliente.
  3. `processPayment` ejecuta el provider y actualiza pago + pedido.
  4. `getOrderPublic` alimenta la página de éxito.

## Pagos

- `src/lib/payments/index.ts` decide el provider: si faltan `WOMPI_*`
  (incluido vacío) usa `mock-provider` (aprueba tokens `tok_test_*`, sin red);
  si están presentes, usa `wompi-provider`.
- `wompi-provider` usa sandbox cuando la llave pública empieza por `pub_test_`.
- Firma de webhook: `src/lib/payments/webhook-signature.ts` (HMAC-SHA256 sobre
  `{x-timestamp}.{body}`, con o sin prefijo `sha256=`) — módulo puro y
  testeable (cobertura con Vitest).
- Endpoint `POST /api/webhooks/wompi` verifica firma, marca el pago
  (PAID/FAILED/PENDING) y el pedido (CONFIRMED), con idempotencia por
  `providerReference`, y opcionalmente notifica `N8N_WEBHOOK_URL`.

## Autenticación y permisos (RBAC)

- Auth.js v5 con estrategia JWT, proveedor credenciales y `PrismaAdapter`.
- `src/auth.ts`: `authorized` exige sesión para `/admin`; el JWT guarda
  `id` y `role`; `getUserPermissionKeys` = permisos del rol + grants
  individuales (`userPermission`).
- `src/lib/auth/guards.ts`: `getSession`, `getSessionUser`, `requireStaff`,
  `can(permission)`, `isSuperAdmin`.
- Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `SALES` con mapa `ROLE_PERMISSIONS`
  en `src/lib/auth/roles.ts`. Los componentes cliente usan
  `src/lib/auth/role-label.ts` (sin `server-only`).
- El panel filtra su navegación por permisos: los datos viven en
  `src/components/admin/admin-nav-data.ts` (server-safe) y `AdminSidebar`
  recibe `permissions` y filtra en el cliente.

## Panel admin

Páginas (todas dinámicas, protegidas): dashboard, productos (lista, nuevo,
edición), categorías, colecciones, pedidos (+ detalle con estados/notas),
clientes, leads, media (uploads locales), SEO, contenido (testimonios,
suscriptores, páginas), configuración (estado env + editor JSON) y usuarios
(alta solo SUPER_ADMIN).

## Datos (Prisma)

Suscripción principal: `Product` (atributos opcionales de joya), `ProductImage`
→ `MediaAsset`, `Category`, `Collection` (join), `Inventory`, `Order`,
`OrderItem`, `Payment`, `Customer`, `Address`, `Lead`, `Review`, `Testimonial`,
`NewsletterSubscriber`, `User`/`Role`/`Permission`/`UserPermission`,
`Setting`, `Page`, `MediaAsset`. Ver `prisma/schema.prisma`.

## Analítica y consentimiento

- `src/lib/consent.ts` guarda el consentimiento en `localStorage`
  (`esmeraldas-gold-consent`: `accepted` | `denied`).
- `src/components/cookies/cookie-consent.tsx` (cliente) inyecta GTM o GA4 solo
  tras aceptar (`gtag("consent", "default", …)` con GRANTED/DENIED).
- `src/lib/analytics.ts` es un módulo `"use client"` con helpers de `dataLayer`;
  **no** se invoca desde Server Actions (los disparos de `purchase` se hacen
  en el cliente).