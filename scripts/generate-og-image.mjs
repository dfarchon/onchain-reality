#!/usr/bin/env node
/**
 * Generates public/images/og-image.png from scripts/og-image.svg.
 * Requires rsvg-convert (install via: brew install librsvg).
 *
 * Layout (logo size, centering, copy) lives in og-image.svg only — edit that file, then run:
 *   node scripts/generate-og-image.mjs
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(__dirname, "og-image.svg");
const out = resolve(root, "public/images/og-image.png");

if (!existsSync(src)) {
  console.error(`[og-image] Source not found: ${src}`);
  process.exit(1);
}

try {
  execSync(`rsvg-convert -w 1200 -h 630 -o "${out}" "${src}"`, {
    stdio: "inherit",
  });
  console.log(`[og-image] Generated: public/images/og-image.png`);
} catch {
  console.warn(
    "[og-image] rsvg-convert failed — skipping OG image generation.",
  );
  console.warn("[og-image] Install with: brew install librsvg");
}
