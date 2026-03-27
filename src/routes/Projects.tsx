import projectsData from '../data/projects.json'

type Project = {
  id: string
  title: string
  description: string
  url: string
  cover: string | null
}

const projects = projectsData as Project[]

export function Projects() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="retro-box">
        <h1 className="font-heading text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
          Projects
        </h1>
        <p className="mt-2 font-body text-base text-[var(--text-muted)]" lang="ja">
          — プロジェクト
        </p>
        <p className="mt-4 text-[var(--text-muted)] font-body text-base">
          Initiatives and builds under the Onchain Reality umbrella.
        </p>

        <hr className="section-rule" />

        <ul className="list-none space-y-6 p-0 font-body">
          {projects.map((p) => (
            <li key={p.id}>
              <a
                href={p.url}
                target={p.url.startsWith('http') ? '_blank' : undefined}
                rel={p.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="retro-link"
              >
                {p.title}
              </a>
              <p className="mt-1 text-base text-[var(--text-muted)]">{p.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
