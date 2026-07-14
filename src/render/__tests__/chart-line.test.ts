import { test } from "node:test";
import assert from "node:assert/strict";
import { renderChartLine } from "../charts.ts";

const line = {
  kind: "chart-line" as const,
  title: "Views over time",
  series: [
    { name: "TikTok", color: "purple" as const, points: [ { x: "W1", y: 10 }, { x: "W2", y: 40 }, { x: "W3", y: 30 } ] },
    { name: "IG", points: [ { x: "W1", y: 5 }, { x: "W2", y: 15 }, { x: "W3", y: 45 } ] },
  ],
  unit: "k",
  caption: "growth",
};

test("line chart renders svg, axis labels, legend, palette tokens", () => {
  const html = renderChartLine(line);
  assert.ok(html.startsWith(`<div class="chart">`));
  assert.ok(html.includes("<svg") && html.includes("viewBox"));
  assert.ok(html.includes("W1") && html.includes("W3"));
  assert.ok(html.includes("chart-legend") && html.includes("TikTok") && html.includes("IG"));
  assert.ok(html.includes("var(--purple)"));
});

test("line chart is deterministic", () => {
  assert.equal(renderChartLine(line), renderChartLine(line));
});

test("different data changes output (seed derived from data)", () => {
  const other = { ...line, series: [{ ...line.series[0]!, points: [ { x: "W1", y: 99 }, { x: "W2", y: 1 } ] }] };
  assert.notEqual(renderChartLine(line), renderChartLine(other));
});

test("no scripts, no external refs", () => {
  const html = renderChartLine(line);
  assert.ok(!/<script/i.test(html));
  assert.ok(!/https?:\/\//.test(html));
});
