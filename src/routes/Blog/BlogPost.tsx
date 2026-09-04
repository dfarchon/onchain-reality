import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AsciiClouds } from "../../components/AsciiClouds";
import { AsciiGameOfLife } from "../../components/AsciiGameOfLife";
import { Markdown } from "../../components/Markdown";
import { Seo } from "../../components/Seo";
import { useTheme } from "../../contexts/ThemeContext";
import { getPostBySlug } from "../../lib/blog";
import {
  DEFAULT_DESCRIPTION,
  absoluteUrl,
  toIsoDateTime,
} from "../../lib/site";

export function BlogPost() {
  const { theme } = useTheme();
  const { slug } = useParams<{ slug: string }>();

  useLayoutEffect(() => {
    document.body.classList.add("blog-page", "blog-post-page");
    return () => document.body.classList.remove("blog-page", "blog-post-page");
  }, []);

  if (!slug) return null;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="minimal-reading-stage">
        <Seo
          title="Post not found"
          description="The requested blog post does not exist on Onchain Reality."
          pathname={`/blog/${slug}`}
        />
        {theme === "light" ? <AsciiClouds /> : <AsciiGameOfLife />}
        <div className="minimal-reading-column flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-[var(--text-muted)]">Post not found.</p>
          <Link to="/blog" className="retro-link mt-4 text-sm">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const description = post.summary?.trim() || DEFAULT_DESCRIPTION;
  const publishedIso = toIsoDateTime(post.date);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: publishedIso,
    description,
    url: absoluteUrl(`/blog/${post.slug}`),
  };
  if (post.author) jsonLd.author = { "@type": "Person", name: post.author };

  return (
    <div className="minimal-reading-stage">
      <Seo
        title={post.title}
        description={description}
        pathname={`/blog/${slug}`}
        ogType="article"
        articlePublishedTime={publishedIso}
        articleAuthor={post.author}
        jsonLd={jsonLd}
      />
      {theme === "light" ? <AsciiClouds /> : <AsciiGameOfLife />}
      <div className="minimal-reading-column">
        <header className="mb-10">
          {post.category && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
              {post.category}
            </p>
          )}
          <h1 className="m-0 text-[1.375rem] leading-[1.3] font-semibold text-[var(--text-heading)] sm:text-[2rem] sm:leading-[1.25]">
            {post.title}
          </h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--text-muted)]">
            {post.author && (
              <>
                <span>{post.author}</span>
                <span aria-hidden> · </span>
              </>
            )}
            {post.date}
          </p>
        </header>
        <div className="prose">
          <Markdown>{post.content}</Markdown>
        </div>
        <Link to="/blog" className="retro-link mt-12 inline-block text-sm">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
