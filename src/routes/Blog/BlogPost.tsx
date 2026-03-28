import { useParams, Link } from "react-router-dom";
import { getPostBySlug } from "../../lib/blog";
import { Markdown } from "../../components/Markdown";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const post = getPostBySlug(slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="retro-box inline-block">
          <p className="text-[var(--text-muted)] font-body">Post not found.</p>
          <Link to="/blog" className="retro-link mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <div className="retro-box">
        <Link to="/blog" className="retro-link text-base">
          ← Back to Blog
        </Link>
        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-wide text-[var(--text-heading)]">
            {post.title}
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)] font-body">
            {post.date}
          </p>
        </header>
        <div className="prose max-w-none prose-headings:font-sans prose-headings:text-[var(--text-heading)] prose-headings:uppercase prose-headings:tracking-wide prose-p:font-body prose-p:text-[var(--text)]">
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
    </article>
  );
}
