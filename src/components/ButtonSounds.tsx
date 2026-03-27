import { useEffect } from "react";

const CLICK_SRC = "/click.ogg";

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

/** Global delegated click sound for native buttons, button-like inputs, and links. */
export function ButtonSounds() {
  useEffect(() => {
    const clickAudio = new Audio(CLICK_SRC);
    clickAudio.preload = "auto";

    const playClick = () => {
      clickAudio.currentTime = 0;
      void clickAudio.play().catch(() => {});
    };

    const onClick = (e: MouseEvent) => {
      const btn = findControlTarget(e.target);
      if (!btn) return;
      playClick();
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      clickAudio.pause();
    };
  }, []);

  return null;
}
