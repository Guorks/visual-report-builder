import { Report } from "../schema.ts";
import { renderDocument } from "./layout.ts";

export type ImageMode = "local" | "cdn";
export type RenderOptions = { imageMode?: ImageMode };

export function renderReport(report: unknown, opts: RenderOptions = {}): string {
  const parsed = Report.parse(report);
  return renderDocument(parsed, opts);
}

export { Report, renderDocument };
