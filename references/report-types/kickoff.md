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

## Schema mapping

Map each section in the recipe above to nodes in `src/schema.ts`:

Hero figure = `figure`; motivation = `status-panel`; goals = `done-list`; scope visual = `figure`; plan = `steps`; team = `cards-3`; risks = `gotcha`; decisions made = `card` color=blue; open questions = `pending-list`.

The renderer reads only the IR — never plain prose — so structural
guarantees (section ordering, required node kinds) hold the moment the
`report.json` validates against the schema.
