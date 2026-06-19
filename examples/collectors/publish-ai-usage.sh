#!/usr/bin/env bash
set -euo pipefail

MQTT_HOST="${MQTT_HOST:-homeassistant.local}"
MQTT_PORT="${MQTT_PORT:-1883}"
MQTT_PREFIX="${MQTT_PREFIX:-homeassistant}"
BASE_TOPIC="${BASE_TOPIC:-ai_allowance_monitor}"
DEVICE_ID="${DEVICE_ID:-ai_allowance_monitor}"
DEVICE_NAME="${DEVICE_NAME:-AI Allowance Monitor}"

payload="$(cat)"
model_id="$(jq -r '.model_id' <<<"$payload")"
model_name="$(jq -r '.name // .model_id' <<<"$payload")"

if [[ -z "$model_id" || "$model_id" == "null" ]]; then
  echo "model_id is required" >&2
  exit 1
fi

mosquitto_args=(-h "$MQTT_HOST" -p "$MQTT_PORT" -r)
if [[ -n "${MQTT_USER:-}" ]]; then
  mosquitto_args+=(-u "$MQTT_USER")
fi
if [[ -n "${MQTT_PASSWORD:-}" ]]; then
  mosquitto_args+=(-P "$MQTT_PASSWORD")
fi

publish() {
  local topic="$1"
  local message="$2"
  mosquitto_pub "${mosquitto_args[@]}" -t "$topic" -m "$message"
}

discovery_payload() {
  local suffix="$1"
  local label="$2"
  local state_topic="$3"
  local kind="$4"

  if [[ "$kind" == "timestamp" ]]; then
    jq -n \
      --arg name "$model_name $label" \
      --arg unique_id "ai_usage_${model_id}_${suffix}" \
      --arg state_topic "$state_topic" \
      --arg device_id "$DEVICE_ID" \
      --arg device_name "$DEVICE_NAME" \
      '{
        name: $name,
        unique_id: $unique_id,
        state_topic: $state_topic,
        device_class: "timestamp",
        icon: "mdi:clock-outline",
        device: {
          identifiers: [$device_id],
          name: $device_name,
          manufacturer: "Local CLI collector"
        }
      }'
  else
    jq -n \
      --arg name "$model_name $label" \
      --arg unique_id "ai_usage_${model_id}_${suffix}" \
      --arg state_topic "$state_topic" \
      --arg device_id "$DEVICE_ID" \
      --arg device_name "$DEVICE_NAME" \
      '{
        name: $name,
        unique_id: $unique_id,
        state_topic: $state_topic,
        unit_of_measurement: "%",
        icon: "mdi:timer-outline",
        device: {
          identifiers: [$device_id],
          name: $device_name,
          manufacturer: "Local CLI collector"
        }
      }'
  fi
}

publish_sensor() {
  local suffix="$1"
  local label="$2"
  local json_path="$3"
  local kind="$4"
  local value
  local state_topic
  local discovery_topic

  value="$(jq -r "$json_path // empty" <<<"$payload")"
  state_topic="$BASE_TOPIC/$model_id/$suffix/state"
  discovery_topic="$MQTT_PREFIX/sensor/ai_usage_${model_id}_${suffix}/config"

  publish "$discovery_topic" "$(discovery_payload "$suffix" "$label" "$state_topic" "$kind")"

  if [[ -n "$value" && "$value" != "null" ]]; then
    publish "$state_topic" "$value"
  fi
}

publish_sensor "5h_remaining" "5H Remaining" ".five_hour.remaining" "percent"
publish_sensor "5h_reset" "5H Reset" ".five_hour.reset" "timestamp"
publish_sensor "weekly_remaining" "Weekly Remaining" ".weekly.remaining" "percent"
publish_sensor "weekly_reset" "Weekly Reset" ".weekly.reset" "timestamp"
