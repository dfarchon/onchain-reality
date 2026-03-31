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
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
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
