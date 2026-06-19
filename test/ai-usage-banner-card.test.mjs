import test from "node:test";
import assert from "node:assert/strict";

import {
  clampPercent,
  formatPercent,
  formatResetTime,
  logoTypeForModel,
  metricState,
  stateValue,
} from "../ai-usage-banner-card.js";

const hass = {
  states: {
    "sensor.codex_5h_remaining": { state: "98.2" },
    "sensor.codex_5h_reset": { state: "2026-06-20T00:15:42+00:00" },
    "sensor.codex_weekly_remaining": { state: "73" },
    "sensor.codex_weekly_reset": { state: "2026-06-24T21:18:14+00:00" },
  },
};

test("state helpers read and format Home Assistant values safely", () => {
  assert.equal(stateValue(hass, "sensor.codex_5h_remaining"), "98.2");
  assert.equal(stateValue(hass, "sensor.missing"), "unknown");
  assert.equal(clampPercent("-5"), 0);
  assert.equal(clampPercent("101.7"), 100);
  assert.equal(formatPercent("98.2"), "98%");
  assert.equal(formatPercent("not-a-number"), "-");
});

test("formatResetTime returns compact countdown labels", () => {
  const now = new Date("2026-06-19T21:15:42+00:00");

  assert.equal(formatResetTime("2026-06-19T21:35:42+00:00", now), "20m");
  assert.equal(formatResetTime("2026-06-20T00:15:42+00:00", now), "3h");
  assert.equal(formatResetTime("2026-06-24T21:18:14+00:00", now), "5d 0h");
  assert.equal(formatResetTime("invalid", now), "invalid");
});

test("metricState reports missing sensors without throwing", () => {
  const present = metricState(hass, {
    remaining: "sensor.codex_5h_remaining",
    reset: "sensor.codex_5h_reset",
  });
  const missing = metricState(hass, {
    remaining: "sensor.nope",
    reset: "sensor.nope_reset",
  });

  assert.equal(present.percent, 98.2);
  assert.equal(present.hasRemaining, true);
  assert.equal(present.hasReset, true);
  assert.equal(missing.percent, null);
  assert.equal(missing.percentLabel, "-");
  assert.equal(missing.resetLabel, "-");
});

test("logo detection supports known AI providers", () => {
  assert.equal(logoTypeForModel({ name: "Gemini" }), "gemini");
  assert.equal(logoTypeForModel({ name: "Claude" }), "claude");
  assert.equal(logoTypeForModel({ name: "Codex GPT" }), "gpt");
  assert.equal(logoTypeForModel({ name: "Local model" }), "ai");
});
