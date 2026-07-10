import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderReport } from "../index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const exampleIR = JSON.parse(
  readFileSync(join(here, "../../../examples/tiktok-status-spanish/report.json"), "utf8"),
);
const golden = readFileSync(join(here, "fixtures/tiktok-golden-body.html"), "utf8");

function extractBody(html: string): string {
  return html.slice(html.indexOf("<body>"), html.indexOf("</html>"));
}

test("TikTok example body bytes are stable", () => {
  assert.equal(extractBody(renderReport(exampleIR)), golden);
});

test("rendering is deterministic (full document, double render)", () => {
  assert.equal(renderReport(exampleIR), renderReport(exampleIR));
});
