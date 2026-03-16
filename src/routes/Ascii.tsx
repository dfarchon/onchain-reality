import { useState, useEffect } from 'react'

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

export function Ascii() {
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {panelOpen && (
        <div className="retro-box ascii-panel">
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
        <div className="retro-box py-12 text-center">
          <p className="text-[var(--text-muted)] font-body mb-4">ASCII panel closed.</p>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="cursor-pointer rounded border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--border)] hover:bg-opacity-20 hover:text-[var(--text-heading)]"
          >
            Show panel
          </button>
        </div>
      )}
    </div>
  )
}
