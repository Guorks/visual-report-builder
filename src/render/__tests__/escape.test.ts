import { test } from "node:test";
import assert from "node:assert/strict";
import { renderReport } from "../index.ts";
import type { Report } from "../../schema.ts";

const baseMeta: Report["meta"] = {
  title: "T",
  language: "en",
  type: "status",
  audience: "engineers",
  date: "2026-05-27",
  project: "probe",
  footer_lines: ["f"],
};
const baseHero: Report["hero"] = {
  kicker: "k",
  h1_pre: "",
  h1_accent: "a",
  h1_post: "",
  lede: "l",
};

const XSS = `<script>alert(1)</script>`;

function build(sections: Report["sections"]): unknown {
  return { meta: baseMeta, hero: baseHero, sections };
}

test("h2 text is escaped", () => {
  const html = renderReport(build([{ kind: "h2", text: XSS }]));
  assert.ok(!html.includes("<script>"), "raw <script> tag must not appear");
  assert.ok(html.includes("&lt;script&gt;"), "escaped form must appear");
});

test("figure alt and caption are attribute/text escaped", () => {
  const payload = `" onerror="alert(1)`;
  const html = renderReport(
    build([
      {
        kind: "figure",
        src: "assets/x.png",
        alt: payload,
        caption: payload,
      },
    ]),
  );
  assert.ok(!html.includes(' onerror="alert(1)"'), "raw onerror must not appear");
  assert.ok(html.includes("&quot;"), "attr-escaped quote must appear");
});

test("done-list items pass through as raw-html (allows <strong>) but render normally", () => {
  const html = renderReport(
    build([{ kind: "done-list", items: ["<strong>ok</strong> done"] }]),
  );
  assert.ok(html.includes("<strong>ok</strong>"), "raw-html item allowed");
  assert.ok(html.includes(`translate="no"`), "translate attr present");
});

test("steps title is escaped (not raw-html)", () => {
  const html = renderReport(
    build([
      {
        kind: "steps",
        items: [{ title: XSS, body: "ok" }],
      },
    ]),
  );
  assert.ok(!html.includes("<script>alert(1)</script><"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("hero kicker is escaped", () => {
  const report = build([{ kind: "h2", text: "ok" }]);
  (report as Report).hero = { ...baseHero, kicker: XSS };
  const html = renderReport(report);
  const scriptCount = (html.match(/<script>/g) ?? []).length;
  assert.equal(scriptCount, 0, "no raw <script> in hero output");
});

test("hero lede passes through as raw-html (allows <strong>)", () => {
  const report = build([{ kind: "h2", text: "ok" }]);
  (report as Report).hero = { ...baseHero, lede: "entro como <strong>socia</strong>" };
  const html = renderReport(report);
  assert.ok(html.includes("<strong>socia</strong>"), "raw-html lede allowed");
  assert.ok(!html.includes("&lt;strong&gt;"), "lede must not be escaped");
});

test("tester-pills items are double-escaped (escape + translate)", () => {
  const html = renderReport(
    build([{ kind: "tester-pills", items: [XSS] }]),
  );
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("figure src_cdn is used when imageMode=cdn and present", () => {
  const figure = {
    kind: "figure" as const,
    src: "assets/local.png",
    src_cdn: "https://cdn.example.com/x.png",
    alt: "a",
    caption: "c",
  };
  const local = renderReport(build([figure]));
  const cdn = renderReport(build([figure]), { imageMode: "cdn" });
  assert.ok(local.includes(`src="assets/local.png"`), "local mode uses src");
  assert.ok(!local.includes("cdn.example.com"), "local mode must not emit cdn url");
  assert.ok(cdn.includes(`src="https://cdn.example.com/x.png"`), "cdn mode uses src_cdn");
  assert.ok(!cdn.includes(`src="assets/local.png"`), "cdn mode must not emit local src");
});

test("figure falls back to src when imageMode=cdn but src_cdn missing", () => {
  const html = renderReport(
    build([{ kind: "figure", src: "assets/x.png", alt: "a", caption: "c" }]),
    { imageMode: "cdn" },
  );
  assert.ok(html.includes(`src="assets/x.png"`), "cdn mode falls back to src when src_cdn absent");
});
