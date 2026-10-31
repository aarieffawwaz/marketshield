"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { volcanoHeight as height } from "@/lib/geo";

export function Terrain({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d0507, 16, 34);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 7.5, 19);
    camera.lookAt(0, 2.2, 0);

    const world = new THREE.Group();
    scene.add(world);

    // Contour-style terrain: rows of polylines coloured by height
    const N = 120;
    const S = 26;
    const low = new THREE.Color("#3a0d14");
    const mid = new THREE.Color("#7b1e26");
    const hi = new THREE.Color("#ea6a1f");
    const rows: number[] = [];
    const cols: number[] = [];
    const tmp = new THREE.Color();
    for (let j = 0; j <= N; j += 2) {
      const z = (j / N - 0.5) * S;
      for (let i = 0; i < N; i++) {
        const x0 = (i / N - 0.5) * S;
        const x1 = ((i + 1) / N - 0.5) * S;
        const h0 = height(x0, z);
        const h1 = height(x1, z);
        rows.push(x0, h0, z, x1, h1, z);
        for (const h of [h0, h1]) {
          const t = Math.min(1, h / 4.6);
          if (t < 0.5) tmp.copy(low).lerp(mid, t * 2);
          else tmp.copy(mid).lerp(hi, (t - 0.5) * 2);
          cols.push(tmp.r, tmp.g, tmp.b);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(rows, 3));
    lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
    world.add(lines);

    // Hazard rings (KRB) on the ground
    const ringMat = (c: string, o: number) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
    [
      [2.6, "#b51a14", 0.75],
      [4.6, "#ea6a1f", 0.5],
      [7, "#e0a100", 0.35],
    ].forEach(([r, c, o]) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 160; k++) {
        const a = (k / 160) * Math.PI * 2;
        const x = Math.cos(a) * (r as number);
        const z = Math.sin(a) * (r as number);
        pts.push(new THREE.Vector3(x, height(x, z) + 0.06, z));
      }
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat(c as string, o as number)));
    });

    // Ash plume particles drifting southwest
    const P = 900;
    const plumePos = new Float32Array(P * 3);
    const seeds = new Float32Array(P);
    const angles = new Float32Array(P);
    const radii = new Float32Array(P);
    for (let p = 0; p < P; p++) {
      seeds[p] = Math.random();
      angles[p] = Math.random() * Math.PI * 2;
      radii[p] = Math.sqrt(Math.random());
    }
    const plumeGeo = new THREE.BufferGeometry();
    plumeGeo.setAttribute("position", new THREE.BufferAttribute(plumePos, 3));
    const plume = new THREE.Points(
      plumeGeo,
      new THREE.PointsMaterial({ color: "#c9b3ab", size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    world.add(plume);

    // Satellite on an inclined orbit with a scan beam
    const orbit = new THREE.Group();
    orbit.rotation.set(0.5, 0, 0.25);
    scene.add(orbit);
    const orbitPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 200; k++) {
      const a = (k / 200) * Math.PI * 2;
      orbitPts.push(new THREE.Vector3(Math.cos(a) * 11, 9, Math.sin(a) * 11));
    }
    orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineDashedMaterial({ color: "#7fb2e5", dashSize: 0.25, gapSize: 0.25, transparent: true, opacity: 0.35 })));
    (orbit.children[0] as THREE.Line).computeLineDistances();
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: "#cfe4ff" }));
    orbit.add(sat);
    const beamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const beam = new THREE.Line(beamGeo, new THREE.LineBasicMaterial({ color: "#7fb2e5", transparent: true, opacity: 0.4 }));
    scene.add(beam);
    const crater = new THREE.Vector3(0, height(0, 0) + 0.3, 0);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.position.z = w < 700 ? 24 : 19;
      world.position.x = w >= 1024 ? 5.5 : 0;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let mx = 0;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let scroll = 0;
    const onScroll = () => (scroll = Math.min(1, window.scrollY / Math.max(1, el.clientHeight)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ringMats: THREE.LineBasicMaterial[] = [];
    world.children.forEach((c) => {
      if (c instanceof THREE.Line && !(c instanceof THREE.LineSegments)) ringMats.push(c.material as THREE.LineBasicMaterial);
    });
    let eased = 0;

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    const satWorld = new THREE.Vector3();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = reduce ? 4 : clock.getElapsedTime();
      eased += (scroll - eased) * 0.08;
      world.rotation.y = t * 0.04 + mx * 0.12 + eased * 0.6;
      camera.position.y = 7.5 - my * 0.8 + eased * 9;
      camera.lookAt(0, 2.2 - eased * 1.5, 0);
      ringMats.forEach((m, i) => (m.opacity = [0.75, 0.5, 0.35][i % 3] + eased * 0.25 + 0.1 * Math.sin(t * 2 + i)));

      for (let p = 0; p < P; p++) {
        const s = seeds[p];
        const life = (t * 0.06 + s) % 1;
        const rise = life * 6;
        const drift = life * life * 7;
        const spread = 0.25 + life * 1.6;
        const ang = angles[p] + life * 1.5;
        const rr = spread * radii[p];
        plumePos[p * 3] = -drift * 0.75 + Math.cos(ang) * rr;
        plumePos[p * 3 + 1] = crater.y + rise + Math.sin(ang * 2) * rr * 0.25;
        plumePos[p * 3 + 2] = drift * 0.6 + Math.sin(ang) * rr;
      }
      plumeGeo.attributes.position.needsUpdate = true;

      const a = t * 0.25;
      sat.position.set(Math.cos(a) * 11, 9, Math.sin(a) * 11);
      sat.getWorldPosition(satWorld);
      const craterWorld = crater.clone().applyMatrix4(world.matrixWorld);
      beamGeo.setFromPoints([satWorld, craterWorld]);
      (beam.material as THREE.LineBasicMaterial).opacity = 0.15 + 0.35 * Math.max(0, Math.sin(a * 2));

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className={className} aria-hidden />;
}
