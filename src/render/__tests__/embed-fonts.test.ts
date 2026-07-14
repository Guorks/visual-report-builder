import { test } from "node:test";
import assert from "node:assert/strict";
import { renderReport } from "../index.ts";

const rep = {
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
  sections: [{ kind: "paragraph", body: "hi" }],
};

test("default render links Google Fonts (network)", () => {
  const html = renderReport(rep);
  assert.ok(html.includes("fonts.googleapis.com"));
  assert.ok(!html.includes("data:font/woff2"));
});

test("embedFonts inlines woff2 as data URIs and drops the network link", () => {
  const html = renderReport(rep, { embedFonts: true });
  assert.ok(html.includes("@font-face"));
  assert.ok(html.includes("data:font/woff2;base64,"));
  assert.ok(!html.includes("fonts.googleapis.com"), "no network font link when embedded");
  for (const fam of ["Caveat", "Inter", "Outfit", "JetBrains Mono"]) {
    assert.ok(html.includes(`font-family: '${fam}'`) || html.includes(`font-family:'${fam}'`), `has @font-face for ${fam}`);
  }
});

test("embedFonts render is deterministic", () => {
  assert.equal(renderReport(rep, { embedFonts: true }), renderReport(rep, { embedFonts: true }));
});
