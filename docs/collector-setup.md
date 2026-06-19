# Collector Setup

This guide mirrors the working deployment pattern used for the original dashboard card:

1. Install the AI CLI tools on an LXC or other small Linux host.
2. Run their usage commands in a headless terminal session.
3. Parse percentages and reset timestamps.
4. Publish the values over MQTT.
5. Let Home Assistant MQTT discovery create the sensors.

## LXC Packages

Debian or Ubuntu example:

```bash
sudo apt update
sudo apt install -y nodejs npm jq mosquitto-clients util-linux
```

`util-linux` provides `script`, which is useful for CLIs that render differently unless they think they are attached to a terminal.

Install whichever CLIs you use, then confirm the usage command works interactively before automating it.

## Headless Command Pattern

Some CLIs need a TTY. Use `script` to provide one:

```bash
script -q -e -c "codex /usage" /dev/null
script -q -e -c "gemini /usage" /dev/null
```

If your CLI is interactive rather than command-based, wrap it with `timeout` and pipe the command:

```bash
printf '/usage\n/quit\n' | timeout 45s script -q -e -c "codex" /dev/null
```

CLI output formats can change. Keep the parser outside Home Assistant so breakage does not affect dashboard loading.

## Parser Example

`examples/collectors/parse-ai-usage.mjs` accepts raw CLI text on stdin and returns normalized JSON:

```bash
script -q -e -c "codex /usage" /dev/null | node examples/collectors/parse-ai-usage.mjs --model codex_gpt
```

Expected JSON shape:

```json
{
  "model_id": "codex_gpt",
  "five_hour": {
    "remaining": 98,
    "reset": "2026-06-20T00:15:42+00:00"
  },
  "weekly": {
    "remaining": 73,
    "reset": "2026-06-24T21:18:14+00:00"
  }
}
```

## MQTT Publish Example

`examples/collectors/publish-ai-usage.sh` publishes discovery configs and state values with `mosquitto_pub`.

```bash
export MQTT_HOST=homeassistant.local
export MQTT_USER=homeassistant
export MQTT_PASSWORD='change-me'

script -q -e -c "codex /usage" /dev/null \
  | node examples/collectors/parse-ai-usage.mjs --model codex_gpt --name "CODEX Gpt" \
  | examples/collectors/publish-ai-usage.sh
```

## systemd Timer

Install the service and timer examples from `examples/systemd/`, adjusting paths and user names first.

Run every 15 minutes:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ai-usage-codex.timer
```

The card updates as soon as the MQTT sensor states change.
