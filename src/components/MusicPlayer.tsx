import { useRef, useState, useEffect, useCallback } from 'react'

/** Replace with your audio file path (e.g. in public folder: /music.mp3) */
const DEFAULT_AUDIO_SRC = '/music.mp3'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasSource, setHasSource] = useState(false)
  const [position, setPosition] = useState({ x: INITIAL_LEFT, y: INITIAL_TOP })
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onCanPlay = () => setHasSource(true)
    const onEnded = () => setIsPlaying(false)
    const onError = () => setHasSource(false)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    if (audio.readyState >= 2) setHasSource(true)
    return () => {
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

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
      audio.pause()
    } else {
      audio.play().catch(() => setHasSource(false))
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div
      ref={panelRef}
      className="music-panel fixed z-[5] flex cursor-grab items-center gap-3 rounded border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg active:cursor-grabbing"
      style={{ left: position.x, top: position.y }}
      aria-label="Music player"
      onMouseDown={handleMouseDown}
    >
      <audio ref={audioRef} src={DEFAULT_AUDIO_SRC} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        disabled={!hasSource}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded border border-[var(--border)] text-[var(--text-heading)] transition hover:bg-[var(--border)] hover:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <span className="music-panel-label max-w-[120px] truncate text-sm text-[var(--text-muted)] select-none">
        {hasSource ? (isPlaying ? 'Playing' : 'Paused') : 'No track'}
      </span>
    </div>
  )
}
