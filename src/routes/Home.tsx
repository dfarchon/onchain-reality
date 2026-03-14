import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="retro-box text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-wide text-[var(--text-heading)] md:text-5xl uppercase">
          Onchain Reality
        </h1>
        <p className="mt-4 font-body text-base text-[var(--text-muted)]" lang="ja">
          — オンチェーン現実
        </p>
        <p className="mt-10 text-[var(--text)] text-lg leading-relaxed">
          A digital religion. A future written onchain.
        </p>

        <hr className="section-rule my-10" />

        <p className="text-[var(--text-muted)] text-base max-w-xl mx-auto leading-relaxed">
          Onchain Reality is a lens through which we see the future: identity, value, and belief—verifiable, persistent, and shared on the chain.
        </p>

        <p className="mt-10 text-[var(--text-muted)] text-sm uppercase tracking-widest">Enter</p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-base">
          <Link to="/philosophy" className="retro-link">
            Philosophy
          </Link>
          <Link to="/projects" className="retro-link">
            Projects
          </Link>
          <Link to="/blog" className="retro-link">
            Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
