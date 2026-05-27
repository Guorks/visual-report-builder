# Image Style Guide (Higgsfield, locked aesthetic)

All images for a visual-report-builder report come from the Higgsfield MCP
using model `nano_banana_pro` at 16:9 aspect ratio. Cost is ~2 credits per
image at 1k resolution.

**Let the report decide how many images it needs.** No fixed cap — a
status update might need 2-3; a multi-type explainer might need 8+; a
single-decision memo might need 1. Judge by what the content requires.
Be intentional, not stingy, not bloated.

## The boilerplate prompt (always prepend)

Every image prompt MUST begin with this paragraph. The model garbles
short-on-style prompts; over-specify the aesthetic every time.

```
Hand-drawn whiteboard sketch illustration in the exact style of a cute
notebook doodle. Warm cream off-white paper background (#F7F3E6), slightly
textured. Black ink marker outlines with slightly rough, imperfect
hand-drawn lines. Soft colored-pencil shading in muted sage green, soft
coral red, dusty sky blue, lavender purple, warm yellow. Hand-lettered
text labels in [LANGUAGE], friendly handwriting style.
```

Substitute `[LANGUAGE]` with the report's language (`Spanish`, `English`,
etc.). The hand-lettered labels respect the language so glyphs render
correctly.

## The composition block

After the boilerplate, add a `Composition:` block with 3-6 short bullets
specifying exact element placement and labels. Be explicit about:

- left-to-right or top-to-bottom order
- what color each element is (use the design-system palette names: "sage
  green", "coral red", "sky blue", "lavender purple", "warm yellow")
- what text label each element carries (max 1-3 words)
- arrow directions, dashed lines, highlights

## The mascot (optional but recommended)

A cute round-headed robot mascot with antenna, headphones, and a friendly
smile, drawn in muted [color] pencil shading. Position and pose specify:

- "pointing up at the current step" — for status report hero
- "holding a magnifying glass in the bottom right" — for OAuth flow
- "giving a thumbs-up" / "sitting and waiting patiently" — for comparison
- "sitting cross-legged with a clipboard" — for kickoff
- omit entirely if the composition is already busy

## The closer (always append)

Every prompt MUST end with these lines:

```
Keep all text very short (1-3 words max per label). Friendly, educational,
clean composition, lots of whitespace. 16:9 aspect ratio.
```

## Failure modes (documented from real generations)

- **Long text → garbled.** Hard cap: 3 words per label. If you need
  precise text, put it in the HTML, not the image.
- **Images for the sake of images.** Each image should earn its space.
  If a section is already clear from prose + a table, don't add a
  decorative image. Cost adds up.
- **Forgetting `aspect_ratio: "16:9"`** in the API call. Defaults to 1:1
  and the HTML layout breaks (the figure becomes too tall).
- **Using `nano_banana` (no `_pro` suffix).** Lower quality, blurry text.
- **Generating before structure.** Decide the report's section recipe
  first, then plan images. Re-running images wastes credits.

## The pipeline

When you reach the image-generation step:

1. Call `mcp__claude_ai_higgsfield__balance` once — sanity-check credits.
2. Call `mcp__claude_ai_higgsfield__generate_image` with `get_cost: true`
   on the first prompt — confirms model + price.
3. Submit all 2-3 images in parallel (`generate_image` without `get_cost`).
4. Poll each job with `job_status` and `sync: true` (each ~10-20s).
5. Download every result to `<output_dir>/assets/<descriptive-slug>.png`
   via `curl`. **Keep the Higgsfield `rawUrl`** too — write it to the
   figure's `src_cdn` field (see pipeline step 7) so the same report can
   render either offline (local PNGs, default) or as a single shareable
   HTML file (`--image-mode cdn`).
6. Embed via relative `<img src="assets/...">` for the offline-portable
   default. The CDN URL kicks in only when the renderer is invoked with
   `--image-mode cdn`.

## Worked example: the "¿Dónde estamos?" hero (TikTok report)

The full prompt that produced `examples/tiktok-status-spanish/assets/donde-estamos.png`:

```
Hand-drawn whiteboard sketch illustration in the exact style of a cute
notebook doodle. Warm cream off-white paper background (#F7F3E6),
slightly textured. Black ink marker outlines with slightly rough,
imperfect, slightly wobbly hand-drawn lines. Soft colored-pencil shading
in muted sage green, soft coral red, dusty sky blue, lavender purple,
warm yellow. Hand-lettered Spanish text in black ink, all caps or
sentence case, friendly handwriting style.

Composition: a horizontal pipeline of six rounded sketchy rectangles
connected by hand-drawn curved arrows pointing right. The boxes are
evenly spaced and clearly readable. Box labels left to right exactly:
1) 'App creada' with a small green checkmark
2) 'Sandbox' with a small green checkmark
3) 'Permisos' with a small green checkmark
4) '3 testers' with a small green checkmark
5) 'Probar conexión' — this box is highlighted with a glowing yellow
   halo and a thicker outline (current step)
6) 'Producción' — this box is drawn in light grey pencil with a small
   clock icon, indicating future

Below the highlighted box 'Probar conexión', a cute round-headed robot
mascot with antenna, headphones, and a friendly smile is pointing up at
it with one arm. The robot is colored in muted teal-green pencil shading.

At the top center, a hand-lettered title banner reads '¿DÓNDE ESTAMOS?'
in bold black ink with a soft yellow highlight underneath.

Keep all text short (1-3 words max). Friendly, educational, lots of
whitespace. 16:9 aspect ratio.
```

That generation succeeded in one pass.

## Cost ledger + cache (v0.2)

Every invocation writes two observability files next to the output HTML:

- `.trace.jsonl` — newline-delimited events: `image_prompt_built`,
  `image_cache_hit`, `image_cache_miss`, `higgsfield_call`,
  `higgsfield_cost`, `higgsfield_retry`, `render_done`.
- `.cost.json` — aggregated credit cost for the session:
  ```json
  { "total_credits": 4, "cache_hits": 1, "cache_misses": 2, "credits_by_prompt": [...] }
  ```

The cache is content-addressable: same boilerplate + composition +
closer = same SHA-256 = cache hit, $0 cost. Lives in
`~/.cache/visual-report-builder/` (override with `VRB_CACHE_DIR`).

Use the CLI to inspect:

```bash
npx tsx bin/cache.ts info
npx tsx bin/cache.ts list
npx tsx bin/cache.ts prune --max-age-days 30
```

Iterating on a prompt no longer costs full freight. If you regenerate
an image because the first crop was bad, only the new prompt variants
hit Higgsfield — the others land via cache.
