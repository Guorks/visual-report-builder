#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Report } from "../src/schema.ts";

const args = process.argv.slice(2);
let out: string | undefined;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out") { out = args[++i]; if (!out) { process.stderr.write("--out requires a path\n"); process.exit(2); } }
  else { process.stderr.write(`unexpected argument: ${args[i]}\n`); process.exit(2); }
}

// No `name` option: this keeps the emitted top-level object AS the Report
// object schema itself (type: "object", properties.meta/hero/sections at
// the root) instead of wrapping it as { $ref, definitions: { Report } }.
// The recursive grid-2/grid-3 nodes (z.lazy) are still handled safely —
// zod-to-json-schema's default ref strategy dedupes repeated sub-schemas
// via JSON-pointer $refs back into the document itself, so no definitions
// block is needed and there's no infinite-expansion risk.
const schema = zodToJsonSchema(Report);
const json = JSON.stringify(schema, null, 2);
if (out) { writeFileSync(resolve(out), json + "\n", "utf8"); process.stdout.write(`${resolve(out)}\n`); }
else { process.stdout.write(json + "\n"); }
