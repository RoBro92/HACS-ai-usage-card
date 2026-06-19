#!/usr/bin/env node

import { readFileSync } from "node:fs";

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

export function addRelativeReset(text, now = new Date()) {
  if (!text) return null;
  const value = String(text).toLowerCase();
  let minutes = 0;

  const dayMatch = value.match(/(\d+(?:\.\d+)?)\s*d/);
  const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = value.match(/(\d+(?:\.\d+)?)\s*m/);

  if (dayMatch) minutes += Number(dayMatch[1]) * 1440;
  if (hourMatch) minutes += Number(hourMatch[1]) * 60;
  if (minuteMatch) minutes += Number(minuteMatch[1]);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;

  return new Date(now.getTime() + minutes * 60 * 1000).toISOString();
}

export function findPercentNear(text, labels) {
  const lines = String(text).split(/\r?\n/);
  const labelPattern = new RegExp(labels.join("|"), "i");

  for (const line of lines) {
    if (!labelPattern.test(line)) continue;
    const remainingFirst = line.match(/remaining\D{0,30}(\d+(?:\.\d+)?)\s*%/i);
    if (remainingFirst) return Number(remainingFirst[1]);

    const percentFirst = line.match(/(\d+(?:\.\d+)?)\s*%\D{0,30}(remaining|left|available)/i);
    if (percentFirst) return Number(percentFirst[1]);

    const anyPercent = line.match(/(\d+(?:\.\d+)?)\s*%/);
    if (anyPercent) return Number(anyPercent[1]);
  }

  return null;
}

export function findResetNear(text, labels, now = new Date()) {
  const lines = String(text).split(/\r?\n/);
  const labelPattern = new RegExp(labels.join("|"), "i");

  for (const line of lines) {
    if (!labelPattern.test(line)) continue;

    const iso = line.match(/\d{4}-\d{2}-\d{2}[tT ][0-9:.+-]+/);
    if (iso) {
      const normalized = iso[0].replace(" ", "T");
      const date = new Date(normalized);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }

    const relative = line.match(/reset\w*\s+(?:in|after)\s+([0-9dhm .]+)/i);
    const relativeReset = addRelativeReset(relative?.[1], now);
    if (relativeReset) return relativeReset;
  }

  return null;
}

export function parseUsage(text, options = {}) {
  const now = options.now || new Date();
  const fiveHourLabels = ["5h", "5-hour", "five hour", "five-hour", "session"];
  const weeklyLabels = ["weekly", "week"];

  return {
    model_id: options.modelId || "ai_model",
    name: options.name || options.modelId || "AI Model",
    five_hour: {
      remaining: findPercentNear(text, fiveHourLabels),
      reset: findResetNear(text, fiveHourLabels, now),
    },
    weekly: {
      remaining: findPercentNear(text, weeklyLabels),
      reset: findResetNear(text, weeklyLabels, now),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const modelId = argValue("--model", "ai_model");
  const name = argValue("--name", modelId);
  const input = readFileSync(0, "utf8");
  const parsed = parseUsage(input, { modelId, name });
  process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
}
