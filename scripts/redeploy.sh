#!/usr/bin/env bash
#
# ESMERALDAS GOLD — Actualización de la app en el VPS
# Uso (como root o con sudo):
#   bash scripts/redeploy.sh [--skip-build]
#
# Edita primero /var/www/esmeraldas-gold/.env si cambiaste NEXT_PUBLIC_* o
# llaves de pago; este script reconstruye la app y reinicia el servicio.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/esmeraldas-gold}"
SKIP_BUILD="${1:-}"

command -v sudo >/dev/null 2>&1 && SUDO="sudo" || SUDO=""

echo "==> 1/4 Pull + dependencias"
$SUDO bash -c "cd $APP_DIR && git pull --ff-only && npm ci"

echo "==> 2/4 Migraciones (si las hay)"
$SUDO bash -c "cd $APP_DIR && npx prisma migrate deploy"

if [[ "$SKIP_BUILD" != "--skip-build" ]]; then
  echo "==> 3/4 Build de producción"
  $SUDO bash -c "cd $APP_DIR && npm run build"
else
  echo "==> 3/4 Build omitido (--skip-build)"
fi

echo "==> 4/4 Reinicio del servicio"
$SUDO systemctl restart esmeraldas-gold
$SUDO systemctl --no-pager status esmeraldas-gold --lines=0

echo ""
echo "Listo."
echo "Cambiar NEXT_PUBLIC_* o llaves requiere este rebuild; los cambios solo de"
echo "navegador (catálogo, precios, contenido) se reflejan sin reiniciar."