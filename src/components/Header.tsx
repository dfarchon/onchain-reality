import { Link } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/philosophy', label: 'Philosophy' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/ascii', label: 'ASCII' },
] as const

export function Header() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-10 flex items-center border-b border-[var(--border)] bg-[var(--bg-surface)]"
      style={{ height: 'var(--banner-height)' }}
    >
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-6 px-6" aria-label="Main">
        <Link
          to="/"
          className="font-heading text-2xl font-semibold text-[var(--text-heading)] no-underline tracking-wide hover:text-[var(--accent)] whitespace-nowrap"
        >
          Onchain Reality
        </Link>
        <ul className="flex list-none gap-6 p-0 m-0 text-base uppercase tracking-widest">
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
