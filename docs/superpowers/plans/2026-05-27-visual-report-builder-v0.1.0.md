# `visual-report-builder` v0.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `visual-report-builder` Claude Code skill in its standalone repo at `~/dev/guorks_labs/visual-report-builder/`, deploy to `~/.claude/skills/`, and tag v0.1.0.

**Architecture:** Composable references. A small `SKILL.md` (~3KB) is the entry point that loads on every invocation; it points at on-demand reference files in `references/`. Report types (7) + audience modifiers (5) + design system + image style guide + base HTML template + pipeline are each their own small markdown/html file. One canonical example (the TikTok status report) lives in `examples/` as reference and regression target.

**Tech stack:** Markdown + HTML + CSS (inline). No build step. No tests beyond manual reproduction of the canonical example. Distribution via plain folder copy or Claude Code's plugin mechanism.

**Spec:** `~/dev/guorks_labs/visual-report-builder/docs/superpowers/specs/2026-05-27-visual-report-builder-design.md`

**Author:** Guorks Labs (apply this to all file headers, README, LICENSE, plugin.json).

**Resolved from spec §13 (open implementation questions):**

1. **`SKILL.md` clarification flow:** Ask topic + audience + language upfront in one round. Infer report type from topic; ask only if ambiguous.
2. **TikTok example sanitization:** Keep the report as-is — already public-safe (sandbox client key is public, no secrets rendered).
3. **`plugin.json` name:** `visual-report-builder` (no namespace prefix); `publisher` field carries "Guorks Labs".

---

## Parallelization hint

Tasks **7-13** (the 7 report-type files) are independent of each other and can run in parallel via subagents. Same for **14-18** (the 5 audience modifiers). Sequential tasks 0-6 must come first; 19-24 must come after. If using subagent-driven execution: dispatch 0-6 one at a time, then dispatch 7-18 as a parallel batch (12 tasks), then 19-24 sequentially.

---

## Task 0: Verify repo skeleton + create top-level folders

**Files:**
- Verify: `~/dev/guorks_labs/visual-report-builder/.git/` (already initialized)
- Create: `~/dev/guorks_labs/visual-report-builder/references/`
- Create: `~/dev/guorks_labs/visual-report-builder/references/report-types/`
- Create: `~/dev/guorks_labs/visual-report-builder/references/audience-modifiers/`
- Create: `~/dev/guorks_labs/visual-report-builder/examples/`
- Create: `~/dev/guorks_labs/visual-report-builder/.claude-plugin/`

- [ ] **Step 1: Confirm the repo is initialized + spec is committed**

Run:
```bash
cd ~/dev/guorks_labs/visual-report-builder && git log --oneline
```
Expected: at least 2 commits (the spec + author change).

- [ ] **Step 2: Create the top-level folders**

Run:
```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  mkdir -p references/report-types references/audience-modifiers examples .claude-plugin && \
  ls -la
```
Expected: `references/`, `examples/`, `.claude-plugin/` all present.

- [ ] **Step 3: Add `.gitkeep` placeholders so empty folders track**

Run:
```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  touch references/.gitkeep references/report-types/.gitkeep references/audience-modifiers/.gitkeep examples/.gitkeep .claude-plugin/.gitkeep
```

- [ ] **Step 4: Commit scaffolding**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add . && \
  git commit -m "chore: scaffold repo folders"
```

---

## Task 1: LICENSE (MIT, Guorks Labs)

**Files:**
- Create: `~/dev/guorks_labs/visual-report-builder/LICENSE`

- [ ] **Step 1: Write the LICENSE file**

Create `LICENSE` with the following exact content:

```
MIT License

Copyright (c) 2026 Guorks Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add LICENSE && \
  git commit -m "chore: MIT license, Guorks Labs"
```

---

## Task 2: Migrate the TikTok example into `examples/`

This task copies the canonical example from `studiosharpods` into the new repo. It must be done early so subsequent tasks can reference the actual TikTok HTML when extracting the design system, image style, and base template.

**Files:**
- Create: `examples/tiktok-status-spanish/tiktok-integracion-estado.html`
- Create: `examples/tiktok-status-spanish/assets/donde-estamos.png`
- Create: `examples/tiktok-status-spanish/assets/como-funciona-login.png`
- Create: `examples/tiktok-status-spanish/assets/sandbox-vs-produccion.png`

- [ ] **Step 1: Create the example folder**

Run:
```bash
mkdir -p ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/assets
```

- [ ] **Step 2: Copy the HTML file**

Run:
```bash
cp ~/dev/sharpods/studiosharpods/control-center/handoffs/tiktok-integracion-estado.html \
   ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/
```

- [ ] **Step 3: Copy the 3 PNG assets**

Run:
```bash
cp ~/dev/sharpods/studiosharpods/control-center/handoffs/assets/donde-estamos.png \
   ~/dev/sharpods/studiosharpods/control-center/handoffs/assets/como-funciona-login.png \
   ~/dev/sharpods/studiosharpods/control-center/handoffs/assets/sandbox-vs-produccion.png \
   ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/assets/
```

- [ ] **Step 4: Verify**

Run:
```bash
ls -lh ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/ \
       ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/assets/
```
Expected: HTML ~27KB, 3 PNGs ~3MB total.

- [ ] **Step 5: Open the example to confirm it renders identically**

Run:
```bash
open ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/tiktok-integracion-estado.html
```
Expected: identical render to the original.

- [ ] **Step 6: Commit (will need increased postBuffer for 3MB PNGs on push later)**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add examples/ && \
  git commit -m "docs(example): canonical TikTok status report (Spanish)"
```

---

## Task 3: `references/design-system.md`

Extract the CSS tokens and reusable component classes from the TikTok HTML into a clean, indexed reference doc.

**Files:**
- Create: `references/design-system.md`

- [ ] **Step 1: Write `references/design-system.md`**

Create with this exact content:

````markdown
# Design System (LOCKED)

The visual-report-builder skill ships exactly one aesthetic: a hand-drawn
notebook sketch on cream paper. No theming, no alt palettes. If you find
yourself wanting to change a token, write a new skill instead.

## Colors (CSS custom properties)

Paste these verbatim into the `:root` block of every generated HTML:

```css
:root {
  --paper: #F7F3E6;
  --paper-deep: #EFE8D4;
  --ink: #2a2620;
  --ink-soft: #5a5246;
  --ink-muted: #8a8170;
  --line: #d9cfb8;
  --green: #7ba87b;       --green-soft: #d4e3c9;
  --red: #d97a6c;         --red-soft: #f3d5cc;
  --blue: #7da3c4;        --blue-soft: #d3e0eb;
  --purple: #9b8bc4;      --purple-soft: #ddd3ea;
  --yellow: #e5b96a;      --yellow-soft: #f5e5b8;
}
```

## Fonts (Google Fonts)

Always load all four — every report uses them:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Font | Usage |
|---|---|
| **Outfit** | Display headings (h1, h2, h3) |
| **Inter** | Body prose |
| **Caveat** | Hand-lettered accents (kickers, scribbles, `.handwrite`) |
| **JetBrains Mono** | Code, IDs, file paths |

## Reusable component classes

The base template ships these — use them as-is, don't redefine:

| Class | Purpose |
|---|---|
| `.wrap` | Page container (max-width 1040px, padding) |
| `.hero` | Top-of-page block (kicker + h1 + lede + meta-row) |
| `.hero .kicker` | Caveat-font accent above h1 (rotated -1deg) |
| `.hero .lede` | Larger paragraph below h1 |
| `.meta-row` | Date + author + project metadata row |
| `.figure` | Image wrapper with `.caption` for hand-written caption |
| `.status-panel` | Executive summary — dashed border + tag chip + body |
| `.status-panel .tag` | Yellow rotated chip ("Resumen ejecutivo") |
| `.progress` / `.progress-track` / `.progress-fill` | Horizontal progress bar |
| `.card` | Generic card |
| `.card.green` / `.red` / `.blue` / `.yellow` / `.purple` | Colored card variants |
| `.grid-2` / `.grid-3` | Responsive 2 or 3 column grids |
| `.done-list` | Ul with green ✓ bullets |
| `.pending-list` | Ul with yellow → bullets |
| `.check-table` | Comparison/criteria table |
| `.steps` | Counter-incremented numbered timeline |
| `.gotcha` | Red-bordered callout |
| `.err` | Inline error-code badge |
| `.tester-pill` | Green pill (used for testers / tags / labels) |
| `.handwrite` / `.scribble` | Caveat-font accents inline |
| `.footer` | Page footer with dashed top border |

## Typography rules

- Headings always `font-family: 'Outfit'`, weight 700 for h1/h2, 600 for h3
- Body always `font-family: 'Inter'`, weight 400
- Body color `var(--ink-soft)`, headings `var(--ink)`
- `<strong>` inside `<p>` switches color to `var(--ink)` (full strength)
- Line height: 1.65 body, 1.05 h1, 1.02 hero h1
- All h2 has a `::before` pseudo-element with a 36px black bar (signature mark)

## Image styling

Every `<img>` inside `.figure` gets:
- `max-width: 100%`
- `border-radius: 14px`
- `box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 12px 32px -8px rgba(42,38,32,0.18)`
- `border: 1px solid var(--line)`

Captions below images are Caveat-font, italic-feeling, with an arrow prefix
("↑ caption text").

## Spacing

- Section h2: `margin: 56px 0 16px` (lots of vertical breathing room)
- Section h3: `margin: 24px 0 10px`
- Card: `padding: 20px 24px`, `margin: 14px 0`
- Status panel: `padding: 28px 32px`, `margin: 32px 0`

## Reference

For the complete CSS, see `examples/tiktok-status-spanish/tiktok-integracion-estado.html`
inline `<style>` block. The `references/base-html-template.html` is the
generic version of that stylesheet, ready to copy into every new report.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/design-system.md && \
  git commit -m "docs(refs): design system tokens and component classes"
```

---

## Task 4: `references/image-style-guide.md`

Encode the Higgsfield image-prompt boilerplate, the failure modes, and worked examples.

**Files:**
- Create: `references/image-style-guide.md`

- [ ] **Step 1: Write `references/image-style-guide.md`**

````markdown
# Image Style Guide (Higgsfield, locked aesthetic)

All images for a visual-report-builder report come from the Higgsfield MCP
using model `nano_banana_pro` at 16:9 aspect ratio. Cost is ~2 credits per
image at 1k resolution. Plan 2-3 images per report — no more, rarely fewer.

## The boilerplate prompt (always prepend)

Every image prompt MUST begin with this paragraph. The model garbles
short-on-style prompts; over-specify the aesthetic every time.

```
Hand-drawn whiteboard sketch illustration in the exact style of a cute
notebook doodle. Warm cream off-white paper background (#F7F3E6), slightly
textured. Black ink marker outlines with slightly rough, imperfect
hand-drawn lines. Soft colored-pencil shading in muted sage green, soft
coral red, dusty sky blue, lavender purple, warm yellow. Hand-lettered
text labels in [LANGUAGE], friendly handwriting style.
```

Substitute `[LANGUAGE]` with the report's language (`Spanish`, `English`,
etc.). The hand-lettered labels respect the language so glyphs render
correctly.

## The composition block

After the boilerplate, add a `Composition:` block with 3-6 short bullets
specifying exact element placement and labels. Be explicit about:

- left-to-right or top-to-bottom order
- what color each element is (use the design-system palette names: "sage
  green", "coral red", "sky blue", "lavender purple", "warm yellow")
- what text label each element carries (max 1-3 words)
- arrow directions, dashed lines, highlights

## The mascot (optional but recommended)

A cute round-headed robot mascot with antenna, headphones, and a friendly
smile, drawn in muted [color] pencil shading. Position and pose specify:

- "pointing up at the current step" — for status report hero
- "holding a magnifying glass in the bottom right" — for OAuth flow
- "giving a thumbs-up" / "sitting and waiting patiently" — for comparison
- "sitting cross-legged with a clipboard" — for kickoff
- omit entirely if the composition is already busy

## The closer (always append)

Every prompt MUST end with these lines:

```
Keep all text very short (1-3 words max per label). Friendly, educational,
clean composition, lots of whitespace. 16:9 aspect ratio.
```

## Failure modes (documented from real generations)

- **Long text → garbled.** Hard cap: 3 words per label. If you need
  precise text, put it in the HTML, not the image.
- **More than 4 images per report.** Cognitive load + cost. 2-3 is the
  sweet spot.
- **Forgetting `aspect_ratio: "16:9"`** in the API call. Defaults to 1:1
  and the HTML layout breaks (the figure becomes too tall).
- **Using `nano_banana` (no `_pro` suffix).** Lower quality, blurry text.
- **Generating before structure.** Decide the report's section recipe
  first, then plan images. Re-running images wastes credits.

## The pipeline

When you reach the image-generation step:

1. Call `mcp__claude_ai_higgsfield__balance` once — sanity-check credits.
2. Call `mcp__claude_ai_higgsfield__generate_image` with `get_cost: true`
   on the first prompt — confirms model + price.
3. Submit all 2-3 images in parallel (`generate_image` without `get_cost`).
4. Poll each job with `job_status` and `sync: true` (each ~10-20s).
5. Download every result to `<output_dir>/assets/<descriptive-slug>.png`
   via `curl`.
6. Embed via relative `<img src="assets/...">` so the artifact is offline-
   portable.

## Worked example: the "¿Dónde estamos?" hero (TikTok report)

The full prompt that produced `examples/tiktok-status-spanish/assets/donde-estamos.png`:

````
Hand-drawn whiteboard sketch illustration in the exact style of a cute
notebook doodle. Warm cream off-white paper background (#F7F3E6),
slightly textured. Black ink marker outlines with slightly rough,
imperfect, slightly wobbly hand-drawn lines. Soft colored-pencil shading
in muted sage green, soft coral red, dusty sky blue, lavender purple,
warm yellow. Hand-lettered Spanish text in black ink, all caps or
sentence case, friendly handwriting style.

Composition: a horizontal pipeline of six rounded sketchy rectangles
connected by hand-drawn curved arrows pointing right. The boxes are
evenly spaced and clearly readable. Box labels left to right exactly:
1) 'App creada' with a small green checkmark
2) 'Sandbox' with a small green checkmark
3) 'Permisos' with a small green checkmark
4) '3 testers' with a small green checkmark
5) 'Probar conexión' — this box is highlighted with a glowing yellow
   halo and a thicker outline (current step)
6) 'Producción' — this box is drawn in light grey pencil with a small
   clock icon, indicating future

Below the highlighted box 'Probar conexión', a cute round-headed robot
mascot with antenna, headphones, and a friendly smile is pointing up at
it with one arm. The robot is colored in muted teal-green pencil shading.

At the top center, a hand-lettered title banner reads '¿DÓNDE ESTAMOS?'
in bold black ink with a soft yellow highlight underneath.

Keep all text short (1-3 words max). Friendly, educational, lots of
whitespace. 16:9 aspect ratio.
````

That generation succeeded in one pass.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/image-style-guide.md && \
  git commit -m "docs(refs): image style guide with prompt boilerplate"
```

---

## Task 5: `references/base-html-template.html`

The generic version of the TikTok HTML, with `{{...}}` placeholders for swap-in content. Subagent should **duplicate** the TikTok HTML and transform it — not retype from scratch.

**Files:**
- Create: `references/base-html-template.html`

- [ ] **Step 1: Duplicate the TikTok HTML as the starting point**

Run:
```bash
cp ~/dev/guorks_labs/visual-report-builder/examples/tiktok-status-spanish/tiktok-integracion-estado.html \
   ~/dev/guorks_labs/visual-report-builder/references/base-html-template.html
```

- [ ] **Step 2: Apply these exact transformations to `references/base-html-template.html`**

Edit the file to replace TikTok-specific content with placeholders, while preserving the **structure, CSS, and all reusable component markup**. The transformations:

1. **`<title>`** — replace `Estado de la integración TikTok · Studio Sharpods` with `{{TITLE}}`
2. **`<html lang="...">`** — replace `es-LA` with `{{LANG}}` (`es-LA` or `en-US`)
3. **Hero `.kicker`** — replace `— informe para el equipo —` with `{{KICKER}}`
4. **Hero `<h1>`** — replace inline title with `{{H1_PRE}} <span style="color: var(--purple)">{{H1_ACCENT}}</span> {{H1_POST}}`
5. **Hero `.lede`** — replace with `{{LEDE}}`
6. **`.meta-row`** — replace with `<span>{{META_DATE}}</span><span>·</span><span>{{META_PROJECT}}</span><span>·</span><span>{{META_EXTRA}}</span>`
7. **First `.figure` `<img>` src** — replace with `assets/{{HERO_IMAGE}}` and `alt` with `{{HERO_IMAGE_ALT}}`
8. **First `.figure .caption`** — replace with `{{HERO_CAPTION}}`
9. **`.status-panel .tag`** — replace `Resumen ejecutivo` with `{{EXEC_TAG}}`
10. **`.status-panel h2`** — replace `Lista para pruebas en sandbox 🟢` with `{{EXEC_HEADING}}`
11. **`.status-panel <p>`** — replace with `{{EXEC_PARAGRAPH}}`
12. **`.progress-fill` width** — replace `67%` with `{{PROGRESS_PCT}}%`
13. **`.progress-labels`** — replace 4 `<span>` children with `{{PROGRESS_LABEL_1}}` … `{{PROGRESS_LABEL_4}}`
14. **All major section `<h2>` headings** — wrap with `{{SECTION_N_TITLE}}` (where N = 1..) — keep the `::before` bar styling
15. **All body sections (between h2s)** — wrap with `{{SECTION_N_BODY}}` markers as HTML comments: `<!-- {{SECTION_2_BODY}} -->`
16. **Footer** — replace dates + project name with `{{FOOTER_LINE_1}}`, `{{FOOTER_LINE_2}}`, `{{FOOTER_LINE_3}}`

The output should remain a complete, valid HTML — placeholders just sit where the content used to be. A consumer of this template literally search-replaces the `{{...}}` tokens.

- [ ] **Step 3: Verify the file is still parseable HTML**

Run:
```bash
open ~/dev/guorks_labs/visual-report-builder/references/base-html-template.html
```
Expected: the template renders in the browser (placeholders visible as text).

- [ ] **Step 4: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/base-html-template.html && \
  git commit -m "docs(refs): base HTML template with {{...}} placeholders"
```

---

## Task 6: `references/pipeline.md`

Encode the 9-step process Claude follows when the skill is invoked.

**Files:**
- Create: `references/pipeline.md`

- [ ] **Step 1: Write `references/pipeline.md`**

````markdown
# Invocation Pipeline

When `visual-report-builder` is invoked, follow these steps in order.
Do not skip steps. Do not change the order.

## Step 1 — Clarify scope (one round of Q&A)

If the user's invocation didn't specify all four, ask in ONE message
using the AskUserQuestion tool:

1. **Topic** — what's the report about? (e.g., "Status of our payments
   integration")
2. **Audience** — who reads this? Options: `engineers`, `non-tech`,
   `operators`, `investors`, `mixed`
3. **Language** — `Spanish` (es-LA) or `English` (en-US). Default
   Spanish if user is writing in Spanish; otherwise English.
4. **Output path** — where to write the HTML? Default
   `<cwd>/reports/<slug>.html`. Honor any project conventions if visible
   (e.g., a `control-center/handoffs/` directory exists).

Infer **report type** from the topic. Only ask if genuinely ambiguous.

| Topic phrase | Inferred type |
|---|---|
| "status" / "where are we" / "progress" | status |
| "what happened" / "incident" / "broke" / "postmortem" | postmortem |
| "starting" / "kickoff" / "new project" / "we're beginning" | kickoff |
| "we shipped" / "launching" / "announcement" | launch |
| "A vs B" / "compare" / "which option" | comparison |
| "decided" / "we picked" / "decision memo" | decision-memo |
| "when user does X" / "user story" / "given/when/then" / "behavior" | user-story |

## Step 2 — Load context files

In order, read:

1. `references/report-types/<type>.md` — structural recipe (sections + order)
2. `references/audience-modifiers/<audience>.md` — tone instructions
3. `references/design-system.md` — palette + classes (skim if already
   familiar)
4. `references/image-style-guide.md` — prompt boilerplate + failure modes

## Step 3 — Plan images

The report-type file specifies how many images and what they show. Write
out each image's prompt mentally before generating. Aim 2-3 images. Hard
cap 4.

## Step 4 — Preflight Higgsfield

```
mcp__claude_ai_higgsfield__balance
```
Confirm credits ≥ (2 × number_of_images + 5 safety margin).

```
mcp__claude_ai_higgsfield__generate_image with get_cost: true
```
on the first prompt. Expected: 2 credits at `nano_banana_pro` 1k 16:9.

## Step 5 — Generate all images in parallel

Submit each prompt as a separate `generate_image` call (not `get_cost`).
Then poll each `job_status` with `sync: true`.

## Step 6 — Download assets

`mkdir -p <output_dir>/assets`. For each completed job, `curl` the
`rawUrl` to `<output_dir>/assets/<descriptive-slug>.png`. Use kebab-case
slugs that match what the report references.

## Step 7 — Render HTML

Start with `references/base-html-template.html`. Apply, in order:

1. Substitute the standard placeholders (`{{TITLE}}`, `{{LANG}}`, etc.)
2. For each section in the report-type recipe, write the section body
   using the audience-modifier's tone rules.
3. Embed images via relative paths (`<img src="assets/...">`).
4. Adjust the `.progress-fill` width if the report type uses a progress
   bar (status report does; others usually don't — remove the
   `.status-panel .progress` block if not applicable).

Hard rules from the design system:
- No `any` JS — there is no JS at all. Pure HTML + inline CSS.
- All dynamic text gets `translate="no"` to prevent Chrome translator
  from breaking layout.
- All Spanish strings (or English, etc.) live in the HTML — no localiza-
  tion layer; one report = one language.

## Step 8 — Open locally

```
open <output_html_path>
```
The user reviews immediately.

## Step 9 — Log

If the working directory is a git repo and has a `control-center/build-state.md`
or similar session log, append a one-paragraph entry noting the report
was generated.

## Errors and recovery

- **Higgsfield job failed:** retry once with the same prompt. If it
  fails again, simplify the composition (fewer elements) and retry.
- **No credits:** stop and tell the user. Don't downgrade the model.
- **`open` failed (no GUI):** print the file path and tell the user
  to open it manually.
- **Output directory doesn't exist:** create it (`mkdir -p`).
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/pipeline.md && \
  git commit -m "docs(refs): invocation pipeline (9 steps)"
```

---

## Task 7: `references/report-types/status.md`

**Files:**
- Create: `references/report-types/status.md`

- [ ] **Step 1: Write `references/report-types/status.md`**

````markdown
# Report Type: status

**Use when:** "where are we / what's done / what's next"
**Canonical example:** `examples/tiktok-status-spanish/`

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | Kicker + h1 (project name) + lede (1-sentence summary) + meta-row | — |
| 2 | Hero image | Pipeline/timeline with current step highlighted | ✅ #1 |
| 3 | Executive panel | Yellow tag chip + 1-paragraph TL;DR + progress bar with % | — |
| 4 | Lo que ya está hecho / What's done | 2-column grid of `.done-list` cards | — |
| 5 | Cómo funciona / How it works | Optional — only if the report explains a process. Flow diagram + numbered `.steps` | ✅ #2 (optional) |
| 6 | Consistency / criteria table | `.check-table` — when there's something that must match across systems | — |
| 7 | Qué sigue / What's next | `.card.yellow` with `.pending-list` action items | — |
| 8 | Comparison (current vs next state) | 2-column side-by-side cards (green/red) | ✅ #3 (if comparison strong) |
| 9 | Gotchas | Red-tinted `.gotcha` callouts | — |
| 10 | Quick reference | `.check-table` of IDs, file paths, links | — |
| 11 | Footer | Date + project + credits | — |

## Image plan

2-3 total:
1. **Hero pipeline** — horizontal flow of N steps with current step
   highlighted (yellow halo, thicker outline) and future steps greyed.
   Mascot pointing at current.
2. **Process diagram** — only if §5 is present. Horizontal flow of the
   actual user/system journey.
3. **Comparison panels** — only if §8 is present. Two side-by-side
   rounded sketchy rectangles (green left, red right) with short bullets.

## Progress bar

`.status-panel .progress` is REQUIRED on status reports. Compute % as:
- Count completed milestones / total milestones, OR
- Count completed `.done-list` items / total items across done+pending

## Tone notes

Status reports are reassuring + precise. Lead with the good news (what
works), then what's next, then risks. Don't bury the lede — the executive
panel is the headline.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/status.md && \
  git commit -m "docs(types): status report recipe"
```

---

## Task 8: `references/report-types/postmortem.md`

**Files:**
- Create: `references/report-types/postmortem.md`

- [ ] **Step 1: Write `references/report-types/postmortem.md`**

````markdown
# Report Type: postmortem

**Use when:** "something broke; here's what happened and how we fix it"

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | Incident name + severity badge (Sev1/Sev2/Sev3 colored) + dates | — |
| 2 | Hero image | Incident timeline visual OR "what broke" diagram | ✅ #1 |
| 3 | Impact panel | RED-tinted status-panel: who was affected, for how long, $ or user impact | — |
| 4 | Timeline | Numbered `.steps` with HH:MM timestamps as `<small>` tags | — |
| 5 | Root cause | Prose section. Optionally with a "before/after" diagram | ✅ #2 (optional) |
| 6 | What went well / What went poorly | `.grid-2` with `.card.green` + `.card.red` | — |
| 7 | Action items | `.pending-list` style but with owner names per item | — |
| 8 | Lessons learned | `.handwrite` / `.scribble` Caveat-font callouts | — |
| 9 | Quick reference | Affected systems, links to logs/dashboards | — |
| 10 | Footer | Date + incident ID | — |

## Image plan

1-2 total:
1. **Incident timeline** — horizontal timeline showing key events with
   timestamps. Use red shading for the "broken" period.
2. **Root cause diagram** — optional, only if the failure mode is
   visual (e.g., a race condition between two services, a misrouted
   request). Two-panel: "what we thought" / "what actually happened".

## Severity badge colors

| Sev | Color class | Meaning |
|---|---|---|
| Sev1 | `.badge-red` (red bg) | Full outage, all users affected |
| Sev2 | `.badge-gold` (yellow bg) | Partial outage, some users affected |
| Sev3 | `.badge-green` (green bg) | Minor degradation, internal only |

(Define these inline; they're not in the design-system reference yet.)

## Tone notes

Honest, blame-free, action-oriented. State facts. Lead with impact (so
the reader knows immediately if this affected them). The "what went
poorly" card should be specific, not vague — name the mistake without
naming individuals.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/postmortem.md && \
  git commit -m "docs(types): postmortem recipe"
```

---

## Task 9: `references/report-types/kickoff.md`

**Files:**
- Create: `references/report-types/kickoff.md`

- [ ] **Step 1: Write `references/report-types/kickoff.md`**

````markdown
# Report Type: kickoff

**Use when:** "we're starting X — here's why, here's the plan"

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | Project name + start date + lede "we're beginning..." | — |
| 2 | Hero image | The "vision" — what success looks like | ✅ #1 |
| 3 | Por qué / Why | Status-panel with the motivation. 1 paragraph max. | — |
| 4 | Goals + success criteria | Bulleted list, measurable. Each goal = one bullet. | — |
| 5 | Scope visual | In-scope / out-of-scope two-column diagram | ✅ #2 |
| 6 | Plan | Phases/milestones as numbered `.steps` timeline | — |
| 7 | Team & roles | `.grid-3` of `.card` per person — name + role + responsibility | — |
| 8 | Risks + mitigations | `.gotcha` callouts: risk → mitigation per item | — |
| 9 | Decisions already made | `.check-table` (decision / chose / why) | — |
| 10 | Open questions | `.pending-list` yellow → bullets | — |
| 11 | Footer | Kickoff date + next checkpoint | — |

## Image plan

2 total:
1. **Vision** — what does success look like? Often a diagram of the
   end-state product, or users happily using the feature. Robot mascot
   pointing at the prize.
2. **Scope** — two-panel: "Dentro / In scope" (green) vs "Fuera / Out
   of scope" (greyed). Helps stakeholders see what's explicitly NOT in
   this project.

## Tone notes

Kickoffs are aspirational + grounded. Energy in the hero, realism in
the risks. Don't promise what you can't measure — every goal in §4
should be a number or a binary observable state.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/kickoff.md && \
  git commit -m "docs(types): kickoff recipe"
```

---

## Task 10: `references/report-types/launch.md`

**Files:**
- Create: `references/report-types/launch.md`

- [ ] **Step 1: Write `references/report-types/launch.md`**

````markdown
# Report Type: launch

**Use when:** "we just shipped X — tell the world"

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | BIG h1 — "Lanzamos X" / "We shipped X" + Caveat kicker | — |
| 2 | Hero image | The product/feature visualized — close-up, hero shot | ✅ #1 |
| 3 | ¿Qué es? / What is it | Status-panel: one-paragraph plain-language description | — |
| 4 | Por qué importa / Why it matters | `.grid-3` — user benefit / business impact / market position | — |
| 5 | Cómo funciona / How it works | Flow visual + 3-5 step explanation | ✅ #2 |
| 6 | Pruébalo ahora / Try it now | Big purple `.card.purple` CTA card with link/button | — |
| 7 | Behind the scenes (optional) | Sketchy "fun facts" — engineering effort, lines of code, time-to-ship | — |
| 8 | Créditos / Credits | `.grid-3` of contributors with role | — |
| 9 | Footer | Launch date + share links | — |

## Image plan

2 total:
1. **Product hero** — the feature in action. Can be a screenshot
   mockup styled hand-drawn, or a conceptual visual. Mascot interacting
   with it.
2. **How it works flow** — horizontal flow of the user journey using
   the feature. Person → action → result.

## Tone notes

Launches are celebratory + clear. Don't lose the "what is it" in the
celebration. §3 must be readable by someone who didn't know this
project existed. §4 makes the case for caring. §6 makes it easy to
try.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/launch.md && \
  git commit -m "docs(types): launch recipe"
```

---

## Task 11: `references/report-types/comparison.md`

**Files:**
- Create: `references/report-types/comparison.md`

- [ ] **Step 1: Write `references/report-types/comparison.md`**

````markdown
# Report Type: comparison

**Use when:** "A vs B — help me pick"

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | The question being decided — "¿X o Y?" / "X vs Y?" | — |
| 2 | Hero image | Fork in the road OR two-panel split with the options | ✅ #1 |
| 3 | Resumen / Summary | Status-panel: 2-sentence description per option | — |
| 4 | Tabla de comparación | `.check-table` — rows = criteria, cols = options, ✓ in best cells | — |
| 5 | Side-by-side panels | `.grid-2` of `.card` (green for option A, red for option B) with pros + cons each | ✅ #2 |
| 6 | Recomendación | Purple/yellow highlighted card with the recommended option + 1 sentence | — |
| 7 | Por qué / Why | Justification prose | — |
| 8 | Riesgos del camino elegido / Risks of chosen path | `.gotcha` callouts | — |
| 9 | Preguntas abiertas / Open questions | `.pending-list` | — |
| 10 | Footer | Date + decision-maker | — |

## Image plan

2 total:
1. **Fork in the road** — two paths diverging. Each labeled with the
   option. Mascot at the fork, hand on chin.
2. **Side-by-side panels** — two rounded sketchy rectangles showing
   the options at-a-glance. Identical to the TikTok sandbox-vs-prod
   composition.

## Tone notes

Comparisons should *recommend*, not just enumerate. §6 must take a
position. Don't hedge — if both options were equal, you wouldn't be
writing this. State the recommendation, then explain.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/comparison.md && \
  git commit -m "docs(types): comparison recipe"
```

---

## Task 12: `references/report-types/decision-memo.md`

**Files:**
- Create: `references/report-types/decision-memo.md`

- [ ] **Step 1: Write `references/report-types/decision-memo.md`**

````markdown
# Report Type: decision-memo

**Use when:** "this is the decision — documenting it for posterity"

Same shape as comparison but the **Decision** is up-front, not buried.
Reader sees the answer first; reasoning is for those who want it.

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | The decision in 1 line | — |
| 2 | LA DECISIÓN / THE DECISION | HUGE highlighted status-panel — the picked answer, big & bold. Yellow tag = "Decisión". | — |
| 3 | Hero image | Visual of the chosen path / direction | ✅ #1 |
| 4 | Contexto / Context | What was the situation, who decided, when | — |
| 5 | Opciones consideradas / Options considered | `.check-table` — what else we looked at | — |
| 6 | Por qué esta opción / Why this option | The reasoning, prose | — |
| 7 | Tradeoffs aceptados / Tradeoffs accepted | What we're explicitly giving up. `.card.yellow`. | — |
| 8 | Reversibility | 1 sentence: how hard would it be to undo this? Anchor with `.handwrite`. | — |
| 9 | Próximos pasos / Action items | `.pending-list` | — |
| 10 | Footer | Date + decision-maker + checkpoint date | — |

## Image plan

1 total:
1. **Chosen path visual** — single road forward, mascot walking
   confidently. Or a checkmark badge with the chosen option's name.

## Tone notes

Decision memos are confident + transparent. State the decision first
(§2), then back it up. Don't relitigate — if §2 needs caveats, the
decision isn't made yet, write a comparison instead.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/decision-memo.md && \
  git commit -m "docs(types): decision-memo recipe"
```

---

## Task 13: `references/report-types/user-story.md`

**Files:**
- Create: `references/report-types/user-story.md`

- [ ] **Step 1: Write `references/report-types/user-story.md`**

````markdown
# Report Type: user-story

**Use when:** "describe a desired app behavior — given/when/then"

Agile-standard user story / behavior spec. Best for "when the user does
X, the app should do Y" — feature requests, behavior changes, animations,
interaction details.

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | Story title — short, descriptive ("Confetti al cumplir 1k vistas") | — |
| 2 | Hero image | The desired moment visualized — confetti flying, modal opening, button glow, etc. | ✅ #1 |
| 3 | Given / When / Then | `.grid-3` of bordered cards (NOT status-panel). Each card = one big label (GIVEN / WHEN / THEN) + 1-2 sentence content. | — |
| 4 | Comportamiento paso a paso / Behavior step-by-step | Numbered `.steps` describing the exact sequence | — |
| 5 | Mockup / sequence | Side-by-side: "estado actual" (current) vs "estado esperado" (expected). Or a 3-panel sequence of the animation. | ✅ #2 |
| 6 | Criterios de aceptación / Acceptance criteria | `.done-list` with green ✓ — what proves it works | — |
| 7 | Edge cases | `.gotcha` callouts — "qué pasa si X es null", "qué pasa si no hay internet", etc. | — |
| 8 | Fuera de alcance / Out of scope | Grey-tinted section (`.card` with `var(--ink-muted)` text) — what this story explicitly does NOT include | — |
| 9 | Notas de implementación / Implementation notes (optional) | Hints for the engineer — only if helpful. Skip for non-tech audiences. | — |
| 10 | Referencias | Linked components, related stories, designs | — |

## Image plan

2 total:
1. **The desired moment** — the single most important visual of the
   behavior. Confetti / modal / glow / transition mid-flight.
2. **Before/after sequence** — 2 or 3 panels showing the state change.
   "Before" panel + arrow + "After" panel.

## Worked example

The user's "confetti on milestone" example:

- **Story title:** "Cuando el operador llega a 1,000 vistas, celebramos"
- **Given:** Operador ha conectado al menos una cuenta TikTok.
- **When:** Sumar todas las vistas de sus submissions activos cruza
  los 1,000 por primera vez.
- **Then:** Confetti cubre la pantalla por 3s + toast "🎉 ¡Primera meta!".
- **Acceptance:** Dispara solo una vez por hito / no flicker para
  `prefers-reduced-motion` / no se re-dispara al re-render.
- **Edge cases:** Tab en background; cuenta desconectada justo al cruzar;
  múltiples cuentas contribuyendo a la suma.

## Tone notes

User stories are precise + visual. The Given/When/Then is the spine —
everything else is supporting detail. Don't write user stories for
features that don't have a specific user-observable trigger. If you
can't fill in `When:` with a concrete user action or system event,
write a kickoff or launch instead.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/report-types/user-story.md && \
  git commit -m "docs(types): user-story recipe (Given/When/Then)"
```

---

## Task 14: `references/audience-modifiers/engineers.md`

**Files:**
- Create: `references/audience-modifiers/engineers.md`

- [ ] **Step 1: Write `references/audience-modifiers/engineers.md`**

````markdown
# Audience Modifier: engineers

Engineers reading a visual-report-builder report want precision, code
references, and skip-the-fluff explanations. The skeleton stays — these
rules adjust the prose, the depth, and what gets emphasized.

## Tone

- Terse. No "delightfully", "powerful", "seamless".
- Direct. State the fact, then the implication.
- Precise. Use exact identifiers (file paths, commit SHAs, table names).

## Include

- **File paths** with line numbers when relevant (`src/auth.ts:42`)
- **Code snippets** (max 8 lines per block) when behavior is non-obvious
- **Error codes / HTTP statuses** as `.err` inline badges
- **Schema details** when state-shape matters (column names, types)
- **Commit refs** when pointing at a specific change (`commit abc123`)
- **CLI commands** in fenced blocks with expected output

## Skip / minimize

- Business impact framing (engineers can map technical → business themselves)
- Long analogies — replace with a one-line "concretely:"
- "Why we built this" if it's already obvious from context
- Stakeholder-style intros — get to the substance

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | One-sentence technical summary, not a marketing line |
| Executive panel | Replace soft framing with hard facts ("3 of 4 services healthy", not "We're making great progress") |
| Body sections | Heavier on `<pre><code>` blocks; lighter on prose paragraphs |
| Quick reference | Maximally exhaustive — file paths, env vars, config keys, commit SHAs |

## Length

Engineer reports skew shorter than non-tech ones — 30-40% fewer words
per section. Don't pad.

## Worked sample

Status report opening for engineers:

> **Hero lede:** "Backend OAuth + sync edge functions deployed on
> `mxalbyzxfnfmrygpbstp`. Sandbox config saved. 3 testers whitelisted.
> Ready for end-to-end with `felipesharpods`."

Status report opening for non-tech (for contrast — see
`stakeholders-non-tech.md`):

> **Hero lede:** "La integración con TikTok está lista para pruebas
> internas; falta confirmar el flujo con una cuenta de prueba real
> antes de pedir aprobación de TikTok."
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/audience-modifiers/engineers.md && \
  git commit -m "docs(audience): engineers tone modifier"
```

---

## Task 15: `references/audience-modifiers/stakeholders-non-tech.md`

**Files:**
- Create: `references/audience-modifiers/stakeholders-non-tech.md`

- [ ] **Step 1: Write `references/audience-modifiers/stakeholders-non-tech.md`**

````markdown
# Audience Modifier: stakeholders-non-tech

Non-technical stakeholders care about: business impact, user-facing
benefits, timeline, risk. They do NOT care about: file paths, schema
details, error codes. Translate technical concepts into the consequences
that matter to them.

## Tone

- Warm. Imagine you're explaining to a smart friend, not lecturing.
- Analogy-heavy. Technical concept → everyday object/situation.
- Jargon-free. Every technical term either gets explained inline or
  replaced with a plain-language equivalent.

## Include

- **Business impact** in the executive panel (revenue / users affected /
  market timing)
- **User-facing framing** — what does this mean for the user / operator?
- **Analogies** for non-obvious technical concepts (e.g., "the OAuth
  redirect is like showing your ID to a doorman before being let in")
- **Visual proof** — the hand-drawn images carry more weight here

## Skip / minimize

- Code blocks (delete them; rephrase the content as prose)
- File paths and identifiers
- Error code lists (replace with "if something goes wrong, the engineering
  team has detailed logs")
- Schema details
- Internal version numbers, sandbox IDs, etc.

## Translation table (technical → plain language)

| Technical | Plain language |
|---|---|
| Edge function | "Small server-side helper" or "robot that handles X" |
| OAuth | "The 'log in with TikTok' flow" |
| RLS / row-level security | "Privacy rules at the database level" |
| Migration | "Database change" |
| State machine | "The lifecycle of an X" (lifecycle is the key word) |
| Token encryption | "We scramble the access keys so nobody can read them" |
| Webhook | "A push notification from another system to ours" |
| Realtime subscription | "Live updates" |
| Rate limit | "How many requests per minute we're allowed" |

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | Lead with the user-facing/business framing |
| Executive panel | Lead with what changed for the business, not what's technically running |
| Quick reference | Drop most of it. Keep only links the stakeholder might click (e.g., the live app URL). |
| Implementation notes (user-story) | Skip entirely |

## Length

Non-tech reports trend longer than engineer reports — 20-30% more words —
because analogies and framing take space. Worth it for comprehension.

## Worked sample

Postmortem impact panel for non-tech:

> "Durante 47 minutos esta mañana, los operadores no pudieron conectar
> nuevas cuentas de TikTok. Las cuentas ya conectadas siguieron
> funcionando normal. Estimamos ~12 operadores afectados; ninguno
> reportó pérdida de datos."

Postmortem impact panel for engineers (for contrast):

> "47-min outage on `tiktok-oauth-init` (12:14-13:01 UTC) due to
> mis-set `OAUTH_STATE_SIGNING_KEY` after secret rotation. Existing
> `social_accounts` unaffected (no token rotation in window).
> Auth failure rate: 100% during window. No data loss."
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/audience-modifiers/stakeholders-non-tech.md && \
  git commit -m "docs(audience): stakeholders-non-tech tone modifier"
```

---

## Task 16: `references/audience-modifiers/operators.md`

**Files:**
- Create: `references/audience-modifiers/operators.md`

- [ ] **Step 1: Write `references/audience-modifiers/operators.md`**

````markdown
# Audience Modifier: operators

Operators are the end-users of the app — in Studio Sharpods' case, the
UGC creators connecting their TikTok accounts. They care about: what to
do, what to expect, what to do when things break. Reports for operators
are usually launch announcements, user-stories, or quick-reference how-tos.

## Tone

- Action-oriented. "Haz esto. Luego esto. Si pasa esto otro, haz X."
- Friendly + practical. Like a colleague walking them through it.
- Short sentences. Operators skim; bullets > paragraphs.

## Include

- **Step-by-step instructions** (use `.steps` heavily)
- **Screenshots / mockups** of the actual UI
- **What to do if X breaks** (troubleshooting section)
- **Real examples** with sample data
- **Quick reference card** with the top 3-5 things they'll need to remember

## Skip / minimize

- "Why we built this" — they don't care, they just want to use it
- Architecture / implementation details
- Internal version numbers, sandbox IDs
- Code blocks (unless they're literal CLI commands the operator runs)

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | What they can do now that they couldn't do before |
| Executive panel | Lead with: "Esto es lo que tienes que hacer" / "Here's what to do" |
| Body sections | Maximum `.steps`. Each step is one click / one decision. |
| Gotchas | Common mistakes operators make. Frame as "Si ves X, prueba Y" |
| Quick reference | Cheat sheet of the 3-5 actions they'll repeat |

## Length

Operator reports are SHORT. Aim 50% of an engineer report. Operators
won't read past page 1.

## Worked sample

Launch announcement opening for operators (TikTok connect feature):

> **Hero lede:** "Ahora puedes conectar tu cuenta de TikTok directamente
> desde el dashboard — no más enviar links por WhatsApp."
>
> **Executive panel:** "Tres pasos:
> 1. Ve a 'Cuentas Sociales' en el menú lateral.
> 2. Haz clic en 'Conectar TikTok'.
> 3. Inicia sesión con tu cuenta de TikTok cuando se abra la ventana.
> ¡Listo!"
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/audience-modifiers/operators.md && \
  git commit -m "docs(audience): operators tone modifier"
```

---

## Task 17: `references/audience-modifiers/investors.md`

**Files:**
- Create: `references/audience-modifiers/investors.md`

- [ ] **Step 1: Write `references/audience-modifiers/investors.md`**

````markdown
# Audience Modifier: investors

Investors care about: traction (numbers), market positioning, milestones
hit, risks managed, runway. Reports for investors are usually status
updates ("monthly recap"), launch announcements ("we shipped X"), or
decision memos ("we pivoted to Y").

## Tone

- Confident. Not boastful, but firm. Investors back conviction.
- Metric-heavy. Every claim backed by a number.
- Milestone-framed. Position progress against a known timeline.

## Include

- **KPIs** in the executive panel (MRR, MAU, conversion %, etc.)
- **Growth signals** — week-over-week, month-over-month deltas
- **Market positioning** — vs competitors, vs prior state
- **Milestones hit** (and dates)
- **Risks the team is managing** (not just risks that exist — the
  proactive framing matters)
- **Runway / burn** if relevant

## Skip / minimize

- Implementation details
- File paths / code
- Anything internal-only (e.g., specific employee names unless they're
  founders or notable hires)

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | A metric or milestone, framed as a sentence |
| Executive panel | 3-5 KPIs front and center. Progress bar = % of quarter goal. |
| Body sections | Charts > prose where possible. (We don't ship charts in v1; use the `.check-table` to show metrics over time.) |
| Quick reference | Replace technical refs with KPI dashboard or financial summary links |

## Length

Investor reports are MEDIUM length. Less than engineer (skip implementation),
more than operators (need context). Aim 70-80% of an engineer report.

## Worked sample

Status report executive panel for investors:

> "Q2 cierra al 67% del plan: 84 operadores activos (+34% MoM), $4,200
> MRR (+28% MoM), churn 6% (-2pp vs Q1). TikTok integration ships
> esta semana — desbloquea el segmento UGC ($120k TAM en LATAM)."
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/audience-modifiers/investors.md && \
  git commit -m "docs(audience): investors tone modifier"
```

---

## Task 18: `references/audience-modifiers/mixed.md`

**Files:**
- Create: `references/audience-modifiers/mixed.md`

- [ ] **Step 1: Write `references/audience-modifiers/mixed.md`**

````markdown
# Audience Modifier: mixed

Default when the audience isn't specified, or when the report reaches
multiple audiences at once (e.g., a launch announcement that goes to
both engineers and stakeholders, or a kickoff brief shared across the
company).

## Tone

- Middle ground — friendly + precise.
- Tech terms welcomed but always explained.
- Both code blocks and analogies present.

## Include

- Code blocks AND analogies (use both — engineers skip the analogy,
  non-tech skip the code, everyone reads the prose between)
- Business impact AND technical specifics
- File paths AND user-facing benefits

## The structural trick

When in doubt: lead each major section with the WHY (everyone reads
this), then the WHAT (everyone reads this), then the HOW (engineers
read this, others skim).

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | Both: business framing + a hint at how it works |
| Executive panel | Both metrics and a 1-sentence "what's actually under the hood" |
| Body sections | Prose-heavy at the top of each section; code/details at the bottom |
| Quick reference | Mix of business-facing links AND technical refs |
| Gotchas | Frame in plain language but include the technical detail in parentheses |

## Length

Slightly longer than any single-audience report because you're saying
some things twice (technical version + plain-language version). Aim
110% of an engineer report.

## Worked sample

Launch announcement opening for mixed audience:

> **Hero lede:** "Lanzamos la integración con TikTok — los operadores
> ya pueden conectar su cuenta con un clic, y el sistema empieza a
> rastrear sus videos automáticamente vía la Display API de TikTok."

The first half ("los operadores ya pueden conectar...") is the
business framing. The second half ("vía la Display API de TikTok")
is the technical hook for engineers.
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add references/audience-modifiers/mixed.md && \
  git commit -m "docs(audience): mixed tone modifier (default)"
```

---

## Task 19: `SKILL.md` (entry point)

The skill's entry point. Small, points at references. Loaded on every invocation.

**Files:**
- Create: `SKILL.md`

- [ ] **Step 1: Write `SKILL.md`**

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add SKILL.md && \
  git commit -m "feat: SKILL.md entry point"
```

---

## Task 20: `README.md`

Install + usage + 30-second pitch.

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# visual-report-builder

A Claude Code skill that produces single-file HTML reports in a locked
hand-drawn / notebook-sketch design system. Drop in a topic + audience,
get back a beautiful, skimmable, offline-shareable artifact with 2-3
hand-drawn illustrations.

Built by [Guorks Labs](https://github.com/guorks).

![hero example](examples/tiktok-status-spanish/assets/donde-estamos.png)

## What it does

Give it:
- A **topic** (e.g., "status of our TikTok integration")
- An **audience** (engineers / non-tech / operators / investors / mixed)
- A **language** (Spanish / English)
- (optionally) a **report type** (status / postmortem / kickoff /
  launch / comparison / decision-memo / user-story)

Get back: a single self-contained `.html` file with 2-3 hand-drawn
illustrations embedded, opened in your browser.

## Install

### Option 1 — drop-in skill folder (simplest)

```bash
git clone https://github.com/guorks/visual-report-builder
cp -r visual-report-builder ~/.claude/skills/
```

That's it. Restart Claude Code if it was running. The skill will appear
in the available-skills list.

### Option 2 — Claude Code plugin

```bash
# inside Claude Code
/plugin add github.com/guorks/visual-report-builder
```

### Option 3 — read-only browse

You don't need to install it to look at the examples. The
`examples/tiktok-status-spanish/` folder has a complete working report
you can open in any browser.

## Use

In any Claude Code session:

```
make me a status report for the team about our payments integration
```

Or more explicitly:

```
build a launch announcement for the new dashboard, audience non-tech, en español
```

The skill will:
1. Ask clarifying questions (if anything's missing)
2. Generate 2-3 illustrations via Higgsfield (~6 credits)
3. Render the HTML
4. Open it in your browser

## Report types

| Type | Use when |
|---|---|
| `status` | Where are we / what's done / what's next |
| `postmortem` | Something broke; here's what happened |
| `kickoff` | We're starting X; here's the plan |
| `launch` | We just shipped X; tell the world |
| `comparison` | A vs B; help me pick |
| `decision-memo` | This is the decision; documenting it |
| `user-story` | When user does X, app should Y (Given/When/Then) |

## Audience modifiers

The same content gets re-toned per audience:

| Audience | Tone |
|---|---|
| `engineers` | Terse + precise. Code, file paths, error codes welcomed. |
| `non-tech` | Warm + analogy-heavy. Jargon-free. |
| `operators` | Action-oriented. Step-by-step. What to do if X breaks. |
| `investors` | Metric-heavy. KPIs, milestones, market positioning. |
| `mixed` | Middle ground. Default when audience isn't specified. |

## Requirements

- Claude Code with the [Higgsfield MCP](https://higgsfield.ai) connected
  (the skill uses `nano_banana_pro` for illustrations).
- ~6 Higgsfield credits per report (2 credits × 3 images at 1k 16:9).
- A working `open` command (or you'll need to open the file path
  manually — the skill prints it).

## Examples

- [`tiktok-status-spanish/`](examples/tiktok-status-spanish/) — full
  status report in Spanish for an engineering team. Open
  `tiktok-integracion-estado.html` in a browser.

## What's locked vs flexible

**Locked (no customization in v1):**
- The hand-drawn cream/sketch design system
- Outfit / Inter / Caveat / JetBrains Mono fonts
- Higgsfield as the image provider
- Single-file HTML output

**Flexible:**
- Report type + audience + language (the 3 axes you pick at invocation)
- Number of sections (each report type has a recipe but you can omit
  sections if the content isn't there)
- Section content + tone (audience modifier handles)

## Roadmap

- **v0.1 (now):** 7 report types × 5 audiences × 2 languages = 70 covered
  combinations.
- **v0.2 (maybe):** Dark mode / alt themes. More languages. PDF export.
- **v1.0 (eventually):** Customizable design tokens, plugin-installable
  components, automated visual regression tests.

## License

MIT. See [`LICENSE`](LICENSE).
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add README.md && \
  git commit -m "docs: README with install + usage"
```

---

## Task 21: `.claude-plugin/plugin.json`

Plugin manifest for Claude Code's plugin distribution mechanism.

**Files:**
- Create: `.claude-plugin/plugin.json`

- [ ] **Step 1: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "visual-report-builder",
  "version": "0.1.0",
  "description": "Generate hand-drawn HTML reports for any audience — status, postmortem, kickoff, launch, comparison, decision memo, user story.",
  "publisher": "Guorks Labs",
  "license": "MIT",
  "homepage": "https://github.com/guorks/visual-report-builder",
  "skills": [
    {
      "name": "visual-report-builder",
      "path": "SKILL.md"
    }
  ],
  "requirements": {
    "mcp": ["claude_ai_higgsfield"]
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git add .claude-plugin/plugin.json && \
  git commit -m "feat: plugin manifest for distribution"
```

---

## Task 22: Deploy to `~/.claude/skills/`

So Sir can invoke the skill immediately from any project.

**Files:**
- Create: `~/.claude/skills/visual-report-builder/` (full copy of the repo content, NOT the `.git` folder)

- [ ] **Step 1: Confirm `~/.claude/skills/` exists**

Run:
```bash
mkdir -p ~/.claude/skills
ls ~/.claude/skills/
```

- [ ] **Step 2: Copy the skill (excluding `.git`)**

Run:
```bash
rm -rf ~/.claude/skills/visual-report-builder
rsync -av --exclude='.git' --exclude='docs/superpowers' \
  ~/dev/guorks_labs/visual-report-builder/ \
  ~/.claude/skills/visual-report-builder/
```

(Exclude `docs/superpowers` because spec + plan don't need to ship
with the deployed skill — they live in the repo for documentation
purposes only.)

- [ ] **Step 3: Verify**

Run:
```bash
ls -la ~/.claude/skills/visual-report-builder/
test -f ~/.claude/skills/visual-report-builder/SKILL.md && echo "✓ SKILL.md present"
test -d ~/.claude/skills/visual-report-builder/references/report-types && echo "✓ report-types/ present"
test -d ~/.claude/skills/visual-report-builder/examples/tiktok-status-spanish && echo "✓ example present"
```

Expected: all three checks print ✓.

- [ ] **Step 4: No commit needed**

The `~/.claude/skills/` deployment is a runtime copy, not a tracked location.

---

## Task 23: Skill self-test (manual)

Validate the skill works end-to-end before tagging v0.1.0.

- [ ] **Step 1: Read `SKILL.md` cold**

Open `~/.claude/skills/visual-report-builder/SKILL.md` and read it as if
you've never seen this skill before. Mentally walk through an invocation:

1. Could you identify what to ask the user? (4 questions in §Quick start)
2. Could you find the recipe for `status` report type? (yes, `references/report-types/status.md`)
3. Could you find the engineers tone? (yes, `references/audience-modifiers/engineers.md`)
4. Could you find the image-prompt boilerplate? (yes, `references/image-style-guide.md`)

If any answer is "no", the SKILL.md is too vague — fix and re-test.

- [ ] **Step 2: Cross-check every reference**

Run:
```bash
cd ~/.claude/skills/visual-report-builder && \
  for f in references/pipeline.md references/design-system.md references/image-style-guide.md references/base-html-template.html \
           references/report-types/status.md references/report-types/postmortem.md references/report-types/kickoff.md \
           references/report-types/launch.md references/report-types/comparison.md references/report-types/decision-memo.md \
           references/report-types/user-story.md \
           references/audience-modifiers/engineers.md references/audience-modifiers/stakeholders-non-tech.md \
           references/audience-modifiers/operators.md references/audience-modifiers/investors.md \
           references/audience-modifiers/mixed.md \
           examples/tiktok-status-spanish/tiktok-integracion-estado.html; do
    test -f "$f" && echo "✓ $f" || echo "✗ MISSING: $f"
  done
```

Expected: 18 ✓ lines, 0 ✗ lines.

- [ ] **Step 3: Open the canonical example in browser**

Run:
```bash
open ~/.claude/skills/visual-report-builder/examples/tiktok-status-spanish/tiktok-integracion-estado.html
```

Expected: renders identically to the original TikTok report (same layout,
same images, same text).

- [ ] **Step 4: If anything's broken, fix it back in the source repo, redeploy with rsync (Task 22 Step 2), and re-run Step 2 here**

---

## Task 24: Tag v0.1.0

**Files:**
- Modify (in git): tag `v0.1.0`

- [ ] **Step 1: Confirm clean working tree + all commits in place**

Run:
```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git status && \
  git log --oneline
```

Expected:
- `git status` shows "nothing to commit, working tree clean"
- `git log` shows ~24 commits (one per task above, plus the initial spec + author-fix commits)

- [ ] **Step 2: Tag v0.1.0**

Run:
```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git tag -a v0.1.0 -m "v0.1.0 — initial release

7 report types × 5 audience modifiers × 2 languages.
Locked hand-drawn design system. Higgsfield image generation.
Single-file offline HTML output.

Canonical example: TikTok integration status (Spanish, engineers)."
```

- [ ] **Step 3: Verify the tag**

Run:
```bash
git tag -l && git show v0.1.0 --stat | head -30
```

Expected: `v0.1.0` listed.

- [ ] **Step 4: Optional — push to GitHub**

If Sir has created a GitHub repo at `github.com/guorks/visual-report-builder`,
push:
```bash
cd ~/dev/guorks_labs/visual-report-builder && \
  git remote add origin git@github.com:guorks/visual-report-builder.git && \
  git push -u origin main --tags
```

If the GitHub repo doesn't exist yet, **do not** push. Tell Sir to create
the repo first, then run the push command.

---

## Final acceptance

After Task 24, the deliverables are:

1. ✅ Standalone repo at `~/dev/guorks_labs/visual-report-builder/` with
   `v0.1.0` tag.
2. ✅ Deployed skill at `~/.claude/skills/visual-report-builder/`.
3. ✅ Canonical example renders identically to the original TikTok report.
4. ✅ Skill is invokable from any Claude Code session in any project.

To test invocation in a real session (recommended but out-of-scope for
this plan): start a new Claude Code session, type "make me a kickoff
brief for [some project]", and the skill should appear in the
available-skills list and run through the pipeline.

If the test invocation passes, v0.1.0 is shipped. If it fails, file
issues against the appropriate task and iterate.
