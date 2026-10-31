"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, ChevronDown, CreditCard, LifeBuoy, Map, Monitor, Phone, Search, Send, ShieldCheck, Smartphone, Check } from "lucide-react";
import { PageHero } from "@/components/site/page";
import { HoldButton } from "@/components/ui/interactions";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

type Article = { cat: string; q: string; a: string };

const CATS = [
  { key: "mulai", icon: Smartphone, id: "Memulai", en: "Getting started" },
  { key: "level", icon: ShieldCheck, id: "Peringatan & level", en: "Alerts & levels" },
  { key: "peta", icon: Map, id: "Peta & evakuasi", en: "Map & evacuation" },
  { key: "console", icon: Monitor, id: "Web console", en: "Web console" },
  { key: "akun", icon: BookOpen, id: "Akun & data", en: "Account & data" },
  { key: "tagihan", icon: CreditCard, id: "Tagihan", en: "Billing" },
];

const ARTICLES: Article[] = [
  { cat: "mulai", q: "Bagaimana cara memasang aplikasi di Android?", a: "Buka halaman Unduh APK di ponsel, ketuk Unduh APK, lalu buka file yang terunduh. Jika muncul peringatan, izinkan \"Instal aplikasi tidak dikenal\" untuk browser Anda, kemudian ketuk Instal. Ponsel lama 32-bit memakai file armeabi-v7a." },
  { cat: "mulai", q: "Apakah aplikasi bisa dipakai tanpa internet?", a: "Bisa sebagian. Lapisan peta terakhir, rute evakuasi dan panduan disimpan di ponsel. Pembaruan level dan prakiraan membutuhkan koneksi. Saat sinyal hilang, aplikasi menampilkan waktu data terakhir." },
  { cat: "mulai", q: "Bagaimana mengganti bahasa?", a: "Buka Profil, lalu pilih Bahasa Indonesia atau English. Perubahan langsung berlaku tanpa memulai ulang aplikasi." },
  { cat: "level", q: "Apa bedanya level PVMBG dan prakiraan MarketShield?", a: "Level I–IV adalah status resmi dari PVMBG dan selalu menjadi acuan. Prakiraan MarketShield adalah peluang kenaikan level dalam 7 hari berdasarkan data satelit, untuk membantu Anda bersiap lebih awal." },
  { cat: "level", q: "Mengapa saya menerima pengingat belanja kit?", a: "Saat status Waspada atau peluang eskalasi di atas 40%, warga diingatkan bertahap per kelompok agar pembelian tersebar dan harga tetap wajar. Pengingat maksimal sekali sehari." },
  { cat: "level", q: "Bagaimana cara kerja cek hoaks?", a: "Tempel pesan di menu Intel. Sistem memberi label hoaks, panik atau terverifikasi beserta kata pemicunya. Klaim lokasi lahar atau abu dicocokkan dengan data satelit. Label terverifikasi tidak pernah diberikan oleh model saja." },
  { cat: "peta", q: "Bagaimana rute evakuasi dipilih?", a: "Rute dihitung ke shelter terdekat yang masih buka, menghindari zona KRB III dan alur lahar dari radar Sentinel-1 serta hujan lebat GPM. Rute diperbarui saat status posko atau lapisan bahaya berubah." },
  { cat: "peta", q: "Bagaimana SOS bekerja?", a: "Tahan tombol SOS selama 3 detik. Lokasi dan jumlah anggota rumah tangga dikirim ke kontak darurat dan BPBD setempat. Jika tidak ada data, aplikasi menyiapkan SMS cadangan. Dalam keadaan darurat, tetap hubungi 112." },
  { cat: "console", q: "Bagaimana mencatat distribusi bantuan?", a: "Di menu Prioritas bantuan, ketuk Catat kiriman pada desa tujuan. Peringkat langsung diperbarui. Anda punya 5 detik untuk membatalkan jika salah ketuk." },
  { cat: "console", q: "Bagaimana menyiarkan peringatan?", a: "Buka Peringatan, pilih wilayah, tulis pesan, lalu tahan tombol siaran sampai penuh. Siaran dikirim bertahap per kohort agar tidak memicu panic buying." },
  { cat: "console", q: "Bisakah mengubah status posko dari console?", a: "Bisa. Di menu Posko & shelter, ketuk label status dan pilih Buka, Penuh atau Tutup. Warga melihat perubahan dalam hitungan detik." },
  { cat: "akun", q: "Data apa saja yang dikumpulkan?", a: "Lokasi (untuk peringatan yang relevan), ukuran rumah tangga dan anggota rentan (untuk rekomendasi kit), serta laporan yang Anda kirim. Rinciannya ada di Kebijakan Privasi." },
  { cat: "akun", q: "Bagaimana menghapus akun dan data saya?", a: "Buka Profil, lalu Privasi, lalu Hapus data. Data dihapus dalam 30 hari kecuali yang wajib disimpan menurut hukum. Anda juga dapat mengajukan permintaan lewat formulir kontak." },
  { cat: "tagihan", q: "Metode pembayaran apa yang tersedia?", a: "Transfer bank, virtual account, dan kartu kredit/debit untuk paket bulanan. Instansi pemerintah dapat memakai kontrak tahunan dengan termin pembayaran." },
  { cat: "tagihan", q: "Bagaimana mendapatkan faktur pajak?", a: "Faktur pajak terbit otomatis untuk setiap tagihan dan dapat diunduh oleh admin instansi dari menu Tagihan di console." },
];

export function HelpPage() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", topic: "Umum", msg: "" });
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ARTICLES.filter((a) => (!cat || a.cat === cat) && (!s || a.q.toLowerCase().includes(s) || a.a.toLowerCase().includes(s)));
  }, [q, cat]);
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.msg.trim().length > 9;

  return (
    <>
      <PageHero kicker={t("Pusat bantuan", "Help centre")} title={t("Ada yang bisa kami bantu?", "How can we help?")} crumbs={[{ label: t("Bantuan", "Help") }]}>
        <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-surface p-2 pl-4 text-ink shadow-2xl">
          <Search className="h-5 w-5 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Cari: SOS, rute evakuasi, faktur…", "Search: SOS, evacuation route, invoice…")} className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none" aria-label={t("Cari artikel bantuan", "Search help articles")} />
          {q && <span className="rounded-lg bg-sand px-2.5 py-1 text-[12px] text-muted">{results.length} {t("hasil", "results")}</span>}
        </div>
        {lang === "en" && <p className="mt-3 text-[12.5px] text-bone/50">Help articles are written in Indonesian.</p>}
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATS.map((c) => (
            <button key={c.key} onClick={() => setCat(cat === c.key ? null : c.key)} aria-pressed={cat === c.key} className={cn("card flex flex-col items-start gap-3 p-4 text-left transition hover:-translate-y-0.5", cat === c.key && "!border-maroon ring-2 ring-maroon/20")}>
              <c.icon className="h-5 w-5 text-maroon" />
              <span className="text-[13.5px] font-semibold text-wine">{lang === "en" ? c.en : c.id}</span>
              <span className="text-[12px] text-muted">{ARTICLES.filter((a) => a.cat === c.key).length} {t("artikel", "articles")}</span>
            </button>
          ))}
        </div>

        <ul className="mt-8 space-y-2">
          <AnimatePresence initial={false}>
            {results.map((a) => (
              <motion.li layout key={a.q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card overflow-hidden">
                <button onClick={() => setOpen(open === a.q ? null : a.q)} aria-expanded={open === a.q} className="flex w-full items-center justify-between gap-4 p-4 text-left">
                  <span>
                    <span className="label !text-[9.5px] text-maroon/60">{CATS.find((c) => c.key === a.cat)?.[lang === "en" ? "en" : "id"]}</span>
                    <span className="mt-1 block text-[15px] font-medium text-wine">{a.q}</span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition", open === a.q && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {open === a.q && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-[14px] leading-relaxed text-muted">{a.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
          {results.length === 0 && <li className="card p-6 text-center text-[14px] text-muted">{t("Tidak ada artikel yang cocok. Coba kata lain atau hubungi kami di bawah.", "No matching articles. Try another word or contact us below.")}</li>}
        </ul>
      </section>

      <section id="kontak" className="scroll-mt-20 bg-sand py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-[30px] font-semibold tracking-tight text-wine">{t("Hubungi kami", "Contact us")}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{t("Untuk pertanyaan produk, penawaran instansi, atau permintaan data pribadi. Kami membalas dalam 1 hari kerja; saat status Siaga atau Awas, dukungan console aktif 24 jam.", "For product questions, agency quotes or personal data requests. We reply within 1 business day; on Watch or Warning, console support runs 24/7.")}</p>
            <div className="mt-6 rounded-2xl bg-crimson p-5 text-white">
              <p className="flex items-center gap-2 font-display text-[16px] font-semibold"><Phone className="h-4 w-4" /> {t("Keadaan darurat?", "Emergency?")}</p>
              <p className="mt-1 text-[13.5px] text-white/85">{t("Hubungi 112 atau BPBD setempat. Formulir ini tidak dipantau untuk situasi darurat.", "Call 112 or your local BPBD. This form is not monitored for emergencies.")}</p>
            </div>
            <div className="mt-4 flex items-center gap-3 text-[13.5px] text-muted"><LifeBuoy className="h-4 w-4 text-maroon" /> <Link href="/docs" className="underline decoration-maroon/30 underline-offset-4">{t("Lihat dokumentasi teknis", "Read the technical docs")}</Link></div>
          </div>
          <div className="card p-6">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-white"><Check className="h-7 w-7" /></span>
                  <p className="mt-4 font-display text-[20px] font-semibold text-wine">{t("Pesan terkirim", "Message sent")}</p>
                  <p className="mt-1 text-[14px] text-muted">{t(`Kami akan membalas ke ${form.email}.`, `We'll reply to ${form.email}.`)}</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", org: "", topic: "Umum", msg: "" }); }} className="mt-5 text-[13px] font-medium text-maroon">{t("Kirim pesan lain", "Send another")}</button>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["name", t("Nama", "Name"), "text"],
                    ["email", "Email", "email"],
                    ["org", t("Instansi / usaha (opsional)", "Organisation (optional)"), "text"],
                  ].map(([k, l, type]) => (
                    <label key={k} className={cn("block", k === "org" && "sm:col-span-2")}>
                      <span className="text-[12.5px] font-medium text-muted">{l}</span>
                      <input type={type} value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-maroon" />
                    </label>
                  ))}
                  <label className="block sm:col-span-2">
                    <span className="text-[12.5px] font-medium text-muted">{t("Topik", "Topic")}</span>
                    <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px]">
                      {["Umum", "Penawaran instansi", "Dukungan console", "Kemitraan", "Permintaan data pribadi", "Tagihan"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[12.5px] font-medium text-muted">{t("Pesan", "Message")}</span>
                    <textarea rows={4} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} className="mt-1 w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-maroon" />
                  </label>
                  <div className="sm:col-span-2">
                    <HoldButton onConfirm={() => setSent(true)} disabled={!valid} duration={700} className="w-full" icon={<Send className="h-4 w-4" />} label={t("Tahan untuk mengirim", "Hold to send")} holdLabel={t("Mengirim…", "Sending…")} doneLabel={t("Terkirim", "Sent")} />
                    <p className="mt-2 text-[11.5px] text-muted">{t("Dengan mengirim, Anda menyetujui", "By sending, you agree to our")} <Link href="/privasi" className="underline">{t("Kebijakan Privasi", "Privacy Policy")}</Link>.</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
