#!/usr/bin/env bash
#
# ESMERALDAS GOLD — Aprovisionamiento de VPS (Ubuntu 24.04 / Debian 12)
# Uso (como root):
#   bash scripts/setup-vps.sh TU-DOMINIO.com [--with-ssl]
#     --with-ssl  instala Let's Encrypt solo si pasas un dominio (no una IP).
#   Sin dominio: pasa la IP del servidor (modo HTTP, p. ej. 123.45.67.89).
#   REPO_URL=https://github.com/carlosgomez12/esmeraldas-gold.git \
#     bash scripts/setup-vps.sh TU-DOMINIO.com
#
# Idempotente: si ya existe /var/www/esmeraldas-gold/.env NO se sobrescribe.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: bash scripts/setup-vps.sh TU-DOMINIO.com [--with-ssl]" >&2
  exit 1
fi

DOMAIN="$1"
WITH_SSL="${2:-}"
REPO_URL="${REPO_URL:-https://github.com/carlosgomez12/esmeraldas-gold.git}"
APP_DIR="${APP_DIR:-/var/www/esmeraldas-gold}"
APP_USER="www-data"
DB_USER="esmeraldas"
DB_NAME="esmeraldas_gold"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-hola@${DOMAIN}}"

# Modo IP: si el primer argumento es una IP, no hay HTTPS ni www.
IS_IP=0
echo "$DOMAIN" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' && IS_IP=1
if [[ "$IS_IP" -eq 1 ]]; then
  SITE_URL="http://${DOMAIN}"
  SERVER_NAME="${DOMAIN}"
else
  SITE_URL="http://${DOMAIN}"
  SERVER_NAME="${DOMAIN} www.${DOMAIN}"
fi
[[ "$WITH_SSL" == "--with-ssl" && "$IS_IP" -eq 0 ]] && SITE_URL="https://${DOMAIN}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Ejecuta como root (sudo)." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> 1/8 Paquetes base"
apt-get update -y
apt-get install -y ca-certificates curl git build-essential nginx \
  postgresql postgresql-contrib

echo "==> 2/8 Node.js 20 LTS (NodeSource)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "==> 3/8 Código (git clone)"
mkdir -p "$APP_DIR"
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "Repo ya presente; actualizando..."
  git -C "$APP_DIR" pull --ff-only || true
fi
cd "$APP_DIR"

echo "==> 4/8 Dependencias"
npm ci

echo "==> 5/8 PostgreSQL (usuario/db + DATABASE_URL en .env)"
if [[ ! -f .env ]]; then
  DB_PASS="$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)"
  AUTH_SECRET="$(openssl rand -base64 32)"

  su - postgres -c "psql -v ON_ERROR_STOP=1 -c \"DO \\$\\$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
    END IF;
  END \\$\\$;\""
  su - postgres -c "psql -v ON_ERROR_STOP=1 -c \"ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';\""
  su - postgres -c "psql -v ON_ERROR_STOP=1 -tc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -q 1 || psql -v ON_ERROR_STOP=1 -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\""

  cp .env.example .env
  sed -i "s|postgresql://USER:PASSWORD@HOST:5432/esmeraldas_gold?schema=public|postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public|" .env
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=\"${AUTH_SECRET}\"|" .env
  sed -i 's|^AUTH_TRUST_HOST=.*|AUTH_TRUST_HOST="true"|' .env
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"${SITE_URL}\"|" .env
  sed -i 's|^NODE_ENV=.*|NODE_ENV="production"|' .env
  sed -i 's|^SEED_ADMIN_PASSWORD=.*|SEED_ADMIN_PASSWORD="CambiaEsta#Password2026"|' .env
  echo "  .env generado con credenciales nuevas."
else
  echo "  .env ya existe: NO se tocó. Asegúrate de que DATABASE_URL apunte a postgres."
fi

echo "==> 6/8 Migraciones + seed"
npx prisma migrate deploy
if [[ ! -f .env.seeded ]]; then
  npx prisma db seed || true
  touch .env.seeded
  echo "  Seed inicial aplicado (admin: revisa SEED_ADMIN_EMAIL/PASSWORD en .env)."
else
  echo "  Seed ya aplicado antes; lo omito."
fi

echo "==> 7/8 Build de producción"
chown -R "${APP_USER}:${APP_USER}" "$APP_DIR"
npm run build

echo "==> 8/8 Servicio systemd + Nginx"
cat > /etc/systemd/system/esmeraldas-gold.service <<EOF
[Unit]
Description=Esmeraldas Gold (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
ExecStart=/usr/bin/node ${APP_DIR}/node_modules/next/dist/bin/next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable esmeraldas-gold
systemctl restart esmeraldas-gold

cat > /etc/nginx/sites-available/esmeraldas-gold <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    client_max_body_size 20m;

    location /_next/static/ {
        alias ${APP_DIR}/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
ln -sf /etc/nginx/sites-available/esmeraldas-gold /etc/nginx/sites-enabled/esmeraldas-gold
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

if [[ "$IS_IP" -eq 0 && "$WITH_SSL" == "--with-ssl" ]]; then
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" \
    -d "${DOMAIN}" -d "www.${DOMAIN}" --redirect
  systemctl reload nginx
fi

echo ""
echo "==================================================="
echo "  Despliegue completado"
if [[ "$IS_IP" -eq 1 ]]; then
  echo "  - App (sin SSL por ahora):  http://${DOMAIN}/admin"
else
  if [[ "$WITH_SSL" == "--with-ssl" ]]; then
    echo "  - App:         https://${DOMAIN}/admin"
  else
    echo "  - App:         http://${DOMAIN}/admin"
  fi
fi
echo "Siguiente paso IMPORTANTE:"
echo "==================================================="
echo "Siguiente paso IMPORTANTE:"
echo "  1) Editar ${APP_DIR}/.env  (WhatsApp, WOMPI_*, GTM/GA4, admin real)."
echo "  2) Volver a compilar con:  bash ${APP_DIR}/scripts/redeploy.sh"
echo "  3) Configurar el webhook de Wompi:  /api/webhooks/wompi"
echo ""