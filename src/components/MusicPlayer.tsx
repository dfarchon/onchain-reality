import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

/** Background music — MP3 is universally supported and hardware-decoded on iOS */
const BGM_SRC = "/audio/music/bgm.mp3";
/** Silence between each full play before restarting */
const LOOP_GAP_MS = 5000;
/** Fade duration in ms */
const FADE_DURATION_MS = 800;
/** Fade step interval in ms */
const FADE_STEP_MS = 50;
/** Start fading out this many seconds before the track ends */
const FADE_OUT_BEFORE_END_S = FADE_DURATION_MS / 1000;
/** Max BGM volume (0–1). Mobile speakers are much louder than desktop. */
const MAX_VOLUME_DESKTOP = 1;
const MAX_VOLUME_MOBILE = 0.1;

function getMaxVolume(): number {
  return navigator.maxTouchPoints > 0 ? MAX_VOLUME_MOBILE : MAX_VOLUME_DESKTOP;
}

/** Keep a thin inset so the panel stays slightly inside the viewport (easier to re-grab). */
const VIEWPORT_EDGE_PX = 2;

const INITIAL_LEFT = 16;
const INITIAL_TOP = 112;

/** On mobile, position the panel on the right side so it doesn't block nav. */
function getInitialPosition(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: INITIAL_LEFT, y: INITIAL_TOP };
  if (navigator.maxTouchPoints > 0) {
    // Right-aligned with a small margin
    const panelWidth = 160; // approximate panel width on mobile
    return { x: window.innerWidth - panelWidth + 6, y: INITIAL_TOP + 5 };
  }
  return { x: INITIAL_LEFT, y: INITIAL_TOP };
}

/** Full viewport bounds (incl. under header/footer); only a thin edge inset. */
function clampToViewport(
  x: number,
  y: number,
  panelW: number,
  panelH: number,
): { x: number; y: number } {
  const maxX = Math.max(
    VIEWPORT_EDGE_PX,
    window.innerWidth - panelW - VIEWPORT_EDGE_PX,
  );
  const maxY = Math.max(
    VIEWPORT_EDGE_PX,
    window.innerHeight - panelH - VIEWPORT_EDGE_PX,
  );
  return {
    x: Math.max(VIEWPORT_EDGE_PX, Math.min(maxX, x)),
    y: Math.max(VIEWPORT_EDGE_PX, Math.min(maxY, y)),
  };
}

export function MusicPlayer() {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isHome = pathname === "/";
  const isPhilosophy = pathname === "/philosophy";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isProjects = pathname === "/projects";
  /** Philosophy + Blog + Projects in light: flat chrome, no drop shadow. */
  const philosophyOrBlogLightFlat =
    (isPhilosophy || isBlog || isProjects) && theme === "light";

  const audioRef = useRef<HTMLAudioElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceConnectedRef = useRef(false);
  const userWantsPlaybackRef = useRef(true);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gapTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayedRef = useRef(false);
  const fadingOutAtEndRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBetweenLoops, setIsBetweenLoops] = useState(false);
  const [gapSecondsLeft, setGapSecondsLeft] = useState<number | null>(null);
  const [hasSource, setHasSource] = useState(false);
  /** True after `error` — distinguish from still-buffering (`!hasSource && !loadError`). */
  const [loadError, setLoadError] = useState(false);
  /** True once playback has started at least once (distinguishes "tap to play" from "paused"). */
  const [hasEverPlayed, setHasEverPlayed] = useState(false);
  const [position, setPosition] = useState(getInitialPosition);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Web Audio GainNode (connected lazily after first successful play)  */
  /* ------------------------------------------------------------------ */

  /** true when GainNode is connected and should be used for volume. */
  const hasGain = () => sourceConnectedRef.current && gainRef.current != null;

  /**
   * Try to connect a GainNode via Web Audio API.
   * MUST be called inside a .then() from audio.play() so that
   * AudioContext creation inherits user-activation on mobile.
   * Returns true on success, false on failure (caller falls back to audio.volume).
   */
  const connectGain = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceConnectedRef.current) return sourceConnectedRef.current;
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(ctx.destination);
      gainRef.current = gain;
      sourceConnectedRef.current = true;
      // Full signal into graph; GainNode controls perceived volume
      audio.volume = 1;
      if (ctx.state === "suspended") void ctx.resume();
      return true;
    } catch {
      // Web Audio unavailable — fall back to audio.volume
      return false;
    }
  }, []);

  /** Set volume on whichever backend is active. */
  const setVol = useCallback((v: number) => {
    if (hasGain()) {
      gainRef.current!.gain.value = v;
    } else if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  /** Read current volume from whichever backend is active. */
  const getVol = useCallback((): number => {
    if (hasGain()) return gainRef.current!.gain.value;
    return audioRef.current?.volume ?? 0;
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Fade helpers                                                       */
  /* ------------------------------------------------------------------ */

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(
    (onDone?: () => void) => {
      clearFade();
      setVol(0);
      const maxVol = getMaxVolume();
      const step = (FADE_STEP_MS / FADE_DURATION_MS) * maxVol;
      fadeRef.current = setInterval(() => {
        const cur = getVol();
        const next = Math.min(maxVol, cur + step);
        setVol(next);
        if (next >= maxVol) {
          clearFade();
          onDone?.();
        }
      }, FADE_STEP_MS);
    },
    [clearFade, setVol, getVol],
  );

  const fadeOut = useCallback(
    (onDone?: () => void) => {
      clearFade();
      const maxVol = getMaxVolume();
      const step = (FADE_STEP_MS / FADE_DURATION_MS) * maxVol;
      fadeRef.current = setInterval(() => {
        const cur = getVol();
        const next = Math.max(0, cur - step);
        setVol(next);
        if (next <= 0) {
          clearFade();
          onDone?.();
        }
      }, FADE_STEP_MS);
    },
    [clearFade, setVol, getVol],
  );

  const clearLoopSchedule = useCallback(() => {
    clearFade();
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (gapTickRef.current) {
      clearInterval(gapTickRef.current);
      gapTickRef.current = null;
    }
    setIsBetweenLoops(false);
    setGapSecondsLeft(null);
  }, [clearFade]);

  /* ------------------------------------------------------------------ */
  /*  Main playback effect                                              */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;

    /* ---------- helpers ------------------------------------------- */

    /** Called after audio.play() resolves. Connects GainNode then fades in. */
    const onPlayStarted = () => {
      connectGain(); // try GainNode; no-op if already connected or unsupported
      autoplayedRef.current = true;
      setHasSource(true);
      setIsPlaying(true);
      setHasEverPlayed(true);
      fadeIn();
    };

    /* ---------- audio element events ------------------------------ */

    const markReady = () => {
      setLoadError(false);
      setHasSource(true);
    };

    const onCanPlay = () => markReady();

    const onTimeUpdate = () => {
      if (!audio.duration || fadingOutAtEndRef.current) return;
      const remaining = audio.duration - audio.currentTime;
      if (
        remaining <= FADE_OUT_BEFORE_END_S &&
        getVol() > 0 &&
        userWantsPlaybackRef.current
      ) {
        fadingOutAtEndRef.current = true;
        fadeOut();
      }
    };

    const onEnded = () => {
      fadingOutAtEndRef.current = false;
      clearFade();
      setVol(0);
      if (!userWantsPlaybackRef.current) {
        setIsPlaying(false);
        return;
      }
      setIsPlaying(false);
      setIsBetweenLoops(true);
      setGapSecondsLeft(Math.ceil(LOOP_GAP_MS / 1000));
      let left = Math.ceil(LOOP_GAP_MS / 1000);
      gapTickRef.current = setInterval(() => {
        left -= 1;
        setGapSecondsLeft(left > 0 ? left : 0);
        if (left <= 0 && gapTickRef.current) {
          clearInterval(gapTickRef.current);
          gapTickRef.current = null;
        }
      }, 1000);
      loopTimeoutRef.current = setTimeout(() => {
        loopTimeoutRef.current = null;
        if (gapTickRef.current) {
          clearInterval(gapTickRef.current);
          gapTickRef.current = null;
        }
        setIsBetweenLoops(false);
        setGapSecondsLeft(null);
        audio.currentTime = 0;
        setVol(0);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            fadeIn();
          })
          .catch(() => setIsPlaying(false));
      }, LOOP_GAP_MS);
    };

    const onError = () => {
      setHasSource(false);
      setLoadError(true);
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", markReady);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    if (audio.readyState >= 2) {
      queueMicrotask(markReady);
    }

    // iOS ignores preload="auto" — canplay/loadedmetadata may never fire.
    // After a short delay, assume the source is valid (play will load on demand).
    const iosFallback = setTimeout(() => {
      if (!audio.error) setHasSource(true);
    }, 1500);

    /* ---------- gesture-based playback for mobile ----------------- */
    // Persistent listener (NOT once) — retries on every tap until
    // playback actually starts.  Handles both:
    //   • iOS Chrome/Safari where canplay fires but autoplay is blocked
    //   • iOS Safari where audio never preloads at all

    const gestureEvents = ["click", "touchstart", "keydown"] as const;

    const removeGestureListeners = () => {
      gestureEvents.forEach((e) =>
        document.removeEventListener(e, onGesture, true),
      );
    };

    const onGesture = (evt: Event) => {
      if (autoplayedRef.current || !userWantsPlaybackRef.current) {
        removeGestureListeners();
        return;
      }
      // Don't fight the play button's own handler
      if (panelRef.current?.contains(evt.target as Node)) return;

      // Don't call audio.load() — it resets the element and can break
      // the subsequent play(). audio.play() implicitly loads on iOS.
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          onPlayStarted();
          removeGestureListeners();
        })
        .catch(() => {
          // Will retry on next gesture automatically
        });
    };

    gestureEvents.forEach((e) =>
      document.addEventListener(e, onGesture, { capture: true }),
    );

    /* ---------- cleanup ------------------------------------------- */

    return () => {
      clearTimeout(iosFallback);
      clearLoopSchedule();
      removeGestureListeners();
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", markReady);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [
    clearLoopSchedule,
    fadeIn,
    fadeOut,
    clearFade,
    connectGain,
    setVol,
    getVol,
  ]);

  /* ------------------------------------------------------------------ */
  /*  Drag-to-move                                                      */
  /* ------------------------------------------------------------------ */

  const clampPosition = useCallback(() => {
    const panel = panelRef.current;
    const w = panel?.offsetWidth ?? 200;
    const h = panel?.offsetHeight ?? 56;
    setPosition((prev) => clampToViewport(prev.x, prev.y, w, h));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: position.x,
        startTop: position.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [position.x, position.y],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const panel = panelRef.current;
      const w = panel?.offsetWidth ?? 200;
      const h = panel?.offsetHeight ?? 56;
      const { startX, startY, startLeft, startTop } = dragRef.current;
      const nextX = startLeft + e.clientX - startX;
      const nextY = startTop + e.clientY - startY;
      const { x, y } = clampToViewport(nextX, nextY, w, h);
      setPosition({ x, y });
    },
    [],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const onResize = () => clampPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    queueMicrotask(clampPosition);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [clampPosition]);

  /* ------------------------------------------------------------------ */
  /*  Play / pause                                                      */
  /* ------------------------------------------------------------------ */

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      userWantsPlaybackRef.current = false;
      clearLoopSchedule();
      fadingOutAtEndRef.current = false;
      clearFade();
      audio.pause();
      setVol(0);
      setIsPlaying(false);
    } else if (isBetweenLoops) {
      userWantsPlaybackRef.current = false;
      clearLoopSchedule();
      setIsPlaying(false);
    } else {
      userWantsPlaybackRef.current = true;
      setVol(0);
      audio
        .play()
        .then(() => {
          connectGain();
          autoplayedRef.current = true;
          setIsPlaying(true);
          fadeIn();
        })
        .catch(() => {
          setIsPlaying(false);
          userWantsPlaybackRef.current = false;
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  const panelShellClass = isHome
    ? theme === "light"
      ? "border-[var(--border-light)] bg-[color-mix(in_srgb,var(--bg)_38%,transparent)] shadow-[0_4px_28px_rgba(60,30,55,0.1)] backdrop-blur-md"
      : "border-[var(--border)] bg-[rgba(6,4,10,0.42)] shadow-[0_6px_24px_rgba(0,0,0,0.4)] backdrop-blur-md"
    : philosophyOrBlogLightFlat
      ? "border-transparent bg-[var(--bg)] shadow-none backdrop-blur-none"
      : "border-[var(--border)] bg-[var(--bg-surface)] shadow-lg";

  const playBtnClass = isHome
    ? theme === "light"
      ? "border-[var(--border-light)] bg-white/30 hover:bg-white/45"
      : "border-[var(--border)] bg-white/[0.07] hover:bg-white/[0.12]"
    : philosophyOrBlogLightFlat
      ? "border-[var(--border-light)] bg-[color-mix(in_srgb,var(--bg)_92%,var(--accent)_8%)] hover:bg-[color-mix(in_srgb,var(--bg)_82%,var(--accent)_18%)]"
      : "border-[var(--border)] hover:bg-[var(--border)] hover:bg-opacity-20";

  return (
    <div
      ref={panelRef}
      className={`music-panel fixed z-[100] flex max-w-[calc(100vw-12px)] touch-none cursor-grab items-center gap-2 rounded border px-2 py-2 active:cursor-grabbing md:max-w-none md:gap-3 md:px-3 ${panelShellClass}`}
      style={{ left: position.x, top: position.y }}
      aria-label="Music player"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <audio ref={audioRef} src={BGM_SRC} preload="auto" loop={false} />
      <button
        type="button"
        onPointerUp={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        disabled={!hasSource}
        className={`flex h-9 w-9 shrink-0 cursor-pointer touch-auto items-center justify-center rounded border text-[var(--text-heading)] transition disabled:cursor-not-allowed disabled:opacity-50 ${playBtnClass}`}
        aria-label={
          isPlaying
            ? "Pause"
            : isBetweenLoops
              ? "Stop (cancel next loop)"
              : "Play"
        }
      >
        {isPlaying ? (
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : isBetweenLoops ? (
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M6 6h12v12H6V6z" />
          </svg>
        ) : (
          <svg
            className="ml-0.5 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <span className="music-panel-label min-w-0 max-w-[min(7rem,36vw)] shrink truncate text-sm text-[var(--text-muted)] select-none md:max-w-[140px]">
        {!hasSource && !loadError
          ? "Loading…"
          : loadError
            ? "No track"
            : isPlaying
              ? "Playing"
              : isBetweenLoops && gapSecondsLeft != null
                ? `Next loop in ${gapSecondsLeft}s`
                : !hasEverPlayed
                  ? "Tap to play"
                  : "Paused"}
      </span>
    </div>
  );
}
