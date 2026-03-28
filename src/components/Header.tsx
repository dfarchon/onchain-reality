import { Link, useLocation } from "react-router-dom";

const nav = [
  { to: "/", label: "Home", width: "5.5rem" },
  { to: "/philosophy", label: "Philosophy", width: "9.5rem" },
  { to: "/projects", label: "Projects", width: "7.5rem" },
  { to: "/blog", label: "Blog", width: "5.5rem" },
] as const;

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isPhilosophy = pathname === "/philosophy";
  const isTransparentPage = isHome || isPhilosophy;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-10 flex items-center ${isTransparentPage ? "bg-transparent" : "bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"} ${isHome ? "fonts-home" : ""}`}
      style={{ height: "var(--banner-height)" }}
    >
      <nav
        className="mx-auto grid w-full max-w-7xl grid-cols-[14rem_1fr_auto] items-center px-8 sm:px-10 md:grid-cols-[16rem_1fr_auto] md:px-12 lg:px-14"
        aria-label="Main"
      >
        <Link
          to="/"
          className={`justify-self-start font-heading text-2xl font-semibold uppercase tracking-wide text-[var(--text-heading)] no-underline hover:text-[var(--accent)] whitespace-nowrap rounded-md px-4 py-2 ${isPhilosophy ? "bg-[rgba(0,0,0,0.55)] backdrop-blur-sm" : ""}`}
        >
          Onchain Reality
        </Link>

        <ul className="col-start-3 flex list-none items-center gap-0 p-0 m-0 text-base uppercase tracking-widest">
          {nav.map(({ to, label, width }) => (
            <li
              key={to}
              className="flex shrink-0 items-center justify-center"
              style={{ width }}
            >
              <Link
                to={to}
                className={`inline-flex items-center justify-center whitespace-nowrap font-normal text-[var(--accent)] no-underline hover:text-[var(--text-heading)] visited:text-[var(--text-muted)] rounded-md px-2 py-2 ${isPhilosophy ? "bg-[rgba(0,0,0,0.55)] backdrop-blur-sm" : ""}`}
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
