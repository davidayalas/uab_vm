#!/bin/bash

# Carga entorno si usas nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 24  # Asegura la versión node que usas

# Comprueba que server.js existe
if [ ! -f "server.js" ]; then
  echo "No s'ha trobat server.js a la carpeta actual"
  exit 1
fi

# Arrenca node en primer pla, mostra sortida
node server.js

# Opcional: si vols mantenir terminal oberta, descomenta
# read -p "Premeu Enter per sortir..."

