import { test } from "node:test";
import assert from "node:assert/strict";
import { renderReport, InlineHtmlError } from "../index.ts";

const base = {
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
};
const withCustom = (html: string, css?: string) => ({
  ...base,
  sections: [{ kind: "custom", html, ...(css ? { css } : {}), note: "no node fits this layout" }],
});

test("valid custom block renders html and aggregates css", () => {
  const out = renderReport(withCustom(
    `<div class="x-ribbon"><p>hey <strong>you</strong></p></div>`,
    `.x-ribbon { border: 2px solid var(--purple); padding: 8px; }`,
  ));
  assert.ok(out.includes(`class="x-ribbon"`));
  assert.ok(out.includes(`<style data-custom>`));
  assert.ok(out.includes(".x-ribbon { border"));
});

test("custom html rejects script and event handlers", () => {
  assert.throws(() => renderReport(withCustom(`<div><script>1</script></div>`)), InlineHtmlError);
  assert.throws(() => renderReport(withCustom(`<div onclick="x()">a</div>`)), InlineHtmlError);
});

test("custom css must target .x-* selectors only; no @import", () => {
  assert.throws(() => renderReport(withCustom(`<div class="x-a">a</div>`, `body { display: none; }`)), InlineHtmlError);
  assert.throws(() => renderReport(withCustom(`<div class="x-a">a</div>`, `@import url(http://x);`)), InlineHtmlError);
});

test("custom class names must be x-* or design-system classes", () => {
  assert.throws(() => renderReport(withCustom(`<div class="totally-custom">a</div>`)), InlineHtmlError);
});

test("report without custom nodes emits no data-custom style block", () => {
  const out = renderReport({ ...base, sections: [{ kind: "paragraph", body: "p" }] });
  assert.ok(!out.includes("data-custom"));
});

test("custom html rejects unquoted event handler (bypass probe)", () => {
  assert.throws(() => renderReport(withCustom(`<div onclick=alert(1)>a</div>`)), InlineHtmlError);
});

test("comma-group selectors cannot smuggle global CSS (bypass probe)", () => {
  assert.throws(() => renderReport(withCustom(`<div class="x-a">a</div>`, `.x-a, body { display: none; }`)), InlineHtmlError);
  assert.throws(() => renderReport(withCustom(`<div class="x-a">a</div>`, `body, .x-a { color: red; }`)), InlineHtmlError);
});

test("multi-compound all-x selector still renders", () => {
  const out = renderReport(withCustom(`<div class="x-a">a</div>`, `.x-a, .x-b { color: var(--ink); }`));
  assert.ok(out.includes(`<style data-custom>.x-a, .x-b { color: var(--ink); }</style>`));
});

test("unterminated custom html tag is rejected (bypass probe)", () => {
  assert.throws(
    () => renderReport(withCustom(`<img src="https://a" onerror="alert(1)"`)),
    InlineHtmlError,
  );
});

test("custom css cannot break out of <style> into a live <script> (bypass probe)", () => {
  assert.throws(
    () => renderReport(withCustom(
      `<div class="x-a">a</div>`,
      `</style><script>alert(1)</script>.x-a{color:red}`,
    )),
    InlineHtmlError,
  );
});

test("valid css with no angle brackets still renders", () => {
  const out = renderReport(withCustom(`<div class="x-a">a</div>`, `.x-a{color:var(--ink)}`));
  assert.ok(out.includes(`<style data-custom>.x-a{color:var(--ink)}</style>`));
});
