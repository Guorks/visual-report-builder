# Report Type: user-story

**Use when:** "describe a desired app behavior — given/when/then"

Agile-standard user story / behavior spec. Best for "when the user does
X, the app should do Y" — feature requests, behavior changes, animations,
interaction details.

## Section recipe (top to bottom)

| # | Section | What goes here | Images |
|---|---|---|---|
| 1 | Hero | Story title — short, descriptive ("Confetti al cumplir 1k vistas") | — |
| 2 | Hero image | The desired moment visualized — confetti flying, modal opening, button glow, etc. | ✅ #1 |
| 3 | Given / When / Then | `.grid-3` of bordered cards (NOT status-panel). Each card = one big label (GIVEN / WHEN / THEN) + 1-2 sentence content. | — |
| 4 | Comportamiento paso a paso / Behavior step-by-step | Numbered `.steps` describing the exact sequence | — |
| 5 | Mockup / sequence | Side-by-side: "estado actual" (current) vs "estado esperado" (expected). Or a 3-panel sequence of the animation. | ✅ #2 |
| 6 | Criterios de aceptación / Acceptance criteria | `.done-list` with green ✓ — what proves it works | — |
| 7 | Edge cases | `.gotcha` callouts — "qué pasa si X es null", "qué pasa si no hay internet", etc. | — |
| 8 | Fuera de alcance / Out of scope | Grey-tinted section (`.card` with `var(--ink-muted)` text) — what this story explicitly does NOT include | — |
| 9 | Notas de implementación / Implementation notes (optional) | Hints for the engineer — only if helpful. Skip for non-tech audiences. | — |
| 10 | Referencias | Linked components, related stories, designs | — |

## Image plan

2 total:
1. **The desired moment** — the single most important visual of the
   behavior. Confetti / modal / glow / transition mid-flight.
2. **Before/after sequence** — 2 or 3 panels showing the state change.
   "Before" panel + arrow + "After" panel.

## Worked example

The user's "confetti on milestone" example:

- **Story title:** "Cuando el operador llega a 1,000 vistas, celebramos"
- **Given:** Operador ha conectado al menos una cuenta TikTok.
- **When:** Sumar todas las vistas de sus submissions activos cruza
  los 1,000 por primera vez.
- **Then:** Confetti cubre la pantalla por 3s + toast "🎉 ¡Primera meta!".
- **Acceptance:** Dispara solo una vez por hito / no flicker para
  `prefers-reduced-motion` / no se re-dispara al re-render.
- **Edge cases:** Tab en background; cuenta desconectada justo al cruzar;
  múltiples cuentas contribuyendo a la suma.

## Tone notes

User stories are precise + visual. The Given/When/Then is the spine —
everything else is supporting detail. Don't write user stories for
features that don't have a specific user-observable trigger. If you
can't fill in `When:` with a concrete user action or system event,
write a kickoff or launch instead.
