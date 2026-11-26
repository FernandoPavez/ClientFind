#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "No encontré Node.js. Instálalo desde https://nodejs.org (versión LTS) y vuelve a abrir este archivo."
  read -p "Presiona Enter para cerrar"
  exit 1
fi
node server.js
