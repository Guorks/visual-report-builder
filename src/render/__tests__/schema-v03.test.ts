import { test } from "node:test";
import assert from "node:assert/strict";
import { Report } from "../../schema.ts";

const base = {
  meta: {
    title: "t", language: "en", type: "status", audience: "engineers",
    date: "2026-07-10", project: "p", footer_lines: ["f"],
  },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
};

const wrap = (sections: unknown[]) => ({ ...base, sections });

test("tier-1 nodes validate", () => {
  Report.parse(wrap([
    { kind: "callout", color: "blue", icon: "💡", title: "Tip", body: "b" },
    { kind: "stat-row", items: [
      { value: "1.2M", label: "views" },
      { value: "82%", label: "done", color: "green", note: "up" },
    ]},
    { kind: "timeline", items: [
      { time: "14:03", title: "boom", body: "b", color: "red" },
      { time: "14:15", body: "fixed" },
    ]},
    { kind: "cta-card", title: "Try it", body: "b", action: { label: "Go", href: "https://x.co" } },
    { kind: "action-list", items: [{ text: "do it", owner: "Ana", due: "Fri", done: false }] },
    { kind: "quote", text: "wow", attribution: "someone" },
    { kind: "figure-row", figures: [
      { src: "a.png", alt: "a" },
      { src: "b.png", alt: "b", caption: "c", width: "small", frame: false },
    ]},
    { kind: "divider" },
    { kind: "divider", style: "scribble" },
  ]));
});

test("figure caption is now optional; layout fields validate", () => {
  Report.parse(wrap([
    { kind: "figure", src: "a.png", alt: "a" },
    { kind: "figure", src: "a.png", alt: "a", caption: "c", width: "medium", aspect: "9:16", frame: false, align: "left" },
  ]));
});

test("hero badges + hero figure validate", () => {
  Report.parse({
    ...wrap([{ kind: "paragraph", body: "p" }]),
    hero: { ...base.hero, badges: [{ kind: "red", text: "SEV1" }], figure: { src: "h.png", alt: "h" } },
  });
});

test("cta href scheme allowlist rejects javascript:", () => {
  assert.throws(() =>
    Report.parse(wrap([
      { kind: "cta-card", title: "t", body: "b", action: { label: "x", href: "javascript:alert(1)" } },
    ])),
  );
});

test("unknown fields still fail (.strict preserved)", () => {
  assert.throws(() => Report.parse(wrap([{ kind: "quote", text: "q", oops: 1 }])));
});
