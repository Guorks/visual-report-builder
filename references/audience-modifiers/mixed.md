# Audience Modifier: mixed

Default when the audience isn't specified, or when the report reaches
multiple audiences at once (e.g., a launch announcement that goes to
both engineers and stakeholders, or a kickoff brief shared across the
company).

## Tone

- Middle ground — friendly + precise.
- Tech terms welcomed but always explained.
- Both code blocks and analogies present.

## Include

- Code blocks AND analogies (use both — engineers skip the analogy,
  non-tech skip the code, everyone reads the prose between)
- Business impact AND technical specifics
- File paths AND user-facing benefits

## The structural trick

When in doubt: lead each major section with the WHY (everyone reads
this), then the WHAT (everyone reads this), then the HOW (engineers
read this, others skim).

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | Both: business framing + a hint at how it works |
| Executive panel | Both metrics and a 1-sentence "what's actually under the hood" |
| Body sections | Prose-heavy at the top of each section; code/details at the bottom |
| Quick reference | Mix of business-facing links AND technical refs |
| Gotchas | Frame in plain language but include the technical detail in parentheses |

## Length

Slightly longer than any single-audience report because you're saying
some things twice (technical version + plain-language version). Aim
110% of an engineer report.

## Worked sample

Launch announcement opening for mixed audience:

> **Hero lede:** "Lanzamos la integración con TikTok — los operadores
> ya pueden conectar su cuenta con un clic, y el sistema empieza a
> rastrear sus videos automáticamente vía la Display API de TikTok."

The first half ("los operadores ya pueden conectar...") is the
business framing. The second half ("vía la Display API de TikTok")
is the technical hook for engineers.

## Tone fingerprint

Used by `src/eval/tone.ts` as a structural check on the prose.

```yaml
tone_must_include_any_of: [team, ship, plan, scope, next, ready]
tone_must_avoid: [synergy, delightful, leverage]
```

The audience eval passes when the rendered prose includes **at least
one** include-phrase AND **none** of the avoid-phrases. Adjust these
lists when the modifier's stylebook genuinely changes; never to silence
a regression you haven't read.
