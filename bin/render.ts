#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { ZodError } from "zod";
import { renderReport, InlineHtmlError, type ImageMode } from "../src/render/index.ts";

function fail(msg: string, code = 1): never {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv: string[]): { input: string; out?: string; imageMode: ImageMode; strictHtml: boolean } {
  const args = argv.slice(2);
  if (args.length === 0) {
    fail("usage: tsx bin/render.ts <report.json> [--out <path>] [--image-mode local|cdn] [--strict-html]", 2);
  }
  let input: string | undefined;
  let out: string | undefined;
  let imageMode: ImageMode = "local";
  let strictHtml = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--out") {
      out = args[++i];
      if (!out) fail("--out requires a path", 2);
    } else if (a === "--image-mode") {
      const v = args[++i];
      if (v !== "local" && v !== "cdn") fail("--image-mode must be 'local' or 'cdn'", 2);
      imageMode = v;
    } else if (a.startsWith("--image-mode=")) {
      const v = a.slice("--image-mode=".length);
      if (v !== "local" && v !== "cdn") fail("--image-mode must be 'local' or 'cdn'", 2);
      imageMode = v;
    } else if (a === "--strict-html") {
      strictHtml = true;
    } else if (!input) {
      input = a;
    } else {
      fail(`unexpected argument: ${a}`, 2);
    }
  }
  if (!input) fail("missing input path", 2);
  return { input, out, imageMode, strictHtml };
}

const { input, out, imageMode, strictHtml } = parseArgs(process.argv);
const inputPath = resolve(input);
let raw: unknown;
try {
  raw = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (e) {
  fail(`failed to read/parse ${inputPath}: ${(e as Error).message}`);
}

let html: string;
try {
  html = renderReport(raw, {
    imageMode,
    strictHtml,
    onWarning: (w) => process.stderr.write(`warn: ${w}\n`),
  });
} catch (e) {
  if (e instanceof ZodError) {
    const issues = e.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    fail(`schema validation failed:\n${issues}`);
  }
  if (e instanceof InlineHtmlError) {
    const issues = e.errors.map((err) => `  ${err}`).join("\n");
    fail(`inline html violations:\n${issues}`);
  }
  fail(`render failed: ${(e as Error).message}`);
}

const outPath = out
  ? resolve(out)
  : resolve(dirname(inputPath), basename(inputPath, ".json") + ".html");
writeFileSync(outPath, html, "utf8");
process.stdout.write(`${outPath}\n`);
