"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Building2, HandHeart, KeyRound, Loader2, Tent } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { LangToggle, ThemeToggle } from "@/components/ui/lang-toggle";
import { PEOPLE, useApp, useT, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const { t, tx } = useT();
  const router = useRouter();
  const signIn = useApp((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const enter = (role: Role, key: string) => {
    setBusy(key);
    window.setTimeout(() => {
      signIn(PEOPLE[role]);
      router.replace(role === "donor" ? "/app?tab=aid" : role === "posko" ? "/app?tab=posko" : "/app");
    }, 650);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email) || pw.length < 6) {
      setErr(t("Masukkan email kerja dan kata sandi minimal 6 karakter.", "Enter your work email and a password of at least 6 characters."));
      return;
    }
    setErr("");
    setBusy("form");
    try {
      const { operatorSignIn } = await import("@/lib/auth");
      const session = await operatorSignIn(email, pw);
      signIn(session);
      router.replace(session.role === "donor" ? "/app?tab=aid" : session.role === "posko" ? "/app?tab=posko" : "/app");
    } catch (e) {
      const { authErrorText } = await import("@/lib/auth");
      setErr(authErrorText((e as { code?: string }).code ?? "", t));
      setBusy(null);
    }
  };

  const roles: { role: Role; icon: typeof Building2; label: string }[] = [
    { role: "bpbd", icon: Building2, label: t("BPBD / Pusdalops", "BPBD / Ops centre") },
    { role: "posko", icon: Tent, label: t("Posko & desa", "Aid post & village") },
    { role: "donor", icon: HandHeart, label: t("Donatur & distributor", "Donor & distributor") },
  ];

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-cream lg:grid-cols-[1.05fr_1fr]">
      <aside className="noise relative hidden overflow-hidden bg-night text-bone lg:block">
        <Image src="/img/semeru_cctv.webp" alt="" fill priority sizes="50vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/30" />
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/"><Logo dark /></Link>
          <div>
            <p className="label text-ember">Web console</p>
            <h1 className="mt-4 max-w-md font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em]">{t("Satu layar untuk satelit, posko dan bantuan.", "One screen for satellites, posts and aid.")}</h1>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              {[
                ["71%", t("peluang eskalasi", "escalation odds")],
                ["8", t("desa prioritas", "priority villages")],
                ["14", t("hoaks dibantah", "hoaxes debunked")],
              ].map(([v, l]) => (
                <div key={l} className="bg-night/70 p-4">
                  <p className="font-display text-[22px] font-semibold tabular">{v}</p>
                  <p className="text-[11.5px] text-bone/50">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-bone/40">{t("Level resmi mengikuti PVMBG.", "Official levels follow PVMBG.")}</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-maroon"><ArrowLeft className="h-4 w-4" /> {t("Kembali ke situs", "Back to website")}</Link>
          <div className="flex items-center gap-2"><LangToggle /><ThemeToggle /></div>
        </div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto my-auto w-full max-w-[400px] py-10">
          <div className="lg:hidden"><Logo /></div>
          <h2 className="mt-6 font-display text-[28px] font-semibold tracking-tight text-wine lg:mt-0">{t("Masuk ke console", "Sign in to the console")}</h2>
          <p className="mt-1.5 text-[14px] text-muted">{t("Gunakan akun operator dari admin MarketShield.", "Use the operator account issued by a MarketShield admin.")}</p>

          <form onSubmit={submit} className="mt-7 space-y-3.5">
            <label className="block">
              <span className="text-[12.5px] font-medium text-muted">{t("Email kerja", "Work email")}</span>
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@bpbd-lumajang.go.id" className="mt-1 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] outline-none transition focus:border-maroon focus:ring-4 focus:ring-maroon/10" />
            </label>
            <label className="block">
              <span className="flex justify-between text-[12.5px] font-medium text-muted">{t("Kata sandi", "Password")} <Link href="/bantuan#kontak" className="text-maroon">{t("Lupa?", "Forgot?")}</Link></span>
              <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] outline-none transition focus:border-maroon focus:ring-4 focus:ring-maroon/10" />
            </label>
            {err && <p className="text-[12.5px] text-crimson" role="alert">{err}</p>}
            <button disabled={!!busy} className="btn-shine shine-maroon flex w-full items-center justify-center gap-2 rounded-xl bg-maroon py-3 text-[14px] font-medium text-white disabled:opacity-70">
              {busy === "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("Masuk", "Sign in")} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[12px] text-muted"><span className="h-px flex-1 bg-line" />{t("atau coba mode demo sebagai", "or try demo mode as")}<span className="h-px flex-1 bg-line" /></div>
          <div className="space-y-2">
            {roles.map((r) => {
              const p = PEOPLE[r.role];
              return (
                <button key={r.role} onClick={() => enter(r.role, r.role)} disabled={!!busy} className={cn("group flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-maroon/30", busy === r.role && "ring-maroon")}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-peach font-display text-[13px] font-semibold text-maroon">{p.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-wine">{p.name}</span>
                    <span className="block truncate text-[12px] text-muted">{tx(p.title)} · {p.org}</span>
                  </span>
                  <span className="hidden items-center gap-1 rounded-full bg-sand px-2 py-1 text-[11px] text-muted sm:flex"><r.icon className="h-3.5 w-3.5" /> {r.label}</span>
                  {busy === r.role ? <Loader2 className="h-4 w-4 animate-spin text-maroon" /> : <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-maroon" />}
                </button>
              );
            })}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[12px] text-muted"><KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("Mode demo memakai data asli, tapi perubahan Anda tidak disimpan ke database.", "Demo mode shows real data, but your changes are not saved to the database.")}</p>
          <p className="mt-8 text-center text-[12px] text-muted">{t("Dengan masuk, Anda menyetujui", "By signing in you agree to the")} <Link href="/syarat" className="underline">{t("Syarat", "Terms")}</Link> {t("dan", "and")} <Link href="/privasi" className="underline">{t("Kebijakan Privasi", "Privacy Policy")}</Link>.</p>
        </motion.div>
      </main>
    </div>
  );
}
