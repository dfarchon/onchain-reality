/* eslint-disable react-refresh/only-export-components -- context + hook module */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "onchain-reality-analytics-consent";

export type AnalyticsConsentState = "unknown" | "granted" | "denied";

function readStored(): AnalyticsConsentState {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "granted") return "granted";
    if (v === "denied") return "denied";
  } catch {
    /* private mode or quota */
  }
  return "unknown";
}

type AnalyticsConsentContextValue = {
  consent: AnalyticsConsentState;
  isCookieSettingsOpen: boolean;
  setConsent: (value: "granted" | "denied") => void;
  /** Opens the cookie settings UI without clearing any previously stored choice. */
  openCookieSettings: () => void;
  closeCookieSettings: () => void;
};

const AnalyticsConsentContext =
  createContext<AnalyticsConsentContextValue | null>(null);

export function AnalyticsConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsentState] = useState<AnalyticsConsentState>(() =>
    typeof window !== "undefined" ? readStored() : "unknown",
  );
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const setConsent = useCallback((value: "granted" | "denied") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setConsentState(value);
    setIsCookieSettingsOpen(false);
  }, []);

  const openCookieSettings = useCallback(() => {
    setIsCookieSettingsOpen(true);
  }, []);

  const closeCookieSettings = useCallback(() => {
    setIsCookieSettingsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      isCookieSettingsOpen,
      setConsent,
      openCookieSettings,
      closeCookieSettings,
    }),
    [
      consent,
      isCookieSettingsOpen,
      setConsent,
      openCookieSettings,
      closeCookieSettings,
    ],
  );

  return (
    <AnalyticsConsentContext.Provider value={value}>
      {children}
    </AnalyticsConsentContext.Provider>
  );
}

export function useAnalyticsConsent() {
  const ctx = useContext(AnalyticsConsentContext);
  if (!ctx) {
    throw new Error(
      "useAnalyticsConsent must be used within AnalyticsConsentProvider",
    );
  }
  return ctx;
}
