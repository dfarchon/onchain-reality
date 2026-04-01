import { Link } from "react-router-dom";
import { useAnalyticsConsent } from "../contexts/AnalyticsConsentContext";

const HAS_GA = Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID);

type PrivacyCookiePillProps = {
  /** Home: transparent pill so it sits cleanly on the starry background. */
  isHome?: boolean;
};

/**
 * Privacy & cookies / Cookie settings — footer.
 * - Below `sm`: both controls in one row, bottom-right (`flex-row justify-end`).
 * - `sm`+: compact pill in the grid’s right column, tight around text.
 */
export function PrivacyCookiePill({ isHome = false }: PrivacyCookiePillProps) {
  const { openCookieSettings } = useAnalyticsConsent();

  if (!HAS_GA) return null;

  const shellClass = isHome
    ? "bg-transparent shadow-none backdrop-blur-none"
    : "bg-[var(--chrome-pill)] shadow-[var(--shadow-cookie)] backdrop-blur-sm";

  const linkClass =
    "text-[10px] text-[var(--accent)] underline underline-offset-2 hover:text-[var(--text-heading)] sm:text-[11px]";
  const focusResetClass = "focus:outline-none focus-visible:outline-none";

  const narrowChip = isHome
    ? "inline-block w-fit max-w-full text-right"
    : `inline-block w-fit max-w-full rounded-md px-2 py-1 text-right ${shellClass}`;

  /** Same typography as `<Link>` — native `<button>` ignores `text-inherit` from body and can look huge on mobile */
  const narrowControlClass = `${narrowChip} ${linkClass} ${focusResetClass} cursor-pointer border-0 bg-transparent p-0 font-sans font-normal`;

  return (
    <nav aria-label="Privacy and cookies" className="w-full sm:w-fit">
      {/* Narrow viewport: side by side, flush right */}
      <div className="flex w-full min-w-0 flex-row flex-nowrap items-center justify-end gap-x-1 sm:hidden">
        <Link
          to="/privacy"
          className={`${narrowChip} ${linkClass} ${focusResetClass} shrink-0`}
        >
          Privacy & cookies
        </Link>

        <button
          type="button"
          onClick={openCookieSettings}
          className={`${narrowControlClass} shrink-0`}
        >
          Cookie settings
        </button>
      </div>

      {/* sm+: single pill, right column */}
      <div
        className={`hidden w-fit max-w-full flex-col items-end gap-y-1 rounded-lg px-3 py-1.5 text-[10px] text-[var(--text-muted)] sm:inline-flex sm:flex-col sm:items-end lg:flex-row lg:items-center lg:gap-x-1.5 lg:gap-y-0 lg:text-[11px] ${shellClass}`}
      >
        <Link to="/privacy" className={`${linkClass} ${focusResetClass}`}>
          Privacy & cookies
        </Link>
        <span aria-hidden className="hidden text-[var(--border)] lg:inline">
          ·
        </span>
        <button
          type="button"
          onClick={openCookieSettings}
          className={`cursor-pointer border-0 bg-transparent p-0 font-sans text-[10px] font-normal text-[var(--accent)] underline underline-offset-2 hover:text-[var(--text-heading)] sm:text-[11px] ${focusResetClass}`}
        >
          Cookie settings
        </button>
      </div>
    </nav>
  );
}
