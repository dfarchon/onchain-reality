import fm from "front-matter";

export type PostMeta = {
  title: string;
  date: string;
  summary?: string;
  slug?: string;
};

export type Post = PostMeta & {
  slug: string;
  content: string;
};

const postModules = import.meta.glob<string>("/src/content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const match = path.match(/\/content\/(.+)\.md$/);
  return match ? match[1] : path;
}

function dateToString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  return "";
}

export function getPostList(): PostMeta[] {
  const entries = Object.entries(postModules);
  const list: PostMeta[] = entries.map(([path, content]) => {
    const { attributes } = fm<PostMeta>(content);
    const slug = slugFromPath(path);
    return {
      slug,
      title: (attributes.title as string) ?? slug,
      date: dateToString(attributes.date),
      summary: attributes.summary as string | undefined,
    };
  });
  return list.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const path = `/src/content/${slug}.md`;
  const content = postModules[path];
  if (!content) return null;
  const { attributes, body } = fm<PostMeta>(content);
  return {
    slug,
    title: (attributes.title as string) ?? slug,
    date: dateToString(attributes.date),
    summary: attributes.summary as string | undefined,
    content: body,
  };
}
