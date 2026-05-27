import { Report } from "../schema.ts";
import { renderDocument } from "./layout.ts";

export function renderReport(report: unknown): string {
  const parsed = Report.parse(report);
  return renderDocument(parsed);
}

export { Report, renderDocument };
