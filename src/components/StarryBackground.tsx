import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const STAR_COUNT = 3000;
const SPHERE_RADIUS = 120;
const TRAIL_SEGMENTS = 50;
const ROTATION_SPEED = 0.05;

const PALETTE = [
  new THREE.Color(0xfff0f4),
  new THREE.Color(0xffe0eb),
  new THREE.Color(0xffb8d0),
  new THREE.Color(0xf0a0c0),
  new THREE.Color(0xffc8e0),
  new THREE.Color(0xffffff),
];

const POLE_AXIS = new THREE.Vector3(-0.4, 0.75, -0.55).normalize();

function buildTrailGeometry() {
  const vertsPerStar = TRAIL_SEGMENTS * 2;
  const total = STAR_COUNT * vertsPerStar;
  const pos = new Float32Array(total * 3);
  const alp = new Float32Array(total);
  const col = new Float32Array(total * 3);

  let vi = 0;

  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * 2 * Math.PI;
    const origin = new THREE.Vector3(
      SPHERE_RADIUS * Math.sin(theta) * Math.cos(phi),
      SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi),
      SPHERE_RADIUS * Math.cos(theta),
    );

    const r = Math.random();
    const brightness =
      r < 0.55
        ? 0.06 + Math.random() * 0.18
        : r < 0.85
          ? 0.25 + Math.random() * 0.35
          : 0.6 + Math.random() * 0.4;

    const arc = ((15 + Math.random() * 45) * Math.PI) / 180;
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];

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
        alp[vi] = fade * fade * brightness;
        col[vi * 3] = c.r;
        col[vi * 3 + 1] = c.g;
        col[vi * 3 + 2] = c.b;
        vi++;
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alp, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  return geo;
}

const VERT = /* glsl */ `
  attribute float aAlpha;
  attribute vec3  aColor;
  varying   float vAlpha;
  varying   vec3  vColor;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

const ease = (t: number) => t * t * (3 - 2 * t);

interface StarryBackgroundProps {
  scrollProgressRef?: RefObject<number>;
}

export function StarryBackground({ scrollProgressRef }: StarryBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08050a);

    const camera = new THREE.PerspectiveCamera(60, w() / h(), 0.1, 500);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0.3, -1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
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

    const geo = buildTrailGeometry();
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trails = new THREE.LineSegments(geo, mat);
    scene.add(trails);

    const t0 = performance.now();
    const quat = new THREE.Quaternion();
    let animId = 0;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const elapsed = (performance.now() - t0) * 0.001;
      const s = ease(scrollProgressRef?.current ?? 0);

      quat.setFromAxisAngle(POLE_AXIS, elapsed * ROTATION_SPEED);
      trails.quaternion.copy(quat);

      // Scroll-driven bloom: more dreamy and hazy as you scroll down
      bloomPass.strength = THREE.MathUtils.lerp(1.4, 2.2, s);
      bloomPass.radius = THREE.MathUtils.lerp(0.7, 1.1, s);
      bloomPass.threshold = THREE.MathUtils.lerp(0.15, 0.05, s);

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
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1] pointer-events-none"
    />
  );
}
