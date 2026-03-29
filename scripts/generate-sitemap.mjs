import { readdirSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
dotenv.config({ path: join(root, ".env"), quiet: true });

const publicDir = join(root, "public");
const contentDir = join(root, "src", "content");

const baseRaw =
  typeof process.env.VITE_SITE_URL === "string" &&
  process.env.VITE_SITE_URL.trim()
    ? process.env.VITE_SITE_URL.trim().replace(/\/$/, "")
    : "http://localhost:5173";

const staticPaths = ["/", "/philosophy", "/projects", "/blog"];

function listBlogSlugs() {
  try {
    const names = readdirSync(contentDir, { withFileTypes: true });
    return names
      .filter((d) => d.isFile() && d.name.endsWith(".md"))
      .map((d) => d.name.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

const urls = [
  ...staticPaths.map((p) => `${baseRaw}${p === "/" ? "/" : p}`),
  ...listBlogSlugs().map((slug) => `${baseRaw}/blog/${slug}`),
];

const urlEntries = urls
  .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const robots = `User-agent: *
Allow: /

Sitemap: ${baseRaw}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");
writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

console.log(
  `Wrote sitemap (${urls.length} URLs) and robots.txt for ${baseRaw}`,
);
