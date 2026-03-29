import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getPostList } from "../../lib/blog";
import type { Category, PostMeta } from "../../lib/blog";
import { AsciiGameOfLife } from "../../components/AsciiGameOfLife";
import { BlogCard } from "../../components/BlogCard";

/** Set to `true` to show the "Debug BG" toggle on the blog index. */
const SHOW_DEBUG_BG_BUTTON = false;

const CATEGORIES: (Category | "All")[] = [
  "All",
  "Reality",
  "Protocol",
  "Experiment",
  "Reflection",
];

const BLOG_FILTER_HEIGHT_VAR = "--blog-filter-bar-height";

export function BlogIndex() {
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("blog-page", "blog-index-page");
    return () => {
      document.body.classList.remove("blog-page", "blog-index-page");
    };
  }, []);

  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;

    const publish = () => {
      requestAnimationFrame(() => {
        const h = el.offsetHeight;
        document.body.style.setProperty(
          BLOG_FILTER_HEIGHT_VAR,
          `${Math.ceil(h)}px`,
        );
      });
    };

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
      document.body.style.removeProperty(BLOG_FILTER_HEIGHT_VAR);
    };
  }, []);

  const posts = getPostList();
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [debugBg, setDebugBg] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((p: PostMeta) => {
      if (activeCategory !== "All" && p.category !== activeCategory)
        return false;
      if (q) {
        const haystack = [p.title, p.author ?? "", p.summary ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, activeCategory, search]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <AsciiGameOfLife />

      {SHOW_DEBUG_BG_BUTTON && (
        <button
          type="button"
          onClick={() => setDebugBg((v) => !v)}
          className="fixed top-3 right-3 z-50 rounded border border-white/20 bg-black/60 px-2 py-1 font-mono text-xs text-white/70 backdrop-blur hover:bg-black/80 hover:text-white transition-colors"
        >
          {debugBg ? "Show UI" : "Debug BG"}
        </button>
      )}

      <div
        ref={filterBarRef}
        className={`fixed left-0 right-0 z-40 bg-transparent transition-opacity ${debugBg ? "opacity-0 pointer-events-none" : ""}`}
        style={{
          top: "calc(var(--layout-chrome-top) + var(--layout-main-below-header))",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-3 pt-2 sm:px-10 md:px-12 md:pb-4 md:pt-3">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
            <div className="flex flex-wrap justify-start gap-2 md:gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`blog-filter-tab${activeCategory === cat ? " blog-filter-tab--active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="blog-search w-full max-w-[min(18rem,100%)] shrink-0 self-start md:max-w-[14rem]"
            />
          </div>
        </div>
      </div>

      {/* Scroll only this pane — content is clipped at the top edge (no sliding under chrome) */}
      <div
        className={`fixed inset-x-0 z-[30] overflow-y-auto overflow-x-hidden overscroll-y-contain px-6 pb-10 sm:px-10 md:px-12 transition-opacity ${debugBg ? "opacity-0 pointer-events-none" : ""}`}
        style={{
          top: "calc(var(--layout-chrome-top) + var(--layout-main-below-header) + var(--blog-filter-bar-height))",
          bottom: "var(--layout-chrome-bottom)",
        }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col pt-5 md:pt-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post: PostMeta) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="no-underline"
              >
                <BlogCard
                  category={post.category}
                  title={post.title}
                  author={post.author}
                  date={post.date}
                />
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="blog-empty-state">No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
