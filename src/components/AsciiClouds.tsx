import { useEffect, useRef } from "react";

const PERM = new Uint8Array(512);
{
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (i * 7919 + 1) & 255;
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : -x;
  const v = h === 0 || h === 3 ? y : -y;
  return u + v;
}

function noise2d(x: number, y: number) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

function fbm(x: number, y: number, octaves: number) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2d(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / max;
}

const CHARS = ".,·:;-=+*%#@&";

function pickChar(density: number): string {
  const i = Math.floor(density * (CHARS.length - 1));
  return CHARS[Math.min(i, CHARS.length - 1)];
}

export function AsciiClouds() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const influenceGrid = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function onMouseMove(e: MouseEvent) {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    }

    window.addEventListener("mousemove", onMouseMove);

    const FONT_SIZE = 14;
    const CHAR_W = FONT_SIZE * 0.62;
    const CHAR_H = FONT_SIZE * 1.05;

    const LAYERS = [
      { speed: 0.025, scale: 1.8, seed: 0,    threshold: 0.40, alpha: 0.55 },
      { speed: 0.05,  scale: 2.4, seed: 50,   threshold: 0.36, alpha: 0.7  },
      { speed: 0.09,  scale: 3.2, seed: 100,  threshold: 0.33, alpha: 0.85 },
      { speed: 0.15,  scale: 4.5, seed: 170,  threshold: 0.30, alpha: 1.0  },
    ];

    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let animId = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CHAR_W) + 1;
      rows = Math.ceil(h / CHAR_H) + 1;
      influenceGrid.current = new Float32Array(cols * rows);
    }

    resize();
    window.addEventListener("resize", resize);

    const PAINT_RADIUS = 6;
    const DECAY = 0.985;
    let prevMX = mouseX.current;
    let prevMY = mouseY.current;

    function draw(time: number) {
      const tSec = time * 0.001;

      const curMX = mouseX.current;
      const curMY = mouseY.current;
      const dmx = curMX - prevMX;
      const dmy = curMY - prevMY;
      const moved = dmx * dmx + dmy * dmy > 1;

      const grid = influenceGrid.current;

      if (moved) {
        const mcol = Math.round(curMX / CHAR_W);
        const mrow = Math.round(curMY / CHAR_H);
        const r = PAINT_RADIUS;
        const r2 = r * r;
        const cMin = Math.max(0, mcol - r);
        const cMax = Math.min(cols - 1, mcol + r);
        const rMin = Math.max(0, mrow - r);
        const rMax = Math.min(rows - 1, mrow + r);
        for (let rr = rMin; rr <= rMax; rr++) {
          for (let cc = cMin; cc <= cMax; cc++) {
            const dc = cc - mcol;
            const dr = rr - mrow;
            const d2 = dc * dc + dr * dr;
            if (d2 < r2) {
              const t = 1 - d2 / r2;
              const strength = t * t;
              const idx = rr * cols + cc;
              grid[idx] = Math.min(1, Math.max(grid[idx], strength));
            }
          }
        }
        prevMX = curMX;
        prevMY = curMY;
      }

      for (let i = 0, len = grid.length; i < len; i++) {
        grid[i] *= DECAY;
      }

      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `${FONT_SIZE}px monospace`;
      ctx!.textBaseline = "top";

      const cx = cols * 0.5;
      const cy = rows * 0.4;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const dx = (col - cx) / cx;
          const dy = (row - cy) / cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          let bestDensity = 0;
          let bestAlpha = 0;
          let bestLit = 0.5;

          for (let li = 0; li < LAYERS.length; li++) {
            const L = LAYERS[li];
            const radial = Math.log(dist + 0.05) * L.scale - tSec * L.speed;
            const nx = angle * 3.5 + L.seed;
            const ny = radial + L.seed * 0.1;

            const n = (fbm(nx, ny, 4) + 1) * 0.5;
            const edgeMask = 1 - Math.exp(-dist * 2.5);
            const raw = n * edgeMask;

            if (raw > L.threshold) {
              const d = (raw - L.threshold) / (1 - L.threshold);
              const shaped = d * d * (3 - 2 * d);
              if (shaped > bestDensity) {
                bestDensity = shaped;
                bestAlpha = L.alpha;
                const sn = (fbm(nx * 0.5 + 20, ny * 0.5 + 20, 2) + 1) * 0.5;
                bestLit = 0.45 + sn * 0.55;
              }
            }
          }

          const baseDensity = (fbm(angle * 2 + 7, Math.log(dist + 0.1) * 2 - tSec * 0.03 + 7, 3) + 1) * 0.5;
          let finalDensity = Math.max(baseDensity * 0.35, bestDensity);

          const inf = grid[row * cols + col];
          if (inf > 0.001) {
            finalDensity *= 1 - inf * 0.85;
          }

          const ch = pickChar(finalDensity);

          const bright = 0.5 + finalDensity * bestLit * 0.5;
          let r = Math.round(lerp(240, 255, bright));
          let g = Math.round(lerp(180, 220, bright));
          let b = Math.round(lerp(210, 245, bright));
          let alpha = bestDensity > 0.01
            ? lerp(0.5, bestAlpha, bestDensity)
            : 0.3 + baseDensity * 0.3;

          if (inf > 0.001) {
            r = Math.round(lerp(r, 160, inf * 0.5));
            g = Math.round(lerp(g, 235, inf * 0.5));
            b = Math.round(lerp(b, 255, inf * 0.5));
            alpha = Math.min(1, alpha + inf * 0.3);
          }

          ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx!.fillText(ch, col * CHAR_W, row * CHAR_H);
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
