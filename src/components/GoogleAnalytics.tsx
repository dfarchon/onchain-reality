import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAnalyticsConsent } from "../contexts/AnalyticsConsentContext";
import {
  initAnalytics,
  isAnalyticsReady,
  resetAnalytics,
  trackPageView,
} from "../lib/analytics/ga";
import { resolvePageContext } from "../lib/analytics/events";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as
  | string
  | undefined;

/**
 * Consent-gated GA4 for SPA. The react-ga4 chunk is lazily loaded only after
 * the user explicitly accepts analytics — rejecting never triggers a single
 * Google network request nor downloads the analytics library code.
 */
export function GoogleAnalytics() {
  const { consent } = useAnalyticsConsent();
  const location = useLocation();
  const [initEpoch, setInitEpoch] = useState(0);

  useEffect(() => {
    if (!MEASUREMENT_ID) {
      if (import.meta.env.DEV) {
        console.warn(
          "[GA4] Missing VITE_GA_MEASUREMENT_ID. Analytics disabled.",
        );
      }
      return;
    }

    let cancelled = false;

    if (consent === "granted") {
      initAnalytics(MEASUREMENT_ID).then((ok) => {
        if (cancelled) {
          resetAnalytics();
          return;
        }
        if (ok) setInitEpoch((c) => c + 1);
      });
    } else {
      resetAnalytics();
    }

    return () => {
      cancelled = true;
    };
  }, [consent]);

  useEffect(() => {
    if (!isAnalyticsReady()) return;
    const page = location.pathname + location.search;
    const context = resolvePageContext(location.pathname);
    trackPageView(page, {
      page_title: document.title,
      ...context,
    });
  }, [location.pathname, location.search, initEpoch]);

  return null;
}
