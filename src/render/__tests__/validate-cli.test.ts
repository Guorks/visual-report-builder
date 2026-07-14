// src/render/__tests__/validate-cli.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const bin = join(root, "bin/render.ts");
const tmp = join(here, "_validate-fixture.json");

const good = JSON.stringify({
  meta: { title: "t", language: "en", type: "status", audience: "engineers", date: "d", project: "p", footer_lines: ["f"] },
  hero: { kicker: "k", h1_pre: "", h1_accent: "A", h1_post: "", lede: "l" },
  sections: [{ kind: "paragraph", body: "hello" }],
});

test("--validate prints valid and writes no file for a good report", () => {
  writeFileSync(tmp, good);
  const outPath = join(here, "_should-not-exist.html");
  const stdout = execFileSync("npx", ["tsx", bin, tmp, "--validate", "--out", outPath], { cwd: root, encoding: "utf8" });
  assert.match(stdout, /valid/);
  assert.equal(existsSync(outPath), false, "must not write output in validate mode");
  rmSync(tmp, { force: true });
});

test("--validate exits non-zero on a bad report", () => {
  writeFileSync(tmp, JSON.stringify({ meta: {}, hero: {}, sections: [] }));
  assert.throws(() => execFileSync("npx", ["tsx", bin, tmp, "--validate"], { cwd: root, stdio: "pipe" }));
  rmSync(tmp, { force: true });
});
