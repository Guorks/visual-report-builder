# Invocation Pipeline

When `visual-report-builder` is invoked, follow these steps in order.
Do not skip steps. Do not change the order.

## Step 1 — Clarify scope (one round of Q&A)

If the user's invocation didn't specify all four, ask in ONE message
using the AskUserQuestion tool:

1. **Topic** — what's the report about? (e.g., "Status of our payments
   integration")
2. **Audience** — who reads this? Options: `engineers`, `non-tech`,
   `operators`, `investors`, `mixed`
3. **Language** — `Spanish` (es-LA) or `English` (en-US). Default
   Spanish if user is writing in Spanish; otherwise English.
4. **Output path** — where to write the HTML? Default
   `<cwd>/reports/<slug>.html`. Honor any project conventions if visible
   (e.g., a `control-center/handoffs/` directory exists).

Infer **report type** from the topic. Only ask if genuinely ambiguous.

| Topic phrase | Inferred type |
|---|---|
| "status" / "where are we" / "progress" | status |
| "what happened" / "incident" / "broke" / "postmortem" | postmortem |
| "starting" / "kickoff" / "new project" / "we're beginning" | kickoff |
| "we shipped" / "launching" / "announcement" | launch |
| "A vs B" / "compare" / "which option" | comparison |
| "decided" / "we picked" / "decision memo" | decision-memo |
| "when user does X" / "user story" / "given/when/then" / "behavior" | user-story |

## Step 2 — Load context files

In order, read:

1. `references/report-types/<type>.md` — structural recipe (sections + order)
2. `references/audience-modifiers/<audience>.md` — tone instructions
3. `references/design-system.md` — palette + classes (skim if already
   familiar)
4. `references/image-style-guide.md` — prompt boilerplate + failure modes

## Step 3 — Plan images

The report-type file specifies how many images and what they show. Write
out each image's prompt mentally before generating. Aim 2-3 images. Hard
cap 4.

## Step 4 — Preflight Higgsfield

```
mcp__claude_ai_higgsfield__balance
```
Confirm credits ≥ (2 × number_of_images + 5 safety margin).

```
mcp__claude_ai_higgsfield__generate_image with get_cost: true
```
on the first prompt. Expected: 2 credits at `nano_banana_pro` 1k 16:9.

## Step 5 — Generate all images in parallel

Submit each prompt as a separate `generate_image` call (not `get_cost`).
Then poll each `job_status` with `sync: true`.

## Step 6 — Download assets

`mkdir -p <output_dir>/assets`. For each completed job, `curl` the
`rawUrl` to `<output_dir>/assets/<descriptive-slug>.png`. Use kebab-case
slugs that match what the report references.

## Step 7 — Render HTML

Start with `references/base-html-template.html`. Apply, in order:

1. Substitute the standard placeholders (`{{TITLE}}`, `{{LANG}}`, etc.)
2. For each section in the report-type recipe, write the section body
   using the audience-modifier's tone rules.
3. Embed images via relative paths (`<img src="assets/...">`).
4. Adjust the `.progress-fill` width if the report type uses a progress
   bar (status report does; others usually don't — remove the
   `.status-panel .progress` block if not applicable).

Hard rules from the design system:
- No `any` JS — there is no JS at all. Pure HTML + inline CSS.
- All dynamic text gets `translate="no"` to prevent Chrome translator
  from breaking layout.
- All Spanish strings (or English, etc.) live in the HTML — no localiza-
  tion layer; one report = one language.

## Step 8 — Open locally

```
open <output_html_path>
```
The user reviews immediately.

## Step 9 — Log

If the working directory is a git repo and has a `control-center/build-state.md`
or similar session log, append a one-paragraph entry noting the report
was generated.

## Errors and recovery

- **Higgsfield job failed:** retry once with the same prompt. If it
  fails again, simplify the composition (fewer elements) and retry.
- **No credits:** stop and tell the user. Don't downgrade the model.
- **`open` failed (no GUI):** print the file path and tell the user
  to open it manually.
- **Output directory doesn't exist:** create it (`mkdir -p`).
