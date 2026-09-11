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
      <div className="mx-auto max-w-[45rem] px-6 py-8 text-[var(--text)]">
        <h1 className="type-article-title mt-0 text-[var(--text-heading)]">
          Privacy
        </h1>
        <div className="prose mt-4">
          <p>
            Onchain Reality does not use Google Analytics, behavioral analytics,
            analytics cookies, or reading-engagement tracking.
          </p>
          <p>
            The site loads Fira Sans from Google Fonts. Your browser therefore
            makes a request to Google to retrieve those font files. Onchain
            Reality does not use that request to measure or profile your visit.
          </p>
        </div>
      </div>
    </>
  );
}
