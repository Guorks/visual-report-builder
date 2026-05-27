#!/usr/bin/env tsx
import { CACHE_DIR, list, prune } from "../src/observability/cache.ts";

function usage(): never {
  process.stdout.write("usage: tsx bin/cache.ts <list|prune|info> [--max-age-days N]\n");
  process.exit(2);
}

const args = process.argv.slice(2);
const sub = args[0];
if (!sub) usage();

if (sub === "info") {
  const entries = list();
  process.stdout.write(`cache_dir: ${CACHE_DIR}\nentries: ${entries.length}\n`);
  const totalCredits = entries.reduce((s, e) => s + e.credits, 0);
  process.stdout.write(`stored_credits_equivalent: ${totalCredits}\n`);
} else if (sub === "list") {
  for (const e of list()) {
    const preview = e.prompt.replace(/\s+/g, " ").slice(0, 70);
    process.stdout.write(`${e.hash.slice(0, 12)}  ${e.created_at}  ${preview}\n`);
  }
} else if (sub === "prune") {
  let days = 30;
  const i = args.indexOf("--max-age-days");
  if (i >= 0) {
    const v = args[i + 1];
    if (!v) usage();
    days = Number.parseInt(v, 10);
    if (Number.isNaN(days)) usage();
  }
  const { pruned, remaining } = prune(days);
  process.stdout.write(`pruned ${pruned}, remaining ${remaining}\n`);
} else {
  usage();
}
