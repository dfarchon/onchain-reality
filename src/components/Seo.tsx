import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  absoluteUrl,
  buildDocumentTitle,
  getSiteOrigin,
} from "../lib/site";

export type SeoProps = {
  /** Short page title; combined as `Title | Onchain Reality` unless empty (home uses site name only). */
  title?: string;
  description: string;
  /** Pathname including leading slash, e.g. `/blog/hello-world`. */
  pathname: string;
  ogType?: "website" | "article";
  imagePath?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  /** One or more JSON-LD objects (BlogPosting, WebSite, etc.). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function jsonLdScripts(
  blocks: Record<string, unknown> | Record<string, unknown>[],
): ReactNode {
  const list = Array.isArray(blocks) ? blocks : [blocks];
  return list.map((data, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ));
}

export function Seo({
  title,
  description,
  pathname,
  ogType = "website",
  imagePath = "/images/og-image.png",
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  jsonLd,
}: SeoProps) {
  const origin = getSiteOrigin();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`,
  );

  const fullTitle = buildDocumentTitle(title);

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {origin ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta property="og:image:width" content="1200" /> : null}
      {ogImage ? <meta property="og:image:height" content="630" /> : null}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {ogType === "article" && articlePublishedTime ? (
        <meta
          property="article:published_time"
          content={articlePublishedTime}
        />
      ) : null}
      {ogType === "article" && articleModifiedTime ? (
        <meta property="article:modified_time" content={articleModifiedTime} />
      ) : null}
      {ogType === "article" && articleAuthor ? (
        <meta property="article:author" content={articleAuthor} />
      ) : null}

      {jsonLd ? jsonLdScripts(jsonLd) : null}
    </Helmet>
  );
}
