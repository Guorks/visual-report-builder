import { test } from "node:test";
import assert from "node:assert/strict";
import { lintInlineHtml } from "../inline-lint.ts";
import { renderReport, InlineHtmlError } from "../index.ts";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

test("clean inline markup passes", () => {
  const r = lintInlineHtml(`hi <strong>x</strong> <code>a&lt;b</code> <span class="handwrite">y</span> <a href="https://x.co">l</a><br><ul><li>i</li></ul>`, "p");
  assert.deepEqual(r, { errors: [], warnings: [] });
});

test("hard rejects: script, on*, javascript:, iframe, style url()", () => {
  assert.ok(lintInlineHtml(`<script>1</script>`, "p").errors.length > 0);
  assert.ok(lintInlineHtml(`<a onclick="x()">l</a>`, "p").errors.length > 0);
  assert.ok(lintInlineHtml(`<a href="javascript:alert(1)">l</a>`, "p").errors.length > 0);
  assert.ok(lintInlineHtml(`<iframe src="#"></iframe>`, "p").errors.length > 0);
  assert.ok(lintInlineHtml(`<span style="background: url(http://evil)">x</span>`, "p").errors.length > 0);
});

test("unknown tag and unknown class warn, not error", () => {
  const t = lintInlineHtml(`<marquee>x</marquee>`, "p");
  assert.equal(t.errors.length, 0);
  assert.equal(t.warnings.length, 1);
  const c = lintInlineHtml(`<span class="funky">x</span>`, "p");
  assert.equal(c.errors.length, 0);
  assert.equal(c.warnings.length, 1);
});

test("renderReport throws InlineHtmlError on script in paragraph body", () => {
  const bad = {
    meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
    hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
    sections: [{ kind: "paragraph", body: `<script>alert(1)</script>` }],
  };
  assert.throws(() => renderReport(bad), InlineHtmlError);
});

test("unquoted attribute values are hard errors (bypass probes)", () => {
  assert.ok(lintInlineHtml(`<a onclick=alert(1)>l</a>`, "p").errors.length >= 1);
  assert.ok(lintInlineHtml(`<a href=javascript:alert(1)>l</a>`, "p").errors.length >= 1);
  assert.ok(lintInlineHtml(`<a onmouseover=1>l</a>`, "p").errors.length >= 1);
  assert.ok(lintInlineHtml(`<a onclick>l</a>`, "p").errors.length >= 1); // bare valueless on*
});

test("renderReport throws InlineHtmlError on unquoted onclick", () => {
  const bad = {
    meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
    hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
    sections: [{ kind: "paragraph", body: `<a onclick=alert(1)>l</a>` }],
  };
  assert.throws(() => renderReport(bad), InlineHtmlError);
});

test("quoted values with spaces around = stay clean (negative control)", () => {
  const r = lintInlineHtml(`<a href = "https://x.co">l</a>`, "p");
  assert.deepEqual(r, { errors: [], warnings: [] });
});

test("the canonical example lints clean (no errors)", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const ir = JSON.parse(readFileSync(join(here, "../../../examples/tiktok-status-spanish/report.json"), "utf8"));
  const warnings: string[] = [];
  renderReport(ir, { onWarning: (w) => warnings.push(w) }); // must not throw
});
