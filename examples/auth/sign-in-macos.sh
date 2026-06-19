#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-$HOME/ai-usage-card}"

echo "Signing in Codex as $(whoami)."
echo "Complete the browser-based ChatGPT OAuth flow when prompted."
codex login

echo "Signing in Gemini as $(whoami)."
echo "Choose Sign in with Google when Gemini starts, then complete the OAuth flow."
gemini

echo "Sign-in complete. Test publishing with:"
echo "node $INSTALL_DIR/examples/collectors/run-ai-usage-collector.mjs --provider codex"
echo "node $INSTALL_DIR/examples/collectors/run-ai-usage-collector.mjs --provider gemini"
