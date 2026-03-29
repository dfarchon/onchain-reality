import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";

type Metrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  railHeight: number;
};

const MIN_THUMB_PX = 28;
const THUMB_HIDE_DELAY_MS = 500;

export function BlogPostScrollArea({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [thumbVisible, setThumbVisible] = useState(false);
  const [m, setM] = useState<Metrics>({
    scrollTop: 0,
    scrollHeight: 1,
    clientHeight: 1,
    railHeight: 1,
  });

  const measure = useCallback(() => {
    const v = viewportRef.current;
    const r = railRef.current;
    if (!v) return;
    setM({
      scrollTop: v.scrollTop,
      scrollHeight: v.scrollHeight,
      clientHeight: v.clientHeight,
      railHeight: r?.clientHeight ?? v.clientHeight,
    });
  }, []);

  const scheduleThumbHide = useCallback(() => {
    if (thumbHideTimerRef.current) {
      clearTimeout(thumbHideTimerRef.current);
      thumbHideTimerRef.current = null;
    }
    thumbHideTimerRef.current = window.setTimeout(() => {
      setThumbVisible(false);
      thumbHideTimerRef.current = null;
    }, THUMB_HIDE_DELAY_MS);
  }, []);

  const revealThumb = useCallback(() => {
    setThumbVisible(true);
    scheduleThumbHide();
  }, [scheduleThumbHide]);

  const cancelThumbHide = useCallback(() => {
    if (thumbHideTimerRef.current) {
      clearTimeout(thumbHideTimerRef.current);
      thumbHideTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    const onScroll = () => {
      measure();
      revealThumb();
    };
    v.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(v);
    const r = railRef.current;
    if (r) ro.observe(r);
    measure();
    return () => {
      v.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (thumbHideTimerRef.current) {
        clearTimeout(thumbHideTimerRef.current);
        thumbHideTimerRef.current = null;
      }
    };
  }, [measure, revealThumb]);

  const overflow = Math.max(0, m.scrollHeight - m.clientHeight);
  const railH = m.railHeight || 1;
  const thumbH =
    overflow <= 0
      ? railH
      : Math.max(MIN_THUMB_PX, (m.clientHeight / m.scrollHeight) * railH);
  const thumbTop =
    overflow <= 0 ? 0 : (m.scrollTop / overflow) * (railH - thumbH);

  const onThumbMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    const v = viewportRef.current;
    const r = railRef.current;
    if (!v || !r) return;
    const maxScroll = Math.max(0, v.scrollHeight - v.clientHeight);
    if (maxScroll <= 0) return;
    cancelThumbHide();
    setThumbVisible(true);
    const startY = e.clientY;
    const startScroll = v.scrollTop;
    const onMove = (ev: MouseEvent) => {
      const el = viewportRef.current;
      const railEl = railRef.current;
      if (!el || !railEl) return;
      const rh = railEl.clientHeight;
      const th = Math.max(
        MIN_THUMB_PX,
        (el.clientHeight / el.scrollHeight) * rh,
      );
      const track = Math.max(1, rh - th);
      const ms = Math.max(0, el.scrollHeight - el.clientHeight);
      const dy = ev.clientY - startY;
      el.scrollTop = Math.max(0, Math.min(ms, startScroll + (dy / track) * ms));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      scheduleThumbHide();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="content-panel__scroll blog-post-scroll-area">
      <div
        ref={viewportRef}
        className={`blog-post-scroll-area__viewport ${className}`.trim()}
      >
        {children}
      </div>
      <div ref={railRef} className="blog-post-scroll-area__rail" aria-hidden>
        <div
          className={
            thumbVisible
              ? "blog-post-scroll-area__thumb blog-post-scroll-area__thumb--visible"
              : "blog-post-scroll-area__thumb"
          }
          style={{ height: thumbH, top: thumbTop }}
          onMouseDown={onThumbMouseDown}
        />
      </div>
    </div>
  );
}
