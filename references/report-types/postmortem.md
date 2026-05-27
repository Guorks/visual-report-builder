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

These classes are defined in `references/base-html-template.html` and documented in `references/design-system.md`. Use them directly in the hero.

## Tone notes

Honest, blame-free, action-oriented. State facts. Lead with impact (so
the reader knows immediately if this affected them). The "what went
poorly" card should be specific, not vague — name the mistake without
naming individuals.

## Schema mapping

Map each section in the recipe above to nodes in `src/schema.ts`:

Severity badge = `badge-row`; impact panel = `status-panel` (red-tinted via tag wording); timeline = `steps` with `small` for HH:MM; root cause = `paragraph` + optional `figure`; went well/poorly = `cards-2` green/red; action items = `pending-list`; lessons = `handwrite` or `scribble`; quick reference = `check-table`.

The renderer reads only the IR — never plain prose — so structural
guarantees (section ordering, required node kinds) hold the moment the
`report.json` validates against the schema.
