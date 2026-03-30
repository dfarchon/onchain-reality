import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

type Props = {
  children: string;
  /** When set, the lightbox matches this element's screen rect (e.g. blog `.content-panel__scroll` row). */
  lightboxBoundsRef?: RefObject<HTMLDivElement | null>;
};

type PlainRect = { top: number; left: number; width: number; height: number };

function rectFromDom(r: DOMRectReadOnly): PlainRect {
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function viewportFallbackRect(): PlainRect {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

type LightboxState = {
  src: string;
  alt: string;
  panelRect: PlainRect;
};

export function Markdown({ children, lightboxBoundsRef }: Props) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const thumbRef = useRef<HTMLImageElement | null>(null);
  const lightboxSessionRef = useRef(false);

  const measurePanelRect = useCallback((): PlainRect => {
    const el = lightboxBoundsRef?.current;
    if (el) return rectFromDom(el.getBoundingClientRect());
    return viewportFallbackRect();
  }, [lightboxBoundsRef]);

  const lightboxOpen = lightbox != null;
  useEffect(() => {
    if (!lightboxOpen) return;
    const el = lightboxBoundsRef?.current;
    const syncRect = () => {
      setLightbox((s) => (s ? { ...s, panelRect: measurePanelRect() } : null));
    };
    const onWin = () => syncRect();
    window.addEventListener("resize", onWin);
    if (el) {
      const ro = new ResizeObserver(() => syncRect());
      ro.observe(el);
      el.classList.add("markdown-lightbox-bounds-lock");
      const viewportEl = el.querySelector(".blog-post-scroll-area__viewport");
      const scrollTarget = viewportEl instanceof HTMLElement ? viewportEl : el;
      const onScroll = () => syncRect();
      scrollTarget.addEventListener("scroll", onScroll, { passive: true });
      if (viewportEl instanceof HTMLElement) {
        viewportEl.classList.add("markdown-lightbox-bounds-lock");
      }
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", onWin);
        scrollTarget.removeEventListener("scroll", onScroll);
        el.classList.remove("markdown-lightbox-bounds-lock");
        if (viewportEl instanceof HTMLElement) {
          viewportEl.classList.remove("markdown-lightbox-bounds-lock");
        }
      };
    }
    return () => window.removeEventListener("resize", onWin);
  }, [lightboxOpen, lightboxBoundsRef, measurePanelRect]);

  useEffect(() => {
    return () => {
      thumbRef.current?.classList.remove("prose-img-zoom--hidden");
      lightboxSessionRef.current = false;
    };
  }, []);

  const clearThumbHidden = useCallback(() => {
    thumbRef.current?.classList.remove("prose-img-zoom--hidden");
    thumbRef.current = null;
  }, []);

  const closeLightbox = useCallback(() => {
    lightboxSessionRef.current = false;
    clearThumbHidden();
    setLightbox(null);
  }, [clearThumbHidden]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, closeLightbox]);

  const openLightbox = useCallback(
    (el: HTMLImageElement, src: string, alt: string) => {
      if (lightboxSessionRef.current) return;
      lightboxSessionRef.current = true;
      thumbRef.current = el;
      el.classList.add("prose-img-zoom--hidden");
      setLightbox({
        src,
        alt,
        panelRect: measurePanelRect(),
      });
    },
    [measurePanelRect],
  );

  const components = useMemo<Partial<Components>>(
    () => ({
      img: ({ src, alt, className, ...rest }) => {
        if (!src) {
          return (
            <img src={src} alt={alt ?? ""} className={className} {...rest} />
          );
        }
        const mergedClass = [className, "prose-img-zoom"]
          .filter(Boolean)
          .join(" ");
        const label = (alt && alt.trim()) || "View image larger";
        return (
          <img
            {...rest}
            src={src}
            alt={alt ?? ""}
            className={mergedClass}
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openLightbox(e.currentTarget, src, alt ?? "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(e.currentTarget, src, alt ?? "");
              }
            }}
          />
        );
      },
    }),
    [openLightbox],
  );

  const lightboxNode = lightbox ? (
    <div
      className="markdown-lightbox-root fixed z-[200] box-border flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-black p-4"
      style={{
        top: lightbox.panelRect.top,
        left: lightbox.panelRect.left,
        width: lightbox.panelRect.width,
        height: lightbox.panelRect.height,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 w-full cursor-zoom-out border-0 bg-black p-0"
        aria-label="Close enlarged image"
        onClick={closeLightbox}
      />
      <img
        src={lightbox.src}
        alt={lightbox.alt}
        className="relative z-[1] max-h-full max-w-full object-contain shadow-2xl pointer-events-none min-h-0 min-w-0"
        draggable={false}
      />
    </div>
  ) : null;

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
      {typeof document !== "undefined" && lightboxNode
        ? createPortal(lightboxNode, document.body)
        : null}
    </>
  );
}
