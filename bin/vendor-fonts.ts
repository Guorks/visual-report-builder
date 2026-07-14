#!/usr/bin/env tsx
// One-time vendoring script: downloads the latin-subset woff2 files the design
// system needs from Google Fonts and writes them to vendor/fonts/. Re-run this
// if the font families/weights in src/render/layout.ts (FONTS_LINK) change.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// slug → { googleFamily, weights } — slug is used for the output filename
// (<slug>-<weight>.woff2) and must match FAMILY_BY_SLUG in src/render/fonts.ts.
const FAMILIES: Array<{ slug: string; googleFamily: string; weights: number[] }> = [
  { slug: "caveat", googleFamily: "Caveat", weights: [500, 700] },
  { slug: "inter", googleFamily: "Inter", weights: [400, 500, 600] },
  { slug: "outfit", googleFamily: "Outfit", weights: [500, 600, 700] },
  { slug: "jetbrainsmono", googleFamily: "JetBrains+Mono", weights: [400, 500] },
];

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../vendor/fonts");

function extractLatinWoff2Url(css: string): string | null {
  // Blocks look like: /* latin */\n@font-face { ... src: url(...woff2) ... }
  const blocks = css.split(/(?=\/\*\s*[\w-]+\s*\*\/)/);
  for (const block of blocks) {
    const commentMatch = /^\/\*\s*([\w-]+)\s*\*\//.exec(block.trim());
    if (!commentMatch || commentMatch[1] !== "latin") continue;
    const urlMatch = /src:\s*url\((https:\/\/[^)]+\.woff2)\)/.exec(block);
    if (urlMatch) return urlMatch[1]!;
  }
  return null;
}

async function fetchWithRetry(url: string, headers: Record<string, string>): Promise<Response> {
  try {
    return await fetch(url, { headers });
  } catch {
    return await fetch(url, { headers });
  }
}

async function vendorOne(slug: string, googleFamily: string, weight: number): Promise<{ slug: string; weight: number; bytes: number } | null> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${googleFamily}:wght@${weight}&display=swap`;
  const cssRes = await fetchWithRetry(cssUrl, { "User-Agent": UA });
  if (!cssRes.ok) {
    console.error(`FAILED: ${slug}-${weight} — css2 fetch returned ${cssRes.status}`);
    return null;
  }
  const css = await cssRes.text();
  const woff2Url = extractLatinWoff2Url(css);
  if (!woff2Url) {
    console.error(`FAILED: ${slug}-${weight} — no latin woff2 url found in css2 response`);
    return null;
  }
  const fontRes = await fetchWithRetry(woff2Url, { "User-Agent": UA });
  if (!fontRes.ok) {
    console.error(`FAILED: ${slug}-${weight} — woff2 download returned ${fontRes.status}`);
    return null;
  }
  const buf = Buffer.from(await fontRes.arrayBuffer());
  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `${slug}-${weight}.woff2`);
  writeFileSync(outPath, buf);
  return { slug, weight, bytes: buf.length };
}

async function main() {
  const manifest: Array<{ slug: string; weight: number; bytes: number }> = [];
  const failures: string[] = [];
  for (const { slug, googleFamily, weights } of FAMILIES) {
    for (const weight of weights) {
      const result = await vendorOne(slug, googleFamily, weight);
      if (result) manifest.push(result);
      else failures.push(`${slug}-${weight}`);
    }
  }
  console.log("\nManifest:");
  for (const m of manifest) {
    console.log(`  ${m.slug}-${m.weight}.woff2  ${m.bytes} bytes`);
  }
  const totalBytes = manifest.reduce((sum, m) => sum + m.bytes, 0);
  console.log(`\nVendored ${manifest.length} files, ${totalBytes} bytes total.`);
  if (failures.length) {
    console.error(`\nFAILED: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main();
