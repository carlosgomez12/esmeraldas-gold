# Wompi y n8n

Configuración de la pasarela y los webhooks de automatización (n8n).

## Wompi

### Modalidades

- **Provider mock (por defecto en desarrollo)**: si `WOMPI_PUBLIC_KEY`,
  `WOMPI_PRIVATE_KEY` o `WOMPI_EVENTS_SECRET` están vacías/ausentes, el checkout
  usa `src/lib/payments/mock-provider.ts`: aprueba toda transacción cuyo token
  empiece por `tok_test_` (el checkout genera `tok_test_<uuid>` automáticamente).
  No hay salida a red.
- **Wompi sandbox**: llaves `pub_test_*` / `prv_test_*`. El provider detecta
  `pub_test_` y usa `https://sandbox.wompi.co/v1`.
- **Wompi producción**: llaves `pub_prod_*` / `prv_prod_*` → `https://production.wompi.co/v1`.

### Datos de tarjeta (sandbox)

Wompi en sandbox:
- Tarjeta aprobada: `4242 4242 4242 4242` (cualquier fecha futura, CVC `123`).
- Tarjeta declinada: usa un valor distinto en el token; el provider devuelve
  `DECLINED` y el pedido queda en `PENDING`.

En la UI real el número se tokeniza con el SDK de Wompi
(`/tokens/cards` desde `src/app/(store)/checkout/page.tsx`) y la app solo ve el
token: nunca se almacena un número de tarjeta.

### Envío de eventos

El frontend (panel de Wompi) permite registrar un webhook por ambiente:

- Sandbox: `https://<tu-host>/api/webhooks/wompi` (o `http://localhost:3000/...` con `utilidad webhook`).
- Producción: `https://esmeraldasgold.com/api/webhooks/wompi`.

Evento recomendado: **`transaction.updated`** (cubre aprobación, declinación,
anulación y errores).

### Verificación de firma

El endpoint `POST /api/webhooks/wompi`:

1. Lee el **body textual** (no lo parsea antes de firmar).
2. Requiere headers `x-signature` y `x-timestamp`.
3. Calcula `HMAC-SHA256` de `"{x-timestamp}.{body}"` con `WOMPI_EVENTS_SECRET`
   y compara (acepta prefijo `sha256=`).
4. Con firma inválida devuelve `401 {"error":"invalid signature"}`.

Lógica en `src/lib/payments/webhook-signature.ts` (probada con Vitest) y
consumida por `wompi-provider.verifyWebhookEvent`.

### Flujo de un pago

```
Checkout cliente → tokenizeCard (Wompi) → processPayment (server action)
   → provider.createTransaction → PAYMENT(PENDING→PAID) + ORDER(CONFIRMED)
   → (opcional) POST a N8N_WEBHOOK_URL
   → /checkout/exito?order=ID
Webhook Wompi → /api/webhooks/wompi → sincroniza estado (idempotente por
   providerReference) y dispara N8N.
```

## n8n

### Configuración de la app

En `.env`:

```dotenv
N8N_WEBHOOK_URL="https://n8n.tudominio.com/webhook/esmeraldas-pagos"
N8N_WEBHOOK_SECRET="un-secreto-largo"
```

Cuando se procesa un pago con webhook de Wompi, la app hace `POST` a esa URL
con header `X-Webhook-Secret` y cuerpo:

```json
{
  "event": "payment.event",
  "status": "APPROVED",
  "providerReference": "txn_...",
  "orderId": "uuid-del-pedido",
  "amount": 1250000
}
```

### Workflows sugeridos

1. **Pago aprobado → notificar al equipo**
   - Trigger: Webhook (`N8N_WEBHOOK_URL`) con cabecera `X-Webhook-Secret`.
   - Filtro: `status === "APPROVED"` (y `status === "DECLINED"` secundario).
   - Acción: mensaje a un grupo de WhatsApp para que el asesor contacte al
     cliente, o email de confirmación de pago.
   - Consulta opcional: `GET /api/products` o la API interna para enriquecer.

2. **Pago declinado / pendiente → reintento manual**
   - Filtro: `status === "DECLINED"` | `"PENDING"`.
   - Nota en el tracker del equipo: cliente a contactar por WhatsApp.

3. **Lead nuevo (opcional)**
   - `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` están disponibles en el código
     para notificar leads desde el sitio de contacto, con el mismo patrón
     `X-Webhook-Secret`.

### Seguridad

- Nunca expongas `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`, `AUTH_SECRET` ni
  `N8N_WEBHOOK_SECRET` en el repositorio o en variables públicas del navegador
  (usa las variables `NEXT_PUBLIC_*` solo para lo que deba ser público).
- Protege los webhooks de n8n con el secreto compartido (`X-Webhook-Secret`).