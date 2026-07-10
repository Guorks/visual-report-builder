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
| Body sections | Lead with `stat-row` tiles and `chart-bar`/`chart-donut` — numbers as structure, not prose. |
| Quick reference | Replace technical refs with KPI dashboard or financial summary links |

## Length

Investor reports are MEDIUM length. Less than engineer (skip implementation),
more than operators (need context). Aim 70-80% of an engineer report.

## Worked sample

Status report executive panel for investors:

> "Q2 cierra al 67% del plan: 84 operadores activos (+34% MoM), $4,200
> MRR (+28% MoM), churn 6% (-2pp vs Q1). TikTok integration ships
> esta semana — desbloquea el segmento UGC ($120k TAM en LATAM)."

## Tone fingerprint

Used by `src/eval/tone.ts` as a structural check on the prose.

```yaml
tone_must_include_any_of: [operators, revenue, growth, milestone, tam, market, mrr, payback]
tone_must_avoid: [debugged, edge function, schema, commit sha]
```

The audience eval passes when the rendered prose includes **at least
one** include-phrase AND **none** of the avoid-phrases. Adjust these
lists when the modifier's stylebook genuinely changes; never to silence
a regression you haven't read.
