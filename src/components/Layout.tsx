import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ButtonSounds } from "./ButtonSounds";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MusicPlayer } from "./MusicPlayer";

function isBlogPostPath(pathname: string | null) {
  return pathname != null && /^\/blog\/[^/]+$/.test(pathname);
}

export function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const shouldPreserveMainScroll =
      isBlogPostPath(previousPathnameRef.current) && isBlogPostPath(pathname);

    if (!shouldPreserveMainScroll) {
      mainRef.current?.scrollTo(0, 0);
    }

    previousPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <div className="flex min-h-[var(--app-height)] min-w-0 flex-col">
      <Header />
      <MusicPlayer />
      <ButtonSounds />
      <main
        ref={mainRef}
        className="main-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
        style={{
          paddingTop:
            "calc(var(--layout-chrome-top) + var(--layout-main-below-header))",
          paddingBottom: "var(--layout-chrome-bottom)",
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
