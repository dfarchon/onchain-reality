import { useLocation } from "react-router-dom";

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isTransparentPage = isHome || pathname === "/philosophy";

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-10 flex items-center ${isTransparentPage ? "bg-transparent" : "bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"}`}
      style={{ height: "var(--banner-height)" }}
    >
      <div className="mx-auto w-full max-w-5xl px-6 text-center">
        <p
          className={`text-base text-[var(--text-muted)] ${pathname === "/philosophy" ? "inline-block rounded-md bg-[rgba(0,0,0,0.55)] px-4 py-2 backdrop-blur-sm" : ""}`}
        >
          Building New Realities on the Blockchain
        </p>
      </div>
    </footer>
  );
}
