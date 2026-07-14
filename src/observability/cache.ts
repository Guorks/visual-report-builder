import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const CACHE_ROOT = process.env["VRB_CACHE_DIR"]
  ? resolve(process.env["VRB_CACHE_DIR"])
  : join(homedir(), ".cache", "visual-report-builder");

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

export function promptHash(prompt: string, model: string): string {
  return createHash("sha256").update(`${model}\n${prompt}`).digest("hex");
}

export type CachedEntry = {
  hash: string;
  prompt: string;
  model: string;
  credits: number;
  created_at: string;
  src_cdn?: string;
};

export function lookup(prompt: string, model: string): CachedEntry | null {
  ensureDir(CACHE_ROOT);
  const hash = promptHash(prompt, model);
  const png = join(CACHE_ROOT, `${hash}.png`);
  const meta = join(CACHE_ROOT, `${hash}.json`);
  if (!existsSync(png) || !existsSync(meta)) return null;
  return JSON.parse(readFileSync(meta, "utf8")) as CachedEntry;
}

export function store(
  prompt: string,
  model: string,
  sourcePng: string,
  credits: number,
  srcCdn?: string,
): CachedEntry {
  ensureDir(CACHE_ROOT);
  const hash = promptHash(prompt, model);
  const entry: CachedEntry = {
    hash,
    prompt,
    model,
    credits,
    created_at: new Date().toISOString(),
    ...(srcCdn ? { src_cdn: srcCdn } : {}),
  };
  copyFileSync(sourcePng, join(CACHE_ROOT, `${hash}.png`));
  writeFileSync(join(CACHE_ROOT, `${hash}.json`), JSON.stringify(entry, null, 2), "utf8");
  return entry;
}

export function copyToOutput(hash: string, destPath: string): void {
  ensureDir(dirname(destPath));
  copyFileSync(join(CACHE_ROOT, `${hash}.png`), destPath);
}

export function list(): CachedEntry[] {
  ensureDir(CACHE_ROOT);
  return readdirSync(CACHE_ROOT)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(CACHE_ROOT, f), "utf8")) as CachedEntry);
}

export function prune(maxAgeDays: number): { pruned: number; remaining: number } {
  ensureDir(CACHE_ROOT);
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let pruned = 0;
  // get all unique hashes from .json files
  const hashes = new Set<string>();
  for (const f of readdirSync(CACHE_ROOT)) {
    if (f.endsWith(".json")) {
      const hash = f.replace(".json", "");
      hashes.add(hash);
    }
  }
  // judge each pair by the NEWER file's mtime; delete both if past cutoff
  for (const hash of hashes) {
    const png = join(CACHE_ROOT, `${hash}.png`);
    const json = join(CACHE_ROOT, `${hash}.json`);
    // skip if either file is missing (don't crash)
    if (!existsSync(png) || !existsSync(json)) continue;
    // get max mtime of the pair
    const pngMtime = statSync(png).mtimeMs;
    const jsonMtime = statSync(json).mtimeMs;
    const maxMtime = Math.max(pngMtime, jsonMtime);
    // delete both if past cutoff
    if (maxMtime < cutoff) {
      unlinkSync(png);
      unlinkSync(json);
      pruned++;
    }
  }
  return { pruned, remaining: list().length };
}

export const CACHE_DIR = CACHE_ROOT;
