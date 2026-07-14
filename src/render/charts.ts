import { createHash } from "node:crypto";
// Runtime: bare "roughjs" resolves via package.json "main" to the bundled CJS
// build, which really does `module.exports = { canvas, svg, generator, newSeed }`.
// Its shipped bin/rough.d.ts types the default export against ESM-only
// semantics and doesn't line up 1:1 with that CJS shape under NodeNext
// resolution, so we re-declare the slice we use and cast through `unknown`
// (never `any`) rather than trust the mismatched ambient types.
import roughFactory from "roughjs";
import type { RoughGenerator } from "roughjs/bin/generator.js";
import type { Drawable, Config } from "roughjs/bin/core.js";
import { escape } from "./text.ts";

interface RoughFactory {
  generator(config?: Config): RoughGenerator;
}
const rough = roughFactory as unknown as RoughFactory;

type Datum = { label: string; value: number; color?: string };
type BarNode = { title?: string; data: Datum[]; unit?: string; caption?: string };
type DonutNode = { title?: string; data: Datum[]; center_label?: string; caption?: string };
type LinePoint = { x: string; y: number };
type LineSeries = { name: string; color?: string; points: LinePoint[] };
type LineNode = { title?: string; series: LineSeries[]; unit?: string; caption?: string };

const PALETTE = ["green", "blue", "purple", "yellow", "red"] as const;

function seedFor(node: unknown): number {
  const hex = createHash("sha256").update(JSON.stringify(node)).digest("hex").slice(0, 8);
  return (parseInt(hex, 16) % 2147483646) + 1; // roughjs wants 1..2^31
}

function colorOf(d: Datum, i: number): string {
  return d.color && d.color !== "neutral" ? d.color : PALETTE[i % PALETTE.length]!;
}

function fmt(v: number, unit?: string): string {
  const n = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return unit ? `${n}${unit}` : n;
}

function toSvgPaths(g: RoughGenerator, drawable: Drawable): string {
  return g
    .toPaths(drawable)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? "none"}"/>`,
    )
    .join("");
}

function wrap(inner: string, title?: string, caption?: string, legend?: string): string {
  const t = title ? `<h3 translate="no">${escape(title)}</h3>` : "";
  const c = caption ? `<div class="caption" translate="no">${escape(caption)}</div>` : "";
  return `<div class="chart">${t}${inner}${legend ?? ""}${c}</div>`;
}

export function renderChartBar(node: BarNode & { kind?: string }): string {
  const W = 720, H = 340, PAD_L = 20, PAD_R = 20, PAD_T = 30, PAD_B = 58;
  const g = rough.generator({ options: { seed: seedFor(node), roughness: 1.8, bowing: 1.4, stroke: "var(--ink)", strokeWidth: 2 } });
  const max = Math.max(...node.data.map((d) => d.value), 1);
  const innerW = W - PAD_L - PAD_R;
  const slot = innerW / node.data.length;
  const barW = Math.min(72, slot * 0.55);
  const parts: string[] = [];
  // baseline
  parts.push(toSvgPaths(g, g.line(PAD_L, H - PAD_B, W - PAD_R, H - PAD_B)));
  node.data.forEach((d, i) => {
    const h = Math.max(4, ((H - PAD_T - PAD_B) * d.value) / max);
    const x = PAD_L + slot * i + (slot - barW) / 2;
    const y = H - PAD_B - h;
    const color = colorOf(d, i);
    parts.push(
      toSvgPaths(g, g.rectangle(x, y, barW, h, { fill: `var(--${color})`, fillStyle: "hachure", hachureGap: 5, fillWeight: 1.4 })),
    );
    parts.push(`<text class="chart-value" x="${x + barW / 2}" y="${y - 8}" text-anchor="middle">${escape(fmt(d.value, node.unit))}</text>`);
    parts.push(`<text class="chart-label" x="${x + barW / 2}" y="${H - PAD_B + 24}" text-anchor="middle">${escape(d.label)}</text>`);
  });
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(node.title ?? "bar chart")}">${parts.join("")}</svg>`;
  return wrap(svg, node.title, node.caption);
}

export function renderChartDonut(node: DonutNode & { kind?: string }): string {
  const W = 380, H = 300, CX = 190, CY = 150, DIA = 220;
  const g = rough.generator({ options: { seed: seedFor(node), roughness: 1.6, bowing: 1.2, stroke: "var(--ink)", strokeWidth: 2 } });
  const total = node.data.reduce((s, d) => s + d.value, 0) || 1;
  const parts: string[] = [];
  let angle = -Math.PI / 2;
  node.data.forEach((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const color = colorOf(d, i);
    parts.push(
      toSvgPaths(g, g.arc(CX, CY, DIA, DIA, angle, angle + sweep, true, { fill: `var(--${color})`, fillStyle: "hachure", hachureGap: 5, fillWeight: 1.4 })),
    );
    angle += sweep;
  });
  // the hole (plain circle, paper-colored, over the pie)
  parts.push(`<circle cx="${CX}" cy="${CY}" r="62" fill="var(--paper)"/>`);
  parts.push(toSvgPaths(g, g.circle(CX, CY, 124, { fill: "none" })));
  if (node.center_label) {
    parts.push(`<text class="chart-center" x="${CX}" y="${CY + 10}" text-anchor="middle">${escape(node.center_label)}</text>`);
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(node.title ?? "donut chart")}">${parts.join("")}</svg>`;
  const legend = `<div class="chart-legend">${node.data
    .map((d, i) => `<span class="chart-key"><span class="chart-dot" style="background: var(--${colorOf(d, i)})"></span><span translate="no">${escape(d.label)}</span> <span class="chart-key-value" translate="no">${escape(fmt(d.value))}</span></span>`)
    .join("")}</div>`;
  return wrap(svg, node.title, node.caption, legend);
}

export function renderChartLine(node: LineNode & { kind?: string }): string {
  const W = 720, H = 340, PAD_L = 44, PAD_R = 20, PAD_T = 24, PAD_B = 52;
  const g = rough.generator({ options: { seed: seedFor(node), roughness: 1.4, bowing: 1.2, stroke: "var(--ink)", strokeWidth: 2 } });
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  // x categories come from the first series; all series share the x axis
  const xs = node.series[0]!.points.map((p) => p.x);
  const allY = node.series.flatMap((s) => s.points.map((p) => p.y));
  const maxY = Math.max(...allY, 1);
  const minY = Math.min(...allY, 0);
  const spanY = maxY - minY || 1;

  const xAt = (i: number) => PAD_L + (xs.length === 1 ? innerW / 2 : (innerW * i) / (xs.length - 1));
  const yAt = (y: number) => PAD_T + innerH - (innerH * (y - minY)) / spanY;

  const parts: string[] = [];
  // axes
  parts.push(toSvgPaths(g, g.line(PAD_L, PAD_T, PAD_L, PAD_T + innerH)));
  parts.push(toSvgPaths(g, g.line(PAD_L, PAD_T + innerH, W - PAD_R, PAD_T + innerH)));
  // x labels
  xs.forEach((x, i) => {
    parts.push(`<text class="chart-label" x="${xAt(i)}" y="${PAD_T + innerH + 24}" text-anchor="middle">${escape(x)}</text>`);
  });
  // y min/max ticks
  parts.push(`<text class="chart-value" x="${PAD_L - 8}" y="${yAt(maxY) + 4}" text-anchor="end">${escape(fmt(maxY, node.unit))}</text>`);
  parts.push(`<text class="chart-value" x="${PAD_L - 8}" y="${yAt(minY) + 4}" text-anchor="end">${escape(fmt(minY, node.unit))}</text>`);
  // one polyline per series
  node.series.forEach((s, si) => {
    const color = s.color && s.color !== "neutral" ? s.color : PALETTE[si % PALETTE.length]!;
    const pts: [number, number][] = s.points.map((p, i) => [xAt(i), yAt(p.y)]);
    parts.push(
      g.toPaths(g.linearPath(pts, { stroke: `var(--${color})`, strokeWidth: 2.5 }))
        .map((p) => `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none"/>`)
        .join(""),
    );
    // vertex dots
    pts.forEach(([cx, cy]) => parts.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="var(--${color})" stroke="var(--ink)" stroke-width="1"/>`));
  });

  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(node.title ?? "line chart")}">${parts.join("")}</svg>`;
  const legend = `<div class="chart-legend">${node.series
    .map((s, si) => {
      const color = s.color && s.color !== "neutral" ? s.color : PALETTE[si % PALETTE.length]!;
      return `<span class="chart-key"><span class="chart-dot" style="background: var(--${color})"></span><span translate="no">${escape(s.name)}</span></span>`;
    })
    .join("")}</div>`;
  return wrap(svg, node.title, node.caption, legend);
}
