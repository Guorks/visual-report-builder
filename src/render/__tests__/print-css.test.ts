import { test } from "node:test";
import assert from "node:assert/strict";
import { CSS } from "../css.ts";

test("print stylesheet is present with color-adjust and break-inside guards", () => {
  assert.ok(CSS.includes("@media print"), "has @media print block");
  assert.ok(/print-color-adjust:\s*exact/.test(CSS), "forces background printing");
  assert.ok(CSS.includes("break-inside: avoid"), "keeps cards/panels/figures whole");
});
