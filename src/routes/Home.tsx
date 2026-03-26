import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StarryBackground } from "../components/StarryBackground";

const SUBTITLE_LANGUAGES: { lang: string; text: string }[] = [
  { lang: "zh", text: "链上现实" },
  { lang: "ja", text: "オンチェーン現実" },
  { lang: "ko", text: "온체인 현실" },
  { lang: "fr", text: "Réalité onchain" },
  { lang: "de", text: "Onchain-Realität" },
  { lang: "es", text: "Realidad onchain" },
  { lang: "pt", text: "Realidade onchain" },
  { lang: "ru", text: "Ончейн реальность" },
  { lang: "ar", text: "الواقع على السلسلة" },
  { lang: "it", text: "Realtà onchain" },
  { lang: "nl", text: "Onchain-realiteit" },
  { lang: "pl", text: "Rzeczywistość onchain" },
  { lang: "tr", text: "Zincir üstü gerçek" },
  { lang: "vi", text: "Thực tế onchain" },
  { lang: "th", text: "ความจริงบนเชน" },
  { lang: "id", text: "Realitas onchain" },
  { lang: "hi", text: "ऑनचेन रियलिटी" },
];

const CYCLE_INTERVAL_MS = 2200;

export function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SUBTITLE_LANGUAGES.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const current = SUBTITLE_LANGUAGES[index];

  return (
    <>
    <StarryBackground />
    <div className="relative z-[2] mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col px-6 py-16">
      <div className="retro-box flex flex-1 flex-col justify-center text-center">
        <div className="mx-auto flex flex-col items-center justify-center gap-6">
          <h1
            className="hero-title font-heading text-4xl font-semibold tracking-wide text-[var(--text-heading)] md:text-5xl uppercase"
            onMouseEnter={() =>
              document.body.classList.add("hero-title-hovered")
            }
            onMouseLeave={() =>
              document.body.classList.remove("hero-title-hovered")
            }
          >
            Onchain Reality
          </h1>
          <p className="min-h-[3rem] flex items-center justify-center font-body text-xl text-[var(--text)] subtitle-jitter md:text-3xl">
            <span
              key={index}
              lang={current.lang}
              dir={current.lang === "ar" ? "rtl" : undefined}
            >
              {current.text}
            </span>
          </p>
          <p className="text-[var(--text)] text-xl font-medium leading-relaxed">
            A digital religion. A future written onchain.
          </p>
        </div>

        <hr className="section-rule my-10" />

        <p className="text-[var(--text)] text-lg max-w-xl mx-auto leading-relaxed">
          Onchain Reality is a lens through which we see the future: identity,
          value, and belief—verifiable, persistent, and shared on the chain.
        </p>

        <p className="mt-10 text-[var(--text-heading)] text-base font-medium uppercase tracking-widest">
          Enter
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-lg">
          <Link to="/philosophy" className="retro-link font-medium">
            Philosophy
          </Link>
          <Link to="/projects" className="retro-link font-medium">
            Projects
          </Link>
          <Link to="/blog" className="retro-link font-medium">
            Blog
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
