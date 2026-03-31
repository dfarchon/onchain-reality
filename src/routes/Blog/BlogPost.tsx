import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug } from "../../lib/blog";
import { AsciiClouds } from "../../components/AsciiClouds";
import { AsciiGameOfLife } from "../../components/AsciiGameOfLife";
import { useTheme } from "../../contexts/ThemeContext";
import { Seo } from "../../components/Seo";
import {
  DEFAULT_DESCRIPTION,
  absoluteUrl,
  toIsoDateTime,
} from "../../lib/site";
import { BlogPostScrollArea } from "../../components/BlogPostScrollArea";
import { Markdown } from "../../components/Markdown";
import {
  HEADER_NAV_MAX_WIDTH_CLASS,
  HEADER_NAV_PADDING_X_CLASS,
} from "../../lib/headerLayout";

/**
 * Panel bottom aligns with the main content floor (top of footer strip) so ASCII from panel→tagline
 * matches tagline→viewport bottom when the tagline is vertically centered in --banner-height.
 */
export function BlogPost() {
  const { theme } = useTheme();
  /** Black article strip (viewport + scrollbar); used to size the image lightbox. */
  const articleScrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("blog-page", "blog-post-page");
    return () => {
      document.body.classList.remove("blog-page", "blog-post-page");
    };
  }, []);
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const post = getPostBySlug(slug);
  if (!post) {
    return (
      <div className="blog-post-stage relative w-full min-h-0 overflow-hidden">
        <Seo
          title="Post not found"
          description="The requested blog post does not exist on Onchain Reality."
          pathname={`/blog/${slug}`}
        />
        {theme === "light" ? <AsciiClouds /> : <AsciiGameOfLife />}
        <div className="pointer-events-none absolute inset-0 z-10 flex justify-center max-md:pt-0 pb-0 md:pt-3.5">
          <div
            className={`pointer-events-auto mx-auto flex h-full min-h-0 w-full flex-col justify-start md:justify-end ${HEADER_NAV_MAX_WIDTH_CLASS} ${HEADER_NAV_PADDING_X_CLASS}`}
          >
            <div className="content-panel">
              <div className="content-panel__inner">
                <div className="content-panel__body">
                  <BlogPostScrollArea
                    scrollRootRef={articleScrollRootRef}
                    className="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
                  >
                    <div className="blog-post-measure">
                      <p className="text-[var(--text-muted)] font-body text-[1.0625rem] leading-relaxed">
                        Post not found.
                      </p>
                      <Link
                        to="/blog"
                        className="retro-link mt-4 inline-block text-sm"
                      >
                        Back to Blog
                      </Link>
                    </div>
                  </BlogPostScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const description = post.summary?.trim() || DEFAULT_DESCRIPTION;
  const publishedIso = toIsoDateTime(post.date);
  const blogPostingLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: publishedIso,
    description,
    url: absoluteUrl(`/blog/${slug}`),
  };
  if (post.author) {
    blogPostingLd.author = { "@type": "Person", name: post.author };
  }

  return (
    <div className="blog-post-stage relative w-full min-h-0 overflow-hidden">
      <Seo
        title={post.title}
        description={description}
        pathname={`/blog/${slug}`}
        ogType="article"
        articlePublishedTime={publishedIso}
        articleAuthor={post.author}
        jsonLd={blogPostingLd}
      />
      {theme === "light" ? <AsciiClouds /> : <AsciiGameOfLife />}
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-center max-md:pt-0 pb-0 md:pt-3.5">
        <div
          className={`pointer-events-auto mx-auto flex h-full min-h-0 w-full flex-col justify-start md:justify-end ${HEADER_NAV_MAX_WIDTH_CLASS} ${HEADER_NAV_PADDING_X_CLASS}`}
        >
          <div className="content-panel">
            <div className="content-panel__inner">
              <div className="content-panel__body">
                <BlogPostScrollArea scrollRootRef={articleScrollRootRef}>
                  <div className="blog-post-measure">
                    <header className="mb-8">
                      {post.category ? (
                        <span className="blog-card-category">
                          {post.category}
                        </span>
                      ) : null}
                      <h1 className="text-[1.875rem] font-semibold leading-snug tracking-tight text-[var(--text-heading)] font-sans md:text-[2rem]">
                        {post.title}
                      </h1>
                      <p className="mt-2 text-[1.0625rem] leading-[1.6] text-[var(--text-muted)] font-body">
                        {post.author ? (
                          <>
                            <span className="blog-author-name">
                              {post.author}
                            </span>
                            <span
                              className="mx-2 text-[var(--border-light)]"
                              aria-hidden
                            >
                              ·
                            </span>
                          </>
                        ) : null}
                        {post.date}
                      </p>
                    </header>
                    <div className="prose max-w-none prose-headings:font-sans prose-headings:text-[var(--text-heading)] prose-p:font-body prose-p:text-[var(--text)]">
                      <Markdown lightboxBoundsRef={articleScrollRootRef}>
                        {post.content}
                      </Markdown>
                    </div>
                    <p className="mt-10 mb-0 text-sm">
                      <Link to="/blog" className="retro-link">
                        ← Back to Blog
                      </Link>
                    </p>
                  </div>
                </BlogPostScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
