# Deploy en Hostinger (VPS)

Guía para el servidor Node de la tienda en producción sobre un VPS Hostinger
(Ubuntu/Debian).

## Ruta rápida (scripts del repo)

VPS fresco de Ubuntu 24.04/Debian 12, entrar como root y ejecutar:

```bash
bash scripts/setup-vps.sh TU-DOMINIO.com --with-ssl
```

El script instala Node 20/nginx/PostgreSQL, clona el repo, genera `.env` con
secreto y base de datos nuevas, aplica migraciones + seed, compila y deja el
servicio `esmeraldas-gold` + Nginx + Let's Encrypt funcionando. Tras eso:

1. Edita `/var/www/esmeraldas-gold/.env` (WhatsApp, `WOMPI_*`, GTM/GA4, admin).
2. `bash scripts/redeploy.sh` para reconstruir con los valores reales.

Para actualizaciones posteriores: `bash scripts/redeploy.sh`.

## 1. Requisitos en el servidor

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nodejs npm git nginx
# Node 20 LTS recomendado: sigue las instrucciones de NodeSource para tu distro.
# PostgreSQL:
sudo apt -y install postgresql postgresql-contrib
# o un contenedor:
# docker run -d --name esmeraldas-db -e POSTGRES_USER=esmeraldas \
#   -e POSTGRES_PASSWORD=<clave> -e POSTGRES_DB=esmeraldas_gold \
#   -p 127.0.0.1:5432:5432 -v esmeraldas-pg:/var/lib/postgresql/data postgres:16
```

Crea la base y un usuario:

```bash
sudo -u postgres psql -c "CREATE USER esmeraldas WITH PASSWORD '<clave-fuerte>';"
sudo -u postgres psql -c "CREATE DATABASE esmeraldas_gold OWNER esmeraldas;"
```

## 2. Código y dependencias

```bash
sudo mkdir -p /var/www && sudo chown $USER /var/www && cd /var/www
git clone <tu-repositorio> esmeraldas-gold && cd esmeraldas-gold
npm ci
cp .env.example .env   # edita con valores de producción (ver abajo)
npx prisma migrate deploy
npm run db:seed        # solo la primera vez
npm run build
```

### `.env` de producción (mínimo)

```dotenv
NODE_ENV="production"
DATABASE_URL="postgresql://esmeraldas:<clave>@localhost:5432/esmeraldas_gold"
AUTH_SECRET="<genera con: openssl rand -base64 32>"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_SITE_URL="https://esmeraldasgold.com"
NEXT_PUBLIC_SITE_NAME="Esmeraldas Gold"

# Pagos: llaves de producción de Wompi (si se omiten, el pago queda en mock)
WOMPI_PUBLIC_KEY="pub_prod_..."
WOMPI_PRIVATE_KEY="prv_prod_..."
WOMPI_EVENTS_SECRET="whsec_..."
WOMPI_CURRENCY="COP"

# Analítica (se activa solo con consentimiento)
NEXT_PUBLIC_GTM_ID="GTM-XXXX"
NEXT_PUBLIC_GA4_ID="G-XXXXXXX"
NEXT_PUBLIC_GA4_ENABLED="true"

N8N_WEBHOOK_URL=""    # si usas n8n
N8N_WEBHOOK_SECRET=""
```

> `AUTH_TRUST_HOST="true"` es obligatorio detrás de un proxy para Auth.js.

## 3. Servicio systemd

`/etc/systemd/system/esmeraldas-gold.service`:

```ini
[Unit]
Description=Esmeraldas Gold (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/esmeraldas-gold
ExecStart=/usr/bin/node /var/www/esmeraldas-gold/node_modules/next/dist/bin/next start -p 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ejecuta `next start` como **un solo proceso** (Node no escala a multi-instancia
sin clúster); para más capacidad usa PM2 en modo cluster (tipo `fork` es
suficiente para una instancia) o un balanceador.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now esmeraldas-gold
sudo systemctl status esmeraldas-gold
```

## 4. Nginx como proxy inverso + TLS

`/etc/nginx/sites-available/esmeraldas-gold`:

```nginx
server {
    listen 80;
    server_name esmeraldasgold.com www.esmeraldasgold.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name esmeraldasgold.com www.esmeraldasgold.com;

    ssl_certificate     /etc/letsencrypt/live/esmeraldasgold.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/esmeraldasgold.com/privkey.pem;

    client_max_body_size 20m;   # uploads del gestor de medios

    location /_next/static/ {
        alias /var/www/esmeraldas-gold/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Certificados (certbot):

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d esmeraldasgold.com -d www.esmeraldasgold.com
```

## 5. Webhook de Wompi

Configura en el panel de Wompi (producción) el endpoint:

```
https://esmeraldasgold.com/api/webhooks/wompi
```

Evento: `transaction.updated`. El endpoint valida la firma `x-signature`
(HMAC-SHA256 de `x-timestamp.body` con `WOMPI_EVENTS_SECRET`).

## 6. Backup y actualizaciones

```bash
# Postgres diario (cron)
pg_dump postgresql://esmeraldas:<clave>@localhost:5432/esmeraldas_gold | \
  gzip > /backups/esmeraldas_$(date +%F).sql.gz
```

Actualización de la app:

```bash
cd /var/www/esmeraldas-gold
git pull && npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart esmeraldas-gold
```

## 7. Checklist post-deploy

- [ ] `/robots.txt` y `/sitemap.xml` accesibles y con URLs canónicas.
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio final (canónicos, OG, JSON-LD).
- [ ] Prueba de pago real en Wompi (tarjeta de prueba/sandbox primero).
- [ ] Configurar Wompi webhook a producción y verificar `201`/`200` en pago.
- [ ] Analítica: aceptar cookies y confirmar `dataLayer`/`gtag` en red.
- [ ] `SITE_DEFAULT_CURRENCY="COP"` y `SITE_LOCALE="es-CO"` según mercado.
- [ ] Copia de respaldo automatizada y acceso restringido SSH.