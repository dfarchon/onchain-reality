import { useLocation } from "react-router-dom";

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isTransparentPage = isHome || pathname === "/philosophy" || isBlog;
  const needsBackdropPill =
    pathname === "/philosophy" || isBlog;
  /** Blog content uses z-30; keep tagline above scroll layers but below header (z-50). */
  const zFooter = isBlog ? "z-[45]" : "z-10";

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 ${zFooter} flex min-h-0 flex-col ${isTransparentPage ? "bg-transparent" : "bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"} ${isHome ? "fonts-home" : ""}`}
      style={{ height: "var(--banner-height)" }}
    >
      {/* Equal flex bands above / below the tagline so ASCII reads symmetric in the footer strip */}
      <div className="min-h-0 flex-1" aria-hidden />
      <div className="mx-auto flex w-full max-w-5xl shrink-0 justify-center px-6">
        <p
          className={`m-0 text-center text-base leading-normal text-[var(--text-muted)] ${needsBackdropPill ? "inline-block rounded-md bg-[rgba(0,0,0,0.55)] px-4 py-2 backdrop-blur-sm" : ""}`}
        >
          Building New Realities on the Blockchain
        </p>
      </div>
      <div className="min-h-0 flex-1" aria-hidden />
    </footer>
  );
}
