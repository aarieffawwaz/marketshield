"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { useInView } from "@/lib/use-in-view";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { rupiah, type Bi } from "@/lib/data";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type KitItem = { file: string; size: number; name: Bi; note: Bi; het: number; market: number };

// 3D models: NVIDIA SimReady Assets (CC BY 4.0), converted from USD to glTF
const KIT: KitItem[] = [
  { file: "respirator", size: 1.25, name: { id: "Respirator / N95", en: "Respirator / N95" }, note: { id: "Wajib saat hujan abu", en: "Essential during ashfall" }, het: 12000, market: 27500 },
  { file: "facemask", size: 1.3, name: { id: "Masker bedah (50)", en: "Surgical masks (50)" }, note: { id: "Untuk anggota keluarga lain", en: "For the rest of the family" }, het: 35000, market: 41000 },
  { file: "water", size: 1.45, name: { id: "Air minum", en: "Drinking water" }, note: { id: "3 liter per orang per hari", en: "3 litres per person per day" }, het: 4000, market: 5500 },
  { file: "first-aid", size: 1.3, name: { id: "Kotak P3K", en: "First-aid box" }, note: { id: "Obat tetes mata & perban", en: "Eye drops & bandages" }, het: 85000, market: 92000 },
  { file: "water-cooler", size: 1.9, name: { id: "Air galon 19 L", en: "19 L water" }, note: { id: "Cadangan untuk posko", en: "Reserve for aid posts" }, het: 20000, market: 21000 },
];

function KitCanvas({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 3.0, 9.6);
    camera.lookAt(0, 0.9, 0);

    const key = new THREE.DirectionalLight("#ffe7d6", 2.2);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#ea6a1f", 1.6);
    rim.position.set(-5, 3, -4);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight("#fff4ec", "#3a0d14", 0.6));

    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.18 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // pedestals on an arc
    const n = KIT.length;
    const slots = KIT.map((_, i) => {
      const x = ((i - (n - 1) / 2) / ((n - 1) / 2)) * 3.3;
      return new THREE.Vector3(x, 0, 1.1 - (x / 3.3) ** 2 * 0.9);
    });
    const pedestals = slots.map((p) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.18, 48), new THREE.MeshStandardMaterial({ color: "#f3ede8", roughness: 0.6 }));
      m.position.copy(p).setY(0.09);
      m.receiveShadow = true;
      scene.add(m);
      return m;
    });

    const holders: THREE.Group[] = [];
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    let disposed = false;
    KIT.forEach((item, i) => {
      const holder = new THREE.Group();
      holder.position.copy(slots[i]).setY(0.18);
      holder.userData.index = i;
      scene.add(holder);
      holders.push(holder);
      loader.load(`/models/${item.file}.glb`, (gltf) => {
        if (disposed) return;
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const s = item.size / Math.max(size.x, size.y, size.z);
        obj.scale.setScalar(s);
        const b2 = new THREE.Box3().setFromObject(obj);
        const c = b2.getCenter(new THREE.Vector3());
        obj.position.set(-c.x, -b2.min.y, -c.z);
        obj.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.userData.index = i;
            const mat = m.material as THREE.MeshStandardMaterial;
            if (mat && !mat.map && mat.color && mat.color.getHex() === 0xcccccc) mat.color.set("#d9d4cf");
          }
        });
        holder.add(obj);
      });
    });

    // aid pallet with boxes in the back
    loader.load("/models/pallet.glb", (g) => {
      if (disposed) return;
      const pallet = g.scene;
      const b = new THREE.Box3().setFromObject(pallet);
      const sz = b.getSize(new THREE.Vector3());
      pallet.scale.setScalar(2.6 / Math.max(sz.x, sz.z));
      pallet.position.set(0, 0, -1.8);
      pallet.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).receiveShadow = true) : null));
      scene.add(pallet);
      const top = new THREE.Box3().setFromObject(pallet).max.y;
      loader.load("/models/aid-box.glb", (bg) => {
        if (disposed) return;
        const proto = bg.scene;
        const bb = new THREE.Box3().setFromObject(proto).getSize(new THREE.Vector3());
        const s = 0.75 / Math.max(bb.x, bb.z);
        const stacks = [
          [-0.5, 0, -0.35],
          [0.4, 0, -0.35],
          [-0.5, 0, 0.35],
          [0.4, 0, 0.35],
          [-0.05, 1, 0],
        ];
        stacks.forEach(([x, layer, z], k) => {
          const c = proto.clone();
          c.scale.setScalar(s);
          c.position.set(x, top + layer * bb.y * s, -1.8 + z);
          c.rotation.y = (k % 2) * 0.12 - 0.06;
          c.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null));
          scene.add(c);
        });
      });
    });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 15 : 10.5;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let hover = -1;
    const pickAt = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects([...holders, ...pedestals], true)[0];
      if (!hit) return -1;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.index === undefined) o = o.parent;
      if (o) return o.userData.index as number;
      return pedestals.indexOf(hit.object as (typeof pedestals)[number]);
    };
    const onMove = (e: PointerEvent) => {
      hover = pickAt(e);
      renderer.domElement.style.cursor = hover >= 0 ? "pointer" : "default";
    };
    const onClick = (e: PointerEvent) => {
      const i = pickAt(e);
      if (i >= 0) onPick(i);
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onClick);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const clock = new THREE.Clock();
    const look = new THREE.Vector3(0, 0.9, 0);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      holders.forEach((h, i) => {
        const on = i === activeRef.current;
        const lift = on ? 0.38 + Math.sin(t * 2) * 0.05 : i === hover ? 0.24 : 0.18;
        h.position.y += (lift - h.position.y) * Math.min(1, dt * 6);
        h.rotation.y += dt * (on ? 0.9 : 0.15);
        const s = on ? 1.12 : 1;
        h.scale.setScalar(h.scale.x + (s - h.scale.x) * Math.min(1, dt * 6));
      });
      pedestals.forEach((p, i) => {
        const mat = p.material as THREE.MeshStandardMaterial;
        mat.color.lerp(new THREE.Color(i === activeRef.current ? "#ea6a1f" : "#f3ede8"), Math.min(1, dt * 5));
      });
      const target = slots[activeRef.current];
      look.lerp(new THREE.Vector3(target.x * 0.3, 0.9, 0), Math.min(1, dt * 3));
      camera.position.x += (target.x * 0.25 - camera.position.x) * Math.min(1, dt * 2);
      camera.lookAt(look);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onClick);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => {
          (x as THREE.MeshStandardMaterial).map?.dispose();
          x.dispose();
        });
      });
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [onPick]);

  return <div ref={host} className="absolute inset-0" />;
}

export function KitSection() {
  const { t, tx } = useT();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const iv = window.setInterval(() => setActive((a) => (a + 1) % KIT.length), 3600);
    return () => window.clearInterval(iv);
  }, [auto]);
  const [stageRef, stageSeen] = useInView<HTMLDivElement>();
  const item = KIT[active];
  const dev = (item.market - item.het) / item.het;
  const pick = useCallback((i: number) => {
    setAuto(false);
    setActive(i);
  }, []);

  return (
    <section id="kit" className="relative overflow-hidden bg-sand py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="label flex items-center gap-3 text-maroon/70"><span className="text-crimson">05</span><span className="h-px w-8 bg-maroon/25" />Kit Siaga</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
              {t("Belanja lebih awal, di harga wajar.", "Buy early, at a fair price.")}
            </h2>
            <p className="max-w-lg text-[15.5px] leading-relaxed text-muted">
              {t("Saat status Waspada, warga diingatkan bertahap per kelompok untuk melengkapi kit dengan patokan HET. Permintaan tersebar, harga tidak ikut meledak.", "On Advisory, residents are nudged in staggered cohorts to complete their kit against the price cap. Demand spreads out and prices stay calm.")}
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative h-[340px] overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_70%_60%_at_50%_75%,var(--t-peach),transparent_70%),linear-gradient(180deg,var(--t-surface),var(--t-sand))] ring-1 ring-line sm:h-[400px]">
            <div className="grid-bg-light absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div ref={stageRef} className="absolute inset-0">{stageSeen && <KitCanvas active={active} onPick={pick} />}</div>
            <p className="label pointer-events-none absolute bottom-4 left-5 !text-[9.5px] text-muted/70">3D · NVIDIA SimReady Assets (CC BY 4.0)</p>
          </div>
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12, filter: "blur(6px)" }} transition={{ duration: 0.28 }} className="card p-6">
                <p className="label text-maroon/60">{String(active + 1).padStart(2, "0")} / {String(KIT.length).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-wine">{tx(item.name)}</h3>
                <p className="mt-1 text-[14px] text-muted">{tx(item.note)}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#e6f2e7] p-3">
                    <p className="text-[11.5px] text-leaf">HET</p>
                    <p className="font-display text-[19px] font-semibold tabular text-leaf">{rupiah(item.het)}</p>
                  </div>
                  <div className="rounded-xl bg-peach/60 p-3">
                    <p className="text-[11.5px] text-maroon">{t("Rata-rata pasar", "Market average")}</p>
                    <p className="font-display text-[19px] font-semibold tabular text-maroon">{rupiah(item.market)}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-sand-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (item.het / item.market) * 100)}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-leaf" />
                </div>
                <p className={cn("mt-2 text-[12.5px] font-medium", dev > 0.3 ? "text-crimson" : dev > 0.1 ? "text-ember" : "text-leaf")}>
                  {dev > 0.3 ? t(`+${Math.round(dev * 100)}% di atas HET · ditandai`, `+${Math.round(dev * 100)}% above cap · flagged`) : t(`+${Math.round(dev * 100)}% · masih wajar`, `+${Math.round(dev * 100)}% · within range`)}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="grid grid-cols-5 gap-2">
              {KIT.map((k, i) => (
                <button key={k.file} onClick={() => pick(i)} className={cn("relative h-1.5 overflow-hidden rounded-full bg-line")} aria-label={tx(k.name)}>
                  {i === active && <motion.span key={`${active}-${auto}`} className="absolute inset-y-0 left-0 bg-maroon" initial={{ width: auto ? "0%" : "100%" }} animate={{ width: "100%" }} transition={{ duration: auto ? 3.6 : 0, ease: "linear" }} />}
                </button>
              ))}
            </div>
            <ul className="card divide-y divide-line">
              {KIT.map((k, i) => {
                const d = (k.market - k.het) / k.het;
                return (
                  <li key={k.file}>
                    <button onClick={() => pick(i)} className={cn("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] transition hover:bg-sand", i === active && "bg-peach/40")}>
                      <span className="flex items-center gap-2"><span className={cn("h-1.5 w-1.5 rounded-full", i === active ? "bg-maroon" : "bg-line-strong")} />{tx(k.name)}</span>
                      <span className={cn("font-mono text-[11.5px]", d > 0.3 ? "text-crimson" : "text-leaf")}>{d > 0 ? "+" : ""}{Math.round(d * 100)}%</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-[12px] text-muted">{t("Ketuk barang di panggung 3D atau di daftar untuk melihat harganya.", "Tap an item on the stage or in the list to see its price.")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
