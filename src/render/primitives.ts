import type { SectionNode } from "../schema.ts";
import type { RenderOptions } from "./index.ts";

import { escape, attr } from "./text.ts";
import { renderChartBar, renderChartDonut } from "./charts.ts";
export { escape };

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
    case "figure":
      return renderFigure(node, opts);
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
    case "callout": {
      const icon = node.icon ? `<span class="callout-icon">${escape(node.icon)}</span>` : "";
      const title = node.title ? `<strong translate="no">${escape(node.title)}</strong> ` : "";
      return `<div class="callout callout-${node.color}">${icon}${title}<span translate="no">${node.body}</span></div>`;
    }
    case "stat-row": {
      const tiles = node.items
        .map((s) => {
          const cls = s.color ? ` stat-${s.color}` : "";
          const note = s.note ? `<div class="stat-note handwrite" translate="no">${escape(s.note)}</div>` : "";
          return `<div class="stat-tile${cls}"><div class="stat-value" translate="no">${escape(s.value)}</div><div class="stat-label" translate="no">${escape(s.label)}</div>${note}</div>`;
        })
        .join("");
      return `<div class="stat-row">${tiles}</div>`;
    }
    case "timeline": {
      const items = node.items
        .map((it) => {
          const cls = it.color ? ` timeline-${it.color}` : "";
          const title = it.title ? `<strong translate="no">${escape(it.title)}</strong> ` : "";
          return `<li class="timeline-item${cls}"><span class="timeline-time" translate="no">${escape(it.time)}</span><span translate="no">${title}${it.body}</span></li>`;
        })
        .join("");
      return `<ol class="timeline">${items}</ol>`;
    }
    case "cta-card": {
      const cls = `cta-card ${node.color ?? "purple"}`;
      const btn = node.action.href
        ? `<a class="cta-button" href="${attr(node.action.href)}" translate="no">${escape(node.action.label)}</a>`
        : `<span class="cta-button" translate="no">${escape(node.action.label)}</span>`;
      return `<div class="${cls}"><h3 translate="no">${escape(node.title)}</h3><p translate="no">${node.body}</p>${btn}</div>`;
    }
    case "action-list": {
      const items = node.items
        .map((a) => {
          const cls = a.done ? "action-item done" : "action-item";
          const owner = a.owner ? ` <span class="tester-pill" translate="no">${escape(a.owner)}</span>` : "";
          const due = a.due ? ` <small translate="no">${escape(a.due)}</small>` : "";
          return `<li class="${cls}"><span translate="no">${a.text}</span>${owner}${due}</li>`;
        })
        .join("");
      return `<ul class="action-list">${items}</ul>`;
    }
    case "quote": {
      const cite = node.attribution ? `<cite translate="no">${escape(node.attribution)}</cite>` : "";
      return `<blockquote class="quote"><p class="handwrite" translate="no">${escape(node.text)}</p>${cite}</blockquote>`;
    }
    case "figure-row": {
      const figs = node.figures.map((f) => renderFigure(f, opts)).join("");
      return `<div class="figure-row">${figs}</div>`;
    }
    case "divider":
      return node.style === "scribble"
        ? `<div class="divider divider-scribble" aria-hidden="true">~~~~~~~</div>`
        : `<div class="divider divider-dashed" aria-hidden="true"></div>`;
    case "chart-bar":
      return renderChartBar(node);
    case "chart-donut":
      return renderChartDonut(node);
    case "custom":
      return `<div class="custom-block">${node.html}</div>`;
  }
}

export function renderFigure(
  fig: {
    src: string; src_cdn?: string; alt: string; caption?: string;
    width?: "full" | "wide" | "medium" | "small";
    aspect?: "16:9" | "1:1" | "4:3" | "3:4" | "9:16";
    frame?: boolean;
    align?: "center" | "left" | "right";
  },
  opts: RenderOptions = {},
): string {
  const src = opts.imageMode === "cdn" && fig.src_cdn ? fig.src_cdn : fig.src;
  const classes = ["figure"];
  if (fig.width && fig.width !== "full") classes.push(`figure--${fig.width}`);
  if (fig.aspect && fig.aspect !== "16:9") classes.push(`figure--a-${fig.aspect.replace(":", "x")}`);
  if (fig.frame === false) classes.push("figure--noframe");
  if (fig.align && fig.align !== "center") classes.push(`figure--${fig.align}`);
  const caption = fig.caption
    ? `<div class="caption" translate="no">${escape(fig.caption)}</div>`
    : "";
  return `<div class="${classes.join(" ")}"><img src="${attr(src)}" alt="${attr(fig.alt)}">${caption}</div>`;
}
