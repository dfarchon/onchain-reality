import { useSound } from "../contexts/SoundContext";

function IconMusic2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </svg>
  );
}

function IconMusicX({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
      <path d="m4 4 16 16" />
    </svg>
  );
}

function IconVolume2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function IconVolumeX({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m16 9 5 5" />
      <path d="m21 9-5 5" />
    </svg>
  );
}

type SoundToggleProps = {
  kind: "bgm" | "sfx";
  transparentBackground?: boolean;
  className?: string;
};

export function SoundToggle({
  kind,
  transparentBackground = false,
  className = "",
}: SoundToggleProps) {
  const { bgmEnabled, sfxEnabled, toggleBgm, toggleSfx } = useSound();

  const surfaceClass = transparentBackground
    ? "bg-transparent"
    : "bg-[var(--chrome-pill)] backdrop-blur-sm";

  const isBgm = kind === "bgm";
  const enabled = isBgm ? bgmEnabled : sfxEnabled;
  const onClick = isBgm ? toggleBgm : toggleSfx;
  const label = isBgm
    ? enabled
      ? "Mute background music"
      : "Enable background music"
    : enabled
      ? "Mute button sounds"
      : "Enable button sounds";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`sound-toggle inline-flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-md border-0 px-2 text-[var(--text-heading)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${surfaceClass} ${className}`}
      aria-label={label}
      aria-pressed={enabled}
      title={isBgm ? "BGM" : "SFX"}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="inline-flex [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-[1.125rem] md:[&>svg]:w-[1.125rem]"
      >
        {isBgm ? (
          enabled ? (
            <IconMusic2 />
          ) : (
            <IconMusicX />
          )
        ) : enabled ? (
          <IconVolume2 />
        ) : (
          <IconVolumeX />
        )}
      </span>
    </button>
  );
}
