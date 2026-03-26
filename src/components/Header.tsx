import { Link } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/philosophy', label: 'Philosophy' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/ascii', label: 'ASCII' },
  { to: '/starry-sky', label: 'Starry Sky' },
] as const

export function Header() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-10 flex items-center bg-transparent"
      style={{ height: 'var(--banner-height)' }}
    >
      <nav
        className="mx-auto flex w-full min-w-0 max-w-7xl items-center gap-6 px-8 sm:px-10 md:px-12 lg:px-14"
        aria-label="Main"
      >
        <Link
          to="/"
          className="shrink-0 font-heading text-2xl font-semibold text-[var(--text-heading)] no-underline tracking-wide hover:text-[var(--accent)] whitespace-nowrap"
        >
          Onchain Reality
        </Link>
        <ul className="flex min-w-0 flex-1 flex-wrap list-none items-center justify-end gap-x-6 gap-y-2 p-0 m-0 text-base uppercase tracking-widest">
          {nav.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="font-normal text-[var(--accent)] no-underline hover:text-[var(--text-heading)] visited:text-[var(--text-muted)]">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
