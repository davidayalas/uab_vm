#!/bin/bash

cleanup() {
    echo "Tancant localtunnel i n8n..."
    kill $LT_PID $N8N_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Mata qualsevol procés que estigui escoltant al port 5678
PORT=5678
PID=$(lsof -ti tcp:$PORT)
if [ ! -z "$PID" ]; then
  echo "Aturant procés al port $PORT amb PID: $PID"
  kill -9 $PID
  sleep 2
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

LT_OUTPUT=$(mktemp)
lt --port 5678 > $LT_OUTPUT 2>&1 &
LT_PID=$!

sleep 5

WEBHOOK_URL=$(grep -o "https://[a-z0-9.-]*\.loca.lt" "$LT_OUTPUT" | head -1)

if [ -z "$WEBHOOK_URL" ]; then
  echo "No s'ha pogut obtenir la URL pública de localtunnel. Surt..."
  cleanup
fi

echo "URL pública localtunnel detectada: $WEBHOOK_URL"

export WEBHOOK_URL

export N8N_USER_MANAGEMENT_DISABLED=true
export N8N_PERSONALIZATION_ENABLED=false
n8n start &
N8N_PID=$!

echo "n8n PID: $N8N_PID, localtunnel PID: $LT_PID"

wait $N8N_PID $LT_PID

