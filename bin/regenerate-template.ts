#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderReport } from "../src/render/index.ts";

const skeleton = {
  meta: {
    title: "{{TITLE}}",
    language: "es" as const,
    type: "status" as const,
    audience: "engineers" as const,
    date: "{{META_DATE}}",
    project: "{{META_PROJECT}}",
    extra: "{{META_EXTRA}}",
    footer_lines: ["{{FOOTER_LINE_1}}", "{{FOOTER_LINE_2}}", "{{FOOTER_LINE_3}}"],
  },
  hero: {
    kicker: "{{KICKER}}",
    h1_pre: "{{H1_PRE}}",
    h1_accent: "{{H1_ACCENT}}",
    h1_post: "{{H1_POST}}",
    lede: "{{LEDE}}",
  },
  sections: [
    { kind: "figure" as const, src: "assets/{{HERO_IMAGE}}", alt: "{{HERO_IMAGE_ALT}}", caption: "{{HERO_CAPTION}}" },
    {
      kind: "status-panel" as const,
      tag: "{{EXEC_TAG}}",
      heading: "{{EXEC_HEADING}}",
      paragraph: "{{EXEC_PARAGRAPH}}",
      progress: {
        pct: 50,
        labels: ["{{LABEL_1}}", "{{LABEL_2}}", "{{LABEL_3}}", "{{LABEL_4}}"],
        note: "{{EXEC_PROGRESS_NOTE}}",
      },
    },
    { kind: "h2" as const, text: "{{SECTION_1_TITLE}}" },
    { kind: "h2" as const, text: "{{SECTION_2_TITLE}}" },
    { kind: "h2" as const, text: "{{SECTION_3_TITLE}}" },
  ],
};

const html = renderReport(skeleton);
const banner = `<!--
  GENERATED FILE — do not edit by hand.
  Source of truth: src/render/{css,layout,primitives}.ts.
  Regenerate via: npm run regenerate-template
  This file is kept as a browser-previewable skeleton with {{}} placeholders.
-->
`;
const out = resolve("references/base-html-template.html");
writeFileSync(out, banner + html, "utf8");
process.stdout.write(`${out}\n`);
