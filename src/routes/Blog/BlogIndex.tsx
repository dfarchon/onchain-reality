import { Link } from "react-router-dom";
import { getPostList } from "../../lib/blog";
import type { PostMeta } from "../../lib/blog";

export function BlogIndex() {
  const posts = getPostList();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="retro-box">
        <h1 className="text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
          Blog
        </h1>
        <p
          className="mt-2 font-body text-base text-[var(--text-muted)]"
          lang="ja"
        >
          — ブログ
        </p>
        <p className="mt-4 text-[var(--text-muted)] font-body text-base">
          Essays, notes, and code from the Onchain Reality world.
        </p>

        <hr className="section-rule" />

        <ul className="list-none space-y-6 p-0 font-body">
          {posts.map((post: PostMeta) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="retro-link">
                {post.title}
              </Link>
              <p className="mt-0.5 text-base text-[var(--text-muted)]">
                {post.date}
              </p>
              {post.summary && (
                <p className="mt-1 text-base text-[var(--text)]">
                  {post.summary}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
