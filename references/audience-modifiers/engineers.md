# Audience Modifier: engineers

Engineers reading a visual-report-builder report want precision, code
references, and skip-the-fluff explanations. The skeleton stays — these
rules adjust the prose, the depth, and what gets emphasized.

## Tone

- Terse. No "delightfully", "powerful", "seamless".
- Direct. State the fact, then the implication.
- Precise. Use exact identifiers (file paths, commit SHAs, table names).

## Include

- **File paths** with line numbers when relevant (`src/auth.ts:42`)
- **Code snippets** (max 8 lines per block) when behavior is non-obvious
- **Error codes / HTTP statuses** as `.err` inline badges
- **Schema details** when state-shape matters (column names, types)
- **Commit refs** when pointing at a specific change (`commit abc123`)
- **CLI commands** in fenced blocks with expected output

## Skip / minimize

- Business impact framing (engineers can map technical → business themselves)
- Long analogies — replace with a one-line "concretely:"
- "Why we built this" if it's already obvious from context
- Stakeholder-style intros — get to the substance

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | One-sentence technical summary, not a marketing line |
| Executive panel | Replace soft framing with hard facts ("3 of 4 services healthy", not "We're making great progress") |
| Body sections | Heavier on `<pre><code>` blocks; lighter on prose paragraphs |
| Quick reference | Maximally exhaustive — file paths, env vars, config keys, commit SHAs |

## Length

Engineer reports skew shorter than non-tech ones — 30-40% fewer words
per section. Don't pad.

## Worked sample

Status report opening for engineers:

> **Hero lede:** "Backend OAuth + sync edge functions deployed on
> `mxalbyzxfnfmrygpbstp`. Sandbox config saved. 3 testers whitelisted.
> Ready for end-to-end with `felipesharpods`."

Status report opening for non-tech (for contrast — see
`stakeholders-non-tech.md`):

> **Hero lede:** "La integración con TikTok está lista para pruebas
> internas; falta confirmar el flujo con una cuenta de prueba real
> antes de pedir aprobación de TikTok."

## Tone fingerprint

Used by `src/eval/tone.ts` as a structural check on the prose.

```yaml
tone_must_include_any_of: [edge function, supabase, commit, redirect_uri, scope, schema, migration, pkce, secret, token]
tone_must_avoid: [delightful, powerful, seamless, exciting, journey, synergy, leverage]
```

The audience eval passes when the rendered prose includes **at least
one** include-phrase AND **none** of the avoid-phrases. Adjust these
lists when the modifier's stylebook genuinely changes; never to silence
a regression you haven't read.
