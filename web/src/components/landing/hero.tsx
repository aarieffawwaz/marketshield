"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Download, Smartphone } from "lucide-react";
import dynamic from "next/dynamic";

const Terrain = dynamic(() => import("./terrain").then((m) => m.Terrain), { ssr: false });
import { DATASETS, LEVELS, VOLCANO } from "@/lib/data";
import { useT } from "@/lib/store";

export function Hero() {
  const { t, tx } = useT();
  const lv = LEVELS[3];
  return (
    <section className="noise relative min-h-[100svh] overflow-hidden bg-night text-bone">
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_70%,rgba(123,30,38,0.45),transparent_70%)]" />
      <Terrain className="absolute inset-0 top-[18%] sm:top-[10%]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night to-transparent" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="label flex items-center gap-2 text-bone/60">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-ember" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
            </span>
            Google Earth Engine · IndoBERT · {t("Peringatan dini erupsi", "Eruption early warning")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="mt-6 font-display text-[clamp(2.4rem,6.4vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
          >
            {t("Gunung dibaca dari orbit.", "Read the volcano from orbit.")}
            <br />
            <span className="bg-gradient-to-r from-ember via-[#f39a5a] to-bone bg-clip-text text-transparent">
              {t("Warga bertindak sebelum panik.", "Act before the panic.")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-bone/70 sm:text-[17px]"
          >
            {t(
              "MarketShield menggabungkan tujuh dataset satelit menjadi satu peluang eskalasi, menyaring hoaks, menjaga harga kebutuhan darurat tetap wajar, dan mengarahkan bantuan ke desa yang paling terpapar.",
              "MarketShield fuses seven satellite datasets into one escalation probability, filters hoaxes, keeps emergency prices fair and routes aid to the most exposed villages.",
            )}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/app" className="group inline-flex items-center gap-2 rounded-full btn-shine shine-bone bg-bone px-5 py-3 text-[14px] font-medium text-night transition hover:bg-white">
              {t("Buka Web Console", "Open web console")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/mobile" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] text-bone ring-1 ring-white/20 transition hover:bg-white/5">
              <Smartphone className="h-4 w-4" /> {t("Coba aplikasi", "Try the app")}
            </Link>
            <Link href="/download" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] text-bone ring-1 ring-white/20 transition hover:bg-white/5">
              <Download className="h-4 w-4" /> {t("Unduh APK", "Download APK")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { k: t("Gunung api", "Volcano"), v: `${VOLCANO.name} · ${tx(VOLCANO.region)}`, extra: <span className="label rounded-full px-2 py-0.5 !text-[10px] text-white" style={{ background: lv.color }}>Level {lv.roman} · {tx(lv.name)}</span> },
            { k: t("Peluang eskalasi 7 hari", "7-day escalation odds"), v: `${Math.round(lv.prob * 100)}%`, extra: <span className="label !text-[10px] text-ember">▲ {t("naik", "rising")}</span> },
            { k: t("Jendela aksi", "Action window"), v: tx(lv.eaw), extra: <span className="label !text-[10px] text-bone/50">XGBoost · SHAP</span> },
            { k: t("Angin (GFS)", "Wind (GFS)"), v: t("Barat Daya 240° · 12 knot", "Southwest 240° · 12 kt"), extra: <span className="label !text-[10px] text-sat-bright">S1 · 2 {t("hari lalu", "days ago")}</span> },
          ].map((c) => (
            <div key={c.k} className="bg-night/70 p-5">
              <p className="label text-bone/45">{c.k}</p>
              <p className="mt-2 font-display text-[19px] font-medium tabular tracking-tight">{c.v}</p>
              <div className="mt-2">{c.extra}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative border-y border-white/10 bg-night py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...DATASETS, ...DATASETS].map((d, i) => (
            <span key={i} className="label flex items-center gap-3 text-bone/50">
              <span className="text-sat-bright">{d.id}</span>
              <span>{tx(d.what)}</span>
              <span className="text-bone/20">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
