import { test } from "node:test";
import assert from "node:assert/strict";
import { renderChartBar, renderChartDonut } from "../charts.ts";

const bar = {
  kind: "chart-bar" as const,
  title: "Views by week",
  data: [
    { label: "W1", value: 120 },
    { label: "W2", value: 480, color: "purple" as const },
    { label: "W3", value: 300 },
  ],
  unit: "k",
  caption: "so it grows",
};

const donut = {
  kind: "chart-donut" as const,
  data: [
    { label: "done", value: 8, color: "green" as const },
    { label: "pending", value: 3, color: "yellow" as const },
  ],
  center_label: "73%",
};

test("bar chart renders svg with labels, values, palette tokens", () => {
  const html = renderChartBar(bar);
  assert.ok(html.startsWith(`<div class="chart">`));
  assert.ok(html.includes("<svg") && html.includes("viewBox"));
  assert.ok(html.includes("W1") && html.includes("480k"));
  assert.ok(html.includes("var(--purple)"));
  assert.ok(html.includes("so it grows"));
});

test("donut renders legend and center label", () => {
  const html = renderChartDonut(donut);
  assert.ok(html.includes("chart-legend"));
  assert.ok(html.includes("done") && html.includes("73%"));
});

test("charts are deterministic", () => {
  assert.equal(renderChartBar(bar), renderChartBar(bar));
  assert.equal(renderChartDonut(donut), renderChartDonut(donut));
});

test("different data → different wobble (seed actually derived from data)", () => {
  const other = { ...bar, data: [...bar.data.slice(0, 2), { label: "W9", value: 999 }] };
  assert.notEqual(renderChartBar(bar), renderChartBar(other));
});

test("no scripts, no external refs", () => {
  for (const html of [renderChartBar(bar), renderChartDonut(donut)]) {
    assert.ok(!/<script/i.test(html));
    assert.ok(!/https?:\/\//.test(html));
  }
});
