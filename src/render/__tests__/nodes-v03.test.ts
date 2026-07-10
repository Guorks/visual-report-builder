import { test } from "node:test";
import assert from "node:assert/strict";
import { renderSection } from "../primitives.ts";

test("default figure markup unchanged from v0.2", () => {
  const html = renderSection({ kind: "figure", src: "a.png", alt: "x", caption: "c" } as never);
  assert.equal(html, `<div class="figure"><img src="a.png" alt="x"><div class="caption" translate="no">c</div></div>`);
});

test("figure modifiers add classes; caption omitted when absent", () => {
  const html = renderSection({ kind: "figure", src: "a.png", alt: "x", width: "small", aspect: "1:1", frame: false, align: "left" } as never);
  assert.ok(html.includes(`class="figure figure--small figure--a-1x1 figure--noframe figure--left"`));
  assert.ok(!html.includes("caption"));
});

test("callout renders color class, icon and title", () => {
  const html = renderSection({ kind: "callout", color: "blue", icon: "💡", title: "Tip", body: "b <strong>x</strong>" } as never);
  assert.ok(html.includes(`class="callout callout-blue"`));
  assert.ok(html.includes("💡"));
  assert.ok(html.includes("<strong>x</strong>"));
});

test("stat-row renders tiles with value/label/note", () => {
  const html = renderSection({ kind: "stat-row", items: [
    { value: "1.2M", label: "views", color: "purple", note: "wow" },
    { value: "82%", label: "done" },
  ]} as never);
  assert.ok(html.includes(`class="stat-row"`));
  assert.ok(html.includes("1.2M") && html.includes("82%") && html.includes("wow"));
});

test("timeline renders times and color modifier", () => {
  const html = renderSection({ kind: "timeline", items: [
    { time: "14:03", title: "boom", body: "b", color: "red" },
    { time: "14:15", body: "ok" },
  ]} as never);
  assert.ok(html.includes(`class="timeline"`));
  assert.ok(html.includes("14:03") && html.includes("timeline-red"));
});

test("cta-card renders link when href present, span otherwise", () => {
  const withHref = renderSection({ kind: "cta-card", title: "T", body: "b", action: { label: "Go", href: "https://x.co" } } as never);
  assert.ok(withHref.includes(`<a class="cta-button" href="https://x.co"`));
  const noHref = renderSection({ kind: "cta-card", title: "T", body: "b", action: { label: "Go" } } as never);
  assert.ok(noHref.includes(`<span class="cta-button"`));
});

test("action-list renders owner pill, due, done state", () => {
  const html = renderSection({ kind: "action-list", items: [
    { text: "fix", owner: "Ana", due: "Fri", done: true },
    { text: "ship" },
  ]} as never);
  assert.ok(html.includes(`class="action-list"`));
  assert.ok(html.includes("Ana") && html.includes("Fri") && html.includes(`class="action-item done"`));
});

test("quote + divider + figure-row render", () => {
  assert.ok(renderSection({ kind: "quote", text: "q", attribution: "me" } as never).includes("blockquote"));
  assert.ok(renderSection({ kind: "divider" } as never).includes(`class="divider divider-dashed"`));
  assert.ok(renderSection({ kind: "divider", style: "scribble" } as never).includes("divider-scribble"));
  const row = renderSection({ kind: "figure-row", figures: [
    { src: "a.png", alt: "a" }, { src: "b.png", alt: "b" },
  ]} as never);
  assert.ok(row.includes(`class="figure-row"`) && row.includes("a.png") && row.includes("b.png"));
});
