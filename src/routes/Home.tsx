import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StarryBackground } from "../components/StarryBackground";

const SUBTITLE_LANGUAGES: { lang: string; text: string }[] = [
  { lang: "ar", text: "الواقع على السلسلة" },
  { lang: "de", text: "Onchain-Realität" },
  { lang: "es", text: "Realidad onchain" },
  { lang: "fr", text: "Réalité onchain" },
  { lang: "hi", text: "ऑनचेन रियलिटी" },
  { lang: "id", text: "Realitas onchain" },
  { lang: "it", text: "Realtà onchain" },
  { lang: "ja", text: "オンチェーン現実" },
  { lang: "ko", text: "온체인 현실" },
  { lang: "nl", text: "Onchain-realiteit" },
  { lang: "pl", text: "Rzeczywistość onchain" },
  { lang: "pt", text: "Realidade onchain" },
  { lang: "ru", text: "Ончейн реальность" },
  { lang: "th", text: "ความจริงบนเชน" },
  { lang: "tr", text: "Zincir üstü gerçek" },
  { lang: "vi", text: "Thực tế onchain" },
  { lang: "zh", text: "链上现实" },
];

const CYCLE_INTERVAL_MS = 2200;

export function Home() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * SUBTITLE_LANGUAGES.length),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * SUBTITLE_LANGUAGES.length);
        } while (next === prev && SUBTITLE_LANGUAGES.length > 1);
        return next;
      });
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const main = document.querySelector(
      "main.main-scroll",
    ) as HTMLElement | null;
    const mq = window.matchMedia("(min-width: 768px)");

    const apply = () => {
      if (!mq.matches) {
        html.style.overflow = "";
        body.style.overflow = "";
        if (main) main.style.overflowY = "";
        return;
      }
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (main) {
        main.style.overflowY = "hidden";
        main.scrollTop = 0;
      }
    };

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevMainOverflowY = main?.style.overflowY ?? "";

    apply();
    mq.addEventListener("change", apply);

    return () => {
      mq.removeEventListener("change", apply);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      if (main) {
        main.style.overflowY = prevMainOverflowY;
      }
    };
  }, []);

  const current = SUBTITLE_LANGUAGES[index];

  return (
    <div className="fonts-home">
      <StarryBackground />
      <div className="relative z-[2] mx-auto flex h-content-stage w-full min-w-0 max-w-6xl flex-col items-center justify-center px-6 py-10 md:py-16">
        <div className="retro-box retro-box--hero w-full min-w-0 max-w-4xl flex flex-col items-stretch justify-center text-center">
          <div className="mx-auto flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-6">
            <h1
              className="hero-title font-heading text-3xl font-semibold tracking-wide text-[var(--text-heading)] sm:text-4xl md:text-5xl uppercase"
              onMouseEnter={() =>
                document.body.classList.add("hero-title-hovered")
              }
              onMouseLeave={() =>
                document.body.classList.remove("hero-title-hovered")
              }
            >
              Onchain Reality
            </h1>
            <p className="min-h-[3rem] flex w-full min-w-0 max-w-full items-center justify-center px-1 font-body text-lg text-[var(--text)] sm:text-xl md:text-3xl">
              <span
                key={index}
                lang={current.lang}
                dir={current.lang === "ar" ? "rtl" : undefined}
                className="max-w-full [overflow-wrap:anywhere]"
              >
                {current.text}
              </span>
            </p>

            <p className="w-full min-w-0 max-w-full px-1 text-[var(--text)] text-xl font-medium leading-relaxed [overflow-wrap:anywhere] sm:text-2xl md:text-3xl">
              Blockchain creates digital space to shape new realities.
            </p>
          </div>

          <div className="mt-12 flex w-full justify-center px-1">
            <Link
              to="/blog"
              className="font-heading inline-flex w-fit max-w-full shrink-0 items-center justify-center border border-[rgba(240,160,192,0.55)] bg-[rgba(240,160,192,0.08)] px-10 py-4 text-[var(--text-heading)] text-sm font-semibold uppercase tracking-[0.12em] shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors md:px-12 md:py-4 md:text-base hover:border-[rgba(240,160,192,0.85)] hover:bg-[rgba(240,160,192,0.14)] hover:text-[var(--accent)] hover:shadow-[0_0_20px_rgba(240,160,192,0.18),0_6px_28px_rgba(0,0,0,0.4)]"
            >
              Explore Writings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
