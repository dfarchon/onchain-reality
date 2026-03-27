import { useEffect } from "react";
import { AsciiClouds } from "../components/AsciiClouds";

export function Philosophy() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main.main-scroll");
    if (main) {
      main.style.overflow = "hidden";
      return () => {
        main.style.overflow = "";
      };
    }
  }, []);

  return (
    <div className="relative h-[calc(100vh-8rem)] overflow-hidden">
      <AsciiClouds />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 -translate-y-8">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
          <div className="rounded-lg bg-[rgba(0,0,0,0.7)] p-8 backdrop-blur-md md:p-12">
            <h1 className="font-heading text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
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
              Onchain reality is about constructing unique interaction protocols
              entirely based on the primitives of blockchain, which
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
        </div>
      </div>
    </div>
  );
}
