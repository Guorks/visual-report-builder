# Eval harness

This directory is the regression net for `visual-report-builder`. It
grades **the typed IR (`report.json`)**, not the rendered HTML — HTML
is a deterministic function of the IR, so structural changes show up at
the IR layer first.

## Running

```bash
# Structural + tone checks only (fast, free, runs on every commit)
npx tsx bin/eval.ts

# Add LLM-as-judge (~$0.02 per entry; requires ANTHROPIC_API_KEY)
npx tsx bin/eval.ts --judge

# Single entry
npx tsx bin/eval.ts --filter status-engineers-es
```

Exit codes:
- `0` — all pass
- `1` — structural or tone failure
- `2` — judge failure (only with `--judge`)
- `3` — at least one entry has a missing snapshot (informational)

## Anatomy of a goldset entry

`goldset/<type>-<audience>-<language>.json`:

```json
{
  "prompt": "what to invoke the skill with",
  "expected": {
    "type": "status",
    "audience": "engineers",
    "language": "es",
    "section_titles_must_include": ["Lo que ya está hecho"],
    "image_count_range": [2, 3],
    "word_count_range": [800, 2200],
    "required_node_kinds": ["status-panel", "steps"],
    "tone_must_include_any_of": ["edge function", "commit"],
    "tone_must_avoid": ["delightful", "powerful"]
  },
  "snapshot_report_json": "../snapshots/status-engineers-es.json"
}
```

`snapshot_report_json` is a relative path from the goldset file.

## What each check means

- **Structural** — does the IR have the right `meta.type` /
  `meta.audience` / `meta.language`? Are the required section titles
  present? Is the image count and word count in the expected range?
  Are all required node kinds (`status-panel`, `steps`, …) used?
- **Tone** — does the rendered prose include at least one of the
  audience-specific phrases? Does it avoid any of the forbidden ones?
  Pure string matching, no LLM cost.
- **Judge** (opt-in) — `claude-haiku-4-5` grades the report on 4
  dimensions (recipe fidelity / audience match / image-prompt quality /
  overall craft) on a 1-5 scale. Default threshold is 3. Uses prompt
  caching (the rubric is cached) so cost stays near $0.02/entry.

## Adding a new entry

1. Author the report by running the skill against the chosen prompt.
2. Copy the produced `report.json` into `evals/snapshots/<slug>.json`.
3. Add `evals/goldset/<slug>.json` with the prompt + expected metadata.
4. Run `npx tsx bin/eval.ts --filter <slug>` to confirm it passes.
5. Commit both files together so the snapshot drift is visible in git.

## What counts as broken vs improved

- **Broken**: an entry that was passing now fails structural or tone.
  Either the recipe drifted (a reference file changed) or the snapshot
  is stale. Investigate before updating the snapshot — moving the
  goalposts to match the regression defeats the eval.
- **Improved**: the recipe genuinely expanded (new required section,
  tighter tone fingerprint). Update the goldset entry's `expected`
  block in the same commit as the recipe change.

## Why grade the IR, not the HTML

The IR is the small surface where authoring lives. Visual diffs on
rendered HTML are noisy (whitespace, attribute order, font loading) and
catch nothing that an IR diff doesn't also catch — sooner and cheaper.
Pixel-diffing is a v0.3 problem and only earns its keep once themes ship.
