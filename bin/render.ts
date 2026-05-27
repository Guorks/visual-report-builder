#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { ZodError } from "zod";
import { renderReport } from "../src/render/index.ts";

function fail(msg: string, code = 1): never {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv: string[]): { input: string; out?: string } {
  const args = argv.slice(2);
  if (args.length === 0) {
    fail("usage: tsx bin/render.ts <report.json> [--out <path>]", 2);
  }
  let input: string | undefined;
  let out: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--out") {
      out = args[++i];
      if (!out) fail("--out requires a path", 2);
    } else if (!input) {
      input = a;
    } else {
      fail(`unexpected argument: ${a}`, 2);
    }
  }
  if (!input) fail("missing input path", 2);
  return { input, out };
}

const { input, out } = parseArgs(process.argv);
const inputPath = resolve(input);
let raw: unknown;
try {
  raw = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (e) {
  fail(`failed to read/parse ${inputPath}: ${(e as Error).message}`);
}

let html: string;
try {
  html = renderReport(raw);
} catch (e) {
  if (e instanceof ZodError) {
    const issues = e.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    fail(`schema validation failed:\n${issues}`);
  }
  fail(`render failed: ${(e as Error).message}`);
}

const outPath = out
  ? resolve(out)
  : resolve(dirname(inputPath), basename(inputPath, ".json") + ".html");
writeFileSync(outPath, html, "utf8");
process.stdout.write(`${outPath}\n`);
