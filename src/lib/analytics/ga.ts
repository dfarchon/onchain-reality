/**
 * Thin facade over react-ga4 with two guarantees:
 *
 * 1. The react-ga4 chunk is only downloaded when `initAnalytics()` is called
 *    (i.e. after the user grants consent).
 * 2. Every public function is a silent no-op when analytics has not been
 *    initialised, so call-sites never need guard checks.
 */

interface GA4 {
  initialize: (
    measurementId: string,
    options?: { gtagOptions?: Record<string, unknown> },
  ) => void;
  send: (fieldObject: Record<string, unknown>) => void;
  event: (name: string, params?: Record<string, unknown>) => void;
  reset: () => void;
}

let ga: GA4 | null = null;
let _initialized = false;

export function isAnalyticsReady(): boolean {
  return _initialized;
}

export async function initAnalytics(measurementId: string): Promise<boolean> {
  if (_initialized) return true;
  try {
    const mod = await import("react-ga4");
    ga = mod.default as unknown as GA4;
    ga.initialize(measurementId, {
      gtagOptions: { send_page_view: false },
    });
    _initialized = true;
    return true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[GA4] Failed to load react-ga4", e);
    }
    return false;
  }
}

export function resetAnalytics(): void {
  if (!ga || !_initialized) return;
  try {
    ga.reset();
  } catch {
    /* reset may not exist in every version */
  }
  document
    .querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
    .forEach((el) => el.remove());
  const w = window as unknown as Record<string, unknown>;
  if (Array.isArray(w.dataLayer)) w.dataLayer = [];
  _initialized = false;
  ga = null;
}

export function trackPageView(
  page: string,
  params?: Record<string, unknown>,
): void {
  if (!_initialized || !ga) return;
  ga.send({ hitType: "pageview", page, ...params });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!_initialized || !ga) return;
  ga.event(eventName, params);
}
