import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("..", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

function exists(path) {
  return existsSync(new URL(path, root));
}

test("HACS metadata points to the release module", () => {
  const hacs = JSON.parse(read("hacs.json"));

  assert.equal(hacs.name, "AI Usage Banner Card");
  assert.equal(hacs.filename, "HACS-ai-usage-banner-card.js");
});

test("release and support files are present", () => {
  const requiredFiles = [
    "README.md",
    "INSTALL.md",
    "info.md",
    "LICENSE",
    "hacs.json",
    ".github/workflows/hacs.yml",
    ".github/workflows/validate.yml",
    "docs/collector-setup.md",
    "docs/mqtt-discovery.md",
    "docs/live-card-investigation.md",
    "examples/dashboard.yaml",
    "examples/collectors/parse-ai-usage.mjs",
    "examples/collectors/publish-ai-usage.sh",
    "dist/HACS-ai-usage-banner-card.js",
  ];

  for (const file of requiredFiles) {
    assert.equal(exists(file), true, `${file} should exist`);
  }
});

test("card picker metadata and docs point to the public repo", () => {
  const source = read("ai-usage-banner-card.js");
  const readme = read("README.md");

  assert.match(source, /window\.customCards/);
  assert.match(source, /preview:\s*true/);
  assert.match(source, /documentationURL:/);
  assert.match(readme, /my\.home-assistant\.io\/redirect\/hacs_repository/);
  assert.match(readme, /\/hacsfiles\/HACS-ai-usage-banner-card\/HACS-ai-usage-banner-card\.js/);
});

test("live investigation records the read-only Home Assistant wiring", () => {
  const investigation = read("docs/live-card-investigation.md");

  assert.match(investigation, /desk-display/);
  assert.match(investigation, /custom:ai-usage-banner-card/);
  assert.match(investigation, /mqtt/);
  assert.match(investigation, /No Home Assistant config was changed/);
});
