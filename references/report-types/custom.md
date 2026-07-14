# Report Type: custom

**Use when:** the report fits none of the 7 named types (status,
postmortem, kickoff, launch, comparison, decision-memo, user-story).
No fixed recipe applies — you're designing the section order yourself.

## How to proceed

1. Pick the sections and their order the content actually needs. There
   is no canonical recipe table here — that's the point of `custom`.
2. State the recipe you chose in **one sentence** in `meta.extra`, e.g.
   `"custom recipe: intro then data then open questions"`. This is the
   only record of the structural intent; keep it accurate.
3. Audience modifiers still apply — read
   `references/audience-modifiers/<audience>.md` and follow its tone
   instructions exactly as you would for any other type.
4. Pick node kinds from `src/schema.ts` freely; nothing is off-limits.

## What structural eval does and doesn't check

`evaluateStructural` SKIPS `section_titles_must_include` for
`type: "custom"` — there's no fixed heading list to enforce. Every
other check still applies:
- `meta.type` / `meta.audience` / `meta.language` must match what was
  requested.
- `image_count_range` and `word_count_range`, if given.
- `required_node_kinds`, if given.
- `max_custom_blocks` — the `custom` node kind (raw HTML escape hatch)
  is still capped; don't confuse a `custom` **report type** with a
  `custom` **node kind**.

## Tone notes

No default tone — inherit whatever the audience modifier prescribes.
If the topic itself suggests a closer fit to one of the 7 named types,
use that type instead; `custom` is the fallback, not the default.

## Schema mapping

There is no fixed schema mapping. Choose nodes from `src/schema.ts`
that best represent the content, same as authoring any other type —
the renderer reads only the IR and does not care which type produced
it.
