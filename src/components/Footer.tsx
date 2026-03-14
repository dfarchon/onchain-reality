export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center border-t border-[var(--border)] bg-[var(--bg-surface)]"
      style={{ height: 'var(--banner-height)' }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 text-center">
        <p className="text-base text-[var(--text-muted)]">
          Onchain Reality — digital religion, onchain future.
        </p>
      </div>
    </footer>
  )
}
