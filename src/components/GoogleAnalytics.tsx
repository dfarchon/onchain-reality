import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalyticsConsent } from "../contexts/AnalyticsConsentContext";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as
  | string
  | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gtagBootstrapDone = false;

const GA_SCRIPT_ATTR = "data-onchain-ga";

function teardownGtag(measurementId: string) {
  gtagBootstrapDone = false;
  document.querySelectorAll(`script[${GA_SCRIPT_ATTR}]`).forEach((el) => {
    if (el.getAttribute(GA_SCRIPT_ATTR) === measurementId) el.remove();
  });
  window.dataLayer = [];
  delete window.gtag;
}

/**
 * Loads gtag only after the user grants consent. Uses Google Consent Mode v2
 * defaults (analytics only) at first load so tags respect storage choices.
 */
function ensureGtag(measurementId: string) {
  if (gtagBootstrapDone) return;
  gtagBootstrapDone = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute(GA_SCRIPT_ATTR, measurementId);
  document.head.appendChild(script);
}

/**
 * GA4 for SPA: loads gtag only after consent; sends `page_view` on each navigation.
 * Set `VITE_GA_MEASUREMENT_ID` (e.g. in Netlify env) to your `G-XXXXXXXXXX` ID.
 */
export function GoogleAnalytics() {
  const { consent } = useAnalyticsConsent();
  const location = useLocation();

  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    if (consent !== "granted") {
      teardownGtag(MEASUREMENT_ID);
      return;
    }
    ensureGtag(MEASUREMENT_ID);
  }, [consent]);

  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    if (consent !== "granted") return;

    const pathWithQuery = `${location.pathname}${location.search}`;

    const send = () => {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "page_view", {
        page_path: pathWithQuery,
        page_title: document.title,
        page_location: `${window.location.origin}${pathWithQuery}`,
      });
    };

    send();
  }, [location.pathname, location.search, consent]);

  return null;
}
