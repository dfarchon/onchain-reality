export const GA_EVENTS = {
  PAGE_VIEW: "page_view",
  SCROLL_DEPTH: "scroll_depth",
  READ_COMPLETE: "read_complete",
  PAGE_ENGAGEMENT_SUMMARY: "page_engagement_summary",
} as const;

export type PageType =
  | "home"
  | "blog_index"
  | "blog_post"
  | "philosophy"
  | "projects"
  | "privacy"
  | "other";

export type ContentType = "article" | "essay" | "page";

export interface PageContext {
  page_type: PageType;
  content_type?: ContentType;
  content_id?: string;
}

export interface ScrollDepthParams extends PageContext {
  percent_scrolled: number;
}

export interface ReadCompleteParams {
  content_id?: string;
  content_type?: ContentType;
  page_type: PageType;
  reading_time_seconds?: number;
}

export interface PageEngagementSummaryParams {
  page_type: PageType;
  content_id?: string;
  active_time_seconds: number;
  max_scroll_percent: number;
  completed_read: boolean;
}

export function resolvePageContext(pathname: string): PageContext {
  if (pathname === "/") return { page_type: "home" };
  if (pathname === "/blog") return { page_type: "blog_index" };
  if (pathname.startsWith("/blog/")) {
    return {
      page_type: "blog_post",
      content_id: pathname.slice(6),
      content_type: "article",
    };
  }
  if (pathname === "/philosophy")
    return { page_type: "philosophy", content_type: "essay" };
  if (pathname === "/projects") return { page_type: "projects" };
  if (pathname === "/privacy") return { page_type: "privacy" };
  return { page_type: "other" };
}
