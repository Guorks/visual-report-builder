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

## Schema mapping

Map each section in the recipe above to nodes in `src/schema.ts`:

Fork figure = `figure`; resumen = `status-panel`; criteria = `check-table`; side-by-side = `cards-2` color green/red; recommendation = `card` color=purple or yellow; justification = `paragraph`; risks = `gotcha`; open questions = `pending-list`; side-by-side visuals = `figure-row`; verdict metrics = `stat-row`.

The renderer reads only the IR — never plain prose — so structural
guarantees (section ordering, required node kinds) hold the moment the
`report.json` validates against the schema.
