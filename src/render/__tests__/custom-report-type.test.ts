import { test } from "node:test";
import assert from "node:assert/strict";
import { Report } from "../../schema.ts";
import { evaluateStructural } from "../../eval/structural.ts";

const mk = (type: string) => ({
  meta: { title: "t", language: "en", type, audience: "engineers", date: "d", project: "p", extra: "custom recipe: intro then data", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
  sections: [{ kind: "paragraph", body: "body" }],
});

test("meta.type accepts 'custom'", () => {
  Report.parse(mk("custom"));
});

test("structural eval skips section-title recipe for custom type", () => {
  const report = Report.parse(mk("custom"));
  const res = evaluateStructural(report, { type: "custom", audience: "engineers", language: "en", section_titles_must_include: ["Nonexistent Heading"] });
  assert.ok(!res.failures.some((f) => f.includes("section title")), "custom type must not fail on recipe titles");
});

test("non-custom types still enforce section-title recipe", () => {
  const report = Report.parse(mk("status"));
  const res = evaluateStructural(report, { type: "status", audience: "engineers", language: "en", section_titles_must_include: ["Nonexistent Heading"] });
  assert.ok(res.failures.some((f) => f.includes("section title")), "status must still enforce recipe titles");
});
