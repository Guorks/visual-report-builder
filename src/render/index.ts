import { Report, type SectionNode } from "../schema.ts";
import { renderDocument } from "./layout.ts";
import { lintReport } from "./inline-lint.ts";
import { lintCustomNode } from "./custom-lint.ts";

export type ImageMode = "local" | "cdn";
export type RenderOptions = {
  imageMode?: ImageMode;
  strictHtml?: boolean;
  embedFonts?: boolean;
  onWarning?: (msg: string) => void;
};

export class InlineHtmlError extends Error {
  constructor(public errors: string[]) {
    super(`inline html violations:\n${errors.map((e) => `  ${e}`).join("\n")}`);
  }
}

type CustomNode = Extract<SectionNode, { kind: "custom" }>;

function collectCustomNodes(sections: SectionNode[], pathPrefix: string): Array<{ node: CustomNode; path: string }> {
  const out: Array<{ node: CustomNode; path: string }> = [];
  sections.forEach((s, i) => {
    const path = `${pathPrefix}[${i}]`;
    if (s.kind === "custom") out.push({ node: s, path });
    else if (s.kind === "grid-2" || s.kind === "grid-3") {
      (s.cells as SectionNode[][]).forEach((cell, ci) =>
        out.push(...collectCustomNodes(cell, `${path}.cells[${ci}]`)),
      );
    }
  });
  return out;
}

export function collectCustomCss(report: Report): string {
  return collectCustomNodes(report.sections, "sections")
    .map(({ node }) => node.css)
    .filter((c): c is string => Boolean(c))
    .join("\n");
}

function collectFigures(report: Report): Array<{ hasCdn: boolean; path: string }> {
  const out: Array<{ hasCdn: boolean; path: string }> = [];
  const push = (f: { src_cdn?: string }, path: string) => out.push({ hasCdn: Boolean(f.src_cdn), path });
  if (report.hero.figure) push(report.hero.figure, "hero.figure");
  const walk = (sections: SectionNode[], prefix: string) => {
    sections.forEach((s, i) => {
      const p = `${prefix}[${i}]`;
      if (s.kind === "figure") push(s, p);
      else if (s.kind === "figure-row") s.figures.forEach((f, fi) => push(f, `${p}.figures[${fi}]`));
      else if (s.kind === "grid-2" || s.kind === "grid-3") (s.cells as SectionNode[][]).forEach((cell, ci) => walk(cell, `${p}.cells[${ci}]`));
    });
  };
  walk(report.sections, "sections");
  return out;
}

export function renderReport(report: unknown, opts: RenderOptions = {}): string {
  const parsed = Report.parse(report);
  const lint = lintReport(parsed);
  const customNodes = collectCustomNodes(parsed.sections, "sections");
  const errors = [...lint.errors];
  const warnings = [...lint.warnings];
  for (const { node, path } of customNodes) {
    const r = lintCustomNode(node, path);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  const gated = opts.strictHtml ? [...errors, ...warnings] : errors;
  if (gated.length) throw new InlineHtmlError(gated);
  if (opts.onWarning) for (const w of warnings) opts.onWarning(w);
  if (opts.imageMode === "cdn" && opts.onWarning) {
    for (const f of collectFigures(parsed)) {
      if (!f.hasCdn) opts.onWarning(`${f.path}: no src_cdn — figure will fall back to local src (not shareable by URL)`);
    }
  }
  const customCss = customNodes.map(({ node }) => node.css).filter(Boolean).join("\n");
  return renderDocument(parsed, opts, customCss);
}

export { Report, renderDocument };
