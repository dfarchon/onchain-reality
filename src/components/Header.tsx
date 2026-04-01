import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HEADER_NAV_MAX_WIDTH_CLASS,
  HEADER_NAV_PADDING_X_CLASS,
} from "../lib/headerLayout";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { to: "/", label: "Home" },
  { to: "/philosophy", label: "Philosophy" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
] as const;

const linkPill = (needsBackdrop: boolean) =>
  needsBackdrop ? "bg-[var(--chrome-pill)] backdrop-blur-sm" : "";

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const isPhilosophy = pathname === "/philosophy";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isHomeLike = pathname === "/" || pathname === "/projects";
  const isTransparentPage = isHomeLike || isPhilosophy || isBlog;
  const needsBackdropPill = isPhilosophy || isBlog;

  const navLinkClass = `inline-flex items-center justify-center whitespace-nowrap font-normal text-[var(--accent)] no-underline hover:text-[var(--text-heading)] visited:text-[var(--text-muted)] rounded-md ${linkPill(needsBackdropPill)}`;

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const publish = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--layout-chrome-top",
        `${Math.ceil(h)}px`,
      );
    };

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty("--layout-chrome-top");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`site-header fixed left-0 right-0 top-0 z-50 flex ${isTransparentPage ? "bg-transparent" : "bg-[var(--chrome-backdrop)] backdrop-blur-sm"}`}
    >
      {/* <md: stacked; md+: wrap so nav moves below before squeezing the title */}
      <nav
        className={`site-header-nav mx-auto flex w-full ${HEADER_NAV_MAX_WIDTH_CLASS} flex-col max-md:gap-[var(--layout-main-below-header)] ${HEADER_NAV_PADDING_X_CLASS} py-0 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-4 md:gap-y-2 md:py-0`}
        aria-label="Main"
      >
        <Link
          to="/"
          className={`shrink-0 whitespace-nowrap inline-flex items-center justify-center font-heading text-2xl font-semibold uppercase leading-none tracking-wide text-[var(--text-heading)] no-underline hover:text-[var(--accent)] rounded-md max-md:w-full max-md:border-0 max-md:!bg-[var(--chrome-pill)] max-md:backdrop-blur-sm max-md:px-4 max-md:py-3.5 md:w-auto md:border-none md:py-3 md:pl-[calc(1.75rem+0.025em)] md:pr-7 ${linkPill(needsBackdropPill)}`}
        >
          Onchain Reality
        </Link>

        <div className="flex w-full min-w-0 flex-1 max-md:justify-start md:min-w-max md:justify-end">
          <ul className="site-header-nav__links m-0 flex w-full list-none flex-wrap items-center justify-start gap-x-2 gap-y-2 p-0 text-sm uppercase tracking-wide sm:gap-x-3 md:flex-nowrap md:justify-end md:gap-x-2 md:gap-y-0 md:text-base md:tracking-widest">
            {nav.map(({ to, label }) => (
              <li key={to} className="flex min-w-0 justify-start md:flex-none">
                <Link
                  to={to}
                  className={`${navLinkClass} min-h-[2.5rem] whitespace-nowrap px-3 py-2 sm:px-4 md:min-h-0 md:min-w-[5.5rem] md:px-4 md:py-1.5`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="flex shrink-0 items-center justify-center">
              <ThemeToggle
                transparentBackground={isHomeLike}
                className="min-h-[2.5rem] !px-3 md:min-h-0 md:!px-2"
              />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
