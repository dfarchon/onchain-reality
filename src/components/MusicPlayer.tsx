import { useRef, useState, useEffect, useCallback } from 'react'

/** Background music in public folder */
const DEFAULT_AUDIO_SRC = '/bgm.ogg'
/** Silence between each full play before restarting */
const LOOP_GAP_MS = 5000
/** Fade duration in ms */
const FADE_DURATION_MS = 800
/** Fade step interval in ms */
const FADE_STEP_MS = 50
/** Start fading out this many seconds before the track ends */
const FADE_OUT_BEFORE_END_S = FADE_DURATION_MS / 1000

const INITIAL_LEFT = 16
const INITIAL_TOP = 112 // banner-height (96px) + 1rem (16px)

function getBannerHeightPx(): number {
  if (typeof document === 'undefined') return 96
  const val = getComputedStyle(document.documentElement).getPropertyValue('--banner-height').trim()
  const rem = parseFloat(val) || 6
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return rem * rootFontSize
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const userWantsPlaybackRef = useRef(true)
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gapTickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoplayedRef = useRef(false)
  const fadingOutAtEndRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBetweenLoops, setIsBetweenLoops] = useState(false)
  const [gapSecondsLeft, setGapSecondsLeft] = useState<number | null>(null)
  const [hasSource, setHasSource] = useState(false)
  const [position, setPosition] = useState({ x: INITIAL_LEFT, y: INITIAL_TOP })
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current)
      fadeRef.current = null
    }
  }, [])

  const fadeIn = useCallback((audio: HTMLAudioElement, onDone?: () => void) => {
    clearFade()
    audio.volume = 0
    const step = FADE_STEP_MS / FADE_DURATION_MS
    fadeRef.current = setInterval(() => {
      const next = Math.min(1, audio.volume + step)
      audio.volume = next
      if (next >= 1) {
        clearFade()
        onDone?.()
      }
    }, FADE_STEP_MS)
  }, [clearFade])

  const fadeOut = useCallback((audio: HTMLAudioElement, onDone?: () => void) => {
    clearFade()
    const step = FADE_STEP_MS / FADE_DURATION_MS
    fadeRef.current = setInterval(() => {
      const next = Math.max(0, audio.volume - step)
      audio.volume = next
      if (next <= 0) {
        clearFade()
        onDone?.()
      }
    }, FADE_STEP_MS)
  }, [clearFade])

  const clearLoopSchedule = useCallback(() => {
    clearFade()
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current)
      loopTimeoutRef.current = null
    }
    if (gapTickRef.current) {
      clearInterval(gapTickRef.current)
      gapTickRef.current = null
    }
    setIsBetweenLoops(false)
    setGapSecondsLeft(null)
  }, [clearFade])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0

    const tryAutoplay = () => {
      if (autoplayedRef.current || !userWantsPlaybackRef.current) return
      autoplayedRef.current = true
      setHasSource(true)
      audio.volume = 0
      audio.play().then(() => {
        setIsPlaying(true)
        fadeIn(audio)
      }).catch(() => {
        // Browser blocked autoplay — play on first user interaction
        const events = ['click', 'keydown', 'touchstart'] as const
        const resume = () => {
          events.forEach(e => document.removeEventListener(e, resume, true))
          audio.volume = 0
          audio.play().then(() => {
            setIsPlaying(true)
            fadeIn(audio)
          }).catch(() => setIsPlaying(false))
        }
        events.forEach(e => document.addEventListener(e, resume, { capture: true, once: true }))
      })
    }

    const onCanPlay = () => {
      setHasSource(true)
      tryAutoplay()
    }

    const onTimeUpdate = () => {
      if (!audio.duration || fadingOutAtEndRef.current) return
      const remaining = audio.duration - audio.currentTime
      if (remaining <= FADE_OUT_BEFORE_END_S && audio.volume > 0 && userWantsPlaybackRef.current) {
        fadingOutAtEndRef.current = true
        fadeOut(audio)
      }
    }

    const onEnded = () => {
      fadingOutAtEndRef.current = false
      clearFade()
      audio.volume = 0
      if (!userWantsPlaybackRef.current) {
        setIsPlaying(false)
        return
      }
      setIsPlaying(false)
      setIsBetweenLoops(true)
      setGapSecondsLeft(Math.ceil(LOOP_GAP_MS / 1000))
      let left = Math.ceil(LOOP_GAP_MS / 1000)
      gapTickRef.current = setInterval(() => {
        left -= 1
        setGapSecondsLeft(left > 0 ? left : 0)
        if (left <= 0 && gapTickRef.current) {
          clearInterval(gapTickRef.current)
          gapTickRef.current = null
        }
      }, 1000)
      loopTimeoutRef.current = setTimeout(() => {
        loopTimeoutRef.current = null
        if (gapTickRef.current) {
          clearInterval(gapTickRef.current)
          gapTickRef.current = null
        }
        setIsBetweenLoops(false)
        setGapSecondsLeft(null)
        audio.currentTime = 0
        audio.volume = 0
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            fadeIn(audio)
          })
          .catch(() => setHasSource(false))
      }, LOOP_GAP_MS)
    }
    const onError = () => setHasSource(false)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    if (audio.readyState >= 2) {
      // Defer to avoid synchronous setState inside effect body
      queueMicrotask(onCanPlay)
    }
    return () => {
      clearLoopSchedule()
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [clearLoopSchedule, fadeIn, fadeOut, clearFade])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
    }
  }, [position])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const { startX, startY, startLeft, startTop } = dragRef.current
      const panel = panelRef.current
      const w = panel ? panel.offsetWidth : 200
      const h = panel ? panel.offsetHeight : 56
      const bannerH = getBannerHeightPx()
      const maxX = window.innerWidth - w
      const minY = bannerH
      const maxY = window.innerHeight - bannerH - h
      const x = Math.max(0, Math.min(maxX, startLeft + e.clientX - startX))
      const y = Math.max(minY, Math.min(maxY, startTop + e.clientY - startY))
      setPosition({ x, y })
    }
    const onUp = () => {
      dragRef.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      userWantsPlaybackRef.current = false
      clearLoopSchedule()
      fadingOutAtEndRef.current = false
      fadeOut(audio, () => {
        audio.pause()
        setIsPlaying(false)
      })
      setIsPlaying(false)
    } else if (isBetweenLoops) {
      userWantsPlaybackRef.current = false
      clearLoopSchedule()
      setIsPlaying(false)
    } else {
      userWantsPlaybackRef.current = true
      audio.volume = 0
      audio.play().then(() => {
        setIsPlaying(true)
        fadeIn(audio)
      }).catch(() => {
        setHasSource(false)
        setIsPlaying(false)
        userWantsPlaybackRef.current = false
      })
    }
  }

  return (
    <div
      ref={panelRef}
      className="music-panel fixed z-[5] flex cursor-grab items-center gap-3 rounded border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg active:cursor-grabbing"
      style={{ left: position.x, top: position.y }}
      aria-label="Music player"
      onMouseDown={handleMouseDown}
    >
      <audio ref={audioRef} src={DEFAULT_AUDIO_SRC} preload="auto" loop={false} />
      <button
        type="button"
        onClick={togglePlay}
        disabled={!hasSource}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded border border-[var(--border)] text-[var(--text-heading)] transition hover:bg-[var(--border)] hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={
          isPlaying ? 'Pause' : isBetweenLoops ? 'Stop (cancel next loop)' : 'Play'
        }
      >
        {isPlaying ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : isBetweenLoops ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 6h12v12H6V6z" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <span className="music-panel-label max-w-[140px] truncate text-sm text-[var(--text-muted)] select-none">
        {!hasSource
          ? 'No track'
          : isPlaying
            ? 'Playing'
            : isBetweenLoops && gapSecondsLeft != null
              ? `Next loop in ${gapSecondsLeft}s`
              : 'Paused'}
      </span>
    </div>
  )
}
