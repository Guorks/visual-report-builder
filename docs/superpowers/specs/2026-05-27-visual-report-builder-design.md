# Design: `visual-report-builder` Skill

**Date:** 2026-05-27
**Author:** Claude Code (with Sir / felipe@guorks.ai)
**Status:** Draft — pending review
**Repo:** `~/dev/guorks_labs/visual-report-builder/` (to be created)

---

## 1. Purpose

A reusable Claude Code skill that produces **single self-contained HTML reports** in a locked hand-drawn / notebook-sketch design system. Input: a topic, an audience, and an optional report type. Output: a beautiful, skimmable, offline-shareable HTML file with 2-3 hand-drawn illustrations embedded.

The skill exists because we built one such report (the TikTok integration status for the Studio Sharpods engineering team) and the artifact's qualities — readable in <5 minutes, warm + precise tone, brand-consistent visuals — were valuable enough to want again, for any audience.

---

## 2. When to use

Trigger this skill when the user asks for:

- a status report / status update
- a postmortem / incident report / retro
- a kickoff brief / project brief
- a launch announcement
- a comparison / "X vs Y" memo
- a decision memo
- a user story / behavior spec
- "make me a report like the TikTok one"
- "build a visual handoff for [team]"
- anything else that needs to feel hand-crafted, not generic, and skim-friendly

**Do not** trigger for:

- plain markdown notes
- multi-page docs (this is single-file only)
- collaboratively-edited docs (HTML is hard to edit by multiple people)
- ad copy, landing pages, marketing surfaces (use other skills)

---

## 3. Architecture — Approach A (composable references)

Chosen over two alternatives (monolithic / template-engine) because:
- it matches the rest of the Claude Code skill ecosystem (`superpowers:*`, `higgsfield-*`)
- each piece is small enough to read in one breath
- the report-type × audience matrix (7 × 5 = 35 covered scenarios) is produced from 14 composable pieces (1 design system + 1 base skeleton + 7 report types + 5 audiences), not 35 hand-written templates

```
visual-report-builder/
├── SKILL.md                                # ~3KB entry point loaded every invocation
├── README.md                               # install + usage docs
├── LICENSE                                 # MIT
├── .claude-plugin/
│   └── plugin.json                         # plugin manifest for distribution
├── references/
│   ├── design-system.md                    # CSS tokens, fonts, colors (locked)
│   ├── image-style-guide.md                # Higgsfield prompt boilerplate + failure modes
│   ├── pipeline.md                         # step-by-step Claude follows when invoked
│   ├── base-html-template.html             # the reference HTML to copy + adapt
│   ├── report-types/
│   │   ├── status.md
│   │   ├── postmortem.md
│   │   ├── kickoff.md
│   │   ├── launch.md
│   │   ├── comparison.md
│   │   ├── decision-memo.md
│   │   └── user-story.md
│   └── audience-modifiers/
│       ├── engineers.md
│       ├── stakeholders-non-tech.md
│       ├── operators.md
│       ├── investors.md
│       └── mixed.md
├── examples/
│   └── tiktok-status-spanish/              # the canonical example
│       ├── tiktok-integracion-estado.html
│       └── assets/
│           ├── donde-estamos.png
│           ├── como-funciona-login.png
│           └── sandbox-vs-produccion.png
└── docs/
    └── superpowers/specs/
        └── 2026-05-27-visual-report-builder-design.md   # this file
```

---

## 4. The invocation pipeline

When Claude reads `SKILL.md`, it follows this flow:

1. **Clarify scope** (one Q&A round if needed):
   - Topic (what's the report about?)
   - Audience (engineers / non-tech / operators / investors / mixed)
   - Language (Spanish / English — Spanish-first like the TikTok report)
   - Output path (default: `<cwd>/reports/<slug>.html` or per-project convention)
   - Report type (auto-pick if not stated)

2. **Load context files** (read on-demand):
   - `references/report-types/<type>.md` — structural recipe
   - `references/audience-modifiers/<audience>.md` — tone instructions
   - `references/design-system.md` (always)
   - `references/image-style-guide.md` (always)

3. **Plan images** — choose 2-3 illustrations from the type's recipe.

4. **Preflight Higgsfield** — call `balance` + `get_cost: true` on the first prompt. Expected: ~2 credits per `nano_banana_pro` 1k 16:9 image.

5. **Generate in parallel** — submit all images, then poll with `sync: true`.

6. **Download to assets/** — relative to the output HTML so the artifact is offline-portable.

7. **Render HTML** — start from `references/base-html-template.html`, apply report-type section recipe + audience-modifier tone.

8. **Open locally** — `open <path>` so the user reviews immediately.

9. **Update tracking** — if invoked inside a git repo with build-state logging conventions, append an entry.

---

## 5. The 7 report types

Each report type has a Markdown file in `references/report-types/` that specifies: trigger, hero-image concept, section order, what goes in each section, how many images to plan, audience-adaptation hints.

### 5.1 Status report
**Use when:** "where are we / what's done / what's next"
**Sections:** Hero → Hero image → Executive panel (with % progress bar) → Done (green ✓) → How it works (timeline + image) → Consistency table → Next steps (yellow →) → Comparison (current vs next) → Gotchas (red) → Quick reference → Footer
**Images:** 2-3 (hero pipeline, flow diagram, comparison panels)
**Canonical example:** The TikTok report we shipped 2026-05-27.

### 5.2 Postmortem
**Use when:** "something broke; here's what happened"
**Sections:** Hero (with severity badge) → Hero image (incident timeline) → Impact panel (red-tinted) → Timeline (HH:MM steps) → Root cause → What went well / What went poorly (2-col) → Action items (with owners) → Lessons learned (Caveat-font callouts) → Quick reference → Footer
**Images:** 1-2 (incident timeline; optionally root-cause diagram)
**Audience tweaks:** Engineers see code/commit refs in root cause. Stakeholders see business impact framing.

### 5.3 Kickoff brief
**Use when:** "we're starting X — here's why, here's the plan"
**Sections:** Hero → Hero image (vision of success) → Why (motivation panel) → Goals + success criteria → Scope visual (in/out) → Plan (phase timeline) → Team & roles → Risks + mitigations → Decisions already made → Open questions → Footer
**Images:** 2 (vision + scope diagram)

### 5.4 Launch announcement
**Use when:** "we just shipped X — tell the world"
**Sections:** Hero (BIG title) → Hero image (product/feature visual) → ¿Qué es? (one-paragraph) → Why it matters (3-column: user / business / market) → How it works (image + steps) → Try it now (CTA card) → Behind the scenes (optional) → Credits → Footer
**Images:** 2 (product hero + how-it-works flow)

### 5.5 Comparison
**Use when:** "A vs B — help me pick"
**Sections:** Hero (the question) → Hero image (fork in the road) → Resumen (2 sentences per option) → Comparison table (criteria × options) → Side-by-side panels (image) → Pros/cons per option → Recommendation (highlighted) → Por qué (justification) → Risks of the chosen path → Open questions → Footer
**Images:** 2 (fork + side-by-side panels)

### 5.6 Decision memo
**Use when:** "this is the decision — documenting it"
Same content as Comparison but the **Decision panel comes second** (right after hero, before context). Reader sees the answer first; reasoning is below for those who want it.
**Sections:** Hero → THE DECISION (huge highlighted panel) → Hero image → Context → Options considered → Por qué → Tradeoffs accepted → Reversibility → Action items → Footer
**Images:** 1 (chosen-path visual)

### 5.7 User story (Sir's addition)
**Use when:** "describe a desired app behavior — given/when/then"
**Sections:** Hero (story title) → Hero image (the desired moment) → Given/When/Then panel (3 bordered cards) → Behavior step-by-step → Mockup/sequence (image: actual vs expected) → Acceptance criteria (green ✓ checklist) → Edge cases (yellow callouts) → Out of scope → Implementation notes (optional, for engineers) → Footer
**Images:** 2 (the moment + before/after sequence)
**Concrete example (your "confetti on milestone"):**
- *Given:* operator has connected ≥1 TikTok account.
- *When:* their total active-submissions views sum crosses 1,000 for the first time.
- *Then:* full-screen confetti for 3s + toast "🎉 ¡Primera meta!".
- *Acceptance:* fires only once per milestone; no flicker for `prefers-reduced-motion` users.
- *Edge cases:* background tab; account disconnected mid-cross; multiple accounts contributing.

---

## 6. The 5 audience modifiers

Each lives in `references/audience-modifiers/` as a Markdown file that prescribes *prose-level* tweaks (not structural). The skeleton stays the same; the modifier changes tone, depth, jargon, and section emphasis.

### 6.1 `engineers.md`
- Tone: terse, precise, code-aware
- Include: file paths, code snippets, error codes, schema details
- Skip: business impact framing
- Code blocks welcome; assume the reader can read TypeScript/SQL

### 6.2 `stakeholders-non-tech.md`
- Tone: warm, analogies-heavy, jargon-free
- Include: business impact, user-facing benefits, "what this means for us"
- Skip: code, file paths, internal IDs
- Every technical term: explain or rename

### 6.3 `operators.md`
- Tone: action-oriented, "do this then this"
- Include: steps the operator needs to perform, checklists, troubleshooting
- Skip: architecture; only "how to use"
- Tester pills + action cards lean heavy

### 6.4 `investors.md`
- Tone: confident, metric-heavy, milestone-framed
- Include: KPIs, market positioning, dates, growth signals
- Skip: implementation details
- Lead with numbers; quick-reference table = key metrics

### 6.5 `mixed.md`
- Default when audience isn't specified
- Tone: middle ground — friendly + precise
- Includes both technical and business framing, lightly
- Code blocks present but introduced gently

---

## 7. The design system (locked)

### 7.1 Colors
```css
--paper: #F7F3E6;        /* cream paper background */
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
```

### 7.2 Fonts (Google Fonts)
- **Outfit** (display headings, weights 500/600/700)
- **Inter** (body, weights 400/500/600)
- **Caveat** (handwritten accents, weights 500/700)
- **JetBrains Mono** (code, weights 400/500)

### 7.3 Reusable component classes
- `.status-panel` — dashed-border executive panel with tag chip
- `.figure` — wrapper for hero/section images with caption
- `.card` (+ `.green` / `.red` / `.blue` / `.yellow` / `.purple` variants)
- `.done-list` / `.pending-list` — green ✓ and yellow → bullets
- `.check-table` — comparison/criteria table
- `.steps` — counter-incremented numbered timeline
- `.gotcha` — red-bordered callout
- `.handwrite` / `.scribble` — Caveat-font accents

### 7.4 No theming
v1 ships with this aesthetic only. No dark mode, no alt palettes. v2 may add themes if real demand surfaces.

---

## 8. Image generation (Higgsfield)

### 8.1 Required model
`nano_banana_pro` — best for text/diagrams. Always 16:9 unless composition forces portrait. Cost: ~2 credits per image at 1k resolution.

### 8.2 Aesthetic boilerplate (always prepended)
```
Hand-drawn whiteboard sketch illustration in the exact style of a cute
notebook doodle. Warm cream off-white paper background (#F7F3E6), slightly
textured. Black ink marker outlines with slightly rough, imperfect
hand-drawn lines. Soft colored-pencil shading in muted sage green, soft
coral red, dusty sky blue, lavender purple, warm yellow. Hand-lettered
text labels in [LANGUAGE], friendly handwriting style.

[Composition-specific instructions: 3-6 short bullets with exact element
placement and short labels.]

Optional: A cute round-headed robot mascot with antenna, headphones,
and a friendly smile, drawn in muted [color] pencil shading, [position
and pose].

Keep all text very short (1-3 words max per label). Friendly, educational,
clean composition, lots of whitespace. 16:9 aspect ratio.
```

### 8.3 Known failure modes (documented in `image-style-guide.md`)
- Long text in images → garbled. Hard cap: 3 words per label.
- More than 4 images per report → bloat + Higgsfield cost. Aim 2-3.
- Forgetting 16:9 → defaults to 1:1, breaks the HTML layout.
- Using `nano_banana` (no `_pro`) → lower quality.
- Generating images before deciding structure → wastes credits when plan changes.

---

## 9. Standalone repo distribution

### 9.1 Location
`~/dev/guorks_labs/visual-report-builder/`

### 9.2 Distribution paths (documented in `README.md`)
1. **Drop-in skill:** `git clone … && cp -r visual-report-builder ~/.claude/skills/`
2. **Plugin install:** via `.claude-plugin/plugin.json` (Claude Code's plugin mechanism)
3. **Read-only browse:** just open `README.md` and `examples/` on GitHub

### 9.3 License
**MIT** — most permissive, lets anyone use, modify, fork.

### 9.4 Sir's immediate use
Also `cp -r` the skill into `~/.claude/skills/visual-report-builder/` so he can invoke it from any project session. The standalone repo is the source of truth; `~/.claude/skills/` is the deployed copy.

---

## 10. Languages

v1 ships templates and example prose in **Spanish (es-LA)** and **English (en-US)**. Image-prompt boilerplate is language-parameterized (the LANGUAGE token in §8.2). Adding a third language is a copy-paste of the prose strings.

---

## 11. v1 scope: explicit non-goals (YAGNI)

- ❌ Custom theming / dark mode / alt color palettes
- ❌ Non-Higgsfield image providers
- ❌ Custom font swaps
- ❌ Multi-page outputs
- ❌ PDF export (browser print works)
- ❌ Real-time collaboration / multi-editor
- ❌ Web-based UI (this is a Claude Code skill, not a SaaS)
- ❌ Translations beyond ES + EN
- ❌ Skill-internal state / config files

---

## 12. Testing strategy

Two-tier acceptance:

1. **Reproduce the TikTok report.** When invoked with `topic="estado de la integración TikTok", audience="engineers", report_type="status", language="es"`, the skill must produce an HTML structurally equivalent to the one we already shipped. The example in `examples/` is both reference and regression test.
2. **Produce one new report per type.** Hand-run each of the other 6 types with a representative prompt (e.g., "make me a kickoff for project Pact") and visually confirm the structure matches the recipe + audience modifier.

No automated tests in v1 — outputs are visual artifacts. v2 could add HTML structural assertions (sections present, image alt text present, etc.).

---

## 13. Open questions to resolve during implementation

1. Should `SKILL.md` ask all clarifying questions upfront, or progressively as it loads each reference file? (Lean: ask topic + audience + language upfront, infer report type, ask only if ambiguous.)
2. Should the `examples/tiktok-status-spanish/` copy use a sanitized version of the actual report (no Sharpods-internal IDs visible) or the real one? (Lean: keep the real one — it's already public-safe; secrets weren't rendered.)
3. Should the plugin manifest's `name` be `visual-report-builder` or namespaced like `guorks/visual-report-builder`? (Resolve when setting up plugin distribution.)

---

## 14. Implementation steps (high level — detailed plan via writing-plans skill)

1. Scaffold the repo skeleton (folders + LICENSE + README + plugin.json placeholder)
2. Copy the TikTok example into `examples/tiktok-status-spanish/` from the studiosharpods repo
3. Write `references/design-system.md` extracted from the TikTok HTML
4. Write `references/image-style-guide.md` capturing the prompt boilerplate + failure modes
5. Write `references/base-html-template.html` (a generic version of the TikTok HTML)
6. Write `references/pipeline.md` (the step-by-step Claude follows)
7. Write the 7 `references/report-types/*.md` files (recipes)
8. Write the 5 `references/audience-modifiers/*.md` files (tone modifiers)
9. Write `SKILL.md` (entry point — small, points at references)
10. Write `README.md` (install + 30-second pitch)
11. `cp -r` to `~/.claude/skills/visual-report-builder/`
12. `git add . && git commit && git tag v0.1.0`
13. Optionally: push to a new GitHub repo under Sir's account

---

## End of spec
