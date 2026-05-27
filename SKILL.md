---
name: visual-report-builder
description: Generate single-file HTML reports for any audience using a locked hand-drawn notebook-sketch design system on cream paper. Use when user asks for a status report, postmortem, kickoff brief, launch announcement, comparison memo, decision memo, or user story (Given/When/Then behavior spec) — especially if they want it to feel hand-crafted, not generic. Generates 2-3 hand-drawn illustrations via Higgsfield MCP (nano_banana_pro) embedded as relative images so the artifact is offline-portable.
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
2. **`references/report-types/<type>.md`** — section recipe for the chosen type.
3. **`references/audience-modifiers/<audience>.md`** — tone instructions.
4. **`references/design-system.md`** — palette + classes (skim).
5. **`references/image-style-guide.md`** — Higgsfield prompt boilerplate.

Reference HTML lives at **`references/base-html-template.html`**. The
canonical example is **`examples/tiktok-status-spanish/`**.

## Quick start

If the user invocation didn't specify all four, ask via AskUserQuestion
in one message:

1. **Topic** — what's the report about?
2. **Audience** — `engineers` / `non-tech` (stakeholders) / `operators` /
   `investors` / `mixed`
3. **Language** — `Spanish` (es-LA) or `English` (en-US). Default to
   the language of the conversation.
4. **Output path** — default `<cwd>/reports/<slug>.html`. Honor project
   conventions if visible.

Infer **report type** from the topic. Only ask if genuinely ambiguous
(see the inference table in `references/pipeline.md`).

## The pipeline (summary — full version in references/pipeline.md)

1. Clarify scope (one Q&A round if needed).
2. Load report-type + audience-modifier + design-system + image-style-guide.
3. Plan 2-3 images (no more than 4).
4. Preflight Higgsfield: `balance` + first `generate_image` with `get_cost: true`.
5. Generate all images in parallel.
6. Download to `<output_dir>/assets/`.
7. Render HTML from `base-html-template.html` + recipe + modifier.
8. `open <output_path>` so the user sees it.
9. If inside a git repo with a session log, append an entry.

## Hard rules

- **One language per report.** No mixed Spanish/English in a single
  output (locale routing happens at invocation, not inside the doc).
- **Locked design system.** No theme customization in v1. If the user
  asks for dark mode, point them at the v2 roadmap.
- **2-3 images preferred, hard cap 4.** Each image costs ~2 credits and
  adds visual load.
- **No JavaScript.** Reports are pure HTML + inline CSS. They must work
  offline, in any browser, including ones that block JS.
- **`translate="no"` on all dynamic text.** Prevents Chrome translator
  from breaking layout.
- **Author = Guorks Labs** on any embedded credits/footer.

## Failure recovery

- Higgsfield job fails → retry once with same prompt. If still fails,
  simplify composition (fewer elements) and retry.
- Out of credits → stop, tell user. Don't downgrade model.
- `open` failed (no GUI / SSH session) → print path, tell user.

## Reference example

When in doubt about a structural choice, look at:
`examples/tiktok-status-spanish/tiktok-integracion-estado.html`.
It is the canonical reference for what a status report (Spanish,
engineers audience) should look like. If the report you're producing
deviates from that, have a reason.

## Don't

- Don't redefine CSS classes that already exist in `design-system.md`.
- Don't generate images before deciding the structure (wastes credits).
- Don't render code blocks for non-tech audiences (use prose instead).
- Don't use icon libraries — use unicode glyphs (✓ → 🎉) when needed.
- Don't add automated tests in v1 — outputs are visual artifacts.
