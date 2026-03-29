import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/philosophy", label: "Philosophy" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
] as const;

const linkPill = (needsBackdrop: boolean) =>
  needsBackdrop ? "bg-[rgba(0,0,0,0.55)] backdrop-blur-sm" : "";

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const isPhilosophy = pathname === "/philosophy";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isTransparentPage = pathname === "/" || isPhilosophy || isBlog;
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
      className={`site-header fixed left-0 right-0 top-0 z-50 flex ${isTransparentPage ? "bg-transparent" : "bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"}`}
    >
      {/* Narrow: brand then nav; md+: single row, justify-between (see index.css) */}
      <nav
        className="site-header-nav mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-1 sm:px-8 md:flex-row md:flex-nowrap md:items-center md:justify-between md:gap-x-4 md:py-0 md:px-12 lg:px-14"
        aria-label="Main"
      >
        <Link
          to="/"
          className={`min-w-0 max-w-full shrink truncate inline-flex items-center justify-center font-heading text-2xl font-semibold uppercase leading-none tracking-wide text-[var(--text-heading)] no-underline hover:text-[var(--accent)] rounded-md py-3.5 pl-[calc(1.75rem+0.025em)] pr-7 md:min-w-0 md:py-3 ${linkPill(needsBackdropPill)}`}
        >
          Onchain Reality
        </Link>

        <ul className="site-header-nav__links m-0 flex w-full min-w-0 list-none flex-nowrap justify-start gap-x-0.5 p-0 text-[11px] uppercase tracking-wide sm:gap-x-1.5 sm:text-xs md:w-auto md:shrink-0 md:justify-end md:gap-x-2 md:text-base md:tracking-widest">
          {nav.map(({ to, label }) => (
            <li
              key={to}
              className="flex min-w-0 flex-1 items-center justify-center md:flex-none"
            >
              <Link
                to={to}
                className={`${navLinkClass} min-h-[2.5rem] w-full px-1.5 py-1.5 text-center sm:px-2 md:min-h-0 md:w-auto md:min-w-[5.5rem] md:px-4`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
