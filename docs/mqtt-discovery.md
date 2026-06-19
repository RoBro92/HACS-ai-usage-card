# MQTT Discovery

The card only needs Home Assistant sensor entities. MQTT discovery is the easiest way to create those sensors from an external collector.

## Entity Shape

For each model/account, publish four sensors:

| Sensor | State example | Discovery settings |
| --- | --- | --- |
| `5h_remaining` | `98.0` | `unit_of_measurement: "%"`, `icon: mdi:timer-outline` |
| `5h_reset` | `2026-06-20T00:15:42+00:00` | `device_class: timestamp`, `icon: mdi:clock-outline` |
| `weekly_remaining` | `73.0` | `unit_of_measurement: "%"`, `icon: mdi:timer-outline` |
| `weekly_reset` | `2026-06-24T21:18:14+00:00` | `device_class: timestamp`, `icon: mdi:clock-outline` |

## Topic Pattern

Recommended state topics:

```text
ai_allowance_monitor/<model_id>/5h_remaining/state
ai_allowance_monitor/<model_id>/5h_reset/state
ai_allowance_monitor/<model_id>/weekly_remaining/state
ai_allowance_monitor/<model_id>/weekly_reset/state
```

Recommended discovery topics:

```text
homeassistant/sensor/ai_usage_<model_id>_5h_remaining/config
homeassistant/sensor/ai_usage_<model_id>_5h_reset/config
homeassistant/sensor/ai_usage_<model_id>_weekly_remaining/config
homeassistant/sensor/ai_usage_<model_id>_weekly_reset/config
```

Use retained discovery and retained state messages so sensors survive Home Assistant restarts.

## Example Discovery Payload

```json
{
  "name": "CODEX Gpt 5H Remaining",
  "unique_id": "ai_usage_codex_gpt_5h_remaining",
  "state_topic": "ai_allowance_monitor/codex_gpt/5h_remaining/state",
  "unit_of_measurement": "%",
  "icon": "mdi:timer-outline",
  "device": {
    "identifiers": ["ai_allowance_monitor"],
    "name": "AI Allowance Monitor",
    "manufacturer": "Local CLI collector"
  }
}
```

## Home Assistant Notes

Use the MQTT integration from Settings > Devices & services. Avoid editing `.storage` files or manually adding MQTT sensors unless you are deliberately running a YAML-mode setup.
