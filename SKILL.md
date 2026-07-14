---
name: visual-report-builder
description: Generate single-file HTML reports for any audience using a locked hand-drawn notebook-sketch design system on cream paper. Use when user asks for a status report, postmortem, kickoff brief, launch announcement, comparison memo, decision memo, or user story (Given/When/Then behavior spec) — especially if they want it to feel hand-crafted, not generic. Authoring produces a typed `report.json` IR; the deterministic Node renderer turns it into HTML. Generates hand-drawn illustrations via Higgsfield MCP (nano_banana_pro) with a content-addressable cache so repeat prompts are free.
---

# visual-report-builder

Produce a beautiful, skimmable, offline-shareable HTML report. The report
matches a locked design system (cream paper, marker outlines, pastel
pencil shading, hand-lettered Spanish/English) and follows a structural
recipe by report type.

## Triggers

Use this skill when the user asks for:

- a status report / progress update / "where are we"
- a postmortem / incident retro / "what happened"
- a kickoff brief / project brief / "we're starting X"
- a launch announcement / "we shipped X"
- a comparison memo / "A vs B"
- a decision memo / "we decided X"
- a user story / behavior spec / "when user does X, app should Y"
- explicit references: "make me a report like the TikTok one", "build
  a visual handoff for [team]"

Skip if the user wants plain markdown, a multi-page doc, or a
collaboratively-edited surface.

## What to read

On every invocation, load:

1. **`references/pipeline.md`** — the 9-step process. This drives everything.
2. **`references/report-types/<type>.md`** — section recipe + schema mapping for the chosen type.
3. **`references/audience-modifiers/<audience>.md`** — tone instructions + tone fingerprint.
4. **`references/design-system.md`** — palette + classes (skim).
5. **`references/image-style-guide.md`** — Higgsfield prompt boilerplate.
6. **`src/schema.ts`** — typed IR contract you'll emit.

Reference HTML lives at **`references/base-html-template.html`** (a
regenerable preview skeleton — actual rendering goes through `bin/render.ts`).
The canonical example is **`examples/tiktok-status-spanish/`** with its
`report.json` IR alongside the rendered HTML.

## Quick start

If the user invocation didn't specify all four, ask via AskUserQuestion
in one message:

1. **Topic** — what's the report about?
2. **Audience** — `engineers` / `stakeholders-non-tech` / `operators` /
   `investors` / `mixed`
3. **Language** — `Spanish` (es) or `English` (en). Default to
   the language of the conversation.
4. **Output path** — default `<cwd>/reports/<slug>.html`. Honor project
   conventions if visible.

Infer **report type** from the topic. Only ask if genuinely ambiguous
(see the inference table in `references/pipeline.md`).

## The pipeline (summary — full version in references/pipeline.md)

1. Clarify scope (one Q&A round if needed).
2. Load report-type + audience-modifier + design-system + image-style-guide + schema.
3. Plan however many images the report actually needs (no fixed cap — judge by content). Numeric content gets chart nodes, not generated images — plan illustrations only for concepts.
4. Preflight: check the image cache (`src/observability/cache.ts`), then Higgsfield balance + `get_cost: true` on the first un-cached prompt.
5. Generate all un-cached images in parallel.
6. Download to `<output_dir>/assets/`, store in cache via `store(prompt, model, path, credits, rawUrl)` — keep the `rawUrl`.
7. Author `report.json` conforming to `src/schema.ts` with both `src` (local path) and `src_cdn` (rawUrl) on each figure, then `tsx bin/render.ts report.json`. Default mode (`cdn`) embeds the CDN URLs for a single-file shareable HTML; `--image-mode local` embeds local images for offline authoring/preview. A figure without `src_cdn` falls back to its local `src` and the renderer warns.
8. `open <output_path>` so the user sees it.
9. Flush `.cost.json` + `.trace.jsonl`; if inside a git repo with a session log, append an entry.

## Hard rules

- **The IR is the artifact.** Write `report.json` first; HTML is rendered.
  Two invocations on the same IR produce byte-identical HTML.
- **`.strict()` schema.** Unknown fields fail. If you find yourself
  wanting an escape hatch, add the node type to `src/schema.ts` instead.
- **One language per report.** No mixed Spanish/English in a single
  output (locale routing happens at invocation, not inside the doc).
- **Locked design system.** No theme customization in v2. If the user
  asks for dark mode, point them at the roadmap.
- **Let the report decide how many images it needs.** No artificial cap —
  judge by what the content requires. A simple status update might need 2-3;
  a multi-type catalog might need 8+. Each image costs ~2 credits at
  `nano_banana_pro` 1k 16:9, but the cache makes repeat invocations free.
- **No JavaScript.** Reports are pure HTML + inline CSS. They must work
  offline, in any browser, including ones that block JS.
- **`translate="no"` on all dynamic text.** The renderer applies this
  automatically — you don't have to.
- **Author = Guorks Labs** on any embedded credits/footer.
- **Custom blocks are a last resort.** Order of preference: (1) a typed
  node from `src/schema.ts`, (2) allowlisted inline markup inside a
  raw-html field, (3) a `custom` node — which requires a `note`
  explaining why nothing else fit. If you use the same custom shape in
  two reports, stop and add it to `src/schema.ts` as a typed node.
- **Data renders as charts, concepts as illustrations.** Percentages,
  breakdowns, and trends use `chart-bar` / `chart-donut` / `stat-row`
  (exact, free, regenerable). Higgsfield images are for metaphors,
  flows, mascots — never for precise numbers.

## Failure recovery

- Higgsfield job fails → retry once with same prompt. If still fails,
  simplify composition (fewer elements) and retry.
- Out of credits → stop, tell user. Don't downgrade model.
- `open` failed (no GUI / SSH session) → print path, tell user.
- Schema validation fails at render → read the zod error path, fix the
  offending field. Most common: extra unrecognized field on a node.
- Result feels off → inspect `<output_dir>/.trace.jsonl` and
  `.cost.json`; run the eval harness if the prompt is in the goldset:
  `npx tsx bin/eval.ts --filter <slug>`.

## Reference example

When in doubt about a structural choice, look at:
`examples/tiktok-status-spanish/report.json` (the IR) and
`examples/tiktok-status-spanish/tiktok-integracion-estado.html` (the
rendered output). The IR is the canonical reference for a status report
(Spanish, engineers audience). If the report you're producing deviates
from that, have a reason.

## Don't

- Don't hand-write documents. Inline markup inside raw-html fields is
  limited to the allowlist in `references/design-system.md`; block-level
  customization goes through the `custom` node (see Hard rules).
- Don't redefine CSS classes that already exist in `src/render/css.ts`.
- Don't generate images before deciding the structure (wastes credits).
- Don't render code blocks for non-tech audiences (use prose instead).
- Don't use icon libraries — use unicode glyphs (✓ → 🎉) when needed.
- Don't add automated tests in your authoring loop — outputs are visual
  artifacts. The eval harness (`bin/eval.ts`) is the regression net,
  not unit tests on the prose.
