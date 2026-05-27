import type { SectionNode } from "../schema.ts";
import type { RenderOptions } from "./index.ts";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

function attr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c] ?? c);
}

function tn(s: string): string {
  return `<span translate="no">${escape(s)}</span>`;
}

export function renderSection(node: SectionNode, opts: RenderOptions = {}): string {
  switch (node.kind) {
    case "h2":
      return `<h2 translate="no">${escape(node.text)}</h2>`;
    case "h3":
      return `<h3 translate="no">${escape(node.text)}</h3>`;
    case "paragraph":
      return `<p translate="no">${node.body}</p>`;
    case "pre": {
      const cls = node.language ? ` class="language-${attr(node.language)}"` : "";
      return `<pre translate="no"><code${cls}>${escape(node.body)}</code></pre>`;
    }
    case "figure": {
      const src = opts.imageMode === "cdn" && node.src_cdn ? node.src_cdn : node.src;
      return [
        `<div class="figure">`,
        `<img src="${attr(src)}" alt="${attr(node.alt)}">`,
        `<div class="caption" translate="no">${escape(node.caption)}</div>`,
        `</div>`,
      ].join("");
    }
    case "status-panel": {
      const parts: string[] = [];
      parts.push(`<div class="status-panel">`);
      parts.push(`<div class="tag" translate="no">${escape(node.tag)}</div>`);
      parts.push(`<h2 translate="no">${escape(node.heading)}</h2>`);
      parts.push(`<p translate="no">${node.paragraph}</p>`);
      if (node.progress) {
        const labels = node.progress.labels
          .map((l) => `<span translate="no">${escape(l)}</span>`)
          .join("");
        parts.push(`<div class="progress">`);
        parts.push(`<div class="progress-track">`);
        parts.push(
          `<div class="progress-fill" style="width: ${node.progress.pct}%"></div>`,
        );
        parts.push(`</div>`);
        parts.push(`<div class="progress-labels">${labels}</div>`);
        parts.push(`</div>`);
        parts.push(
          `<p style="margin-top: 14px; font-size: 13px;" translate="no"><span class="handwrite" style="font-size: 18px;">≈ ${node.progress.pct}%</span> ${node.progress.note}</p>`,
        );
      }
      parts.push(`</div>`);
      return parts.join("");
    }
    case "card": {
      const cls = `card ${node.color === "neutral" ? "" : node.color}`.trim();
      const title = node.title
        ? `<h3 translate="no">${escape(node.title)}</h3>`
        : "";
      return `<div class="${cls}">${title}<p translate="no">${node.body}</p></div>`;
    }
    case "cards-2":
    case "cards-3": {
      const gridCls = node.kind === "cards-2" ? "grid-2" : "grid-3";
      const items = node.cards
        .map((c) => {
          const cls = `card ${c.color === "neutral" ? "" : c.color}`.trim();
          const title = c.title
            ? `<h3 translate="no">${escape(c.title)}</h3>`
            : "";
          return `<div class="${cls}">${title}<p translate="no">${c.body}</p></div>`;
        })
        .join("");
      return `<div class="${gridCls}">${items}</div>`;
    }
    case "done-list": {
      const items = node.items
        .map((it) => `<li translate="no">${it}</li>`)
        .join("");
      return `<ul class="done-list">${items}</ul>`;
    }
    case "pending-list": {
      const items = node.items
        .map((it) => `<li translate="no">${it}</li>`)
        .join("");
      return `<ul class="pending-list">${items}</ul>`;
    }
    case "steps": {
      const items = node.items
        .map((s) => {
          const small = s.small
            ? `<small translate="no">${escape(s.small)}</small> `
            : "";
          return `<li><strong translate="no">${escape(s.title)}</strong>${small}<span translate="no">${s.body}</span></li>`;
        })
        .join("");
      return `<ol class="steps">${items}</ol>`;
    }
    case "check-table": {
      const head = node.headers
        .map((h) => `<th translate="no">${escape(h)}</th>`)
        .join("");
      const body = node.rows
        .map((r) => {
          const cells = r
            .map((c) => `<td translate="no">${c}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<table class="check-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }
    case "gotcha":
      return `<div class="gotcha"><strong translate="no">${escape(node.title)}</strong> <span translate="no">${node.body}</span></div>`;
    case "handwrite":
      return `<span class="handwrite" translate="no">${escape(node.text)}</span>`;
    case "scribble":
      return `<p><span class="scribble" translate="no">${escape(node.text)}</span></p>`;
    case "tester-pills": {
      const pills = node.items
        .map((t) => `<span class="tester-pill">${tn(t)}</span>`)
        .join(" ");
      return `<p>${pills}</p>`;
    }
    case "badge-row": {
      const badges = node.items
        .map(
          (b) =>
            `<span class="badge-${b.kind}" translate="no">${escape(b.text)}</span>`,
        )
        .join(" ");
      return `<p>${badges}</p>`;
    }
    case "grid-2":
    case "grid-3": {
      const cls = node.kind === "grid-2" ? "grid-2" : "grid-3";
      const cells = (node.cells as SectionNode[][])
        .map((cell) => `<div>${cell.map((n) => renderSection(n, opts)).join("")}</div>`)
        .join("");
      return `<div class="${cls}">${cells}</div>`;
    }
  }
}
