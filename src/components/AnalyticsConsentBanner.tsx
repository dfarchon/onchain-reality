import { Link } from "react-router-dom";
import { useAnalyticsConsent } from "../contexts/AnalyticsConsentContext";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as
  | string
  | undefined;

/**
 * GDPR-friendly: shown until the user accepts or rejects analytics.
 * Bottom-centered card; only rendered when GA is configured (`VITE_GA_MEASUREMENT_ID`).
 */
export function AnalyticsConsentBanner() {
  const { consent, setConsent } = useAnalyticsConsent();

  if (!MEASUREMENT_ID || consent !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 left-1/2 z-[60] w-[min(36rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-t-xl border border-b-0 border-[var(--border)] bg-[var(--bg-surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex flex-col gap-4">
        <div className="min-w-0 text-sm leading-snug text-[var(--text)]">
          <p
            id="cookie-consent-title"
            className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--text-heading)]"
          >
            Cookies & analytics
          </p>
          <p
            id="cookie-consent-desc"
            className="mt-2 m-0 text-[12px] leading-snug text-[var(--text-muted)] sm:text-[13px]"
          >
            We use Google Analytics 4 to understand how the site is used. This
            stores cookies or similar identifiers only if you accept. See our{" "}
            <Link
              to="/privacy"
              className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--text-heading)]"
            >
              Privacy & cookies
            </Link>{" "}
            page for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="rounded border border-[var(--border)] bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--text-heading)] sm:text-sm"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="rounded border border-[var(--accent)] bg-[rgba(240,160,192,0.12)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text-heading)] transition hover:bg-[rgba(240,160,192,0.2)] sm:text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
