import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useTheme } from "../contexts/ThemeContext";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/** One shared star count so light/dark share the same trails. */
const STAR_COUNT = 5400;
const SPHERE_RADIUS = 120;
const TRAIL_SEGMENTS = 50;
const ROTATION_SPEED = 0.05;

const PALETTE_DARK = [
  new THREE.Color(0xfff0f4),
  new THREE.Color(0xffe0eb),
  new THREE.Color(0xffb8d0),
  new THREE.Color(0xf0a0c0),
  new THREE.Color(0xffc8e0),
  new THREE.Color(0xffffff),
];

const PALETTE_LIGHT = [
  new THREE.Color(0x2a0c18),
  new THREE.Color(0x3d1028),
  new THREE.Color(0x4a1532),
  new THREE.Color(0x5c1e40),
  new THREE.Color(0x6b2850),
  new THREE.Color(0x7a3558),
  new THREE.Color(0x5a3d68),
  new THREE.Color(0x8b3d5c),
  new THREE.Color(0x9d4a6a),
  new THREE.Color(0xb03058),
  new THREE.Color(0xc84878),
];

const POLE_AXIS = new THREE.Vector3(-0.4, 0.75, -0.55).normalize();

/** Deterministic RNG so star layout is stable across theme. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Single trail mesh: same positions for every star; per-vertex dark + light colors/alphas for theme mix.
 */
function buildDualTrailGeometry(seed: number) {
  const rng = mulberry32(seed);
  const vertsPerStar = TRAIL_SEGMENTS * 2;
  const total = STAR_COUNT * vertsPerStar;
  const pos = new Float32Array(total * 3);
  const colDark = new Float32Array(total * 3);
  const colLight = new Float32Array(total * 3);
  const alpDark = new Float32Array(total);
  const alpLight = new Float32Array(total);

  let vi = 0;

  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.acos(2 * rng() - 1);
    const phi = rng() * 2 * Math.PI;
    const origin = new THREE.Vector3(
      SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi),
      SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi),
      SPHERE_RADIUS * Math.cos(theta),
    );

    const r = rng();
    let bd: number;
    if (r < 0.55) bd = 0.06 + rng() * 0.18;
    else if (r < 0.85) bd = 0.25 + rng() * 0.35;
    else bd = 0.6 + rng() * 0.4;

    let bl: number;
    if (r < 0.38) bl = 0.52 + rng() * 0.28;
    else if (r < 0.76) bl = 0.66 + rng() * 0.26;
    else bl = 0.85 + rng() * 0.15;

    /** Same arc for both themes so the trail shape is identical. */
    const arc = ((15 + rng() * 50) * Math.PI) / 180;

    const idxDark = Math.floor(rng() * PALETTE_DARK.length);
    const idxLight = Math.floor(rng() * PALETTE_LIGHT.length);
    const cDark = PALETTE_DARK[idxDark];
    const cLight = PALETTE_LIGHT[idxLight];

    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= TRAIL_SEGMENTS; j++) {
      pts.push(
        origin.clone().applyAxisAngle(POLE_AXIS, (-arc * j) / TRAIL_SEGMENTS),
      );
    }

    for (let j = 0; j < TRAIL_SEGMENTS; j++) {
      for (let k = 0; k < 2; k++) {
        const p = pts[j + k];
        const t = (j + k) / TRAIL_SEGMENTS;
        const fade = 1 - t;
        pos[vi * 3] = p.x;
        pos[vi * 3 + 1] = p.y;
        pos[vi * 3 + 2] = p.z;

        const fadeFalloffDark = fade * fade;
        const fadeFalloffLight = fade ** 1.32;
        alpDark[vi] = Math.min(1, fadeFalloffDark * bd);
        alpLight[vi] = Math.min(1, fadeFalloffLight * bl * 2.45);

        colDark[vi * 3] = cDark.r;
        colDark[vi * 3 + 1] = cDark.g;
        colDark[vi * 3 + 2] = cDark.b;
        colLight[vi * 3] = cLight.r;
        colLight[vi * 3 + 1] = cLight.g;
        colLight[vi * 3 + 2] = cLight.b;
        vi++;
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColorDark", new THREE.BufferAttribute(colDark, 3));
  geo.setAttribute("aColorLight", new THREE.BufferAttribute(colLight, 3));
  geo.setAttribute("aAlphaDark", new THREE.BufferAttribute(alpDark, 1));
  geo.setAttribute("aAlphaLight", new THREE.BufferAttribute(alpLight, 1));
  return geo;
}

function createLightSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  const cx = 256;
  const cy = 210;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
  g.addColorStop(0, "rgb(238,230,246)");
  g.addColorStop(0.42, "rgb(228,218,236)");
  g.addColorStop(1, "rgb(208,196,222)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildSparklePoints(seed: number, count: number, radius: number) {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color(0x6b2848),
    new THREE.Color(0x8b4d6e),
    new THREE.Color(0x5a3d68),
    new THREE.Color(0x9d4a6a),
  ];
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(2 * rng() - 1);
    const phi = rng() * 2 * Math.PI;
    const r = radius * (0.88 + rng() * 0.12);
    positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(theta);
    const c = palette[i % palette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

const VERT = /* glsl */ `
  attribute vec3  aColorDark;
  attribute vec3  aColorLight;
  attribute float aAlphaDark;
  attribute float aAlphaLight;
  uniform   float uThemeMix;
  varying   float vAlpha;
  varying   vec3  vColor;
  varying   vec3  vPos;
  void main() {
    vColor = mix(aColorDark, aColorLight, uThemeMix);
    vAlpha = mix(aAlphaDark, aAlphaLight, uThemeMix);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSparkle;
  varying float vAlpha;
  varying vec3  vColor;
  varying vec3  vPos;
  void main() {
    float shimmer = sin(uTime * 1.2 + dot(vPos, vec3(0.05, 0.08, 0.04)));
    float pulse = mix(1.0, 0.96 + 0.04 * shimmer, uSparkle);
    gl_FragColor = vec4(vColor * uIntensity * pulse, vAlpha);
  }
`;

const ease = (t: number) => t * t * (3 - 2 * t);

const SCENE_BG = { dark: 0x08050a, light: 0xe8e0ee } as const;

const THEME_MIX_LERP = 10;
const SKY_TEXTURE_AT = 0.985;

interface StarryBackgroundProps {
  scrollProgressRef?: RefObject<number>;
}

export function StarryBackground({ scrollProgressRef }: StarryBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const scene = new THREE.Scene();
    const bgColorDark = new THREE.Color(SCENE_BG.dark);
    const bgColorLight = new THREE.Color(SCENE_BG.light);
    const skyTex = createLightSkyTexture();
    const startLight = themeRef.current === "light";
    scene.background = startLight ? skyTex : bgColorDark.clone();

    const camera = new THREE.PerspectiveCamera(60, w() / h(), 0.1, 500);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0.3, -1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(startLight ? SCENE_BG.light : SCENE_BG.dark, 1);
    renderer.setSize(w(), h());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w(), h()),
      1.4,
      0.7,
      0.15,
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const GEO_SEED = 0x4f3a2c1d;
    const geo = buildDualTrailGeometry(GEO_SEED);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uThemeMix: { value: startLight ? 1 : 0 },
        uIntensity: { value: startLight ? 3.45 : 1 },
        uTime: { value: 0 },
        uSparkle: { value: startLight ? 0.24 : 0.22 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trails = new THREE.LineSegments(geo, mat);
    scene.add(trails);

    const sGeo = buildSparklePoints(GEO_SEED + 1, 1700, SPHERE_RADIUS * 0.92);
    const sMat = new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: startLight ? 1 : 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const sparkles = new THREE.Points(sGeo, sMat);
    scene.add(sparkles);

    let themeMix = startLight ? 1 : 0;

    const t0 = performance.now();
    let lastFrame = t0;
    const quat = new THREE.Quaternion();
    let animId = 0;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const now = performance.now();
      const elapsed = (now - t0) * 0.001;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const s = ease(scrollProgressRef?.current ?? 0);

      const target = themeRef.current === "light" ? 1 : 0;
      const alpha = 1 - Math.exp(-dt * THEME_MIX_LERP);
      themeMix += (target - themeMix) * alpha;

      mat.uniforms.uThemeMix.value = themeMix;
      mat.uniforms.uTime.value = elapsed;
      mat.uniforms.uIntensity.value = THREE.MathUtils.lerp(1, 3.45, themeMix);
      mat.uniforms.uSparkle.value = THREE.MathUtils.lerp(0.22, 0.24, themeMix);

      const showSkyTex =
        themeRef.current === "light" && themeMix >= SKY_TEXTURE_AT;
      scene.background = showSkyTex
        ? skyTex
        : bgColorDark.clone().lerp(bgColorLight, themeMix);

      const bloomStrengthDark = THREE.MathUtils.lerp(1.4, 2.2, s);
      const bloomRadiusDark = THREE.MathUtils.lerp(0.7, 1.1, s);
      const bloomThresholdDark = THREE.MathUtils.lerp(0.15, 0.05, s);
      bloomPass.strength = THREE.MathUtils.lerp(
        bloomStrengthDark,
        0.02,
        themeMix,
      );
      bloomPass.radius = THREE.MathUtils.lerp(bloomRadiusDark, 0.35, themeMix);
      bloomPass.threshold = THREE.MathUtils.lerp(
        bloomThresholdDark,
        0.88,
        themeMix,
      );

      sMat.opacity = THREE.MathUtils.clamp((themeMix - 0.02) / 0.98, 0, 1);
      sMat.transparent = sMat.opacity < 1;

      quat.setFromAxisAngle(POLE_AXIS, elapsed * ROTATION_SPEED);
      trails.quaternion.copy(quat);
      sparkles.quaternion.copy(quat);

      renderer.setClearColor(
        showSkyTex
          ? SCENE_BG.light
          : bgColorDark.clone().lerp(bgColorLight, themeMix),
        1,
      );

      composer.render();
    };
    tick();

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
      composer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geo.dispose();
      mat.dispose();
      sGeo.dispose();
      sMat.dispose();
      skyTex.dispose();
      composer.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; theme via themeRef
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[1] min-h-0 min-w-0"
    />,
    document.body,
  );
}
