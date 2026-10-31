// three.js particle eruption drawn inside MapLibre as a custom layer:
// a billowing ash column bent by the wind, an incandescent vent with ejecta,
// and a pyroclastic density current rolling down the channel over real terrain.

import * as THREE from "three";
import type { CustomLayerInterface, Map as MLMap } from "maplibre-gl";

export type EruptionState = {
  active: boolean;
  origin: [number, number];
  colKm: number; // current column height
  pdcKm: number; // current flow length along the channel
  wind: number; // degrees, direction the plume travels toward
  channel: [number, number][];
};

type MercatorApi = { fromLngLat: (ll: [number, number], alt?: number) => { x: number; y: number; z: number; meterInMercatorCoordinateUnits: () => number } };

function puffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 38; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.pow(rnd(), 0.7) * 34;
    const r = 14 + rnd() * 26;
    const x = 64 + Math.cos(a) * d;
    const y = 64 + Math.sin(a) * d;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, "rgba(255,255,255,0.22)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.65)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const vert = /* glsl */ `
  attribute float size;
  attribute float alpha;
  attribute float rot;
  attribute vec3 tint;
  uniform vec2 uViewport;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vTint;
  void main() {
    vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 e = projectionMatrix * modelViewMatrix * vec4(position + vec3(size, 0.0, 0.0), 1.0);
    vec4 u = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, size, 0.0), 1.0);
    vec2 pc = c.xy / c.w;
    float pe = length((e.xy / e.w - pc) * uViewport * 0.5);
    float pu = length((u.xy / u.w - pc) * uViewport * 0.5);
    gl_PointSize = clamp(max(pe, pu), 1.0, 900.0);
    gl_Position = c;
    vAlpha = alpha;
    vRot = rot;
    vTint = tint;
  }
`;
const frag = /* glsl */ `
  uniform sampler2D uTex;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vTint;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float s = sin(vRot), co = cos(vRot);
    p = vec2(co * p.x - s * p.y, s * p.x + co * p.y) + 0.5;
    vec4 t = texture2D(uTex, p);
    gl_FragColor = vec4(vTint, t.a * vAlpha);
  }
`;

class Cloud {
  geo = new THREE.BufferGeometry();
  pos: Float32Array;
  size: Float32Array;
  alpha: Float32Array;
  rot: Float32Array;
  tint: Float32Array;
  points: THREE.Points;
  constructor(public n: number, tex: THREE.Texture, additive: boolean, viewport: THREE.Vector2) {
    this.pos = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    this.alpha = new Float32Array(n);
    this.rot = new Float32Array(n);
    this.tint = new Float32Array(n * 3);
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute("size", new THREE.BufferAttribute(this.size, 1));
    this.geo.setAttribute("alpha", new THREE.BufferAttribute(this.alpha, 1));
    this.geo.setAttribute("rot", new THREE.BufferAttribute(this.rot, 1));
    this.geo.setAttribute("tint", new THREE.BufferAttribute(this.tint, 3));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tex }, uViewport: { value: viewport } },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
  }
  flush() {
    for (const k of ["position", "size", "alpha", "rot", "tint"]) (this.geo.getAttribute(k) as THREE.BufferAttribute).needsUpdate = true;
  }
}

const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createEruptionLayer(map: MLMap, Mercator: MercatorApi, getState: () => EruptionState): CustomLayerInterface {
  let renderer: THREE.WebGLRenderer;
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const viewport = new THREE.Vector2(1, 1);
  let smoke: Cloud, pdc: Cloud, fire: Cloud, glow: Cloud;
  const start = performance.now();
  // channel geometry in local metres (x east, y up, z south), refreshed when the origin changes
  let key = "";
  let path: { x: number; y: number; z: number; d: number }[] = [];
  let ventAlt = 0;

  const local = (ll: [number, number], origin: { x: number; y: number }, scale: number) => {
    const m = Mercator.fromLngLat(ll, 0);
    return { x: (m.x - origin.x) / scale, z: (m.y - origin.y) / scale };
  };

  return {
    id: "eruption-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(_map, gl) {
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
      renderer.autoClear = false;
      const puff = puffTexture();
      const dot = glowTexture();
      smoke = new Cloud(900, puff, false, viewport);
      pdc = new Cloud(520, puff, false, viewport);
      fire = new Cloud(220, dot, true, viewport);
      glow = new Cloud(3, dot, true, viewport);
      scene.add(pdc.points, smoke.points, glow.points, fire.points);
    },
    render(_gl, args) {
      const st = getState();
      if (!st.active) return;
      const now = (performance.now() - start) / 1000;
      const canvas = map.getCanvas();
      viewport.set(canvas.width, canvas.height);

      // terrain heights arrive asynchronously, so re-sample the channel every few seconds
      const k = `${st.origin.join(",")}|${Math.floor(now / 3)}`;
      if (k !== key) {
        key = k;
        ventAlt = map.queryTerrainElevation(st.origin) ?? 0;
        const o = Mercator.fromLngLat(st.origin, 0);
        const sc = o.meterInMercatorCoordinateUnits();
        const pts: typeof path = [];
        let d = 0;
        st.channel.forEach((ll, i) => {
          const p = local(ll, o, sc);
          if (i > 0) d += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z);
          pts.push({ x: p.x, y: (map.queryTerrainElevation(ll) ?? ventAlt) - ventAlt, z: p.z, d });
        });
        path = pts;
      }

      const origin = Mercator.fromLngLat(st.origin, ventAlt);
      const s = origin.meterInMercatorCoordinateUnits();
      const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix as unknown as number[]);
      const l = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .scale(new THREE.Vector3(s, -s, s))
        .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      camera.projectionMatrix = m.multiply(l);

      const wb = (st.wind * Math.PI) / 180;
      const wx = Math.sin(wb);
      const wz = -Math.cos(wb);
      const H = st.colKm * 1000;
      const on = H > 30 ? 1 : 0;

      // --- ash column
      for (let i = 0; i < smoke.n; i++) {
        const life = 20 + hash(i) * 14;
        const a = ((now + hash(i + 3) * life) % life) / life;
        const h = H * Math.pow(a, 0.72);
        const drift = Math.pow(a, 1.9) * H * 1.15;
        const umb = smooth(0.62, 1, a);
        const ang = hash(i + 7) * Math.PI * 2 + a * 2.2;
        const rr = (90 + a * H * 0.16 + umb * H * 0.5 * hash(i + 11)) * Math.sqrt(hash(i + 13));
        smoke.pos[i * 3] = wx * drift + Math.cos(ang) * rr - wz * umb * H * 0.25 * (hash(i + 5) - 0.5);
        smoke.pos[i * 3 + 1] = h - umb * H * 0.08 * hash(i + 17);
        smoke.pos[i * 3 + 2] = wz * drift + Math.sin(ang) * rr + wx * umb * H * 0.25 * (hash(i + 5) - 0.5);
        smoke.size[i] = (320 + a * H * 0.5 + umb * H * 0.25) * (0.75 + hash(i + 19) * 0.5);
        smoke.alpha[i] = on * smooth(0, 0.05, a) * (1 - smooth(0.75, 1, a)) * 0.82;
        smoke.rot[i] = hash(i + 23) * 6.28 + now * 0.08 * (hash(i) - 0.5);
        const lt = Math.pow(a, 0.55);
        const warm = Math.pow(1 - a, 8) * 0.55;
        smoke.tint[i * 3] = 0.16 + lt * 0.5 + warm;
        smoke.tint[i * 3 + 1] = 0.15 + lt * 0.47 + warm * 0.35;
        smoke.tint[i * 3 + 2] = 0.15 + lt * 0.45;
      }
      smoke.flush();

      // --- incandescent vent glow + ballistic ejecta
      const pulse = 0.8 + 0.2 * Math.sin(now * 6);
      [[0, 60, 1400, 0.85], [0, 220, 2400, 0.35], [0, 30, 700, 1]].forEach(([x, y, sz, al], j) => {
        glow.pos[j * 3] = x;
        glow.pos[j * 3 + 1] = y;
        glow.pos[j * 3 + 2] = 0;
        glow.size[j] = sz * 1.4 * (0.5 + 0.5 * Math.min(1, H / 3000));
        glow.alpha[j] = on * al * pulse;
        glow.tint[j * 3] = 1;
        glow.tint[j * 3 + 1] = j === 2 ? 0.75 : 0.38;
        glow.tint[j * 3 + 2] = j === 2 ? 0.3 : 0.08;
      });
      glow.flush();
      for (let i = 0; i < fire.n; i++) {
        const T = 2.2 + hash(i + 31) * 1.6;
        const t = (now + hash(i + 37) * T) % T;
        const vy = 160 + hash(i + 41) * 260;
        const vh = 30 + hash(i + 43) * 110;
        const ang = hash(i + 47) * Math.PI * 2;
        const g = 140;
        const y = vy * t - 0.5 * g * t * t;
        fire.pos[i * 3] = Math.cos(ang) * vh * t;
        fire.pos[i * 3 + 1] = Math.max(0, y);
        fire.pos[i * 3 + 2] = Math.sin(ang) * vh * t;
        const f = t / T;
        fire.size[i] = 90 + hash(i + 53) * 120;
        fire.alpha[i] = on * (y > 0 ? 1 : 0) * (1 - f) * 0.95;
        fire.tint[i * 3] = 1;
        fire.tint[i * 3 + 1] = 0.85 - f * 0.6;
        fire.tint[i * 3 + 2] = 0.35 - f * 0.3;
      }
      fire.flush();

      // --- pyroclastic density current hugging the channel
      const L = st.pdcKm * 1000;
      const total = path.length ? path[path.length - 1].d : 0;
      for (let i = 0; i < pdc.n; i++) {
        const life = 6 + hash(i + 61) * 5;
        const a = ((now + hash(i + 67) * life) % life) / life;
        const dist = Math.min(L, total) * Math.pow(a, 0.8);
        let seg = 1;
        while (seg < path.length - 1 && path[seg].d < dist) seg++;
        const p0 = path[seg - 1] ?? { x: 0, y: 0, z: 0, d: 0 };
        const p1 = path[seg] ?? p0;
        const f = p1.d > p0.d ? (dist - p0.d) / (p1.d - p0.d) : 0;
        const nx = -(p1.z - p0.z);
        const nz = p1.x - p0.x;
        const nl = Math.hypot(nx, nz) || 1;
        const spread = (120 + (dist / 1000) * 110) * (hash(i + 71) - 0.5) * 2;
        const rise = 40 + hash(i + 73) * (120 + (dist / 1000) * 60) + Math.sin(now * 2 + i) * 20;
        pdc.pos[i * 3] = p0.x + (p1.x - p0.x) * f + (nx / nl) * spread;
        pdc.pos[i * 3 + 1] = p0.y + (p1.y - p0.y) * f + rise;
        pdc.pos[i * 3 + 2] = p0.z + (p1.z - p0.z) * f + (nz / nl) * spread;
        pdc.size[i] = (240 + (dist / 1000) * 70) * (0.7 + hash(i + 79) * 0.6);
        pdc.alpha[i] = (L > 50 ? 1 : 0) * smooth(0, 0.1, a) * (1 - smooth(0.85, 1, a)) * 0.7;
        pdc.rot[i] = hash(i + 83) * 6.28 + now * 0.2;
        const hot = Math.pow(1 - a, 3) * 0.35;
        pdc.tint[i * 3] = 0.42 + hot;
        pdc.tint[i * 3 + 1] = 0.33 + hot * 0.4;
        pdc.tint[i * 3 + 2] = 0.27;
      }
      pdc.flush();

      renderer.resetState();
      renderer.render(scene, camera);
      map.triggerRepaint();
    },
    onRemove() {
      scene.traverse((o) => {
        const p = o as THREE.Points;
        p.geometry?.dispose();
        const mt = p.material as THREE.ShaderMaterial | undefined;
        (mt?.uniforms?.uTex?.value as THREE.Texture | undefined)?.dispose();
        mt?.dispose();
      });
    },
  };
}
