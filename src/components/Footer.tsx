import { useLocation } from "react-router-dom";
import { PrivacyCookiePill } from "./PrivacyCookiePill";

const HAS_GA = Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID);

const taglineClass = (needsBackdropPill: boolean) =>
  `m-0 text-center text-[11px] leading-normal text-[var(--text-muted)] sm:text-xs md:text-base ${needsBackdropPill ? "inline-block rounded-md bg-[var(--chrome-pill)] px-4 py-2 backdrop-blur-sm" : ""}`;

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isTransparentPage =
    isHome || pathname === "/projects" || pathname === "/philosophy" || isBlog;
  const needsBackdropPill =
    pathname === "/philosophy" || pathname === "/privacy" || isBlog;
  /** Blog content uses z-30; keep tagline above scroll layers but below header (z-50). */
  const zFooter = isBlog ? "z-[45]" : "z-10";

  return (
    <footer
      className={`site-footer fixed bottom-0 left-0 right-0 ${zFooter} flex min-h-0 flex-col ${isTransparentPage ? "bg-transparent" : "bg-[var(--chrome-backdrop)] backdrop-blur-sm"} ${isHome ? "fonts-home" : ""}`}
    >
      {/* Equal flex bands above / below the tagline so ASCII reads symmetric in the footer strip */}
      <div className="min-h-0 flex-1" aria-hidden />
      {HAS_GA ? (
        <div className="mx-auto grid w-full max-w-7xl shrink-0 grid-cols-1 items-center gap-y-2 px-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-y-0 sm:px-8 md:px-12 lg:px-14">
          <div className="hidden min-w-0 sm:block" aria-hidden />
          <p
            className={`${taglineClass(needsBackdropPill)} sm:col-start-2 sm:max-w-none`}
          >
            Building New Realities on the Blockchain
          </p>
          <div className="flex min-w-0 justify-end">
            <PrivacyCookiePill isHome={isHome || pathname === "/projects"} />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl shrink-0 px-6">
          <p className={`${taglineClass(needsBackdropPill)} mx-auto max-w-5xl`}>
            Building New Realities on the Blockchain
          </p>
        </div>
      )}
      <div className="min-h-0 flex-1" aria-hidden />
    </footer>
  );
}
