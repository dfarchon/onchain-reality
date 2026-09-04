type OrbitMarkProps = {
  className?: string;
  title?: string;
};

const GRID = [
  ".......s........",
  ".......o........",
  ".......o........",
  ".......o........",
  ".......o........",
  "......PPPP......",
  "...oooPccPooo...",
  "..o...PccP...o..",
  ".o....PPPP....o.",
  ".o............o.",
  "..oo........oo..",
  "....oooooooo....",
  ".......o........",
  ".......o........",
  ".......s........",
  "................",
] as const;

const colors = {
  o: "currentColor",
  s: "currentColor",
  P: "var(--mark-world, #ffb7c5)",
  c: "var(--mark-knockout, #000000)",
} as const;

/** Canonical Onchain Reality 16×16 orbit lock from the DFArchon brand system. */
export function OrbitMark({ className, title }: OrbitMarkProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`orbit-mark ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      shapeRendering="crispEdges"
    >
      {GRID.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={colors[cell as keyof typeof colors]}
            />
          ),
        ),
      )}
    </svg>
  );
}
