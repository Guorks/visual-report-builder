# Audience Modifier: operators

Operators are the end-users of the app — in Studio Sharpods' case, the
UGC creators connecting their TikTok accounts. They care about: what to
do, what to expect, what to do when things break. Reports for operators
are usually launch announcements, user-stories, or quick-reference how-tos.

## Tone

- Action-oriented. "Haz esto. Luego esto. Si pasa esto otro, haz X."
- Friendly + practical. Like a colleague walking them through it.
- Short sentences. Operators skim; bullets > paragraphs.

## Include

- **Step-by-step instructions** (use `.steps` heavily)
- **Screenshots / mockups** of the actual UI
- **What to do if X breaks** (troubleshooting section)
- **Real examples** with sample data
- **Quick reference card** with the top 3-5 things they'll need to remember

## Skip / minimize

- "Why we built this" — they don't care, they just want to use it
- Architecture / implementation details
- Internal version numbers, sandbox IDs
- Code blocks (unless they're literal CLI commands the operator runs)

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | What they can do now that they couldn't do before |
| Executive panel | Lead with: "Esto es lo que tienes que hacer" / "Here's what to do" |
| Body sections | Maximum `.steps`. Each step is one click / one decision. |
| Gotchas | Common mistakes operators make. Frame as "Si ves X, prueba Y" |
| Quick reference | Cheat sheet of the 3-5 actions they'll repeat |

## Length

Operator reports are SHORT. Aim 50% of an engineer report. Operators
won't read past page 1.

## Worked sample

Launch announcement opening for operators (TikTok connect feature):

> **Hero lede:** "Ahora puedes conectar tu cuenta de TikTok directamente
> desde el dashboard — no más enviar links por WhatsApp."
>
> **Executive panel:** "Tres pasos:
> 1. Ve a 'Cuentas Sociales' en el menú lateral.
> 2. Haz clic en 'Conectar TikTok'.
> 3. Inicia sesión con tu cuenta de TikTok cuando se abra la ventana.
> ¡Listo!"

## Tone fingerprint

Used by `src/eval/tone.ts` as a structural check on the prose.

```yaml
tone_must_include_any_of: [step, do, click, open, paso, hacer, abrir, ir a]
tone_must_avoid: [architecture, internals, schema, migration]
```

The audience eval passes when the rendered prose includes **at least
one** include-phrase AND **none** of the avoid-phrases. Adjust these
lists when the modifier's stylebook genuinely changes; never to silence
a regression you haven't read.
