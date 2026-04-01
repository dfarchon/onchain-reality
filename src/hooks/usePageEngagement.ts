import { useEffect, useRef, type RefObject } from "react";
import { trackEvent, isAnalyticsReady } from "../lib/analytics/ga";
import {
  GA_EVENTS,
  type PageType,
  type ContentType,
} from "../lib/analytics/events";
import type { AnalyticsConsentState } from "../contexts/AnalyticsConsentContext";

const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100] as const;
const READ_COMPLETE_RATIO = 0.98;

export interface PageEngagementConfig {
  scrollRef: RefObject<HTMLElement | null>;
  pageType: PageType;
  consent: AnalyticsConsentState;
  contentId?: string;
  contentType?: ContentType;
}

interface EngagementState {
  firedThresholds: Set<number>;
  readComplete: boolean;
  maxScrollPercent: number;
  activeTimeMs: number;
  lastActiveTs: number | null;
}

function snapshotActiveTime(s: EngagementState): number {
  let total = s.activeTimeMs;
  if (s.lastActiveTs !== null) total += Date.now() - s.lastActiveTs;
  return total;
}

/**
 * Tracks scroll depth, read completion, active time, and fires a
 * page_engagement_summary when the component unmounts (route change).
 *
 * All GA events are gated on both consent and `isAnalyticsReady()` so the
 * hook is safe to mount before GA has initialised.
 */
export function usePageEngagement({
  scrollRef,
  pageType,
  consent,
  contentId,
  contentType,
}: PageEngagementConfig): void {
  const consentRef = useRef(consent);
  const pageTypeRef = useRef(pageType);
  const contentIdRef = useRef(contentId);
  const contentTypeRef = useRef(contentType);

  useEffect(() => {
    consentRef.current = consent;
    pageTypeRef.current = pageType;
    contentIdRef.current = contentId;
    contentTypeRef.current = contentType;
  });

  const state = useRef<EngagementState>({
    firedThresholds: new Set(),
    readComplete: false,
    maxScrollPercent: 0,
    activeTimeMs: 0,
    lastActiveTs: null,
  });

  // Reset tracking state on mount and when content changes
  useEffect(() => {
    const s = state.current;
    s.firedThresholds.clear();
    s.readComplete = false;
    s.maxScrollPercent = 0;
    s.activeTimeMs = 0;
    s.lastActiveTs = document.hidden ? null : Date.now();
  }, [contentId, pageType]);

  // Active-time bookkeeping via visibilitychange
  useEffect(() => {
    const onVisibility = () => {
      const s = state.current;
      if (document.hidden) {
        if (s.lastActiveTs !== null) {
          s.activeTimeMs += Date.now() - s.lastActiveTs;
          s.lastActiveTs = null;
        }
      } else {
        s.lastActiveTs = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Scroll-depth and read-complete tracking
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      const percent = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
      const s = state.current;
      if (percent > s.maxScrollPercent) s.maxScrollPercent = percent;

      if (consentRef.current !== "granted" || !isAnalyticsReady()) return;

      for (const threshold of SCROLL_THRESHOLDS) {
        if (percent >= threshold && !s.firedThresholds.has(threshold)) {
          s.firedThresholds.add(threshold);
          trackEvent(GA_EVENTS.SCROLL_DEPTH, {
            percent_scrolled: threshold,
            page_type: pageTypeRef.current,
            content_id: contentIdRef.current,
          });
        }
      }

      if (!s.readComplete && scrollTop / maxScroll >= READ_COMPLETE_RATIO) {
        s.readComplete = true;
        trackEvent(GA_EVENTS.READ_COMPLETE, {
          content_id: contentIdRef.current,
          content_type: contentTypeRef.current,
          page_type: pageTypeRef.current,
          reading_time_seconds: Math.round(snapshotActiveTime(s) / 1000),
        });
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  // Send engagement summary on unmount (route navigation or page leave)
  useEffect(() => {
    const s = state.current;
    return () => {
      if (consentRef.current !== "granted" || !isAnalyticsReady()) return;
      trackEvent(GA_EVENTS.PAGE_ENGAGEMENT_SUMMARY, {
        page_type: pageTypeRef.current,
        content_id: contentIdRef.current,
        active_time_seconds: Math.round(snapshotActiveTime(s) / 1000),
        max_scroll_percent: s.maxScrollPercent,
        completed_read: s.readComplete,
      });
    };
  }, []);
}
