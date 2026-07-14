import { test } from "node:test";
import assert from "node:assert/strict";
import { renderReport } from "../index.ts";

const base = {
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
};
const withFigs = (a: object, b: object) => ({ ...base, sections: [
  { kind: "figure", ...a }, { kind: "figure-row", figures: [ b, { src: "z.png", alt: "z", src_cdn: "https://cdn.example/z.png" } ] },
]});

test("cdn mode warns once per figure missing src_cdn", () => {
  const warns: string[] = [];
  renderReport(withFigs({ src: "a.png", alt: "a" }, { src: "b.png", alt: "b" }), { imageMode: "cdn", onWarning: (w) => warns.push(w) });
  const missing = warns.filter((w) => w.includes("no src_cdn"));
  assert.equal(missing.length, 2); // the figure + one figure-row member; the src_cdn-bearing member does not warn
});

test("local mode emits no src_cdn warning", () => {
  const warns: string[] = [];
  renderReport(withFigs({ src: "a.png", alt: "a" }, { src: "b.png", alt: "b" }), { imageMode: "local", onWarning: (w) => warns.push(w) });
  assert.equal(warns.filter((w) => w.includes("src_cdn")).length, 0);
});

test("strict-html does NOT promote a missing-src_cdn warning to an error", () => {
  // no HTML violations here, only a missing src_cdn — strict must still render
  const html = renderReport(withFigs({ src: "a.png", alt: "a" }, { src: "b.png", alt: "b" }), { imageMode: "cdn", strictHtml: true });
  assert.ok(html.includes("<body>"));
});
