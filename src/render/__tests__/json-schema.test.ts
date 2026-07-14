import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("bin/schema.ts emits valid JSON Schema for Report", () => {
  const out = execFileSync("npx", ["tsx", join(root, "bin/schema.ts")], { cwd: root, encoding: "utf8" });
  const schema = JSON.parse(out); // must be valid JSON
  assert.ok(schema.$schema, "has $schema");
  assert.equal(schema.type, "object");
  assert.ok(schema.properties && schema.properties.sections, "describes sections");
  assert.ok(schema.properties.meta && schema.properties.hero, "describes meta + hero");
});
