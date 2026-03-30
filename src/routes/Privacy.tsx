import { Helmet } from "react-helmet-async";

export function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy & cookies — Onchain Reality</title>
        <meta
          name="description"
          content="Privacy and cookie information for Onchain Reality, including Google Analytics."
        />
      </Helmet>
      <div className="mx-auto max-w-2xl px-6 py-8 text-[var(--text)]">
        <h1 className="fonts-home mt-0 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--text-heading)] md:text-3xl">
          Privacy & cookies
        </h1>
        <p className="mt-4 text-sm leading-relaxed md:text-base">
          This site may use <strong>Google Analytics 4</strong> to collect
          aggregated usage data (for example which pages are viewed). That
          processing relies on cookies or similar technology and, depending on
          your location, may require your consent before it runs.
        </p>
        <p className="mt-4 text-sm leading-relaxed md:text-base">
          You can accept or reject analytics using the banner when it appears,
          or change your choice later via <strong>Cookie settings</strong> in
          the site footer. If you reject analytics, we do not load the Google
          Analytics script for that browser.
        </p>
      </div>
    </>
  );
}
