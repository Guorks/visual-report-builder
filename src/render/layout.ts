import type { Report } from "../schema.ts";
import { CSS } from "./css.ts";
import { escape, renderSection } from "./primitives.ts";

const FONTS_LINK = `<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;

export function renderHead(report: Report): string {
  return [
    `<!doctype html>`,
    `<html lang="${escape(report.meta.language)}">`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escape(report.meta.title)}</title>`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    FONTS_LINK,
    `<style>${CSS}</style>`,
    `</head>`,
  ].join("\n");
}

export function renderHero(report: Report): string {
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
  return [
    `<header class="hero">`,
    `<div class="kicker" translate="no">${escape(hero.kicker)}</div>`,
    `<h1 translate="no">${h1}</h1>`,
    `<p class="lede" translate="no">${escape(hero.lede)}</p>`,
    `<div class="meta-row">${metaParts.join("")}</div>`,
    `</header>`,
  ].join("");
}

export function renderFooter(report: Report): string {
  const lines = report.meta.footer_lines
    .map((l) => `<p translate="no">${escape(l)}</p>`)
    .join("");
  return `<div class="footer">${lines}</div>`;
}

export function renderDocument(report: Report): string {
  const sections = report.sections.map(renderSection).join("\n");
  return [
    renderHead(report),
    `<body>`,
    `<div class="wrap">`,
    renderHero(report),
    sections,
    renderFooter(report),
    `</div>`,
    `</body>`,
    `</html>`,
    "",
  ].join("\n");
}
