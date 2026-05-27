import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { Report } from "../schema.ts";
import { evaluateStructural, type Expected } from "./structural.ts";
import { evaluateTone, type ToneExpected } from "./tone.ts";
import { judge as runJudge, type JudgeResult } from "./judge.ts";

export type GoldsetEntry = {
  prompt: string;
  expected: Expected & ToneExpected;
  snapshot_report_json: string;
};

export type EntryResult = {
  name: string;
  status: "pass" | "fail" | "missing-snapshot" | "structural-fail" | "tone-fail" | "judge-fail";
  structural?: ReturnType<typeof evaluateStructural>;
  tone?: ReturnType<typeof evaluateTone>;
  judge?: JudgeResult;
};

export async function evalAll(
  goldsetDir: string,
  opts: { judge?: boolean; filter?: string } = {},
): Promise<EntryResult[]> {
  const entries = readdirSync(goldsetDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const results: EntryResult[] = [];

  for (const file of entries) {
    const name = basename(file, ".json");
    if (opts.filter && !name.includes(opts.filter)) continue;

    const entryPath = resolve(goldsetDir, file);
    const entry = JSON.parse(readFileSync(entryPath, "utf8")) as GoldsetEntry;
    const snapPath = resolve(dirname(entryPath), entry.snapshot_report_json);

    if (!existsSync(snapPath)) {
      results.push({ name, status: "missing-snapshot" });
      continue;
    }

    const raw = JSON.parse(readFileSync(snapPath, "utf8"));
    const parsed = Report.safeParse(raw);
    if (!parsed.success) {
      results.push({
        name,
        status: "structural-fail",
        structural: {
          passed: false,
          failures: parsed.error.issues.map((i) => `schema: ${i.path.join(".")}: ${i.message}`),
        },
      });
      continue;
    }
    const report = parsed.data;
    const structural = evaluateStructural(report, entry.expected);
    const tone = evaluateTone(report, entry.expected);

    let judgeResult: JudgeResult | undefined;
    if (opts.judge && structural.passed && tone.passed) {
      judgeResult = await runJudge(report, entry.expected.type, entry.expected.audience);
    }

    const passed =
      structural.passed && tone.passed && (judgeResult ? judgeResult.passed : true);

    let status: EntryResult["status"] = "pass";
    if (!structural.passed) status = "structural-fail";
    else if (!tone.passed) status = "tone-fail";
    else if (judgeResult && !judgeResult.passed) status = "judge-fail";

    results.push({
      name,
      status: passed ? "pass" : status,
      structural,
      tone,
      judge: judgeResult,
    });
  }

  return results;
}

export function summarize(results: EntryResult[]): string {
  const lines: string[] = [];
  let pass = 0;
  let fail = 0;
  let missing = 0;
  for (const r of results) {
    const tag = r.status === "pass" ? "✓" : r.status === "missing-snapshot" ? "?" : "✗";
    lines.push(`  ${tag} ${r.name} — ${r.status}`);
    if (r.structural && !r.structural.passed) {
      for (const f of r.structural.failures) lines.push(`      [structural] ${f}`);
    }
    if (r.tone && !r.tone.passed) {
      for (const f of r.tone.failures) lines.push(`      [tone] ${f}`);
    }
    if (r.judge && !r.judge.passed) {
      for (const f of r.judge.failures) lines.push(`      [judge] ${f}`);
    }
    if (r.status === "pass") pass++;
    else if (r.status === "missing-snapshot") missing++;
    else fail++;
  }
  lines.push("");
  lines.push(`  ${pass} pass · ${fail} fail · ${missing} missing-snapshot · ${results.length} total`);
  return lines.join("\n");
}
