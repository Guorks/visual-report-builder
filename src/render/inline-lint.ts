import type { Report, SectionNode } from "../schema.ts";

const ALLOWED_TAGS = new Set([
  "strong", "em", "b", "i", "code", "a", "br", "small", "sub", "sup",
  "ul", "ol", "li", "span",
]);
const HARD_REJECT_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "img", "svg",
]);
const ALLOWED_CLASSES = new Set([
  "handwrite", "scribble", "err", "match", "tester-pill",
  "badge-red", "badge-gold", "badge-green",
]);
const ALLOWED_STYLE_PROPS = /^(font-size|color|text-align|margin(-\w+)?|padding(-\w+)?)$/;

export const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
export const ATTR_RE = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
const UNQUOTED_ATTR_RE = /([a-zA-Z-]+)\s*=\s*[^\s"'>][^\s>]*/g;
const BARE_ON_ATTR_RE = /(?:^|[\s/])(on[a-zA-Z]+)(?=[\s/]|$)/gi;

export type LintResult = { errors: string[]; warnings: string[] };

// ATTR_RE only matches quoted values, so anything it leaves behind is either an
// unquoted value assignment or a bare attribute name — both hard errors (an
// unquoted on*/href value would otherwise bypass the allowlist entirely).
// Shared so other linters over the same TAG_RE/ATTR_RE grammar inherit the fix.
export function findUnquotedAttrIssues(attrs: string, path: string): string[] {
  const issues: string[] = [];
  const leftover = attrs.replace(ATTR_RE, " ");
  for (const m of leftover.matchAll(UNQUOTED_ATTR_RE)) {
    issues.push(`${path}: unquoted attribute value for "${m[1]!.toLowerCase()}" — quote all attribute values`);
  }
  const bare = leftover.replace(UNQUOTED_ATTR_RE, " ");
  for (const m of bare.matchAll(BARE_ON_ATTR_RE)) {
    issues.push(`${path}: bare event handler attribute ${m[1]!.toLowerCase()}`);
  }
  return issues;
}

// TAG_RE only matches a tag when a literal '>' terminates it within the field.
// A raw-html field whose '<' has no following '>' is never iterated by TAG_RE,
// so the linter would otherwise report zero errors while the browser forms the
// element by consuming the renderer's own trailing template markup (e.g. the
// </p> after a paragraph body). Strip well-formed tags, then reject any
// residual '<' directly followed by a letter, '/', or '!' — that's an
// unterminated tag opener, comment opener ('<!--'), or CDATA opener
// ('<![CDATA['). Legit prose '<' (a < b, 5 < 10, x <3) is never followed by a
// letter, slash, or '!', so it's untouched.
export function findUnterminatedTag(html: string, path: string): string[] {
  const residual = html.replace(TAG_RE, "");
  return /<(\/?[a-zA-Z]|!)/.test(residual) ? [`${path}: unterminated tag ('<' without a closing '>')`] : [];
}

export function lintInlineHtml(html: string, path: string): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  errors.push(...findUnterminatedTag(html, path));
  for (const m of html.matchAll(TAG_RE)) {
    if (m[1] === "/") continue; // closing tags carry no attributes; checked once at the opening tag
    const tag = m[2]!.toLowerCase();
    const attrs = m[3] ?? "";
    if (HARD_REJECT_TAGS.has(tag)) {
      errors.push(`${path}: forbidden tag <${tag}>`);
      continue;
    }
    if (!ALLOWED_TAGS.has(tag)) warnings.push(`${path}: tag <${tag}> is outside the inline allowlist`);
    for (const a of attrs.matchAll(ATTR_RE)) {
      const name = a[1]!.toLowerCase();
      const value = (a[3] ?? a[4] ?? "").trim();
      if (/^on/.test(name)) { errors.push(`${path}: event handler attribute ${name}`); continue; }
      if (name === "href" && !/^(https?:\/\/|mailto:|#)/i.test(value)) {
        errors.push(`${path}: href scheme not allowed: ${value.slice(0, 40)}`);
      } else if (name === "class") {
        for (const cls of value.split(/\s+/).filter(Boolean)) {
          if (!ALLOWED_CLASSES.has(cls)) warnings.push(`${path}: unknown class "${cls}"`);
        }
      } else if (name === "style") {
        if (/url\s*\(|expression/i.test(value)) { errors.push(`${path}: style value contains url()/expression`); continue; }
        for (const decl of value.split(";").map((s) => s.trim()).filter(Boolean)) {
          const prop = decl.split(":")[0]?.trim().toLowerCase() ?? "";
          if (!ALLOWED_STYLE_PROPS.test(prop)) warnings.push(`${path}: style property "${prop}" outside allowlist`);
        }
      } else if (!["translate", "href", "class", "style"].includes(name)) {
        warnings.push(`${path}: attribute "${name}" outside allowlist`);
      }
    }
    errors.push(...findUnquotedAttrIssues(attrs, path));
  }
  return { errors, warnings };
}

function fields(node: SectionNode, path: string): Array<[string, string]> {
  switch (node.kind) {
    case "paragraph": return [[`${path}.body`, node.body]];
    case "status-panel": {
      const out: Array<[string, string]> = [[`${path}.paragraph`, node.paragraph]];
      if (node.progress) out.push([`${path}.progress.note`, node.progress.note]);
      return out;
    }
    case "card": return [[`${path}.body`, node.body]];
    case "cards-2":
    case "cards-3": return node.cards.map((c, i) => [`${path}.cards[${i}].body`, c.body] as [string, string]);
    case "done-list":
    case "pending-list": return node.items.map((it, i) => [`${path}.items[${i}]`, it] as [string, string]);
    case "steps": return node.items.map((s, i) => [`${path}.items[${i}].body`, s.body] as [string, string]);
    case "check-table": return node.rows.flatMap((r, i) => r.map((c, j) => [`${path}.rows[${i}][${j}]`, c] as [string, string]));
    case "gotcha": return [[`${path}.body`, node.body]];
    case "callout": return [[`${path}.body`, node.body]];
    case "timeline": return node.items.map((it, i) => [`${path}.items[${i}].body`, it.body] as [string, string]);
    case "cta-card": return [[`${path}.body`, node.body]];
    case "action-list": return node.items.map((a, i) => [`${path}.items[${i}].text`, a.text] as [string, string]);
    case "grid-2":
    case "grid-3": return node.cells.flatMap((cell, i) => cell.flatMap((n, j) => fields(n, `${path}.cells[${i}][${j}]`)));
    default: return [];
  }
}

export function lintReport(report: Report): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const all: Array<[string, string]> = [["hero.lede", report.hero.lede]];
  report.sections.forEach((s, i) => all.push(...fields(s, `sections[${i}]`)));
  for (const [path, html] of all) {
    const r = lintInlineHtml(html, path);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  return { errors, warnings };
}
