/**
 * Recognizes X/Twitter status URLs for embedded tweet rendering.
 */
const STATUS_PATH =
  /^https?:\/\/(?:x\.com|(?:www\.)?twitter\.com|mobile\.twitter\.com)\/([^/]+)\/status\/(\d+)/i;

export function parseTwitterStatusUrl(url: string): string | null {
  const trimmed = url.trim().split(/[?#]/)[0];
  const m = trimmed.match(STATUS_PATH);
  if (!m) return null;
  return trimmed;
}

/** Href passed to Twitter's embed script (twitter.com is still accepted by widgets.js). */
export function tweetEmbedHref(url: string): string {
  const parsed = parseTwitterStatusUrl(url);
  if (!parsed) return url;
  const m = parsed.match(STATUS_PATH);
  if (!m) return parsed;
  const [, user, id] = m;
  return `https://twitter.com/${user}/status/${id}`;
}
