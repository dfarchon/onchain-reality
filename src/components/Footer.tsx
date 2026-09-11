import { useLocation } from "react-router-dom";

const taglineClass = (needsBackdropPill: boolean) =>
  `type-metadata m-0 text-center text-[var(--text-muted)] ${needsBackdropPill ? "inline-block rounded-md bg-[var(--chrome-pill)] px-4 py-2 backdrop-blur-sm" : ""}`;

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isBlogPost = /^\/blog\/[^/]+$/.test(pathname);
  if (isBlogPost) return null;
  const isTransparentPage = isHome || pathname === "/philosophy" || isBlog;
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
      <div className="mx-auto w-full max-w-5xl shrink-0 px-6 text-center">
        <p className={`${taglineClass(needsBackdropPill)} mx-auto max-w-5xl`}>
          We shape reality on the chain.
        </p>
      </div>
      <div className="min-h-0 flex-1" aria-hidden />
    </footer>
  );
}
