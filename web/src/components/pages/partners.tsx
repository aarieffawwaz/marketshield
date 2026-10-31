"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Check, GraduationCap, HandHeart, Radio, ShieldCheck, Store, Send } from "lucide-react";
import { PageHero } from "@/components/site/page";
import { FluidTabs, HoldButton } from "@/components/ui/interactions";
import { Reveal } from "@/components/landing/reveal";
import { useT } from "@/lib/store";

export function PartnersPage() {
  const { t } = useT();
  const types = [
    { key: "pemda", i: Building2, h: t("Pemerintah daerah & BPBD", "Local government & BPBD"), give: t("Data posko, distribusi bantuan, kanal siaran resmi", "Post data, aid distribution, official broadcast channel"), get: t("Console, prioritas desa, pelatihan Pusdalops, laporan dampak", "Console, village priority, ops training, impact reports") },
    { key: "ngo", i: HandHeart, h: t("NGO & lembaga kemanusiaan", "NGOs & humanitarian agencies"), give: t("Relawan lapangan, verifikasi laporan warga", "Field volunteers, resident report verification"), get: t("Peta kebutuhan desa, API prioritas bantuan, akses gratis", "Village needs map, aid priority API, free access") },
    { key: "ritel", i: Store, h: t("Apotek, ritel & distributor", "Pharmacies, retail & distributors"), give: t("Harga dan stok barang darurat", "Emergency goods prices and stock"), get: t("Lencana harga wajar, lalu lintas pembeli yang tenang", "Fair-price badge, calmer customer demand") },
    { key: "telco", i: Radio, h: t("Telco & platform pesan", "Telcos & messaging platforms"), give: t("Kanal SMS/cell broadcast, kuota data darurat", "SMS/cell broadcast channels, emergency data"), get: t("Konten peringatan terverifikasi, CSR yang terukur", "Verified alert content, measurable CSR") },
    { key: "asuransi", i: ShieldCheck, h: t("Asuransi & keuangan", "Insurance & finance"), give: t("Produk mikro-asuransi untuk warga KRB", "Micro-insurance for hazard-zone residents"), get: t("Indikator satelit untuk pemicu parametrik", "Satellite indicators for parametric triggers") },
    { key: "kampus", i: GraduationCap, h: t("Kampus & peneliti", "Universities & researchers"), give: t("Validasi model, data lapangan", "Model validation, field data"), get: t("Akses data riset, publikasi bersama", "Research data access, joint publications") },
  ];
  const steps = [
    { h: t("Perkenalan", "Intro call"), p: t("30 menit membahas wilayah, kebutuhan dan data yang tersedia.", "30 minutes on your area, needs and available data.") },
    { h: t("Uji coba 30 hari", "30-day pilot"), p: t("Satu kecamatan atau satu jaringan outlet, dengan target terukur.", "One sub-district or outlet network, with measurable targets.") },
    { h: t("Evaluasi bersama", "Joint review"), p: t("Kami membandingkan hasil dengan target awal dan masukan lapangan.", "We compare results with targets and field feedback.") },
    { h: t("Perjanjian kerja sama", "Agreement"), p: t("Ruang lingkup, perlindungan data dan SLA dituangkan dalam PKS.", "Scope, data protection and SLA set out in the agreement.") },
  ];
  const [type, setType] = useState("pemda");
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ org: "", name: "", email: "", area: "" });
  const valid = f.org.trim() && f.name.trim() && /\S+@\S+\.\S+/.test(f.email);

  return (
    <>
      <PageHero kicker={t("Kemitraan", "Partnerships")} title={t("Kesiapsiagaan bukan kerja satu pihak.", "Preparedness is never a solo job.")} sub={t("Kami menghubungkan data satelit dengan orang-orang yang bertindak di lapangan. Bergabunglah sebagai mitra data, distribusi atau kanal.", "We connect satellite data with the people acting on the ground. Join as a data, distribution or channel partner.")} crumbs={[{ label: t("Kemitraan", "Partnerships") }]} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold tracking-tight text-wine">{t("Jenis mitra", "Partner types")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {types.map((x, i) => (
            <Reveal key={x.key} delay={(i % 3) * 0.06}>
              <div className="card h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peach text-maroon"><x.i className="h-5 w-5" /></span>
                <h3 className="mt-4 font-display text-[18px] font-semibold text-wine">{x.h}</h3>
                <dl className="mt-4 space-y-3 text-[13.5px]">
                  <div><dt className="label !text-[9.5px] text-muted">{t("Kontribusi", "You bring")}</dt><dd className="mt-1 text-ink">{x.give}</dd></div>
                  <div><dt className="label !text-[9.5px] text-leaf">{t("Manfaat", "You get")}</dt><dd className="mt-1 text-ink">{x.get}</dd></div>
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-night py-20 text-bone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold tracking-tight">{t("Alur kemitraan", "How partnering works")}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.h} className="relative rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
                <span className="font-mono text-[12px] text-ember">0{i + 1}</span>
                <p className="mt-3 font-display text-[17px] font-semibold">{s.h}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-bone/60">{s.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-display text-[30px] font-semibold tracking-tight text-wine">{t("Ajukan kemitraan", "Apply to partner")}</h2>
        <div className="card mt-8 p-6">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-white"><Check className="h-7 w-7" /></span>
                <p className="mt-4 font-display text-[20px] font-semibold text-wine">{t("Pengajuan diterima", "Application received")}</p>
                <p className="mt-1 text-[14px] text-muted">{t("Tim kemitraan akan menghubungi Anda dalam 3 hari kerja.", "Our partnerships team will reach out within 3 business days.")}</p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <p className="text-[12.5px] font-medium text-muted">{t("Jenis mitra", "Partner type")}</p>
                <FluidTabs
                  label={t("Jenis mitra", "Partner type")}
                  value={type}
                  onChange={setType}
                  className="mt-2 flex-wrap gap-1 rounded-2xl bg-sand p-1"
                  itemClassName="rounded-xl px-3 py-1.5 text-[12.5px] font-medium"
                  pillClassName="rounded-xl bg-maroon"
                  options={types.map((x) => ({ value: x.key, label: x.h.split(" ")[0] }))}
                />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    ["org", t("Nama instansi / perusahaan", "Organisation")],
                    ["name", t("Nama penanggung jawab", "Contact person")],
                    ["email", "Email"],
                    ["area", t("Wilayah / gunung yang diminati", "Area / volcano of interest")],
                  ].map(([k, l]) => (
                    <label key={k} className="block">
                      <span className="text-[12.5px] font-medium text-muted">{l}</span>
                      <input value={f[k as keyof typeof f]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-[14px] outline-none focus:border-maroon" />
                    </label>
                  ))}
                </div>
                <HoldButton onConfirm={() => setSent(true)} disabled={!valid} duration={700} className="mt-5 w-full" icon={<Send className="h-4 w-4" />} label={t("Tahan untuk mengajukan", "Hold to apply")} holdLabel={t("Mengirim…", "Sending…")} doneLabel={t("Terkirim", "Sent")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
