import { Seo } from "../components/Seo";
import { PAGE_DESCRIPTIONS } from "../lib/site";
import projectsData from "../data/projects.json";

const projects = projectsData as {
  id: string;
  title: string;
  description: string;
  url: string;
  cover: string | null;
}[];

/** Same markup for light + dark — colors come from theme CSS variables. */
function ProjectsBody() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
        Projects
      </h1>
      <p
        className="mt-2 font-body text-base text-[var(--text-muted)]"
        lang="ja"
      >
        — プロジェクト
      </p>
      <p className="mt-4 font-body text-base text-[var(--text-muted)]">
        Initiatives and builds under the Onchain Reality umbrella.
      </p>

      <hr className="section-rule" />

      <ul className="list-none space-y-6 p-0 font-body">
        {projects.map((p) => (
          <li key={p.id}>
            <a
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel={p.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="retro-link"
            >
              {p.title}
            </a>
            <p className="mt-1 text-base text-[var(--text-muted)]">
              {p.description}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Projects() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Seo
        title="Projects"
        description={PAGE_DESCRIPTIONS.projects}
        pathname="/projects"
      />
      <div className="retro-box">
        <ProjectsBody />
      </div>
    </div>
  );
}
