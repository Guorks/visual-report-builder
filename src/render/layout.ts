import type { Report } from "../schema.ts";
import type { RenderOptions } from "./index.ts";
import { CSS } from "./css.ts";
import { escape, renderSection, renderFigure } from "./primitives.ts";
import { embeddedFontCss } from "./fonts.ts";

const FONTS_LINK = `<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;

export function renderHead(report: Report, customCss = "", opts: RenderOptions = {}): string {
  const fontTags = opts.embedFonts
    ? [`<style>${embeddedFontCss()}</style>`]
    : [
        `<link rel="preconnect" href="https://fonts.googleapis.com">`,
        `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
        FONTS_LINK,
      ];
  return [
    `<!doctype html>`,
    `<html lang="${escape(report.meta.language)}">`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escape(report.meta.title)}</title>`,
    ...fontTags,
    `<style>${CSS}</style>`,
    ...(customCss ? [`<style data-custom>${customCss}</style>`] : []),
    `</head>`,
  ].join("\n");
}

export function renderHero(report: Report, opts: RenderOptions = {}): string {
  const { hero, meta } = report;
  const metaParts = [
    `<span translate="no">${escape(meta.date)}</span>`,
    `<span>·</span>`,
    `<span translate="no">${escape(meta.project)}</span>`,
  ];
  if (meta.extra) {
    metaParts.push(`<span>·</span>`);
    metaParts.push(`<span translate="no">${escape(meta.extra)}</span>`);
  }
  const accent = `<span style="color: var(--purple)" translate="no">${escape(hero.h1_accent)}</span>`;
  const h1 = [
    hero.h1_pre ? escape(hero.h1_pre) : "",
    accent,
    hero.h1_post ? escape(hero.h1_post) : "",
  ]
    .filter(Boolean)
    .join(" ");
  const badges = hero.badges
    ? `<div class="hero-badges">${hero.badges
        .map((b) => `<span class="badge-${b.kind}" translate="no">${escape(b.text)}</span>`)
        .join(" ")}</div>`
    : "";
  const heroFigure = hero.figure ? renderFigure(hero.figure, opts) : "";
  return [
    `<header class="hero">`,
    `<div class="kicker" translate="no">${escape(hero.kicker)}</div>`,
    badges,
    `<h1 translate="no">${h1}</h1>`,
    `<p class="lede" translate="no">${hero.lede}</p>`,
    `<div class="meta-row">${metaParts.join("")}</div>`,
    heroFigure,
    `</header>`,
  ].join("");
}

export function renderFooter(report: Report): string {
  const lines = report.meta.footer_lines
    .map((l) => `<p translate="no">${escape(l)}</p>`)
    .join("");
  return `<div class="footer">${lines}</div>`;
}

export function renderDocument(report: Report, opts: RenderOptions = {}, customCss = ""): string {
  const sections = report.sections.map((s) => renderSection(s, opts)).join("\n");
  return [
    renderHead(report, customCss, opts),
    `<body>`,
    `<div class="wrap">`,
    renderHero(report, opts),
    sections,
    renderFooter(report),
    `</div>`,
    `</body>`,
    `</html>`,
    "",
  ].join("\n");
}
