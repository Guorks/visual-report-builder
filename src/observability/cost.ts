import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type CostEntry = {
  prompt_hash: string;
  prompt_preview: string;
  credits: number;
  cached: boolean;
};

export class CostLedger {
  private readonly entries: CostEntry[] = [];

  record(entry: CostEntry): void {
    this.entries.push(entry);
  }

  totalCredits(): number {
    return this.entries.reduce((s, e) => s + (e.cached ? 0 : e.credits), 0);
  }

  cacheHits(): number {
    return this.entries.filter((e) => e.cached).length;
  }

  cacheMisses(): number {
    return this.entries.filter((e) => !e.cached).length;
  }

  flush(path: string): void {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const payload = {
      total_credits: this.totalCredits(),
      cache_hits: this.cacheHits(),
      cache_misses: this.cacheMisses(),
      credits_by_prompt: this.entries,
    };
    writeFileSync(path, JSON.stringify(payload, null, 2), "utf8");
  }
}
