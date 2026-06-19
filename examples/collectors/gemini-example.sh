#!/usr/bin/env bash
set -euo pipefail

script -q -e -c "gemini /usage" /dev/null \
  | node /opt/ai-usage-card/examples/collectors/parse-ai-usage.mjs --model agy_gemini --name "AGY Gemini" \
  | /opt/ai-usage-card/examples/collectors/publish-ai-usage.sh
