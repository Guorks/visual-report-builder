import { test } from "node:test";
import assert from "node:assert/strict";
import { Report } from "../../schema.ts";
import { countWords, countImages, collectNodeKinds, countCustomBlocks, evaluateStructural } from "../../eval/structural.ts";

const report = Report.parse({
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "one two three" },
  sections: [
    { kind: "stat-row", items: [{ value: "1", label: "alpha beta" }, { value: "2", label: "gamma" }] },
    { kind: "timeline", items: [{ time: "1:00", body: "tick tock" }, { time: "2:00", body: "done" }] },
    { kind: "figure-row", figures: [{ src: "a.png", alt: "a" }, { src: "b.png", alt: "b" }] },
    { kind: "chart-bar", data: [{ label: "a", value: 1 }, { label: "b", value: 2 }] },
    { kind: "custom", html: `<div class="x-a">five six seven</div>`, note: "testing counters" },
  ],
});

test("new kinds appear in collectNodeKinds", () => {
  const kinds = collectNodeKinds(report);
  for (const k of ["stat-row", "timeline", "figure-row", "chart-bar", "custom"]) assert.ok(kinds.has(k), k);
});

test("figure-row counts its figures as images; charts do not count as images", () => {
  assert.equal(countImages(report), 2);
});

test("custom html words are counted", () => {
  assert.ok(countWords(report) >= 15);
});

test("max_custom_blocks enforced", () => {
  const r = evaluateStructural(report, { type: "status", audience: "engineers", language: "en", max_custom_blocks: 0 });
  assert.equal(r.passed, false);
  assert.ok(r.failures.some((f) => f.includes("custom")));
  assert.equal(countCustomBlocks(report), 1);
});
