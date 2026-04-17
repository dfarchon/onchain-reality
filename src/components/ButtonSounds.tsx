import { useEffect } from "react";
import { useSound } from "../contexts/SoundContext";

const CLICK_SRC = "/audio/sfx/click.ogg";

/** Quieter on phones / touch-primary UIs — speakers feel louder than desktop. */
const CLICK_VOLUME_DESKTOP = 1;
const CLICK_VOLUME_NARROW = 0.05;

function shouldUseQuietClickVolume(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.maxTouchPoints > 0;
}

function clickVolumeForViewport(): number {
  return shouldUseQuietClickVolume()
    ? CLICK_VOLUME_NARROW
    : CLICK_VOLUME_DESKTOP;
}

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
  const { sfxEnabled } = useSound();

  useEffect(() => {
    if (!sfxEnabled) return;

    let cancelled = false;
    let ctx: AudioContext | null = null;
    let buffer: AudioBuffer | null = null;

    fetch(CLICK_SRC)
      .then((res) => res.arrayBuffer())
      .then((arr) => {
        if (cancelled) return null;
        ctx = new AudioContext();
        return ctx.decodeAudioData(arr);
      })
      .then((decoded) => {
        if (cancelled || !decoded) return;
        buffer = decoded;
      })
      .catch(() => {});

    const playClick = () => {
      if (!ctx || !buffer) return;
      if (ctx.state === "suspended") void ctx.resume();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = clickVolumeForViewport();
      source.buffer = buffer;
      source.connect(gain).connect(ctx.destination);
      source.start();
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Element) {
        if (t.closest(".markdown-lightbox-root")) return;
        if (t.closest("img.prose-img-zoom")) return;
      }
      const btn = findControlTarget(e.target);
      if (!btn) return;
      playClick();
    };

    document.addEventListener("click", onClick, true);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick, true);
      if (ctx) void ctx.close();
    };
  }, [sfxEnabled]);

  return null;
}
