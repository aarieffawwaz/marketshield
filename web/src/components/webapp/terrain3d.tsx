"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { volcanoHeight } from "@/lib/geo";
import type { Level } from "@/lib/data";
import { MAP_VILLAGES, type LayerKey } from "./hazard-map";

// SVG map space (800x540, crater at 300,200) -> world units
const toWorld = (x: number, y: number) => new THREE.Vector2((x - 300) / 32, (y - 200) / 26);

type Props = { level: Level; layers: Set<LayerKey>; horizon: number; selected?: string; onSelect?: (v: string) => void };

export function Terrain3D({ level, layers, horizon, selected, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ level, layers, horizon, selected });
  useEffect(() => {
    state.current = { level, layers, horizon, selected };
  }, [level, layers, horizon, selected]);
  const pickRef = useRef(onSelect);
  useEffect(() => {
    pickRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#f4eee6");
    el.appendChild(renderer.domElement);
    const labels = new CSS2DRenderer();
    labels.domElement.style.position = "absolute";
    labels.domElement.style.inset = "0";
    labels.domElement.style.pointerEvents = "none";
    el.appendChild(labels.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#f4eee6", 30, 60);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    camera.position.set(6, 15, 20);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(2, 1, 3);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 8;
    controls.maxDistance = 40;

    scene.add(new THREE.HemisphereLight("#fff8f0", "#8a6f66", 1.4));
    const sun = new THREE.DirectionalLight("#ffffff", 1.6);
    sun.position.set(-8, 14, 6);
    scene.add(sun);

    // terrain mesh, vertex-coloured by elevation
    const W = 30;
    const D = 24;
    const geo = new THREE.PlaneGeometry(W, D, 160, 128);
    geo.rotateX(-Math.PI / 2);
    geo.translate(4, 0, 4);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const c0 = new THREE.Color("#e9dccd");
    const c1 = new THREE.Color("#c9a68f");
    const c2 = new THREE.Color("#6b4a42");
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = volcanoHeight(x, z) * 0.9;
      pos.setY(i, h);
      const t = Math.min(1, h / 4.4);
      if (t < 0.5) tmp.copy(c0).lerp(c1, t * 2);
      else tmp.copy(c1).lerp(c2, (t - 0.5) * 2);
      cols.push(tmp.r, tmp.g, tmp.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: false })));
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: "#7b1e26", transparent: true, opacity: 0.05 }));
    scene.add(wire);
    const hAt = (x: number, z: number) => volcanoHeight(x, z) * 0.9;

    // draped KRB rings
    const krb = new THREE.Group();
    [
      [2.4, "#b51a14"],
      [4.6, "#ea6a1f"],
      [7, "#e0a100"],
    ].forEach(([r, c]) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 160; k++) {
        const a = (k / 160) * Math.PI * 2;
        const se = 1 + 0.35 * Math.max(0, Math.cos(a - 0.7));
        const x = Math.cos(a) * (r as number) * se;
        const z = Math.sin(a) * (r as number) * se * 0.85;
        pts.push(new THREE.Vector3(x, hAt(x, z) + 0.05, z));
      }
      krb.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: c as string, linewidth: 2 })));
    });
    scene.add(krb);

    // lahar channel (Besuk Kobokan) as a draped tube
    const laharPts = [toWorld(300, 200), toWorld(340, 250), toWorld(380, 300), toWorld(430, 340), toWorld(480, 390), toWorld(520, 420)].map((v) => new THREE.Vector3(v.x, hAt(v.x, v.y) + 0.08, v.y));
    const lahar = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(laharPts), 80, 0.12, 8), new THREE.MeshStandardMaterial({ color: "#7a3b16", emissive: "#5a2a10", emissiveIntensity: 0.4 }));
    scene.add(lahar);

    // evacuation route
    const routePts = [toWorld(470, 320), toWorld(510, 302), toWorld(560, 300), toWorld(600, 320)].map((v) => new THREE.Vector3(v.x, hAt(v.x, v.y) + 0.12, v.y));
    const route = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(routePts), 40, 0.07, 6), new THREE.MeshStandardMaterial({ color: "#2e7d32", emissive: "#2e7d32", emissiveIntensity: 0.5 }));
    scene.add(route);

    // villages: pins + labels
    const pins: THREE.Mesh[] = [];
    const labelEls: Record<string, HTMLDivElement> = {};
    MAP_VILLAGES.forEach((v) => {
      const w = toWorld(v.x, v.y);
      const y = hAt(w.x, w.y);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), new THREE.MeshStandardMaterial({ color: "#7b1e26" }));
      pin.position.set(w.x, y + 0.45, w.y);
      pin.userData.name = v.name;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#7b1e26", emissiveIntensity: 0.2 }));
      head.position.y = 0.5;
      head.userData.name = v.name;
      pin.add(head);
      scene.add(pin);
      pins.push(pin, head);
      const div = document.createElement("div");
      div.textContent = v.name;
      div.style.cssText = "font:500 11px var(--font-geist),sans-serif;color:#350915;background:rgba(255,255,255,.85);padding:2px 7px;border-radius:999px;transform:translateY(-18px);white-space:nowrap;box-shadow:0 2px 8px rgba(53,9,21,.12)";
      labelEls[v.name] = div;
      const lbl = new CSS2DObject(div);
      lbl.position.set(0, 0.75, 0);
      pin.add(lbl);
    });
    const craterLbl = document.createElement("div");
    craterLbl.textContent = "Semeru · 3.676 m";
    craterLbl.style.cssText = "font:600 12px var(--font-poppins),sans-serif;color:#fff;background:#350915;padding:3px 9px;border-radius:999px;transform:translateY(-14px)";
    const cl = new CSS2DObject(craterLbl);
    cl.position.set(0, hAt(0, 0) + 0.9, 0);
    scene.add(cl);

    // ash plume particles (direction from GFS wind, toward the southwest)
    const P = 1400;
    const plumePos = new Float32Array(P * 3);
    const seeds = Array.from({ length: P }, () => [Math.random(), Math.random() * Math.PI * 2, Math.sqrt(Math.random())]);
    const plumeGeo = new THREE.BufferGeometry();
    plumeGeo.setAttribute("position", new THREE.BufferAttribute(plumePos, 3));
    const plumeMat = new THREE.PointsMaterial({ color: "#5d4f4a", size: 0.12, transparent: true, opacity: 0.45, depthWrite: false });
    scene.add(new THREE.Points(plumeGeo, plumeMat));

    // hotspots
    const hot = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      const r = 0.3 + (i % 4) * 0.22;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: "#ff5a1f" }));
      m.position.set(Math.cos(a) * r, hAt(Math.cos(a) * r, Math.sin(a) * r) + 0.1, Math.sin(a) * r);
      hot.add(m);
    }
    scene.add(hot);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      labels.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const onUp = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(pins)[0];
      if (hit) pickRef.current?.(hit.object.userData.name);
    };
    renderer.domElement.addEventListener("pointerup", onUp);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const { level: lv, layers: ly, horizon: hz, selected: sel } = state.current;
      krb.visible = ly.has("krb");
      lahar.visible = ly.has("lahar") && lv >= 2;
      lahar.scale.setScalar(1);
      route.visible = ly.has("route");
      hot.visible = ly.has("hot");
      hot.children.forEach((m, i) => (m.visible = i < [0, 2, 4, 7, 10][lv]));
      const ashOn = ly.has("ash") && lv > 1;
      plumeMat.opacity = ashOn ? 0.45 : 0;
      const reach = ([0, 4, 6.5, 9, 11.5][lv] * (1 + hz / 72)) as number;
      const cy = hAt(0, 0);
      for (let p = 0; p < P; p++) {
        const [s, ang0, rr0] = seeds[p];
        const life = (t * 0.05 + s) % 1;
        const along = life * reach;
        const spread = 0.2 + life * reach * 0.28;
        const ang = ang0 + life * 1.3;
        const rr = spread * rr0;
        // wind toward 240°: -x, +z in this frame
        plumePos[p * 3] = -along * 0.8 + Math.cos(ang) * rr;
        plumePos[p * 3 + 1] = cy + 0.4 + Math.min(4, life * 9) - life * life * 2 + Math.sin(ang * 2) * rr * 0.2;
        plumePos[p * 3 + 2] = along * 0.55 + Math.sin(ang) * rr;
      }
      plumeGeo.attributes.position.needsUpdate = true;
      Object.entries(labelEls).forEach(([n, d]) => {
        d.style.background = n === sel ? "#7b1e26" : "rgba(255,255,255,.85)";
        d.style.color = n === sel ? "#fff" : "#350915";
      });
      controls.update();
      renderer.render(scene, camera);
      labels.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      renderer.dispose();
      el.removeChild(renderer.domElement);
      el.removeChild(labels.domElement);
    };
  }, []);

  return <div ref={host} className="relative h-full w-full overflow-hidden" />;
}
