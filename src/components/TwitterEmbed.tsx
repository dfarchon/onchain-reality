import { useEffect, useRef } from "react";
import { tweetEmbedHref } from "../lib/twitterStatusUrl";

type Twttr = {
  ready: (
    cb: (twttr: { widgets: { load: (el?: Element | null) => void } }) => void,
  ) => void;
  widgets?: { load: (el?: Element | null) => void };
};

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

const SCRIPT_ID = "twitter-wjs";

function loadTwitterWidgets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    if (window.twttr?.widgets?.load) {
      finish();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      window.twttr?.ready?.(() => finish());
      setTimeout(finish, 4000);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.onerror = () =>
      reject(new Error("Failed to load X/Twitter embed script"));
    script.onload = () => {
      window.twttr?.ready?.(() => finish());
      setTimeout(finish, 4000);
    };
    document.body.appendChild(script);
  });
}

type Props = { url: string };

/**
 * Renders an official X/Twitter embedded post via widgets.js (blockquote → iframe).
 */
export function TwitterEmbed({ url }: Props) {
  const href = tweetEmbedHref(url);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const el = rootRef.current;
    if (!el) return undefined;

    loadTwitterWidgets()
      .then(() => {
        if (cancelled || !rootRef.current) return;
        window.twttr?.widgets?.load(rootRef.current);
      })
      .catch(() => {
        /* keep fallback link visible */
      });

    return () => {
      cancelled = true;
    };
  }, [href]);

  return (
    <div
      ref={rootRef}
      className="twitter-embed-root my-6 not-prose mx-auto flex w-full max-w-[440px] min-w-0 justify-center"
    >
      <blockquote className="twitter-tweet" data-dnt="true" data-width="440">
        <a href={href}>View post on X</a>
      </blockquote>
    </div>
  );
}
