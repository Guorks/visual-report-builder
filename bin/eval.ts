#!/usr/bin/env tsx
import { resolve } from "node:path";
import { evalAll, summarize } from "../src/eval/runner.ts";

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const opts: { judge?: boolean; filter?: string; goldset?: string } = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--judge") opts.judge = true;
    else if (a === "--filter") opts.filter = args[++i];
    else if (a === "--goldset") opts.goldset = args[++i];
    else if (a === "-h" || a === "--help") {
      process.stdout.write(
        "usage: tsx bin/eval.ts [--judge] [--filter <substring>] [--goldset <dir>]\n",
      );
      process.exit(0);
    } else {
      process.stderr.write(`unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return opts;
}

const opts = parseArgs(process.argv);
const dir = resolve(opts.goldset ?? "evals/goldset");

const results = await evalAll(dir, { judge: opts.judge, filter: opts.filter });
process.stdout.write(summarize(results) + "\n");

const anyFail = results.some(
  (r) => r.status !== "pass" && r.status !== "missing-snapshot",
);
const anyMissing = results.some((r) => r.status === "missing-snapshot");
const anyJudgeFail = results.some((r) => r.status === "judge-fail");

if (anyJudgeFail) process.exit(2);
if (anyFail) process.exit(1);
if (anyMissing) process.exit(3);
process.exit(0);
