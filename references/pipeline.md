# Invocation Pipeline

When `visual-report-builder` is invoked, follow these steps in order.
Do not skip steps. Do not change the order.

## Step 1 — Clarify scope (one round of Q&A)

If the user's invocation didn't specify all four, ask in ONE message
using the AskUserQuestion tool:

1. **Topic** — what's the report about? (e.g., "Status of our payments
   integration")
2. **Audience** — who reads this? Options: `engineers`,
   `stakeholders-non-tech`, `operators`, `investors`, `mixed`
3. **Language** — `Spanish` (es) or `English` (en). Default
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

1. `references/report-types/<type>.md` — structural recipe + schema mapping
2. `references/audience-modifiers/<audience>.md` — tone instructions + tone fingerprint
3. `references/design-system.md` — palette + classes (skim if already familiar)
4. `references/image-style-guide.md` — prompt boilerplate + failure modes
5. `src/schema.ts` — node-type contract for the IR you'll emit in step 7

## Step 3 — Plan images

The report-type file suggests typical image needs. **There is no fixed
cap** — pick the number the report actually requires. A multi-type
explainer might need 8+; a simple status update might need 2-3; a
decision memo might need 1. Write out each image's prompt mentally
before generating so you don't waste credits on bad framing.

## Step 4 — Preflight Higgsfield + check the cache

Before generating, check the local image cache for each planned prompt:

```ts
import { lookup } from "./src/observability/cache.ts";
const hit = lookup(fullPrompt, "nano_banana_pro");
```

On hit: skip Higgsfield, copy the PNG via `copyToOutput(hit.hash, dest)`,
emit a `image_cache_hit` event to `.trace.jsonl`.

On miss: continue.

```
mcp__claude_ai_higgsfield__balance
```
Confirm credits ≥ (2 × number_of_misses + 5 safety margin).

```
mcp__claude_ai_higgsfield__generate_image with get_cost: true
```
on the first un-cached prompt. Expected: 2 credits at `nano_banana_pro` 1k 16:9.

## Step 5 — Generate all images in parallel

Submit each un-cached prompt as a separate `generate_image` call (not `get_cost`).
Then poll each `job_status` with `sync: true`.

## Step 6 — Download assets + cache them

`mkdir -p <output_dir>/assets`. For each completed job, `curl` the
`rawUrl` to `<output_dir>/assets/<descriptive-slug>.png`. Use kebab-case
slugs that match what the report references.

Then call `store(prompt, "nano_banana_pro", assetPath, 2)` so the next
invocation with the same prompt is a cache hit.

## Step 7 — Author `report.json` and render

Write the report as a typed IR file at `<output_dir>/report.json` that
conforms to `src/schema.ts`. The IR is the artifact you are producing —
HTML is a pure function of it.

```bash
npx tsx bin/render.ts <output_dir>/report.json --out <output_dir>/<slug>.html
```

The renderer is deterministic: same JSON in, byte-identical HTML out.
It validates the IR against the zod schema. Schema violations exit
non-zero with the offending path.

Hard rules from the design system:
- No `any` JS — there is no JS at all. Pure HTML + inline CSS.
- All dynamic text gets `translate="no"` to prevent Chrome translator
  from breaking layout. The renderer adds this automatically.
- All Spanish strings (or English, etc.) live in the HTML — no localiza-
  tion layer; one report = one language.

## Step 8 — Open locally

```
open <output_html_path>
```
The user reviews immediately.

## Step 9 — Log + flush observability

Write `.cost.json` (CostLedger.flush) and ensure `.trace.jsonl` is
closed. If the working directory is a git repo and has a
`control-center/build-state.md` or similar session log, append a
one-paragraph entry noting the report was generated and citing the
cost (e.g. "2 cache hits + 1 miss, total 2 credits spent").

## Errors and recovery

- **Higgsfield job failed:** retry once with the same prompt. If it
  fails again, simplify the composition (fewer elements) and retry.
- **No credits:** stop and tell the user. Don't downgrade the model.
- **`open` failed (no GUI):** print the file path and tell the user
  to open it manually.
- **Schema validation failed at render:** read the zod error path,
  inspect the offending field in `report.json`. Most common cause is
  a node with an extra field — `.strict()` rejects unknown keys.
- **Output directory doesn't exist:** create it (`mkdir -p`).
- **Unexpected report quality:** inspect `<output_dir>/.trace.jsonl`
  for the actual file reads, image-prompt hashes, and durations. Run
  `npx tsx bin/eval.ts --filter <slug>` if the report is in the goldset.
