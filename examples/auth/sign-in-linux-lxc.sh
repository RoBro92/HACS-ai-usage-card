#!/usr/bin/env bash
set -euo pipefail

SERVICE_USER="${SERVICE_USER:-aiusage}"
INSTALL_DIR="${INSTALL_DIR:-/opt/ai-usage-card}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo or as root so this can sign in as $SERVICE_USER." >&2
  exit 1
fi

if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$SERVICE_USER"
fi

echo "Signing in Codex as $SERVICE_USER."
echo "Complete the browser-based ChatGPT OAuth flow when prompted."
sudo -u "$SERVICE_USER" -H bash -lc 'codex login'

echo "Signing in Gemini as $SERVICE_USER."
echo "Choose Sign in with Google when Gemini starts, then complete the OAuth flow."
sudo -u "$SERVICE_USER" -H bash -lc 'gemini'

echo "Sign-in complete. Test publishing with:"
echo "sudo -u $SERVICE_USER -H node $INSTALL_DIR/examples/collectors/run-ai-usage-collector.mjs --provider codex"
echo "sudo -u $SERVICE_USER -H node $INSTALL_DIR/examples/collectors/run-ai-usage-collector.mjs --provider gemini"
