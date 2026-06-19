#!/usr/bin/env bash
set -euo pipefail

script -q -e -c "codex /usage" /dev/null \
  | node /opt/ai-usage-card/examples/collectors/parse-ai-usage.mjs --model codex_gpt --name "CODEX Gpt" \
  | /opt/ai-usage-card/examples/collectors/publish-ai-usage.sh
