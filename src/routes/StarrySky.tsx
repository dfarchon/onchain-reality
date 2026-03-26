import { StarryBackground } from "../components/StarryBackground";

export function StarrySky() {
  return (
    <>
      <StarryBackground />
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <h1 className="sr-only">Starry Sky</h1>
      </div>
      <div className="min-h-[100dvh]" aria-hidden />
    </>
  );
}
