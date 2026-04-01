/* eslint-disable react-refresh/only-export-components -- context + hook module */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import hljsGithubUrl from "highlight.js/styles/github.css?url";
import hljsGithubDarkUrl from "highlight.js/styles/github-dark.css?url";

export type Theme = "light" | "dark";

const STORAGE_KEY = "onchain-reality-theme";

const HLJS_LINK_ID = "hljs-theme";
const THEME_SWITCHING_ATTR = "data-theme-switching";

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* private mode or quota */
  }
  return null;
}

function applyDomTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function markThemeSwitching() {
  document.documentElement.setAttribute(THEME_SWITCHING_ATTR, "true");
}

function clearThemeSwitching() {
  document.documentElement.removeAttribute(THEME_SWITCHING_ATTR);
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStored() ?? "dark");

  useEffect(() => {
    applyDomTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    let raf1 = 0;
    let raf2 = 0;
    if (document.documentElement.hasAttribute(THEME_SWITCHING_ATTR)) {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          clearThemeSwitching();
        });
      });
    }

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    markThemeSwitching();
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    markThemeSwitching();
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    let link = document.getElementById(HLJS_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = HLJS_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = theme === "light" ? hljsGithubUrl : hljsGithubDarkUrl;
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
