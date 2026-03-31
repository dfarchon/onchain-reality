import { useTheme } from "../contexts/ThemeContext";

function IconSunOutline({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 2v2.25M12 19.75V22M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M2 12h2.25M19.75 12H22M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59" />
    </svg>
  );
}

function IconMoonOutline({ className }: { className?: string }) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

type ThemeToggleProps = {
  /** When true (e.g. Home over starfield), no pill fill — icon floats on the page background. */
  transparentBackground?: boolean;
};

export function ThemeToggle({
  transparentBackground = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const surfaceClass = transparentBackground
    ? "bg-transparent"
    : "bg-[var(--chrome-pill)] backdrop-blur-sm";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-md border-0 px-2 text-[var(--text-heading)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${surfaceClass}`}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      <span className="sr-only">
        {isLight ? "Switch to dark theme" : "Switch to light theme"}
      </span>
      <span
        aria-hidden
        className="inline-flex [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]"
      >
        {isLight ? <IconMoonOutline /> : <IconSunOutline />}
      </span>
    </button>
  );
}
