export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center bg-transparent"
      style={{ height: "var(--banner-height)" }}
    >
      <div className="mx-auto w-full max-w-3xl px-6 text-center">
        <p className="text-base text-[var(--text-muted)]">
          Onchain Reality — Building New Realities on the Blockchain
        </p>
      </div>
    </footer>
  );
}
