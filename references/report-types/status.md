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

## Schema mapping

Map each section in the recipe above to nodes in `src/schema.ts`:

Hero figure = `figure`; executive panel = `status-panel`; done lists in grid = `grid-2` cells of `h3` + `done-list`; supporting card = `card` color=green; flow = `steps`; consistency = `check-table`; next steps = `card` color=yellow; comparison = `cards-2` with green/red colors; gotchas = `gotcha`; quick reference = `check-table`; file paths = `pre`.

The renderer reads only the IR — never plain prose — so structural
guarantees (section ordering, required node kinds) hold the moment the
`report.json` validates against the schema.
