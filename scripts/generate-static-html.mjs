#!/usr/bin/env node
/**
 * Generates per-route static HTML files under dist/ so social crawlers
 * (X / Twitter, Facebook, LinkedIn, Telegram, …) — which do not execute
 * JavaScript — see the correct, absolute Open Graph tags for every URL.
 *
 * For each blog post, the og:image is the first image found in the post body
 * (HTML <img src="..."> or markdown ![](...)). When a post has no images,
 * the default site poster (/images/og-image.png) is used.
 *
 * The default poster is also used for the home page and other static routes
 * (/philosophy, /projects, /blog, /privacy).
 *
 * Run after `vite build` (wired as the `postbuild` script in package.json).
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fm from "front-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
dotenv.config({ path: join(root, ".env"), quiet: true });

const distDir = join(root, "dist");
const contentDir = join(root, "src", "content");
const templatePath = join(distDir, "index.html");

const SITE_NAME = "Onchain Reality";
const DEFAULT_DESCRIPTION =
  'The chain is a space. We shape reality on it. Essays, projects, and philosophy from "Onchain Reality".';
const DEFAULT_OG_IMAGE = "/images/og-image.png";
const DEFAULT_OG_WIDTH = "1200";
const DEFAULT_OG_HEIGHT = "630";

const PAGE_DESCRIPTIONS = {
  philosophy:
    "Reality is what we commit to the blockchain. Thoughts on identity, value, and verifiable truth.",
  projects:
    'Each one is a service. Under "Onchain Reality". Links to experiments and work.',
  blog: 'Essays and notes from "Onchain Reality". Intro, manifesto, reflection, technology.',
  privacy:
    'Privacy notice for "Onchain Reality" — what we collect, why, and your choices.',
};

const siteOrigin = (() => {
  const raw = process.env.VITE_SITE_URL;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/$/, "");
  }
  return "";
})();

if (!siteOrigin) {
  console.warn(
    "[static-html] VITE_SITE_URL is not set; absolute URLs will be relative to ''.",
  );
}

function absoluteUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // External URLs are returned as-is.
  if (/^https?:\/\//i.test(path)) return path;
  return siteOrigin ? `${siteOrigin}${normalized}` : normalized;
}

function buildDocumentTitle(pageTitle) {
  const t = (pageTitle ?? "").trim();
  return t ? `${t} | ${SITE_NAME}` : SITE_NAME;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toIsoDateTime(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  return dateStr;
}

/** First HTML <img src> or markdown ![](src) in a post body, or null. */
function extractFirstImage(body) {
  const htmlMatch = body.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  const mdMatch = body.match(/!\[[^\]]*\]\(([^)\s]+)/);

  const htmlIdx = htmlMatch ? htmlMatch.index : -1;
  const mdIdx = mdMatch ? mdMatch.index : -1;

  if (htmlIdx === -1 && mdIdx === -1) return null;
  if (htmlIdx === -1) return mdMatch[1];
  if (mdIdx === -1) return htmlMatch[1];
  return htmlIdx <= mdIdx ? htmlMatch[1] : mdMatch[1];
}

function dateToString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  return "";
}

function listBlogPosts() {
  let names;
  try {
    names = readdirSync(contentDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const posts = [];
  for (const dirent of names) {
    if (!dirent.isFile() || !dirent.name.endsWith(".md")) continue;
    const slug = dirent.name.replace(/\.md$/, "");
    const raw = readFileSync(join(contentDir, dirent.name), "utf8");
    const { attributes, body } = fm(raw);
    const explicitCover =
      typeof attributes.cover === "string" && attributes.cover.trim()
        ? attributes.cover.trim()
        : typeof attributes.image === "string" && attributes.image.trim()
          ? attributes.image.trim()
          : null;
    const firstImage = explicitCover ?? extractFirstImage(body);
    posts.push({
      slug,
      title:
        typeof attributes.title === "string" && attributes.title.trim()
          ? attributes.title.trim()
          : slug,
      summary:
        typeof attributes.summary === "string" && attributes.summary.trim()
          ? attributes.summary.trim()
          : "",
      author:
        typeof attributes.author === "string" ? attributes.author.trim() : "",
      date: dateToString(attributes.date),
      image: firstImage,
    });
  }
  return posts;
}

/**
 * Patch the source template's head with route-specific values.
 *
 * The source already contains a baseline set of OG / Twitter / description /
 * title tags; we replace those by name so the resulting HTML stays well-formed
 * and matches the shape Helmet renders client-side.
 */
function renderRouteHtml(template, route) {
  const {
    title,
    description,
    pathname,
    ogType = "website",
    image,
    isDefaultImage,
    articlePublishedTime,
    articleAuthor,
    jsonLd,
  } = route;

  const fullTitle = buildDocumentTitle(title);
  const canonical = absoluteUrl(pathname);
  const ogImage = absoluteUrl(image);

  let html = template;

  // <title>
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeHtml(fullTitle)}</title>`,
  );

  // name="description"
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/?>(?=\s*<)/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );

  const replaceMeta = (attr, key, value) => {
    const re = new RegExp(
      `<meta\\s+${attr}="${key}"[\\s\\S]*?\\/?>(?=\\s*<)`,
      "i",
    );
    const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace(/(\s*)<\/head>/i, `\n    ${tag}$1</head>`);
    }
  };

  replaceMeta("property", "og:type", ogType);
  replaceMeta("property", "og:title", fullTitle);
  replaceMeta("property", "og:description", description);
  replaceMeta("property", "og:site_name", SITE_NAME);
  replaceMeta("property", "og:image", ogImage);
  replaceMeta("property", "og:locale", "en_US");

  // og:url — not in the template by default; insert if missing.
  replaceMeta("property", "og:url", canonical);

  // og:image dimensions only meaningful for the known default poster.
  const widthRe = /\s*<meta\s+property="og:image:width"[\s\S]*?\/?>(?=\s*<)/i;
  const heightRe = /\s*<meta\s+property="og:image:height"[\s\S]*?\/?>(?=\s*<)/i;
  if (isDefaultImage) {
    if (widthRe.test(html)) {
      html = html.replace(
        widthRe,
        `\n    <meta property="og:image:width" content="${DEFAULT_OG_WIDTH}" />`,
      );
    }
    if (heightRe.test(html)) {
      html = html.replace(
        heightRe,
        `\n    <meta property="og:image:height" content="${DEFAULT_OG_HEIGHT}" />`,
      );
    }
  } else {
    html = html.replace(widthRe, "");
    html = html.replace(heightRe, "");
  }

  replaceMeta("name", "twitter:card", "summary_large_image");
  replaceMeta("name", "twitter:title", fullTitle);
  replaceMeta("name", "twitter:description", description);
  replaceMeta("name", "twitter:image", ogImage);

  // <link rel="canonical">
  const canonicalRe = /<link\s+rel="canonical"[\s\S]*?\/?>(?=\s*<)/i;
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  if (canonicalRe.test(html)) {
    html = html.replace(canonicalRe, canonicalTag);
  } else if (siteOrigin) {
    html = html.replace(/(\s*)<\/head>/i, `\n    ${canonicalTag}$1</head>`);
  }

  // Article-only tags
  if (ogType === "article") {
    if (articlePublishedTime) {
      replaceMeta("property", "article:published_time", articlePublishedTime);
    }
    if (articleAuthor) {
      replaceMeta("property", "article:author", articleAuthor);
    }
  }

  // JSON-LD for blog posts.
  if (jsonLd) {
    const tag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace(/(\s*)<\/head>/i, `\n    ${tag}$1</head>`);
  }

  return html;
}

function writeRoute(template, route) {
  const html = renderRouteHtml(template, route);
  const outDir =
    route.pathname === "/" ? distDir : join(distDir, route.pathname);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "index.html");
  writeFileSync(outPath, html, "utf8");
  return outPath;
}

function main() {
  let template;
  try {
    template = readFileSync(templatePath, "utf8");
  } catch (err) {
    console.error(
      `[static-html] Cannot read template: ${templatePath} — did vite build run?`,
    );
    throw err;
  }

  const staticRoutes = [
    {
      pathname: "/",
      title: "",
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_OG_IMAGE,
      isDefaultImage: true,
    },
    {
      pathname: "/philosophy",
      title: "Philosophy",
      description: PAGE_DESCRIPTIONS.philosophy,
      image: DEFAULT_OG_IMAGE,
      isDefaultImage: true,
    },
    {
      pathname: "/projects",
      title: "Projects",
      description: PAGE_DESCRIPTIONS.projects,
      image: DEFAULT_OG_IMAGE,
      isDefaultImage: true,
    },
    {
      pathname: "/blog",
      title: "Blog",
      description: PAGE_DESCRIPTIONS.blog,
      image: DEFAULT_OG_IMAGE,
      isDefaultImage: true,
    },
    {
      pathname: "/privacy",
      title: "Privacy",
      description: PAGE_DESCRIPTIONS.privacy,
      image: DEFAULT_OG_IMAGE,
      isDefaultImage: true,
    },
  ];

  const blogRoutes = listBlogPosts().map((post) => {
    const isDefaultImage = !post.image;
    const image = post.image || DEFAULT_OG_IMAGE;
    const description = post.summary || DEFAULT_DESCRIPTION;
    const publishedIso = toIsoDateTime(post.date);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: publishedIso,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
    };
    if (post.author) {
      jsonLd.author = { "@type": "Person", name: post.author };
    }
    if (image) {
      jsonLd.image = absoluteUrl(image);
    }

    return {
      pathname: `/blog/${post.slug}`,
      title: post.title,
      description,
      ogType: "article",
      image,
      isDefaultImage,
      articlePublishedTime: publishedIso,
      articleAuthor: post.author,
      jsonLd,
    };
  });

  const allRoutes = [...staticRoutes, ...blogRoutes];
  for (const route of allRoutes) {
    writeRoute(template, route);
  }

  console.log(
    `[static-html] Wrote ${allRoutes.length} route file(s) under dist/ (${blogRoutes.length} blog post(s)).`,
  );
}

main();
