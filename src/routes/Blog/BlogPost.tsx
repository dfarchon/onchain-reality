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
          <Link to="/blog" className="retro-link type-button mt-4">
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
            <p className="type-label mb-2 text-[var(--accent)]">
              {post.category}
            </p>
          )}
          <h1 className="type-article-title m-0 text-[var(--text-heading)]">
            {post.title}
          </h1>
          <p className="type-metadata mt-3 text-[var(--text-muted)]">
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
        <Link to="/blog" className="retro-link type-button mt-12 inline-block">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
