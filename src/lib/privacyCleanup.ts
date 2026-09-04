const LEGACY_CONSENT_KEY = "onchain-reality-analytics-consent";

/** Remove first-party state left by the site's retired GA4 integration. */
export function clearLegacyAnalyticsState() {
  try {
    window.localStorage.removeItem(LEGACY_CONSENT_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter((name): name is string =>
      Boolean(name && (name === "_ga" || name.startsWith("_ga_"))),
    );

  const hostParts = window.location.hostname.split(".");
  const domains = hostParts.flatMap((_, index) => {
    const domain = hostParts.slice(index).join(".");
    return domain.includes(".") ? [domain, `.${domain}`] : [];
  });

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}
