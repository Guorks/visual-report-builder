import { TAG_RE, ATTR_RE, findUnquotedAttrIssues, findUnterminatedTag } from "./inline-lint.ts";

const BLOCK_ALLOWED = new Set([
  "div", "p", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption", "img", "blockquote",
  "strong", "em", "b", "i", "code", "a", "br", "small", "sub", "sup",
  "ul", "ol", "li", "span",
]);
const HARD_REJECT = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);
const DESIGN_CLASSES = new Set([
  "handwrite", "scribble", "err", "match", "tester-pill",
  "badge-red", "badge-gold", "badge-green", "card", "grid-2", "grid-3",
  "green", "red", "blue", "yellow", "purple", "caption", "figure",
]);

export type CustomLint = { errors: string[]; warnings: string[] };

export function lintCustomNode(
  node: { html: string; css?: string },
  path: string,
): CustomLint {
  const errors: string[] = [];
  const warnings: string[] = [];

  errors.push(...findUnterminatedTag(node.html, `${path}.html`));
  for (const m of node.html.matchAll(TAG_RE)) {
    if (m[1] === "/") continue; // closing tags carry no attributes; checked once at the opening tag
    const tag = m[2]!.toLowerCase();
    const attrs = m[3] ?? "";
    if (HARD_REJECT.has(tag)) { errors.push(`${path}.html: forbidden tag <${tag}>`); continue; }
    if (!BLOCK_ALLOWED.has(tag)) warnings.push(`${path}.html: tag <${tag}> outside custom allowlist`);
    for (const a of attrs.matchAll(ATTR_RE)) {
      const name = a[1]!.toLowerCase();
      const value = (a[3] ?? a[4] ?? "").trim();
      if (/^on/.test(name)) { errors.push(`${path}.html: event handler ${name}`); continue; }
      if (name === "href" && !/^(https?:\/\/|mailto:|#)/i.test(value)) errors.push(`${path}.html: href scheme not allowed`);
      if (name === "src" && !/^(assets\/|https:\/\/)/i.test(value)) errors.push(`${path}.html: img src must be assets/ or https://`);
      if (name === "style" && /url\s*\(|expression/i.test(value)) errors.push(`${path}.html: style contains url()/expression`);
      if (name === "class") {
        for (const cls of value.split(/\s+/).filter(Boolean)) {
          if (!cls.startsWith("x-") && !DESIGN_CLASSES.has(cls)) {
            errors.push(`${path}.html: class "${cls}" must be x-* or a design-system class`);
          }
        }
      }
    }
    errors.push(...findUnquotedAttrIssues(attrs, `${path}.html`));
  }

  if (node.css) {
    // CSS legitimately never needs '<' (the child combinator '>' is a
    // legitimate, common selector and is allowed); this is the
    // emission-context guard that stops a custom.css payload from closing
    // the renderer's <style data-custom> tag early — that breakout requires
    // '<' (e.g. '</style>') — and injecting a live <script> into <head>.
    if (/</.test(node.css)) errors.push(`${path}.css: '<' is not allowed in custom CSS`);
    if (/@import/i.test(node.css)) errors.push(`${path}.css: @import forbidden`);
    if (/position\s*:\s*fixed/i.test(node.css)) errors.push(`${path}.css: position: fixed forbidden`);
    if (/animation|@keyframes/i.test(node.css)) errors.push(`${path}.css: animations forbidden`);
    if (/url\s*\(\s*['"]?(?!assets\/)/i.test(node.css)) errors.push(`${path}.css: url() must point at assets/`);
    // every compound in every top-level selector must contain a .x-* class
    // (a comma group like ".x-a, body" must not smuggle global selectors)
    const selectors = node.css.replace(/\/\*[\s\S]*?\*\//g, "").split("}").map((b) => b.split("{")[0]?.trim() ?? "").filter(Boolean);
    for (const sel of selectors) {
      const parts = sel.split(",").map((p) => p.trim()).filter(Boolean);
      if (!parts.every((part) => /\.x-[a-zA-Z0-9_-]+/.test(part))) {
        errors.push(`${path}.css: selector "${sel}" must target a .x-* class`);
      }
    }
  }

  return { errors, warnings };
}
