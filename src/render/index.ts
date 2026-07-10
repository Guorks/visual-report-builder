import { Report } from "../schema.ts";
import { renderDocument } from "./layout.ts";
import { lintReport } from "./inline-lint.ts";

export type ImageMode = "local" | "cdn";
export type RenderOptions = {
  imageMode?: ImageMode;
  strictHtml?: boolean;
  onWarning?: (msg: string) => void;
};

export class InlineHtmlError extends Error {
  constructor(public errors: string[]) {
    super(`inline html violations:\n${errors.map((e) => `  ${e}`).join("\n")}`);
  }
}

export function renderReport(report: unknown, opts: RenderOptions = {}): string {
  const parsed = Report.parse(report);
  const lint = lintReport(parsed);
  const errors = opts.strictHtml ? [...lint.errors, ...lint.warnings] : lint.errors;
  if (errors.length) throw new InlineHtmlError(errors);
  if (opts.onWarning) for (const w of lint.warnings) opts.onWarning(w);
  return renderDocument(parsed, opts);
}

export { Report, renderDocument };
