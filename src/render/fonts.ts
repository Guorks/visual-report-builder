import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// vendor/fonts/<slug>-<weight>.woff2 — filenames map to family + weight.
// Slugs must match bin/vendor-fonts.ts's FAMILIES output.
const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../vendor/fonts");
const FAMILY_BY_SLUG: Record<string, string> = {
  caveat: "Caveat",
  inter: "Inter",
  outfit: "Outfit",
  jetbrainsmono: "JetBrains Mono",
};

let cached: string | null = null;

export function embeddedFontCss(): string {
  if (cached !== null) return cached;
  const files = readdirSync(FONT_DIR)
    .filter((f) => f.endsWith(".woff2"))
    .sort(); // sort → deterministic order
  const faces = files
    .map((f) => {
      const m = /^([a-z]+)-(\d+)\.woff2$/.exec(f);
      if (!m) return "";
      const family = FAMILY_BY_SLUG[m[1]!] ?? m[1]!;
      const weight = m[2]!;
      const b64 = readFileSync(join(FONT_DIR, f)).toString("base64");
      return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
    })
    .filter(Boolean);
  cached = faces.join("");
  return cached;
}
