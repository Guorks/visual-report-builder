import type { Report } from "../schema.ts";
import { countWords } from "./structural.ts";

export type ToneExpected = {
  tone_must_include_any_of?: string[];
  tone_must_avoid?: string[];
};

export type ToneResult = {
  passed: boolean;
  failures: string[];
};

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractProse(report: Report): string {
  const buf: string[] = [];
  const visit = (s: unknown): void => {
    if (typeof s !== "object" || s === null) return;
    for (const [, v] of Object.entries(s as Record<string, unknown>)) {
      if (typeof v === "string") buf.push(stripTags(v));
      else if (Array.isArray(v)) for (const x of v) visit(x);
      else if (typeof v === "object" && v !== null) visit(v);
    }
  };
  visit(report);
  return buf.join(" ").toLowerCase();
}

export function evaluateTone(report: Report, expected: ToneExpected): ToneResult {
  const prose = extractProse(report);
  const failures: string[] = [];

  if (expected.tone_must_include_any_of && expected.tone_must_include_any_of.length > 0) {
    const hit = expected.tone_must_include_any_of.some((phrase) =>
      prose.includes(phrase.toLowerCase()),
    );
    if (!hit) {
      failures.push(
        `tone_must_include_any_of: none of [${expected.tone_must_include_any_of.join(", ")}] found`,
      );
    }
  }

  if (expected.tone_must_avoid) {
    for (const phrase of expected.tone_must_avoid) {
      if (prose.includes(phrase.toLowerCase())) {
        failures.push(`tone_must_avoid: forbidden phrase "${phrase}" found`);
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

export { countWords };
