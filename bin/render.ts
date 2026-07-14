#!/usr/bin/env tsx
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, resolve, basename, join } from "node:path";
import { ZodError } from "zod";
import { renderReport, InlineHtmlError, Report, type ImageMode } from "../src/render/index.ts";
import type { SectionNode } from "../src/schema.ts";

function collectCustomNotes(sections: SectionNode[]): string[] {
  const notes: string[] = [];
  for (const s of sections) {
    if (s.kind === "custom") notes.push(s.note);
    else if (s.kind === "grid-2" || s.kind === "grid-3") {
      for (const cell of s.cells as SectionNode[][]) notes.push(...collectCustomNotes(cell));
    }
  }
  return notes;
}

function fail(msg: string, code = 1): never {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv: string[]): { input: string; out?: string; imageMode: ImageMode; strictHtml: boolean; embedFonts: boolean; validate: boolean } {
  const args = argv.slice(2);
  if (args.length === 0) {
    fail("usage: tsx bin/render.ts <report.json> [--out <path>] [--image-mode local|cdn (default cdn)] [--strict-html] [--embed-fonts] [--validate]", 2);
  }
  let input: string | undefined;
  let out: string | undefined;
  let imageMode: ImageMode = "cdn";
  let strictHtml = false;
  let embedFonts = false;
  let validate = false;
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
    } else if (a === "--embed-fonts") {
      embedFonts = true;
    } else if (a === "--validate") {
      validate = true;
    } else if (!input) {
      input = a;
    } else {
      fail(`unexpected argument: ${a}`, 2);
    }
  }
  if (!input) fail("missing input path", 2);
  return { input, out, imageMode, strictHtml, embedFonts, validate };
}

const { input, out, imageMode, strictHtml, embedFonts, validate } = parseArgs(process.argv);
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
    embedFonts,
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

if (validate) {
  process.stdout.write(`valid: ${inputPath}\n`);
  process.exit(0);
}

const outPath = out
  ? resolve(out)
  : resolve(dirname(inputPath), basename(inputPath, ".json") + ".html");
writeFileSync(outPath, html, "utf8");

const customNotes = collectCustomNotes(Report.parse(raw).sections);
if (customNotes.length) {
  const tracePath = join(dirname(outPath), ".trace.jsonl");
  for (const note of customNotes) {
    appendFileSync(tracePath, JSON.stringify({ event: "custom_block_used", note, ts: null }) + "\n");
  }
}

process.stdout.write(`${outPath}\n`);
