# Design System (LOCKED)

The visual-report-builder skill ships exactly one aesthetic: a hand-drawn
notebook sketch on cream paper. No theming, no alt palettes. If you find
yourself wanting to change a token, write a new skill instead.

## Colors (CSS custom properties)

Paste these verbatim into the `:root` block of every generated HTML:

```css
:root {
  --paper: #F7F3E6;
  --paper-deep: #EFE8D4;
  --ink: #2a2620;
  --ink-soft: #5a5246;
  --ink-muted: #8a8170;
  --line: #d9cfb8;
  --green: #7ba87b;       --green-soft: #d4e3c9;
  --red: #d97a6c;         --red-soft: #f3d5cc;
  --blue: #7da3c4;        --blue-soft: #d3e0eb;
  --purple: #9b8bc4;      --purple-soft: #ddd3ea;
  --yellow: #e5b96a;      --yellow-soft: #f5e5b8;
}
```

## Fonts (Google Fonts)

Always load all four — every report uses them:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Font | Usage |
|---|---|
| **Outfit** | Display headings (h1, h2, h3) |
| **Inter** | Body prose |
| **Caveat** | Hand-lettered accents (kickers, scribbles, `.handwrite`) |
| **JetBrains Mono** | Code, IDs, file paths |

## Reusable component classes

The base template ships these — use them as-is, don't redefine:

| Class | Purpose |
|---|---|
| `.wrap` | Page container (max-width 1040px, padding) |
| `.hero` | Top-of-page block (kicker + h1 + lede + meta-row) |
| `.hero .kicker` | Caveat-font accent above h1 (rotated -1deg) |
| `.hero .lede` | Larger paragraph below h1 |
| `.meta-row` | Date + author + project metadata row |
| `.figure` | Image wrapper with `.caption` for hand-written caption |
| `.status-panel` | Executive summary — dashed border + tag chip + body |
| `.status-panel .tag` | Yellow rotated chip ("Resumen ejecutivo") |
| `.progress` / `.progress-track` / `.progress-fill` | Horizontal progress bar |
| `.card` | Generic card |
| `.card.green` / `.red` / `.blue` / `.yellow` / `.purple` | Colored card variants |
| `.grid-2` / `.grid-3` | Responsive 2 or 3 column grids |
| `.done-list` | Ul with green ✓ bullets |
| `.pending-list` | Ul with yellow → bullets |
| `.check-table` | Comparison/criteria table |
| `.steps` | Counter-incremented numbered timeline |
| `.gotcha` | Red-bordered callout |
| `.err` | Inline error-code badge |
| `.tester-pill` | Green pill (used for testers / tags / labels) |
| `.badge-red` / `.badge-gold` / `.badge-green` | Severity / status badges (use for postmortem Sev1/2/3, status indicators). Round-corner pills, ~12px, uppercase, bold. |
| `.handwrite` / `.scribble` | Caveat-font accents inline |
| `.footer` | Page footer with dashed top border |

## Typography rules

- Headings always `font-family: 'Outfit'`, weight 700 for h1/h2, 600 for h3
- Body always `font-family: 'Inter'`, weight 400
- Body color `var(--ink-soft)`, headings `var(--ink)`
- `<strong>` inside `<p>` switches color to `var(--ink)` (full strength)
- Line height: 1.65 body, 1.05 h1, 1.02 hero h1
- All h2 has a `::before` pseudo-element with a 36px black bar (signature mark)

## Image styling

Every `<img>` inside `.figure` gets:
- `max-width: 100%`
- `border-radius: 14px`
- `box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 12px 32px -8px rgba(42,38,32,0.18)`
- `border: 1px solid var(--line)`

Captions below images are Caveat-font, italic-feeling, with an arrow prefix
("↑ caption text").

## Spacing

- Section h2: `margin: 56px 0 16px` (lots of vertical breathing room)
- Section h3: `margin: 24px 0 10px`
- Card: `padding: 20px 24px`, `margin: 14px 0`
- Status panel: `padding: 28px 32px`, `margin: 32px 0`

## Reference

For the complete CSS, see `examples/tiktok-status-spanish/tiktok-integracion-estado.html`
inline `<style>` block. The `references/base-html-template.html` is the
generic version of that stylesheet, ready to copy into every new report.

## New component classes (v0.3)

| Class | Purpose |
|---|---|
| `.callout` + `.callout-<color>` | Colored callout (generalizes `.gotcha`) |
| `.stat-row` / `.stat-tile` / `.stat-value` / `.stat-label` | KPI tiles |
| `.timeline` / `.timeline-item` / `.timeline-time` | Timestamped timeline |
| `.cta-card` / `.cta-button` | Call-to-action card with sketchy button |
| `.action-list` / `.action-item` (+ `.done`) | Action items with owner pills |
| `.quote` | Hand-lettered pull-quote |
| `.figure-row` | 2-3 figures side by side |
| `.divider-dashed` / `.divider-scribble` | Section dividers |
| `.chart` / `.chart-legend` / `.chart-dot` | Hand-drawn SVG charts |
| `.figure--wide/medium/small`, `.figure--noframe`, `.figure--left/right` | Figure layout modifiers |

## Inline HTML allowlist (raw-html fields)

Fields marked `raw-html` in `src/schema.ts` accept ONLY:
- Tags: `strong em b i code a br small sub sup ul ol li span`
- `class` values: `handwrite scribble err match tester-pill badge-red badge-gold badge-green`
- `style` props: `font-size color text-align margin* padding*` (no `url()`)
- `a href` schemes: `https://` `http://` `mailto:` `#`

The renderer hard-fails on `<script>`, `on*` attributes, `javascript:`
URLs, and embeds. Anything else off-list renders with a warning.
`--strict-html` turns warnings into errors (CI mode).
