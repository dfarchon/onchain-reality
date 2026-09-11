import { useEffect, useRef, useState } from "react";
import { useSound } from "../contexts/SoundContext";

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      {muted ? (
        <path d="m16 9 5 5m0-5-5 5" />
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" />
      )}
    </svg>
  );
}

export function SoundMenu({
  transparentBackground = false,
}: {
  transparentBackground?: boolean;
}) {
  const { bgmEnabled, sfxEnabled, bgmStatus, toggleBgm, toggleSfx, muteAll } =
    useSound();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const anyEnabled = bgmEnabled || sfxEnabled;
  const surfaceClass = transparentBackground
    ? "bg-transparent"
    : "bg-[var(--chrome-pill)] backdrop-blur-sm";

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="sound-menu relative flex shrink-0">
      <button
        type="button"
        className={`inline-flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-md border-0 px-2 text-[var(--text-heading)] hover:text-[var(--accent)] ${surfaceClass}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Sound settings"
        aria-expanded={open}
      >
        <span className="h-5 w-5">
          <SpeakerIcon muted={!anyEnabled} />
        </span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+0.5rem)] right-0 z-[70] w-[min(18rem,calc(100vw-2rem))] rounded-md bg-[var(--bg)] p-3 text-left">
          <p className="type-label mb-2 text-[var(--text-muted)]">Sound</p>
          <button
            type="button"
            onClick={toggleBgm}
            className="flex min-h-11 w-full items-center justify-between rounded px-2 hover:bg-[var(--border-light)]"
          >
            <span>Background music</span>
            <span className="text-[0.875rem] leading-[1.45] capitalize text-[var(--text-muted)]">
              {bgmEnabled ? bgmStatus : "Off"}
            </span>
          </button>
          <button
            type="button"
            onClick={toggleSfx}
            className="flex min-h-11 w-full items-center justify-between rounded px-2 hover:bg-[var(--border-light)]"
          >
            <span>Interface sounds</span>
            <span className="text-[0.875rem] leading-[1.45] text-[var(--text-muted)]">
              {sfxEnabled ? "On" : "Off"}
            </span>
          </button>
          {anyEnabled && (
            <button
              type="button"
              onClick={muteAll}
              className="mt-2 min-h-10 w-full pt-2 font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            >
              Mute all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
