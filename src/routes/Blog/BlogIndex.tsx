import { useEffect, useMemo, useState } from "react";
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

export function BlogIndex() {
  useEffect(() => {
    document.body.classList.add("blog-page", "blog-index-page");
    return () => {
      document.body.classList.remove("blog-page", "blog-index-page");
    };
  }, []);
  const posts = getPostList();
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [debugBg, setDebugBg] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((p: PostMeta) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
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
        className={`fixed left-0 right-0 z-40 bg-transparent transition-opacity ${debugBg ? "opacity-0 pointer-events-none" : ""}`}
        style={{ top: "var(--banner-height)" }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-10 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
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
              className="blog-search"
            />
          </div>
        </div>
      </div>

      {/* Scroll only this pane — content is clipped at the top edge (no sliding under chrome) */}
      <div
        className={`fixed inset-x-0 z-[30] overflow-y-auto overflow-x-hidden overscroll-y-contain px-6 pb-10 sm:px-10 md:px-12 transition-opacity ${debugBg ? "opacity-0 pointer-events-none" : ""}`}
        style={{
          top: "calc(var(--banner-height) + var(--blog-filter-bar-height))",
          bottom: "var(--banner-height)",
        }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col">
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
