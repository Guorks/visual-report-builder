import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readdirSync, utimesSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// prune reads VRB_CACHE_DIR; set it before importing the module fresh each run
test("prune removes png+json as a pair by the newer file's age; never orphans", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vrb-cache-"));
  process.env["VRB_CACHE_DIR"] = dir;
  // @ts-ignore - query string forces fresh module import at runtime
  const cache = await import("../cache.ts?prune-test");
  const hash = "abc123";
  writeFileSync(join(dir, `${hash}.png`), "png");
  writeFileSync(join(dir, `${hash}.json`), JSON.stringify({ hash, prompt: "p", model: "m", credits: 2, created_at: "x" }));
  // make the PNG old but the JSON new — the pair must be judged by the NEWER (json), so NOT pruned
  const oldSecs = (Date.now() - 40 * 864e5) / 1000;
  const nowSecs = Date.now() / 1000;
  utimesSync(join(dir, `${hash}.png`), oldSecs, oldSecs);
  utimesSync(join(dir, `${hash}.json`), nowSecs, nowSecs);
  let res = cache.prune(30);
  assert.equal(res.pruned, 0, "pair with a fresh json must survive");
  assert.ok(existsSync(join(dir, `${hash}.png`)) && existsSync(join(dir, `${hash}.json`)));
  // now make BOTH old → pruned together
  utimesSync(join(dir, `${hash}.png`), oldSecs, oldSecs);
  utimesSync(join(dir, `${hash}.json`), oldSecs, oldSecs);
  res = cache.prune(30);
  assert.equal(res.pruned, 1);
  assert.equal(readdirSync(dir).length, 0, "both files removed, no orphan");
});
