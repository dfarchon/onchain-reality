import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HEADER_NAV_MAX_WIDTH_CLASS,
  HEADER_NAV_PADDING_X_CLASS,
} from "../lib/headerLayout";
import { OrbitMark } from "./OrbitMark";
import { SoundMenu } from "./SoundMenu";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { to: "/", label: "Home" },
  { to: "/philosophy", label: "Philosophy" },
  { to: "/blog", label: "Blog" },
] as const;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const isBlogPost = /^\/blog\/[^/]+$/.test(pathname);
  const isPhilosophy = pathname === "/philosophy";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isHome = pathname === "/";
  const isTransparent = isHome || isPhilosophy || isBlog;
  const needsBackdrop = isPhilosophy || isBlog;

  useLayoutEffect(() => {
    const element = headerRef.current;
    if (!element) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        "--layout-chrome-top",
        `${Math.ceil(element.getBoundingClientRect().height)}px`,
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty("--layout-chrome-top");
    };
  }, []);

  const pill = needsBackdrop ? "bg-[var(--chrome-pill)] backdrop-blur-sm" : "";

  return (
    <header
      ref={headerRef}
      className={`site-header fixed top-0 right-0 left-0 z-50 flex ${isBlogPost ? "reading-header" : isTransparent ? "bg-transparent" : "bg-[var(--chrome-backdrop)] backdrop-blur-sm"}`}
    >
      {isBlogPost ? (
        <nav
          className={`mx-auto flex min-h-12 w-full items-center justify-between gap-2 ${HEADER_NAV_MAX_WIDTH_CLASS} ${HEADER_NAV_PADDING_X_CLASS}`}
          aria-label="Reading"
        >
          <Link
            to="/blog"
            className="reading-back-link rounded-md px-3 py-2 text-sm backdrop-blur-sm"
          >
            <span className="sm:hidden">← Blog</span>
            <span className="hidden sm:inline">← Back to Blog</span>
          </Link>
          <div className="flex items-center justify-self-end gap-1">
            <SoundMenu key={pathname} />
            <ThemeToggle />
          </div>
        </nav>
      ) : (
        <nav
          className={`site-header-nav mx-auto flex w-full ${HEADER_NAV_MAX_WIDTH_CLASS} flex-col max-md:gap-[var(--layout-main-below-header)] ${HEADER_NAV_PADDING_X_CLASS} md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-4 md:gap-y-2`}
          aria-label="Main"
        >
          <Link
            to="/"
            className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-heading text-2xl font-semibold leading-none tracking-wide text-[var(--text-heading)] uppercase hover:text-[var(--accent)] max-md:w-full max-md:bg-[var(--chrome-pill)] max-md:px-4 max-md:py-3.5 max-md:backdrop-blur-sm md:py-3 md:pr-7 md:pl-[calc(1.75rem+0.025em)] ${pill}`}
          >
            <OrbitMark className="mr-2.5 h-7 w-7 shrink-0" />
            <span>Onchain Reality</span>
          </Link>
          <ul className="m-0 flex w-full min-w-0 flex-1 list-none flex-wrap items-center justify-start gap-2 p-0 text-sm uppercase tracking-wide sm:gap-x-3 md:w-auto md:flex-nowrap md:justify-end md:text-base md:tracking-widest">
            {nav.map(({ to, label }) => {
              const isCurrent = to === "/blog" ? isBlog : pathname === to;

              return (
                <li key={to} className="flex min-w-0 md:flex-none">
                  <Link
                    to={to}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`site-nav-link ${isCurrent ? "site-nav-link--active" : ""} inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md px-3 font-normal sm:px-4 md:min-h-0 md:min-w-[5.5rem] md:py-1.5 ${pill}`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="flex shrink-0 items-center">
              <SoundMenu key={pathname} transparentBackground={isHome} />
            </li>
            <li className="flex shrink-0 items-center">
              <ThemeToggle transparentBackground={isHome} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
