# Audience Modifier: stakeholders-non-tech

Non-technical stakeholders care about: business impact, user-facing
benefits, timeline, risk. They do NOT care about: file paths, schema
details, error codes. Translate technical concepts into the consequences
that matter to them.

## Tone

- Warm. Imagine you're explaining to a smart friend, not lecturing.
- Analogy-heavy. Technical concept → everyday object/situation.
- Jargon-free. Every technical term either gets explained inline or
  replaced with a plain-language equivalent.

## Include

- **Business impact** in the executive panel (revenue / users affected /
  market timing)
- **User-facing framing** — what does this mean for the user / operator?
- **Analogies** for non-obvious technical concepts (e.g., "the OAuth
  redirect is like showing your ID to a doorman before being let in")
- **Visual proof** — the hand-drawn images carry more weight here

## Skip / minimize

- Code blocks (delete them; rephrase the content as prose)
- File paths and identifiers
- Error code lists (replace with "if something goes wrong, the engineering
  team has detailed logs")
- Schema details
- Internal version numbers, sandbox IDs, etc.

## Translation table (technical → plain language)

| Technical | Plain language |
|---|---|
| Edge function | "Small server-side helper" or "robot that handles X" |
| OAuth | "The 'log in with TikTok' flow" |
| RLS / row-level security | "Privacy rules at the database level" |
| Migration | "Database change" |
| State machine | "The lifecycle of an X" (lifecycle is the key word) |
| Token encryption | "We scramble the access keys so nobody can read them" |
| Webhook | "A push notification from another system to ours" |
| Realtime subscription | "Live updates" |
| Rate limit | "How many requests per minute we're allowed" |

## Section-level adjustments

| Section | Adjustment |
|---|---|
| Hero `.lede` | Lead with the user-facing/business framing |
| Executive panel | Lead with what changed for the business, not what's technically running |
| Quick reference | Drop most of it. Keep only links the stakeholder might click (e.g., the live app URL). |
| Implementation notes (user-story) | Skip entirely |

## Length

Non-tech reports trend longer than engineer reports — 20-30% more words —
because analogies and framing take space. Worth it for comprehension.

## Worked sample

Postmortem impact panel for non-tech:

> "Durante 47 minutos esta mañana, los operadores no pudieron conectar
> nuevas cuentas de TikTok. Las cuentas ya conectadas siguieron
> funcionando normal. Estimamos ~12 operadores afectados; ninguno
> reportó pérdida de datos."

Postmortem impact panel for engineers (for contrast):

> "47-min outage on `tiktok-oauth-init` (12:14-13:01 UTC) due to
> mis-set `OAUTH_STATE_SIGNING_KEY` after secret rotation. Existing
> `social_accounts` unaffected (no token rotation in window).
> Auth failure rate: 100% during window. No data loss."

## Tone fingerprint

Used by `src/eval/tone.ts` as a structural check on the prose.

```yaml
tone_must_include_any_of: [users, operators, team, customers, business, impact, benefit, ready]
tone_must_avoid: [edge function, schema, commit sha, pkce, hkdf, rls, jwt]
```

The audience eval passes when the rendered prose includes **at least
one** include-phrase AND **none** of the avoid-phrases. Adjust these
lists when the modifier's stylebook genuinely changes; never to silence
a regression you haven't read.
