import { useState, useEffect, useRef, useCallback } from 'react'

function getBannerHeightPx(): number {
  if (typeof document === 'undefined') return 96
  const val = getComputedStyle(document.documentElement).getPropertyValue('--banner-height').trim()
  const rem = parseFloat(val) || 6
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return rem * rootFontSize
}

const ASCII_BANNER = `  ___  _   _  ____ _   _    ____    _    _   _ _   _ ___ _   _
 / _ \\| \\ | |/ ___| | | |  / ___|  / \\  | \\ | | \\ | |_ _| \\ | |
| | | |  \\| | |   | |_| | | |     / _ \\ |  \\| |  \\| || ||  \\| |
| |_| | |\\  | |___|  _  | | |___ / ___ \\| |\\  | |\\  || || |\\  |
 \\___/|_| \\_|\\____|_| |_|  \\____/_/   \\_\\_| \\_|_| \\_|___|_| \\_|`

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

function GlitchLine() {
  const [line, setLine] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const length = 40 + Math.floor(Math.random() * 20)
      const chars = Array.from({ length }, () =>
        Math.random() > 0.3 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ' '
      )
      setLine(chars.join(''))
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return <span className="ascii-glitch text-[var(--accent)] opacity-70">{line}</span>
}

const PANEL_MARGIN = 24

export function Ascii() {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 24, y: 120 })
  const [panelOpen, setPanelOpen] = useState(true)
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null)
  const initialRightDone = useRef(false)

  useEffect(() => {
    if (!panelOpen || initialRightDone.current) return
    const panel = panelRef.current
    if (!panel) return
    initialRightDone.current = true
    const bannerH = getBannerHeightPx()
    setPosition({
      x: window.innerWidth - panel.offsetWidth - PANEL_MARGIN,
      y: bannerH + PANEL_MARGIN,
    })
  }, [panelOpen])

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
      const w = panel ? panel.offsetWidth : 672
      const h = panel ? panel.offsetHeight : 400
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

  return (
    <div className="ascii-page min-h-[50vh] relative px-6 py-12">
      {panelOpen && (
        <div
          ref={panelRef}
          className="retro-box ascii-panel fixed z-[4] w-full max-w-3xl cursor-grab select-none active:cursor-grabbing"
          style={{ left: position.x, top: position.y }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-semibold tracking-wide text-[var(--text-heading)] uppercase">
                ASCII
              </h1>
              <p className="mt-2 font-body text-base text-[var(--text-muted)]" lang="ja">
                — アスキー
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="ascii-panel-close shrink-0 cursor-pointer rounded border border-[var(--border)] px-2 py-1 text-sm text-[var(--text-muted)] transition hover:bg-[var(--border)] hover:bg-opacity-20 hover:text-[var(--text-heading)]"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          <hr className="section-rule" />

          <p className="text-[var(--text-muted)] font-body text-base leading-relaxed">
            Terminal aesthetics. Text as image. Here you can experiment with ASCII art and effects.
          </p>

          <div className="ascii-block mt-8 overflow-x-auto border border-[var(--border)] bg-[var(--code-bg)] p-4">
            <pre className="font-mono text-sm leading-tight text-[var(--accent)] whitespace-pre">
              {ASCII_BANNER}
            </pre>
          </div>

          <p className="mt-6 text-sm text-[var(--text-muted)] uppercase tracking-widest">
            Data stream
          </p>
          <div className="ascii-block mt-2 overflow-x-auto border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-xs leading-tight text-[var(--text)]">
            <GlitchLine />
          </div>
        </div>
      )}
      {!panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-[calc(var(--banner-height)+1rem)] left-6 z-[5] cursor-pointer rounded border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--border)] hover:bg-opacity-20 hover:text-[var(--text-heading)]"
        >
          Show panel
        </button>
      )}
    </div>
  )
}
