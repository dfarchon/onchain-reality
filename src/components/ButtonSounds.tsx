import { useEffect } from "react";

const HOVER_SRC = "/hover.ogg";
const CLICK_SRC = "/click.ogg";
/** Perceived loudness boost for hover (HTMLAudioElement.volume maxes at 1). */
const HOVER_GAIN = 2;

const CONTROL_SELECTOR =
  'button, input[type="button"], input[type="submit"], input[type="reset"], a[href]';

function isDisabledControl(el: HTMLElement): boolean {
  if (
    el.matches(
      'button, input[type="button"], input[type="submit"], input[type="reset"]',
    )
  ) {
    return el.matches(":disabled");
  }
  if (el.matches("a[href]")) {
    return el.getAttribute("aria-disabled") === "true";
  }
  return false;
}

function findControlTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest(CONTROL_SELECTOR) as HTMLElement | null;
  if (!el || isDisabledControl(el)) return null;
  return el;
}

/** Global delegated sounds for native buttons, button-like inputs, and links. */
export function ButtonSounds() {
  useEffect(() => {
    const hoverAudio = new Audio(HOVER_SRC);
    hoverAudio.preload = "auto";
    hoverAudio.volume = 1;

    const hoverCtx = new AudioContext();
    const hoverSource = hoverCtx.createMediaElementSource(hoverAudio);
    const hoverGain = hoverCtx.createGain();
    hoverGain.gain.value = HOVER_GAIN;
    hoverSource.connect(hoverGain).connect(hoverCtx.destination);

    const clickAudio = new Audio(CLICK_SRC);
    clickAudio.preload = "auto";

    const playHover = () => {
      void hoverCtx.resume().catch(() => {});
      hoverAudio.currentTime = 0;
      void hoverAudio.play().catch(() => {});
    };

    const playClick = () => {
      clickAudio.currentTime = 0;
      void clickAudio.play().catch(() => {});
    };

    const onMouseOver = (e: MouseEvent) => {
      const btn = findControlTarget(e.target);
      if (!btn) return;
      const rel = e.relatedTarget;
      if (rel instanceof Node && btn.contains(rel)) return;
      playHover();
    };

    const onClick = (e: MouseEvent) => {
      const btn = findControlTarget(e.target);
      if (!btn) return;
      playClick();
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("click", onClick, true);
      hoverAudio.pause();
      clickAudio.pause();
      hoverSource.disconnect();
      hoverGain.disconnect();
      void hoverCtx.close();
    };
  }, []);

  return null;
}
