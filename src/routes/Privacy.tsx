import { Helmet } from "react-helmet-async";

export function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy — Onchain Reality</title>
        <meta
          name="description"
          content="Onchain Reality does not use behavioral analytics or analytics cookies."
        />
      </Helmet>
      <div className="mx-auto max-w-2xl px-6 py-8 text-[var(--text)]">
        <h1 className="fonts-home mt-0 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--text-heading)] md:text-3xl">
          Privacy
        </h1>
        <p className="mt-4 text-sm leading-relaxed md:text-base">
          Onchain Reality does not use Google Analytics, behavioral analytics,
          analytics cookies, or reading-engagement tracking.
        </p>
        <p className="mt-4 text-sm leading-relaxed md:text-base">
          The site loads Fira Sans from Google Fonts. Your browser therefore
          makes a request to Google to retrieve those font files. Onchain
          Reality does not use that request to measure or profile your visit.
        </p>
      </div>
    </>
  );
}
