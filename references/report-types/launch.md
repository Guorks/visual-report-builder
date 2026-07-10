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

## Schema mapping

Map each section in the recipe above to nodes in `src/schema.ts`:

Hero = `figure`; what-is-it = `status-panel`; why-it-matters = `cards-3` (user/business/market); how-it-works = `figure` + `steps`; CTA = `card` color=purple; behind-the-scenes = `paragraph` + optional `cards-3`; credits = `cards-3`; Try-it-now = `cta-card`; key metrics = `stat-row`; product hero = `hero.figure`.

The renderer reads only the IR — never plain prose — so structural
guarantees (section ordering, required node kinds) hold the moment the
`report.json` validates against the schema.
