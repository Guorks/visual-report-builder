# Design: v0.3 "Expressiveness" — richer nodes, governed HTML, flexible images

**Date:** 2026-07-10
**Author:** Guorks Labs (drafted by Claude, from a comprehensive audit of `main` @ `4088c4e`)
**Status:** Approved 2026-07-10 (owner resolved all open questions — see §9)
**Supersedes nothing; builds on:** `2026-05-27-visual-report-builder-design.md` (v0.1) and the karpathy-pass v0.2 (typed IR + deterministic renderer + evals)

---

## 1. Problem statement

The v0.2 typed-IR architecture succeeded at what it set out to do: same
`report.json` → byte-identical HTML, a locked design system, a regression
net (goldset + structural evals + LLM judge). The audit confirms the
machinery is healthy: 9/9 renderer tests pass, `tsc --noEmit` is clean,
and double-rendering the canonical TikTok example produces identical bytes.

But the authoring agent — and the human behind it — routinely hits the
walls of the 20-node vocabulary. The symptom reported by the user:

> "I feel limited, like it's only obligating me to use the JSON. Sometimes
> the agent should create more custom HTML and include more images."

The audit shows this feeling is structurally justified, in three ways:

### 1.1 The recipes promise components the schema doesn't have

The report-type recipes in `references/report-types/` describe sections
that have **no corresponding node kind**, forcing the agent to approximate
with generic cards and tables:

| Recipe promise | File | Closest node today | Gap |
|---|---|---|---|
| "Try it now (CTA card)" | launch.md | `card` | No action/link affordance |
| "Timeline (HH:MM steps)" | postmortem.md | `steps` | Steps are numbered 1-2-3, not timestamped |
| "Action items (with owners)" | postmortem.md | `check-table` | Owners/due/done are prose, not structure |
| "Lead with numbers; quick-reference = key metrics" | investors.md | `check-table` | No KPI/stat tiles |
| "Hero (with severity badge)" | postmortem.md | `badge-row` after hero | Hero has no badge or image slot |
| "Lessons learned (Caveat-font callouts)" | postmortem.md | `gotcha` (red only) | Callouts exist in one color |
| "Side-by-side panels (image)" | comparison.md | two `figure`s in `grid-2` | Works, but undocumented and images render small with no aspect control |

Every one of these is the agent being told "build X" while holding a
toolbox without X in it.

### 1.2 The escape hatch already exists — cramped, undocumented, ungoverned

Nine schema fields are tagged `.describe("raw-html")` and rendered
**verbatim** (`src/render/primitives.ts:31` and friends). The canonical
example `examples/tiktok-status-spanish/report.json` uses this heavily:
65 `<code>` tags, 19 `<strong>`, whole `<ul style="…">` lists, and
`<span style="font-size: 13px;">` — inline HTML with inline styles,
inside JSON strings.

So the reality is: **hand-written HTML is already load-bearing**, while
`SKILL.md` says "Don't hand-write HTML" and nothing defines what's
allowed inside a raw-html field. Consequences:

- The agent doesn't know it may use inline HTML, so it under-uses it
  (feels limited) or over-uses it (nothing stops a `<script>` — the
  "No JavaScript" hard rule is enforced nowhere for these fields).
- There is no *block-level* escape hatch at all. A layout the vocabulary
  can't express is simply impossible without editing the skill repo
  mid-task (`SKILL.md`'s own advice: "add the node type to src/schema.ts"
  — correct long-term, unusable mid-report).

### 1.3 Images are a single rigid shape

- Only one image node: `figure` — always full-width, always framed
  (border + shadow), captioned, 16:9.
- No hero image slot; the "hero image" convention is just "first section
  is a figure."
- No size/aspect/frame control. A small decorative doodle, a tall
  phone-mockup (9:16), or a frameless transparent sketch are all
  inexpressible.
- Stale guidance caps images: `references/image-style-guide.md` says "no
  fixed cap" at the top, then step 3 of its own pipeline says "Submit all
  2-3 images in parallel." v0.1 spec language ("Aim 2-3", "More than 4
  images → bloat") survives in the repo and pulls the agent toward fewer
  images than the content wants — the second half of the user's complaint.

### 1.4 Additional audit findings (fix regardless of approach)

| # | Finding | Where | Severity |
|---|---|---|---|
| F1 | "Works offline" hard rule vs. Google Fonts loaded from network — offline, the entire hand-drawn typography collapses to system fallbacks | `src/render/layout.ts:6` | Medium |
| F2 | "Single-file HTML" claim: `local` mode needs a sibling `assets/` dir; `cdn` mode is single-file but depends on Higgsfield CDN URL longevity and network. No truly self-contained mode | `bin/render.ts`, docs | Medium |
| F3 | `cdn` mode silently falls back to relative `src` when `src_cdn` missing → recipients of a "shareable" file get broken images with no warning | `src/render/primitives.ts:37` | Medium |
| F4 | `check-table` row length is not validated against `headers` length → ragged tables render silently | `src/schema.ts:167` | Low |
| F5 | "No JavaScript" rule unenforced on raw-html fields (a `<script>` in `paragraph.body` validates and renders) | schema/renderer | Medium |
| F6 | `progress.labels` hard-coded to exactly 4 | `src/schema.ts:58` | Low |
| F7 | No `@media print` CSS — v0.1 spec says "PDF export: browser print works," but browsers strip backgrounds by default, so the cream-paper aesthetic vanishes in print | `src/render/css.ts` | Low |
| F8 | No CI — tests + tsc + determinism check exist but run only when someone remembers | repo | Low |
| F9 | Duplicate `Card` / `CardNode` shape definitions | `src/schema.ts:105-120` | Cosmetic |
| F10 | `cache.prune` deletes `.png`/`.json` independently by mtime → can orphan half a pair | `src/observability/cache.ts:79` | Cosmetic |
| F11 | Contradiction: image-cap language (see §1.3) | `references/image-style-guide.md` | Low |
| F12 | 7 closed report types; no sanctioned path for a report that is none of them | `SKILL.md`, schema | Low |

---

## 2. Goals / non-goals

**Goals**

1. The agent can express every component the existing recipes describe,
   natively in the IR.
2. A governed escape hatch exists for genuinely novel layouts — without
   surrendering the locked design system, the no-JS rule, determinism,
   or the eval harness.
3. Images become a first-class layout citizen: hero slot, sizes, aspect
   ratios, frameless mode, side-by-side rows — and the docs stop
   whispering "2-3 images."
4. The sharing story matches reality: the primary use case is a report
   shared as a URL (or a file opened on someone else's machine), so
   figures resolve **CDN-first with local fallback** by default. No
   multi-MB base64 embedding (rejected — see Resolved decisions §9.1).
5. Numeric information renders as **real charts** (deterministic inline
   SVG in the hand-drawn aesthetic), not as hand-lettered numbers inside
   generated images. Generated illustrations carry *concepts*; charts
   carry *data*.
6. All F1–F12 findings resolved or explicitly waived.

**Non-goals (unchanged from v0.1 §11)**

- No theming, dark mode, or alt palettes. The escape hatch does NOT
  permit new colors/fonts — it composes existing tokens.
- No JavaScript in outputs. Ever. This proposal *strengthens* that rule
  (today it's unenforced).
- No multi-page outputs, no collaborative editing, no web UI.
- No non-Higgsfield image providers.

---

## 3. Approaches considered

### Approach A — Pure vocabulary expansion (add nodes, keep `.strict()` absolutism)

Add every missing node kind; forbid raw HTML entirely (escape today's
raw-html fields too, replacing inline HTML with a micro-markup like
`**bold**`/`` `code` ``).

- **Pros:** maximal determinism and evaluability; design system airtight.
- **Cons:** the catalog chases an infinite tail — every future gap is a
  repo PR before the report can ship; retrofitting micro-markup breaks
  every existing report.json and the goldset; the canonical example
  proves inline HTML is already needed. This fights reality.

### Approach B — Open raw-HTML block node (maximal freedom)

Add `{kind: "html", body: string}`, unvalidated, and tell the agent to
use it whenever the vocabulary pinches.

- **Pros:** the limitation disappears overnight; zero schema churn.
- **Cons:** the locked design system becomes advisory — agents under
  deadline pressure will reach for the hatch first, and reports drift
  back to generic AI output (the exact failure the skill was built to
  prevent); no-JS unenforceable; eval word counts / structural checks
  go blind inside opaque blobs; quality regressions invisible.

### Approach C — Three-tier hybrid: expand vocabulary + govern inline HTML + gated custom block ✅ RECOMMENDED

1. **Tier 1 (default):** add the ~9 nodes the recipes already assume,
   plus image flexibility. Covers ≥95% of real reports natively.
2. **Tier 2 (inline):** formalize the raw-html fields with an explicit
   allowlist, enforced by a linter in the renderer. Current practice
   becomes legal, documented, and safe.
3. **Tier 3 (block escape hatch):** a `custom` node carrying scoped
   HTML/CSS, validated hard (no JS, no external resources, namespaced
   classes), instrumented (trace event + eval counter), and paired with
   a promotion rule: *the same custom shape used twice becomes a node
   type PR*. Freedom with a ratchet back toward the type system.

Chosen because it resolves the felt limitation immediately (tier 3),
removes most future need for it (tier 1), and converts today's silent
rule-breaking into governed behavior (tier 2) — while every safeguard
that made v0.2 valuable (determinism, locked aesthetic, evals) survives.

---

## 4. Detailed design

### 4.1 Tier 1 — new node kinds (`src/schema.ts`)

All additive; every existing `report.json` stays valid.

```ts
// Generalized callout — supersedes gotcha (gotcha kept as alias)
const CalloutNode = z.object({
  kind: z.literal("callout"),
  color: CardColor,                    // green|red|blue|yellow|purple|neutral
  icon: z.string().max(4).optional(), // unicode glyph, e.g. "⚠" "💡"
  title: z.string().min(1).optional(),
  body: z.string().min(1).describe("raw-html"),
}).strict();

// KPI/stat tiles — investors.md finally gets its numbers row
const StatRowNode = z.object({
  kind: z.literal("stat-row"),
  items: z.array(z.object({
    value: z.string().min(1),          // "1.2M", "82%", "$40k"
    label: z.string().min(1),
    color: CardColor.optional(),
    note: z.string().optional(),       // small Caveat-font annotation
  }).strict()).min(2).max(4),
}).strict();

// Timestamped timeline — postmortem.md's "HH:MM steps"
const TimelineNode = z.object({
  kind: z.literal("timeline"),
  items: z.array(z.object({
    time: z.string().min(1),           // "14:03", "Day 2", "T+5min"
    title: z.string().optional(),
    body: z.string().min(1).describe("raw-html"),
    color: CardColor.optional(),       // e.g. red for the incident moment
  }).strict()).min(2),
}).strict();

// CTA card — launch.md's "Try it now"
const CtaCardNode = z.object({
  kind: z.literal("cta-card"),
  title: z.string().min(1),
  body: z.string().min(1).describe("raw-html"),
  action: z.object({
    label: z.string().min(1),
    href: z.string().optional(),       // rendered as a big sketchy button-link
  }).strict(),
  color: CardColor.default("purple").optional(),
}).strict();

// Action items with owners — postmortem.md
const ActionListNode = z.object({
  kind: z.literal("action-list"),
  items: z.array(z.object({
    text: z.string().min(1).describe("raw-html"),
    owner: z.string().optional(),      // rendered as a tester-pill
    due: z.string().optional(),
    done: z.boolean().default(false).optional(),
  }).strict()).min(1),
}).strict();

// Hand-lettered pull-quote
const QuoteNode = z.object({
  kind: z.literal("quote"),
  text: z.string().min(1),
  attribution: z.string().optional(),
}).strict();

// Side-by-side images (2-3), shared row, equal heights
const FigureRowNode = z.object({
  kind: z.literal("figure-row"),
  figures: z.array(Figure).min(2).max(3),   // Figure = extracted shape of FigureNode
}).strict();

// Hand-drawn section divider
const DividerNode = z.object({
  kind: z.literal("divider"),
  style: z.enum(["dashed", "scribble"]).default("dashed").optional(),
}).strict();
```

**Figure gains layout control** (same fields on `figure`, `figure-row`
members, and the hero figure):

```ts
const Figure = z.object({
  src: z.string().min(1),
  src_cdn: z.string().url().optional(),
  alt: z.string().min(1),
  caption: z.string().min(1).optional(),   // was required; decorative doodles need none
  width: z.enum(["full", "wide", "medium", "small"]).default("full").optional(),
  aspect: z.enum(["16:9", "1:1", "4:3", "3:4", "9:16"]).default("16:9").optional(),
  frame: z.boolean().default(true).optional(), // false = no border/shadow (transparent doodles)
  align: z.enum(["center", "left", "right"]).default("center").optional(),
}).strict();
```

`aspect` is advisory metadata for layout CSS (max-width per aspect so a
9:16 image doesn't dominate the page) *and* it flows back into the image
pipeline: `references/image-style-guide.md` gains a section on choosing
aspect per composition (phone mockups 9:16, avatars 1:1, flows 16:9)
instead of hard-coding 16:9 everywhere.

**Hero gains two optional slots** (postmortem severity badge; hero image
becomes structural instead of positional):

```ts
const Hero = z.object({
  // ...existing fields...
  badges: z.array(z.object({ kind: BadgeKind, text: z.string().min(1) }).strict()).max(3).optional(),
  figure: Figure.optional(),
}).strict();
```

**Small unlocks in existing nodes:**

- `progress.labels`: `.length(4)` → `.min(2).max(6)` (F6)
- `check-table`: `superRefine` — every row's cell count must equal
  `headers.length` (F4)
- `card.title` / cards in `cards-2|3`: allow optional `icon` glyph
- Dedup `Card`/`CardNode` via a shared base shape (F9)

### 4.2 Tier 2 — the inline HTML contract

A new module `src/render/inline-lint.ts`, run by the renderer on every
`raw-html` field before emission:

**Allowed tags:** `strong em b i code a br small sub sup ul ol li span`
**Allowed attributes:** `class` (values must be design-system classes:
`handwrite scribble err match tester-pill badge-red badge-gold badge-green`),
`style` (property allowlist: `font-size margin* padding* color text-align`;
`url(` and `expression` forbidden), `href` on `a` (schemes: `https http
mailto #`), `translate`.
**Hard-rejected always:** `script style iframe object embed link meta img
svg`, any `on*` attribute, `javascript:` URLs.

Violations of the hard-reject list **fail the render** (exit non-zero,
zod-style path message) — this is what finally enforces the "No
JavaScript" hard rule (F5). Unknown-but-harmless tags/classes emit
stderr **warnings** (render succeeds), so old reports keep rendering.
`--strict-html` upgrades warnings to errors (CI uses this).

`SKILL.md` and `references/design-system.md` document the allowlist so
the agent knows exactly how much inline expressiveness it legitimately
has — replacing today's implicit "whatever the example got away with."

Determinism is unaffected: the linter validates, it does not rewrite.

### 4.3 Tier 3 — the `custom` block node

```ts
const CustomNode = z.object({
  kind: z.literal("custom"),
  html: z.string().min(1),
  css: z.string().optional(),
  note: z.string().min(10),   // REQUIRED: why no existing node fit
}).strict();
```

**Validation (render-fails on violation):**

- `html`: same hard-reject list as tier 2, but tag allowlist expands to
  block elements (`div p h3 h4 table thead tbody tr th td ul ol li
  figure figcaption` + tier-2 inline set). `img` allowed here (local
  `assets/` or `src_cdn`-style https only). Class names must be either
  design-system classes or namespaced `x-*`.
- `css`: only selectors targeting `.x-*` classes; no `@import`, no
  `url(` to non-local targets, no `position: fixed`, no animations.
  Values may reference the design tokens (`var(--green)` etc.) —
  composing the palette is the point.
- All custom CSS is concatenated into one `<style data-custom>` block
  after the base CSS, in section order → deterministic output.

**Governance (what keeps B's failure mode away):**

1. `note` is mandatory — the agent must articulate the gap.
2. Renderer emits `custom_block_used` to `.trace.jsonl` with the note.
3. Eval structural check gains `max_custom_blocks` (goldset default: 0;
   authoring guidance: >2 per report is a smell).
4. **Promotion rule** (documented in SKILL.md): if the same custom shape
   appears in two reports, open a PR adding it as a typed node. The
   hatch is a staging area, not a home.
5. `SKILL.md` ordering rule: try tier-1 nodes → tier-2 inline → only
   then `custom`.

### 4.4 Images beyond the schema — pipeline changes

1. **`cdn` becomes the default image mode** (F2): reports are shared as
   URLs or handed to people who don't have the author's `assets/`
   folder, so figures emit `src_cdn` (the Higgsfield CDN URL) when
   present. Per-figure fallback to the local `src` stays (unchanged
   renderer behavior, just the default flag flips). `--image-mode
   local` remains for authoring/offline preview. Base64 `embed` mode is
   **rejected** — multi-MB files defeat the share-a-URL use case
   (decision §9.1).
2. **The `cdn` default warns** on stderr for every figure missing
   `src_cdn` (F3) — now default-mode behavior, so it matters more.
   `--quiet` suppresses.
3. **CDN link-rot risk, documented:** Higgsfield CDN URLs are not
   guaranteed immortal. Mitigation is already structural: `report.json`
   + `assets/` stay on the author's disk and in the image cache, so a
   rotted report re-renders/re-uploads in one command. Pipeline docs
   state this explicitly.
4. **Fonts** (F1): add `--embed-fonts`, which inlines the four families
   as woff2 `data:` URIs from a checked-in `vendor/fonts/` (subset,
   ~250 KB total). Default remains network fonts — consistent with the
   CDN-first sharing model, which assumes a network anyway. Docs stop
   claiming offline-correct rendering without the flag.
5. **Purge the stale caps:** rewrite the contradicting "2-3 images"
   passages in `references/image-style-guide.md` (§ "The pipeline" step
   3) and align every doc with the v0.2 "let the report decide" rule
   (F11). Add positive guidance: decorative frameless doodles
   (`frame: false, width: small`) are cheap and encouraged for warmth;
   information-bearing figures still must earn their space.
6. **Aspect-aware prompt guidance:** image-style-guide gains per-aspect
   composition advice + the `aspect_ratio` API parameter table.

### 4.5 Chart nodes — data-driven, hand-drawn SVG

Today the only way to "show" a number visually is to bake it into a
Higgsfield illustration — where text garbles past 3 words, values can't
be trusted pixel-perfect, and regeneration costs credits. Charts should
be **computed from data in the IR**, not drawn by a diffusion model.

**Why not Chart.js / ECharts / any runtime library:** every JS chart
library violates three locked rules at once — "No JavaScript" (runtime
scripts), offline (CDN `<script>` tags), and print (canvas often drops
out). Instead, the **renderer** generates charts as inline `<svg>` at
render time, in Node, deterministically:

- Dependency: `roughjs` (used via its headless `generator` API — no DOM),
  with a fixed `seed` derived from the SHA-256 of the chart's data, so
  the same IR always yields byte-identical wobbles. Hand-drawn bars,
  arcs, and lines that match the notebook aesthetic natively.
- Colors come only from the design tokens (`--green`, `--red`, …);
  labels render in Caveat, values in JetBrains Mono. No new palette.
- Pure SVG output: no runtime JS, no network, prints correctly, embeds
  in single-file mode for free.

```ts
const ChartDatum = z.object({
  label: z.string().min(1),
  value: z.number(),
  color: CardColor.optional(),      // defaults cycle through the palette
}).strict();

const ChartBarNode = z.object({
  kind: z.literal("chart-bar"),
  title: z.string().optional(),
  data: z.array(ChartDatum).min(2).max(8),
  unit: z.string().optional(),      // "%", "credits", "$"
  caption: z.string().optional(),   // Caveat-font, like figure captions
}).strict();

const ChartDonutNode = z.object({
  kind: z.literal("chart-donut"),
  title: z.string().optional(),
  data: z.array(ChartDatum).min(2).max(6),
  center_label: z.string().optional(),  // big Caveat number in the hole
  caption: z.string().optional(),
}).strict();

const ChartLineNode = z.object({
  kind: z.literal("chart-line"),
  title: z.string().optional(),
  series: z.array(z.object({
    name: z.string().min(1),
    color: CardColor.optional(),
    points: z.array(z.object({ x: z.string(), y: z.number() }).strict()).min(2),
  }).strict()).min(1).max(3),
  unit: z.string().optional(),
  caption: z.string().optional(),
}).strict();
```

Authoring guidance (SKILL.md + image-style-guide): **data → chart node;
concept → generated illustration.** A progress %, a cost breakdown, a
views-over-time curve are chart nodes (free, exact, regenerable); a
pipeline metaphor, a mascot moment, an architecture doodle stay
Higgsfield. `stat-row` (§4.1) covers single headline numbers; charts
cover distributions and trends. Charts also compose with `grid-2`
(chart + prose side by side) and count separately from images in evals.

### 4.6 Tooling & CI

- `bin/render.ts --validate`: parse + lint only, no output file. The
  authoring loop can check the IR before spending render/open time.
- `bin/schema.ts emit-json-schema`: export the zod schema as JSON Schema
  (via `zod-to-json-schema`) so authoring agents can use structured
  output / editor validation against the real contract.
- `@media print` block in `css.ts`: `print-color-adjust: exact`,
  sensible page margins, `break-inside: avoid` on cards/panels/figures
  (F7).
- GitHub Actions workflow (F8): `npm test`, `tsc --noEmit`, render the
  example + all goldset snapshots with `--strict-html`, double-render
  determinism `cmp`.
- `cache.prune` prunes by pair: delete `.png`+`.json` together when the
  *newer* of the two is past cutoff (F10).

### 4.7 Report type escape (F12) — small, optional

Add `"custom"` to the `ReportType` enum plus
`references/report-types/custom.md`: the agent designs its own section
recipe, states it in one sentence in `meta.extra`, and audience
modifiers still apply. Structural eval skips recipe checks for custom
type; the LLM judge still scores audience match and craft.

### 4.8 Documentation truth pass

- `SKILL.md` "Don't hand-write HTML" → "Don't hand-write *documents*.
  Inline markup inside raw-html fields follows the allowlist in
  design-system.md; block-level customization goes through the `custom`
  node, tier rules apply."
- Single-file/offline claims rewritten per §4.4.
- `references/design-system.md` gains the inline allowlist table and the
  new component classes (callout, stat-tile, timeline, cta, action-list,
  quote, figure-row, divider).
- Each report-type recipe's "Schema mapping" updated to name the new
  nodes it previously approximated.

---

## 5. Eval & testing strategy

1. **Regression:** the TikTok example must render byte-identical to
   today's output (no changes to existing nodes' emitted HTML — new CSS
   is appended, not interleaved). CI `cmp` guards this.
2. **Unit tests** (extend `src/render/__tests__/`): one render test per
   new node; inline-lint accept/reject matrix (script, on*, javascript:,
   unknown class, style url()); custom-node CSS namespacing; cdn-default
   emits `src_cdn` when present and warns per missing one; check-table
   ragged-row rejection.
3. **Structural eval:** `collectText`/`countImages`/`collectNodeKinds`
   extended to the new kinds (including `custom` word-count via
   tag-strip); new `max_custom_blocks` expectation.
4. **Goldset additions:** `launch-investors-en` updated to require
   `cta-card` + `stat-row`; new `postmortem` entry requiring `timeline`
   + `action-list`; one entry exercising `figure-row` + frameless
   figures.
5. **Chart tests:** snapshot the SVG output of each chart node for a
   fixed dataset (seeded roughness must be byte-stable across runs and
   platforms); reject NaN/negative-where-invalid values at the schema
   layer; verify chart SVGs contain no `<script>` and no external refs.
6. **Judge rubric:** add a line to `image_prompt_quality` — penalize
   reports whose content begged for a diagram/screenshot that isn't
   there (the anti-"too few images" pressure, matching the user's ask).

---

## 6. Compatibility & migration

- Schema changes are additive except the `check-table` row-length refine
  and hard-reject lint — both are *bug catchers*; the example and all
  goldset snapshots pass them (verified for the example during audit;
  CI will prove the rest).
- `figure.caption` becomes optional: existing reports unaffected.
- `gotcha` remains valid; docs mark it "alias of callout(red)".
- No changes to cache format, cost ledger, or trace event names (only
  additions).
- Version bump to 0.3.0; deployed copy at `~/.claude/skills/` re-synced
  from the repo after merge.

## 7. Sequencing (P0 → P2)

| Phase | Contents |
|---|---|
| **P0 — unblocks the user's pain** | Tier-1 nodes + Figure flexibility + hero slots; `chart-bar` + `chart-donut` (§4.5); inline-lint (tier 2); `custom` node (tier 3); doc truth pass (SKILL.md, image-style-guide caps, design-system allowlist); eval extensions; unit tests |
| **P1 — honest artifacts** | `chart-line`; flip default image mode to `cdn` + missing-`src_cdn` warnings; `--validate`; CI workflow; print CSS; check-table refine; schema small-unlocks (F4/F6/F9) |
| **P2 — nice-to-have** | `--embed-fonts` + vendored woff2; JSON Schema export; `custom` report type; cache prune pairing (F10) |

## 8. Risks

| Risk | Mitigation |
|---|---|
| Agents overuse `custom` and the aesthetic drifts | mandatory `note`, trace event, eval counter, promotion rule, SKILL.md tier ordering |
| Inline lint breaks old third-party reports | hard-fail list is tiny and unambiguous (JS vectors only); everything else warns |
| Higgsfield CDN links rot → shared reports lose images | `report.json` + `assets/` + image cache persist locally; re-render/re-upload is one command; pipeline docs say to keep them |
| Node vocabulary growth bloats renderer | each node is ~15 lines of primitives.ts; promotion rule keeps additions demand-driven |
| Adding CSS changes the bytes of re-rendered old reports | Accepted: the determinism contract is "same IR + same renderer version → identical bytes," not stability across versions. CSS stays a static per-version string (no conditional emission); CI's double-render `cmp` guards the contract that matters. |

## 9. Resolved decisions (owner review, 2026-07-10)

1. **Image mode:** the primary use case is sharing a URL — recipients
   never have the author's disk. Default flips to `cdn` (Higgsfield URL
   first, local `src` as per-figure fallback). Base64 `embed` mode is
   **rejected**: never ship the megabytes. `local` mode stays for
   authoring/offline preview.
2. **Fonts:** vendor the subset woff2 files in the repo (~250 KB) behind
   `--embed-fonts`; determinism beats cleverness. Stays P2 — the
   CDN-first model assumes a network, so this is low urgency.
3. **CTA links:** yes — `cta-card.action.href` uses the same scheme
   allowlist as tier-2 links (`https http mailto #`).
4. **Chart style:** hand-drawn rough strokes (roughjs, seeded). It's the
   skill's identity. A `style: "clean"` override only if someone
   actually complains one day.

---

## End of spec
