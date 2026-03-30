/** Public site name used in titles and Open Graph. */
export const SITE_NAME = "Onchain Reality";

/** Default meta description (home and fallbacks). */
export const DEFAULT_DESCRIPTION =
  "Onchain Reality — essays, projects, and philosophy at the intersection of blockchain, verifiable truth, and crypto-native culture.";

export const PAGE_DESCRIPTIONS = {
  philosophy:
    "Reality is what we commit to the blockchain. Thoughts on onchain identity, value, and verifiable truth.",
  projects:
    "Initiatives and builds under the Onchain Reality umbrella — links to experiments and work.",
  blog: "Essays and updates from Onchain Reality — manifesto, reflection, technology, and more.",
} as const;

/**
 * Canonical site origin without trailing slash. Uses `VITE_SITE_URL` when set;
 * otherwise `window.location.origin` in the browser (dev-friendly).
 */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/** Absolute URL for a path starting with `/`. */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${normalized}` : normalized;
}

export function buildDocumentTitle(pageTitle?: string): string {
  if (!pageTitle?.trim()) return SITE_NAME;
  return `${pageTitle.trim()} | ${SITE_NAME}`;
}

/** `YYYY-MM-DD` or ISO string → ISO 8601 for schema.org / Open Graph. */
export function toIsoDateTime(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  return dateStr;
}
