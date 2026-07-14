import { test } from "node:test";
import assert from "node:assert/strict";
import { Report } from "../../schema.ts";

const base = {
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
};
const wrap = (sections: unknown[]) => ({ ...base, sections });

test("check-table rejects a row whose length != headers length", () => {
  assert.throws(() => Report.parse(wrap([
    { kind: "check-table", headers: ["a", "b", "c"], rows: [["1", "2"]] },
  ])));
});

test("check-table accepts rectangular rows", () => {
  Report.parse(wrap([
    { kind: "check-table", headers: ["a", "b"], rows: [["1", "2"], ["3", "4"]] },
  ]));
});

test("progress.labels accepts 2 and 6, rejects 1 and 7", () => {
  const panel = (n: number) => wrap([
    { kind: "status-panel", tag: "T", heading: "H", paragraph: "p",
      progress: { pct: 50, labels: Array.from({ length: n }, (_, i) => `L${i}`), note: "n" } },
  ]);
  Report.parse(panel(2));
  Report.parse(panel(6));
  assert.throws(() => Report.parse(panel(1)));
  assert.throws(() => Report.parse(panel(7)));
});

test("card node and cards-2 share the Card shape (both still validate)", () => {
  Report.parse(wrap([
    { kind: "card", color: "green", title: "T", body: "b" },
    { kind: "cards-2", cards: [{ color: "red", body: "x" }, { color: "blue", body: "y" }] },
  ]));
});
