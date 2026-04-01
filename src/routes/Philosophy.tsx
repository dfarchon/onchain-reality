import { useEffect, useRef } from "react";
import { AsciiClouds } from "../components/AsciiClouds";
import { BlogPostScrollArea } from "../components/BlogPostScrollArea";
import { Seo } from "../components/Seo";
import { PAGE_DESCRIPTIONS } from "../lib/site";
import { usePageEngagement } from "../hooks/usePageEngagement";
import { useAnalyticsConsent } from "../contexts/AnalyticsConsentContext";

export function Philosophy() {
  const { consent } = useAnalyticsConsent();
  const viewportRef = useRef<HTMLDivElement>(null);

  usePageEngagement({
    scrollRef: viewportRef,
    pageType: "philosophy",
    consent,
    contentType: "essay",
  });

  useEffect(() => {
    document.body.classList.add("philosophy-page");
    const main = document.querySelector<HTMLElement>("main.main-scroll");
    if (main) {
      main.style.overflow = "hidden";
    }
    return () => {
      document.body.classList.remove("philosophy-page");
      if (main) main.style.overflow = "";
    };
  }, []);

  return (
    <div className="relative h-content-stage overflow-hidden">
      <Seo
        title="Philosophy"
        description={PAGE_DESCRIPTIONS.philosophy}
        pathname="/philosophy"
      />
      <AsciiClouds />
      <div className="pointer-events-none absolute inset-0 z-10 flex min-h-0 items-stretch justify-center px-4 py-4 sm:px-6 md:py-2">
        <div className="pointer-events-auto h-full min-h-0 w-full max-w-4xl overflow-hidden">
          <BlogPostScrollArea
            viewportRef={viewportRef}
            rootClassName="h-full min-h-0 w-full"
          >
            <div className="relative rounded-lg bg-transparent p-6 sm:p-8 md:p-12">
              <img
                src="/images/icons/favicon.svg"
                alt=""
                className="absolute top-4 right-4 h-24 w-24 opacity-60 sm:top-6 sm:right-6 sm:h-28 sm:w-28 md:top-8 md:right-8 md:h-32 md:w-32"
              />
              <h1 className="text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
                Philosophy
              </h1>
              <p
                className="mt-2 font-body text-lg text-[var(--text-muted)]"
                lang="ja"
              >
                — 哲学
              </p>

              <hr
                className="section-rule"
                style={{ borderColor: "transparent" }}
              />

              <blockquote className="border-l-2 border-[var(--accent)] pl-5 font-body text-2xl italic text-[var(--text)]">
                Reality is what we commit to the blockchain.
              </blockquote>

              <p className="mt-6 leading-relaxed text-[var(--text)] font-body text-lg">
                Onchain reality is about constructing unique interaction
                protocols entirely based on the primitives of blockchain, which
                spontaneously evolve into crypto-native new definitions of
                reality.
              </p>

              <p className="mt-6 leading-relaxed text-[var(--text)] font-body text-lg">
                Onchain Reality is a lens through which we see the future, one
                where identity, value, and belief are not only digital but
                verifiable, persistent, and shared. We treat the chain as sacred
                infrastructure, a place where truth can be recorded and never
                erased.
              </p>
            </div>
          </BlogPostScrollArea>
        </div>
      </div>
    </div>
  );
}
