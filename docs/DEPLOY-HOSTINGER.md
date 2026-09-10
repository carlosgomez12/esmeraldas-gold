# Deploy en Hostinger (VPS)

Guía para servir la tienda en producción sobre un VPS Hostinger
(Ubuntu/Debian).

## Topología del servidor actual (2.24.200.160)

Este VPS **ya tenía n8n + Traefik** desplegado en Docker ocupando los puertos
`80/443` (con workflows en producción en `https://n8n.olctecnologia.com`), así
que la tienda se sirve en **puertos propios** para no pisar ese servicio:

| Servicio | Acceso público | Puerto interno | Tecnología |
|---|---|---|---|
| Tienda (Next.js) | `http://2.24.200.160:8080` | `127.0.0.1:3000` | nginx (host) |
| Tienda (TLS temporal) | `https://2.24.200.160:8443` | `127.0.0.1:3000` | nginx + cert snakeoil |
| Admin | `http://2.24.200.160:8080/admin` | `127.0.0.1:3000` | nginx (host) |
| n8n + Traefik (existente) | `https://n8n.olctecnologia.com` | `127.0.0.1:5678` | Docker `/docker/n8n` |
| PostgreSQL 16 | solo localhost | `127.0.0.1:5432` | sistema |

Casos:
- **VPS limpio (sin otros servicios):** la tienda puede ocupar `80/443` como
  `server_name` por defecto (modo dominio con `--with-ssl`).
- **VPS con n8n/Traefik en 80/443:** desplegar con `WEB_PORT=8080
  WEB_PORT_SSL=8443`. El script solo valida que esos puertos estén libres y
  **nunca detiene contenedores Docker por su cuenta**.

## Ruta rápida (scripts del repo)

VPS fresco de Ubuntu 24.04/Debian 12, entrar como root y ejecutar:

```bash
# Modo dominio (ocupa 80/443 + Let's Encrypt):
bash scripts/setup-vps.sh TU-DOMINIO.com --with-ssl

# Modo puertos aparte (si 80/443 ya están ocupados, p. ej. n8n/Traefik):
WEB_PORT=8080 WEB_PORT_SSL=8443 bash scripts/setup-vps.sh 123.45.67.89
```

El script (idempotente) instala Node 20/nginx/PostgreSQL, clona el repo,
genera `.env` con base de datos y secreto nuevos, aplica migraciones + seed,
compila y deja el servicio `esmeraldas-gold` + Nginx funcionando.

Despliegue real ejecutado en 2.24.200.160:

```bash
export WEB_PORT=8080
export WEB_PORT_SSL=8443
bash -c "$(curl -fsSL https://raw.githubusercontent.com/carlosgomez12/esmeraldas-gold/main/scripts/setup-vps.sh)" bash 2.24.200.160
```

Tras ello:
1. Edita `/var/www/esmeraldas-gold/.env` (WhatsApp, `WOMPI_*`, GTM/GA4, admin).
2. `bash scripts/redeploy.sh` para reconstruir con los valores reales.

Para actualizaciones posteriores: `bash scripts/redeploy.sh`.

## 1. Requisitos en el servidor (si se hace a mano)

```bash
sudo apt update && sudo apt -y upgrade
# Node 20 LTS vía NodeSource (Prisma/Next exigen >=20.19):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt -y install nodejs npm git nginx
sudo apt -y install postgresql postgresql-contrib
```

Crea la base y un usuario (o lo hace el script automáticamente):

```bash
sudo -u postgres psql -c "CREATE USER esmeraldas WITH PASSWORD '<clave-fuerte>';"
sudo -u postgres psql -c "CREATE DATABASE esmeraldas_gold OWNER esmeraldas;"
```

> En el VPS actual el script generó rol `esmeraldas`, db `esmeraldas_gold` y
> credenciales aleatorias guardadas en `/var/www/esmeraldas-gold/.env`.

## 2. Código y dependencias

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone <tu-repositorio> esmeraldas-gold && cd esmeraldas-gold
sudo npm ci
sudo cp .env.example .env      # edita (ver abajo)
sudo npx prisma migrate deploy
sudo npm run db:seed           # solo la primera vez (guard .env.seeded)
sudo npm run build
```

### `.env` de producción (mínimo)

```dotenv
NODE_ENV="production"
DATABASE_URL="postgresql://esmeraldas:<clave>@localhost:5432/esmeraldas_gold"
AUTH_SECRET="<genera con: openssl rand -base64 32>"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_SITE_URL="http://2.24.200.160:8080"   # o el dominio final
NEXT_PUBLIC_SITE_NAME="Esmeraldas Gold"

# Pagos: llaves reales de Wompi (si se omiten, el pago queda en mock)
WOMPI_PUBLIC_KEY="pub_prod_..."
WOMPI_PRIVATE_KEY="prv_prod_..."
WOMPI_EVENTS_SECRET="whsec_..."
WOMPI_CURRENCY="COP"

# Analítica (se activa solo con consentimiento de cookies)
NEXT_PUBLIC_GTM_ID="GTM-XXXX"
NEXT_PUBLIC_GA4_ID="G-XXXXXXX"
NEXT_PUBLIC_GA4_ENABLED="true"

# n8n existente (ya desplegado en este VPS)
N8N_WEBHOOK_URL="https://n8n.olctecnologia.com/webhook/esmeraldas-pagos"
N8N_WEBHOOK_SECRET=""
```

> `AUTH_TRUST_HOST="true"` es obligatorio detrás de un proxy para Auth.js.
> `NEXT_PUBLIC_SITE_URL` debe reflejar el puerto si la tienda no usa `80`.

## 3. Servicio systemd

`/etc/systemd/system/esmeraldas-gold.service` (generado por el script):

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

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now esmeraldas-gold
sudo systemctl status esmeraldas-gold
```

## 4. Nginx como proxy inverso

El script escribe `/etc/nginx/sites-available/esmeraldas-gold` y lo habilita
(quita el vhost `default`). **Escucha en `{$WEB_PORT}`** — `80` por defecto o
`8080`/`8443` según el despliegue:

```nginx
server {
    listen 8080;                 # usa 80 en el modo dominio
    server_name 2.24.200.160;

    client_max_body_size 20m;    # uploads del gestor de medios

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
# Si WEB_PORT_SSL=8443 se añade un bloque listen 8443 ssl con snakeoil:
#   ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem
#   ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key
```

Certificados con dominio (modo estándar, `80/443`):

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d esmeraldasgold.com -d www.esmeraldasgold.com
```

> **Let's Encrypt no emite certificados para IPs**: el HTTPS de la tienda en
> `8443` es un cert temporal (snakeoil) hasta tener dominio.

## 5. n8n / Traefik (servicio preexistente)

- Compose en `/docker/n8n` (contenedores `n8n-n8n-1` y `n8n-traefik-1`).
- n8n queda en `127.0.0.1:5678` con su URL pública `https://n8n.olctecnologia.com`.
- Traefik conserva `80/443`; **no hay que tocarlo al desplegar la tienda**.
- Si por error se para Traefik, se restaura con:

```bash
cd /docker/n8n
docker compose start traefik
docker update --restart=unless-stopped n8n-n8n-1 n8n-traefik-1
```

## 6. Webhook de Wompi

El endpoint de la app es `/api/webhooks/wompi` (evento `transaction.updated`,
firma `x-signature` HMAC-SHA256 de `x-timestamp.body` con `WOMPI_EVENTS_SECRET`).

⚠️ **Pendiente en este VPS:** Wompi exige un certificado TLS válido y la tienda
aún no tiene dominio (`8443` es snakeoil). Cuando haya dominio de la tienda hay
que decidir cómo se reparten `80/443` (hoy los tiene Traefik/n8n) o emitir un
cert para la tienda con validación DNS. El checkout puede probarse mientras
tanto en modo **mock** (`WOMPI_*` vacías → tokens `tok_test_*`).

## 7. Backup y actualizaciones

```bash
# Postgres diario (cron)
pg_dump postgresql://esmeraldas:<clave>@localhost:5432/esmeraldas_gold | \
  gzip > /backups/esmeraldas_$(date +%F).sql.gz
```

Actualización de la app:

```bash
bash /var/www/esmeraldas-gold/scripts/redeploy.sh    # pull + ci + migrate + build + restart
```

## 8. Troubleshooting del despliegue (lecciones aplicadas)

- **Node <20:** Prisma 7 y Next 16 exigen `^20.19 || ^22.12 || >=24`. El script
  detecta la versión real y si es <20 instala NodeSource 20 (no basta con que
  `node` exista).
- **`prisma generate` falla en `npm ci`** con `Cannot resolve environment
  variable: DATABASE_URL`: el `.env` se crea **antes** de `npm ci` en el script.
- **`git pull` → `dubious ownership`**: tras `chown -R www-data` del repo, git
  como root lo rechaza. Solución aplicada: `git config --global --add
  safe.directory /var/www/esmeraldas-gold` (en `setup-vps.sh` y `redeploy.sh`).
- **`systemctl reload nginx` → `cannot reload`**: si nginx nunca arrancó (tuvo
  el puerto ocupado al instalarse), hay que **`systemctl start`** primero. El
  script usa `nginx -t && systemctl enable nginx && systemctl start nginx`.
- **Contenedores Docker en `80/443` (`docker-proxy`, p. ej. Traefik)**: el
  script **los deja en paz**. Si `WEB_PORT=80` los encuentra, aborta con
  instrucciones para que el operador decida; con `WEB_PORT=8080` comprueba solo
  los puertos de la tienda.

## 9. Checklist / pendientes reales en 2.24.200.160

- [ ] Editar `/var/www/esmeraldas-gold/.env`: WhatsApp, `WOMPI_*`, GTM/GA4.
- [ ] Cambiar `SEED_ADMIN_PASSWORD` de `CambiaEsta#Password2026` a una real y
      `bash scripts/redeploy.sh`.
- [ ] Comprar/configurar dominio de la tienda → decidir reparto de `80/443`
      con Traefik o cert DNS para la tienda (webhook Wompi real).
- [ ] Reiniciar el VPS (kernel pendiente) y verificar que arrancan
      `nginx`, `esmeraldas-gold` y los contenedores de n8n.
- [ ] Seguridad: cambiar password de root y acceso SSH solo por clave pública.
- [ ] Confirmar `SITE_DEFAULT_CURRENCY="COP"` y `SITE_LOCALE="es-CO"`.
- [ ] Backup diario automatizado.