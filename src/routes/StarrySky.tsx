import { useEffect, useRef } from "react";
import { StarryBackground } from "../components/StarryBackground";

export function StarrySky() {
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    html.classList.add("starry-scroll");
    if (root) {
      root.style.height = "auto";
      root.style.minHeight = "auto";
    }

    // Hide the global fixed footer
    const globalFooter = document.querySelector("footer");
    if (globalFooter) {
      (globalFooter as HTMLElement).style.display = "none";
    }

    const onScroll = () => {
      const maxScroll = html.scrollHeight - window.innerHeight;
      scrollProgressRef.current =
        maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      html.classList.remove("starry-scroll");
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
      if (root) {
        root.style.height = "";
        root.style.minHeight = "";
      }
      if (globalFooter) {
        (globalFooter as HTMLElement).style.display = "";
      }
    };
  }, []);

  return (
    <div className="relative z-[2]" style={{ minHeight: "300dvh" }}>
      <StarryBackground scrollProgressRef={scrollProgressRef} />
      <h1 className="sr-only">Starry Sky</h1>
      <div
        className="absolute bottom-0 left-0 right-0 z-[3] flex items-center bg-transparent"
        style={{
          height: "var(--layout-chrome-bottom)",
          paddingBottom: "var(--safe-bottom)",
          boxSizing: "border-box",
        }}
      >
        <div className="mx-auto w-full max-w-5xl px-6 text-center">
          <p className="text-base text-[var(--text-muted)]">
            Onchain Reality — digital religion, onchain future.
          </p>
        </div>
      </div>
    </div>
  );
}
