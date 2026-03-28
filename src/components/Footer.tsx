import { useLocation } from "react-router-dom";

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isTransparentPage =
    isHome || pathname === "/philosophy" || isBlog;
  const needsBackdropPill = pathname === "/philosophy" || isBlog;

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-10 flex items-center ${isTransparentPage ? "bg-transparent" : "bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"} ${isHome ? "fonts-home" : ""}`}
      style={{ height: "var(--banner-height)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-6">
        <p
          className={`text-center text-base text-[var(--text-muted)] ${needsBackdropPill ? "inline-block rounded-md bg-[rgba(0,0,0,0.55)] px-4 py-2 backdrop-blur-sm" : ""}`}
        >
          Building New Realities on the Blockchain
        </p>
      </div>
    </footer>
  );
}
