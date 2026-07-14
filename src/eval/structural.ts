import type { Report, SectionNode } from "../schema.ts";

export type Expected = {
  type: string;
  audience: string;
  language: string;
  section_titles_must_include?: string[];
  image_count_range?: [number, number];
  word_count_range?: [number, number];
  required_node_kinds?: string[];
  max_custom_blocks?: number;
};

export type StructuralResult = {
  passed: boolean;
  failures: string[];
};

function collectText(node: SectionNode, out: string[]): void {
  switch (node.kind) {
    case "h2":
    case "h3":
      out.push(node.text);
      return;
    case "paragraph":
      out.push(stripTags(node.body));
      return;
    case "pre":
      out.push(node.body);
      return;
    case "figure":
      if (node.caption) out.push(node.caption);
      return;
    case "status-panel":
      out.push(node.tag, node.heading, stripTags(node.paragraph));
      if (node.progress) out.push(...node.progress.labels, stripTags(node.progress.note));
      return;
    case "card":
      if (node.title) out.push(node.title);
      out.push(stripTags(node.body));
      return;
    case "cards-2":
    case "cards-3":
      for (const c of node.cards) {
        if (c.title) out.push(c.title);
        out.push(stripTags(c.body));
      }
      return;
    case "done-list":
    case "pending-list":
      for (const it of node.items) out.push(stripTags(it));
      return;
    case "steps":
      for (const s of node.items) {
        out.push(s.title, stripTags(s.body));
        if (s.small) out.push(s.small);
      }
      return;
    case "check-table":
      for (const r of node.rows) for (const c of r) out.push(stripTags(c));
      return;
    case "gotcha":
      out.push(node.title, stripTags(node.body));
      return;
    case "handwrite":
    case "scribble":
      out.push(node.text);
      return;
    case "tester-pills":
      out.push(...node.items);
      return;
    case "badge-row":
      for (const b of node.items) out.push(b.text);
      return;
    case "grid-2":
    case "grid-3":
      for (const cell of node.cells) for (const inner of cell) collectText(inner, out);
      return;
    case "callout":
      if (node.title) out.push(node.title);
      out.push(stripTags(node.body));
      return;
    case "stat-row":
      for (const s of node.items) { out.push(s.value, s.label); if (s.note) out.push(s.note); }
      return;
    case "timeline":
      for (const it of node.items) { out.push(it.time); if (it.title) out.push(it.title); out.push(stripTags(it.body)); }
      return;
    case "cta-card":
      out.push(node.title, stripTags(node.body), node.action.label);
      return;
    case "action-list":
      for (const a of node.items) { out.push(stripTags(a.text)); if (a.owner) out.push(a.owner); if (a.due) out.push(a.due); }
      return;
    case "quote":
      out.push(node.text);
      if (node.attribution) out.push(node.attribution);
      return;
    case "figure-row":
      for (const f of node.figures) if (f.caption) out.push(f.caption);
      return;
    case "chart-bar":
    case "chart-donut":
      if (node.title) out.push(node.title);
      for (const d of node.data) out.push(d.label);
      if (node.caption) out.push(node.caption);
      return;
    case "chart-line":
      if (node.title) out.push(node.title);
      for (const s of node.series) { out.push(s.name); for (const p of s.points) out.push(p.x); }
      if (node.caption) out.push(node.caption);
      return;
    case "custom":
      out.push(stripTags(node.html));
      return;
    case "divider":
      return;
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function countWords(report: Report): number {
  const buf: string[] = [];
  buf.push(report.hero.kicker, report.hero.h1_pre, report.hero.h1_accent, report.hero.h1_post, report.hero.lede);
  for (const s of report.sections) collectText(s, buf);
  for (const l of report.meta.footer_lines) buf.push(l);
  return buf.join(" ").split(/\s+/).filter(Boolean).length;
}

export function countImages(report: Report): number {
  let n = 0;
  const walk = (node: SectionNode): void => {
    if (node.kind === "figure") n++;
    if (node.kind === "figure-row") n += node.figures.length;
    if (node.kind === "grid-2" || node.kind === "grid-3") {
      for (const cell of node.cells) for (const inner of cell) walk(inner);
    }
  };
  for (const s of report.sections) walk(s);
  return n;
}

export function countCustomBlocks(report: Report): number {
  let n = 0;
  const walk = (node: SectionNode): void => {
    if (node.kind === "custom") n++;
    if (node.kind === "grid-2" || node.kind === "grid-3") {
      for (const cell of node.cells) for (const inner of cell) walk(inner);
    }
  };
  for (const s of report.sections) walk(s);
  return n;
}

export function collectSectionTitles(report: Report): string[] {
  const titles: string[] = [];
  for (const s of report.sections) {
    if (s.kind === "h2") titles.push(s.text);
  }
  return titles;
}

export function collectNodeKinds(report: Report): Set<string> {
  const kinds = new Set<string>();
  const walk = (node: SectionNode): void => {
    kinds.add(node.kind);
    if (node.kind === "grid-2" || node.kind === "grid-3") {
      for (const cell of node.cells) for (const inner of cell) walk(inner);
    }
  };
  for (const s of report.sections) walk(s);
  return kinds;
}

export function evaluateStructural(
  report: Report,
  expected: Expected,
): StructuralResult {
  const failures: string[] = [];

  if (report.meta.type !== expected.type) {
    failures.push(`meta.type expected=${expected.type} actual=${report.meta.type}`);
  }
  if (report.meta.audience !== expected.audience) {
    failures.push(`meta.audience expected=${expected.audience} actual=${report.meta.audience}`);
  }
  if (report.meta.language !== expected.language) {
    failures.push(`meta.language expected=${expected.language} actual=${report.meta.language}`);
  }

  if (expected.section_titles_must_include) {
    const titles = collectSectionTitles(report);
    for (const req of expected.section_titles_must_include) {
      const found = titles.some((t) => t.toLowerCase().includes(req.toLowerCase()));
      if (!found) failures.push(`missing section title containing "${req}"`);
    }
  }

  if (expected.image_count_range) {
    const [lo, hi] = expected.image_count_range;
    const n = countImages(report);
    if (n < lo || n > hi) failures.push(`image_count=${n} outside [${lo},${hi}]`);
  }

  if (expected.word_count_range) {
    const [lo, hi] = expected.word_count_range;
    const n = countWords(report);
    if (n < lo || n > hi) failures.push(`word_count=${n} outside [${lo},${hi}]`);
  }

  if (expected.required_node_kinds) {
    const kinds = collectNodeKinds(report);
    for (const k of expected.required_node_kinds) {
      if (!kinds.has(k)) failures.push(`required node kind missing: ${k}`);
    }
  }

  if (expected.max_custom_blocks !== undefined) {
    const n = countCustomBlocks(report);
    if (n > expected.max_custom_blocks) failures.push(`custom_blocks=${n} exceeds max ${expected.max_custom_blocks}`);
  }

  return { passed: failures.length === 0, failures };
}
