import test from "node:test";
import assert from "node:assert/strict";

import { addRelativeReset, parseUsage } from "../examples/collectors/parse-ai-usage.mjs";

test("parseUsage extracts percentage and ISO reset lines", () => {
  const input = `
Codex usage
5h remaining: 98%
5h reset: 2026-06-20T00:15:42+00:00
Weekly remaining: 73%
Weekly reset: 2026-06-24T21:18:14+00:00
`;

  const parsed = parseUsage(input, { modelId: "codex_gpt", name: "CODEX Gpt" });

  assert.equal(parsed.model_id, "codex_gpt");
  assert.equal(parsed.name, "CODEX Gpt");
  assert.equal(parsed.five_hour.remaining, 98);
  assert.equal(parsed.five_hour.reset, "2026-06-20T00:15:42.000Z");
  assert.equal(parsed.weekly.remaining, 73);
  assert.equal(parsed.weekly.reset, "2026-06-24T21:18:14.000Z");
});

test("parseUsage extracts relative reset durations", () => {
  const now = new Date("2026-06-19T21:00:00+00:00");
  const input = `
5-hour window: 50% left, resets in 2h 15m
weekly quota: remaining 90%, resets in 4d 3h
`;

  const parsed = parseUsage(input, { modelId: "gemini", now });

  assert.equal(parsed.five_hour.remaining, 50);
  assert.equal(parsed.five_hour.reset, "2026-06-19T23:15:00.000Z");
  assert.equal(parsed.weekly.remaining, 90);
  assert.equal(parsed.weekly.reset, "2026-06-24T00:00:00.000Z");
});

test("addRelativeReset ignores empty or unparsable text", () => {
  assert.equal(addRelativeReset("soon", new Date("2026-06-19T21:00:00+00:00")), null);
});
