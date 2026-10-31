"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, ArrowLeftRight, Bell, Check, CircleHelp, ChevronDown, ChevronsLeft, ChevronsRight, CircleDollarSign, CornerDownLeft, HandHeart,
  LayoutDashboard, LifeBuoy, LogOut, Map, Megaphone, Radio, Search, Smartphone, Tent,
} from "lucide-react";
import { Logo, Mark } from "@/components/ui/brand";
import { LangToggle, ThemeToggle } from "@/components/ui/lang-toggle";
import { FluidTabs } from "@/components/ui/interactions";
import { LEVELS, VOLCANO, type Level } from "@/lib/data";
import { useAlerts, useDataMode, useForecast, useOfficialLevel } from "@/lib/live";
import { PEOPLE, useApp, useT, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LevelChip } from "./ui";
import { startConsoleTour, tourSeen } from "./tour";
import { AidPanel, AlertList, AlertsPanel, MapPanel, Overview, PoskoPanel, PricePanel, SignalPanel } from "./panels";

const TABS = ["overview", "map", "aid", "prices", "signal", "posko", "alerts"] as const;
type Tab = (typeof TABS)[number];

const ROLE_TABS: Record<Role, Tab[]> = {
  bpbd: [...TABS],
  posko: ["overview", "map", "posko", "signal", "alerts", "prices"],
  donor: ["overview", "aid", "prices", "posko", "map"],
};

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function useNav() {
  const { t } = useT();
  return {
    groups: [
      { label: t("Pantau", "Monitor"), items: [
        { key: "overview" as Tab, icon: LayoutDashboard, label: t("Ringkasan", "Overview") },
        { key: "map" as Tab, icon: Map, label: t("Peta bahaya", "Hazard map") },
      ] },
      { label: t("Tindak", "Act"), items: [
        { key: "aid" as Tab, icon: HandHeart, label: t("Prioritas bantuan", "Aid priority") },
        { key: "posko" as Tab, icon: Tent, label: t("Posko & shelter", "Aid posts") },
        { key: "alerts" as Tab, icon: Megaphone, label: t("Siaran & peringatan", "Broadcasts & alerts") },
      ] },
      { label: t("Verifikasi", "Verify"), items: [
        { key: "signal" as Tab, icon: Radio, label: t("Filter sinyal", "Signal filter"), badge: 3 },
        { key: "prices" as Tab, icon: CircleDollarSign, label: t("Harga HET", "Price watch"), badge: 2 },
      ] },
    ],
  };
}

export function Console() {
  const router = useRouter();
  const { t, tx } = useT();
  const level = useApp((s) => s.level);
  const setLevel = useApp((s) => s.setLevel);
  const session = useApp((s) => s.session);
  const hydrated = useApp((s) => s.hydrated);
  const collapsed = useApp((s) => s.collapsed);
  const initial = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>(initial && (TABS as readonly string[]).includes(initial) ? (initial as Tab) : "overview");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const { groups } = useNav();

  useEffect(() => {
    if (hydrated && !session) router.replace("/app/login");
  }, [hydrated, session, router]);

  // first visit: walk through the console once; the ? button replays it
  useEffect(() => {
    if (!hydrated || !session || tourSeen()) return;
    const id = window.setTimeout(() => startConsoleTour("overview", t), 1400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, session]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const allowed = session ? ROLE_TABS[session.role] : ROLE_TABS.bpbd;
  const current = allowed.includes(tab) ? tab : "overview";
  const go = (next: string) => {
    if (!(TABS as readonly string[]).includes(next)) return;
    setTab(next as Tab);
    window.history.replaceState(null, "", `/app?tab=${next}`);
    window.scrollTo({ top: 0 });
  };
  const toast = (m: string) => {
    setToastMsg(m);
    window.setTimeout(() => setToastMsg((cur) => (cur === m ? null : cur)), 2800);
  };
  const L = LEVELS[level];
  const allItems = groups.flatMap((g) => g.items).filter((i) => allowed.includes(i.key));
  const label = allItems.find((i) => i.key === current)?.label ?? "";

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Mark className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-cream transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
      <Sidebar groups={groups} allowed={allowed} tab={current} go={go} openPalette={() => setPalette(true)} />

      <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="lg:hidden"><Mark /></Link>
            <div className="min-w-0">
              <p className="hidden items-center gap-2 text-[11.5px] text-muted sm:flex">{session.org} · {VOLCANO.name} <ModeBadge /></p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1 key={current} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }} className="truncate font-display text-[17px] font-semibold text-wine">{label}</motion.h1>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button data-tour="help" onClick={() => startConsoleTour(current, t)} aria-label={t("Tur & bantuan", "Tour & help")} title={t("Tur & bantuan", "Tour & help")} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition hover:ring-maroon/30">
              <CircleHelp className="h-4 w-4 text-wine" />
            </button>
            <button data-tour="search" onClick={() => setPalette(true)} className="hidden items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[12.5px] text-muted ring-1 ring-line hover:text-ink xl:flex">
              <Search className="h-3.5 w-3.5" /> {t("Cari", "Search")} <kbd className="rounded bg-sand px-1.5 font-mono text-[10.5px]">⌘K</kbd>
            </button>
            <div data-tour="level" className="hidden items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-line md:flex">
              <span className="label px-2 !text-[9.5px] text-muted">PVMBG</span>
              <FluidTabs
                label={t("Status PVMBG", "PVMBG status")}
                value={level}
                onChange={setLevel}
                itemClassName="h-7 min-w-9 rounded-full px-2 text-[12px] font-semibold"
                pillStyle={(l) => ({ background: LEVELS[l].color })}
                options={([1, 2, 3, 4] as Level[]).map((l) => ({ value: l, label: LEVELS[l].roman }))}
              />
            </div>
            <span data-tour="notif"><Notifications /></span>
            <span className="hidden items-center gap-2 sm:flex"><LangToggle /><ThemeToggle /></span>
            <span data-tour="user"><UserMenu onSwitched={(name) => toast(t(`Masuk sebagai ${name}`, `Signed in as ${name}`))} /></span>
          </div>
        </div>
        <motion.div animate={{ backgroundColor: L.soft }} transition={{ duration: 0.5 }} className="flex items-center gap-3 overflow-x-auto border-t border-line px-4 py-2.5 sm:px-6">
          <LevelChip level={level} label={tx(L.name)} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={level} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap text-[13px] font-medium" style={{ color: L.color }}>{tx(L.hero)}</motion.p>
          </AnimatePresence>
          <span className="ml-auto hidden whitespace-nowrap font-mono text-[11px] text-muted md:block">{t("Pembaruan satelit terakhir 08.42 WIB", "Last satellite update 08:42 WIB")}</span>
        </motion.div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
          {allItems.map((n) => (
            <button key={n.key} onClick={() => go(n.key)} className={cn("relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px]", current === n.key ? "text-white" : "text-muted")}>
              {current === n.key && <motion.span layoutId="mob-pill" className="absolute inset-0 rounded-lg bg-maroon" transition={spring} />}
              <n.icon className="relative h-3.5 w-3.5" /> <span className="relative">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1 border-t border-line px-3 py-2 md:hidden">
          <span className="label px-1 !text-[9.5px] text-muted">PVMBG</span>
          {([1, 2, 3, 4] as Level[]).map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={cn("h-7 flex-1 rounded-full text-[12px] font-semibold", level === l ? "text-white" : "text-muted ring-1 ring-line")} style={level === l ? { background: LEVELS[l].color } : undefined}>
              {LEVELS[l].roman}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {current === "overview" && <Overview go={go} role={session.role} />}
            {current === "map" && <MapPanel />}
            {current === "aid" && <AidPanel />}
            {current === "prices" && <PricePanel toast={toast} />}
            {current === "signal" && <SignalPanel />}
            {current === "posko" && <PoskoPanel toast={toast} />}
            {current === "alerts" && <AlertsPanel toast={toast} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>{palette && <CommandPalette items={allItems} go={go} close={() => setPalette(false)} />}</AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-night px-4 py-3 text-[13px] text-bone shadow-2xl" role="status">
            <Check className="h-4 w-4 text-ember" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sidebar ---------- */

type NavGroups = ReturnType<typeof useNav>["groups"];

function Sidebar({ groups, allowed, tab, go, openPalette }: { groups: NavGroups; allowed: Tab[]; tab: Tab; go: (t: string) => void; openPalette: () => void }) {
  const { t, tx } = useT();
  const collapsed = useApp((s) => s.collapsed);
  const setCollapsed = useApp((s) => s.setCollapsed);
  const session = useApp((s) => s.session)!;
  const level = useApp((s) => s.level);
  const L = LEVELS[level];
  // same source as the overview KPI: the live model forecast when it covers the current level
  const fc = useForecast();
  const prob = fc && level === 3 ? fc.p : L.prob;
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/5 bg-night text-bone transition-[width] duration-300 lg:flex", collapsed ? "w-[76px]" : "w-[264px]")}>
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="MarketShield">{collapsed ? <Mark /> : <Logo dark />}</Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="rounded-lg p-1.5 text-bone/40 transition hover:bg-white/5 hover:text-bone" aria-label={t("Ciutkan sidebar", "Collapse sidebar")}><ChevronsLeft className="h-4 w-4" /></button>
        )}
      </div>

      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="mx-auto mb-3 rounded-lg p-2 text-bone/40 hover:bg-white/5 hover:text-bone" aria-label={t("Lebarkan sidebar", "Expand sidebar")}><ChevronsRight className="h-4 w-4" /></button>
      ) : (
        <div className="mx-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-maroon to-crimson font-display text-[12px] font-semibold">{session.org.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">{session.org}</p>
              <p className="truncate text-[11.5px] text-bone/45">{VOLCANO.name} · {tx(VOLCANO.region)}</p>
            </div>
          </div>
          <div data-tour="status" className="rounded-xl p-3 ring-1 ring-white/10" style={{ background: `linear-gradient(135deg, ${L.color}33, transparent)` }}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold" style={{ color: L.color === "#E0A100" ? "#f5c84a" : L.color === "#2E7D32" ? "#6fcf73" : "#ff9a6b" }}>Level {L.roman} · {tx(L.name)}</span>
              <span className="font-mono text-[11px] tabular text-bone/70">{Math.round(prob * 100)}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: `${prob * 100}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: L.color }} /></div>
            <p className="mt-2 text-[11px] text-bone/45">{t("Lintasan berikutnya: Sentinel-1 · 14.20 WIB", "Next pass: Sentinel-1 · 14:20 WIB")}</p>
          </div>
          <button onClick={openPalette} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-bone/50 ring-1 ring-white/10 transition hover:text-bone">
            <Search className="h-3.5 w-3.5" /> {t("Cari atau lompat…", "Search or jump…")} <kbd className="ml-auto rounded bg-white/10 px-1.5 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>
      )}

      <nav data-tour="nav" className="mt-4 flex-1 overflow-y-auto px-3">
        {groups.map((g) => {
          const items = g.items.filter((i) => allowed.includes(i.key));
          if (!items.length) return null;
          return (
            <div key={g.label} className="mb-4">
              {!collapsed && <p className="label mb-1.5 px-3 !text-[9.5px] text-bone/30">{g.label}</p>}
              {items.map((n) => {
                const active = tab === n.key;
                const badge = (n as { badge?: number }).badge;
                return (
                  <button
                    key={n.key}
                    onClick={() => go(n.key)}
                    title={collapsed ? n.label : undefined}
                    className={cn("group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-[13.5px] transition-colors", collapsed ? "justify-center px-0" : "px-3", active ? "text-white" : "text-bone/55 hover:text-bone")}
                  >
                    {active && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.12] to-white/[0.04] ring-1 ring-white/10" transition={spring} />}
                    {active && <motion.span layoutId="side-bar" className="absolute -left-3 bottom-2 top-2 w-1 rounded-r bg-ember shadow-[0_0_12px_#ea6a1f]" transition={spring} />}
                    <n.icon className={cn("relative h-[18px] w-[18px] transition", active ? "text-ember" : "group-hover:scale-110")} />
                    {!collapsed && <span className="relative">{n.label}</span>}
                    {badge ? (
                      <span className={cn("rounded-full bg-crimson text-[10px] font-semibold text-white", collapsed ? "absolute right-3 top-1.5 h-2 w-2 p-0 text-[0px]" : "relative ml-auto px-1.5")}>{badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-white/5 p-3", collapsed && "px-2")}>
        <Link href="/mobile" title={t("Aplikasi warga", "Resident app")} className={cn("flex items-center gap-3 rounded-xl py-2 text-[13px] text-bone/55 transition hover:text-bone", collapsed ? "justify-center" : "px-3")}>
          <Smartphone className="h-[18px] w-[18px]" /> {!collapsed && t("Aplikasi warga", "Resident app")}
        </Link>
        <Link href="/bantuan" title={t("Bantuan", "Help")} className={cn("flex items-center gap-3 rounded-xl py-2 text-[13px] text-bone/55 transition hover:text-bone", collapsed ? "justify-center" : "px-3")}>
          <LifeBuoy className="h-[18px] w-[18px]" /> {!collapsed && t("Pusat bantuan", "Help centre")}
        </Link>
      </div>
    </aside>
  );
}

/* ---------- User menu ---------- */

function UserMenu({ onSwitched }: { onSwitched: (name: string) => void }) {
  const { t, tx } = useT();
  const router = useRouter();
  const session = useApp((s) => s.session)!;
  const signIn = useApp((s) => s.signIn);
  const signOut = useApp((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setSwitching(false);
      }
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink transition hover:bg-sand";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-2.5 ring-1 ring-line transition hover:ring-maroon/30">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach font-display text-[12px] font-semibold text-maroon">{session.initials}</span>
        <span className="hidden max-w-[140px] truncate text-[13px] font-semibold text-wine sm:block">{session.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-12 z-50 w-[300px] origin-top-right rounded-3xl bg-surface p-2 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center gap-3 px-3 pb-3 pt-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-peach font-display text-[15px] font-semibold text-maroon">{session.initials}</span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-wine">{session.name}</p>
                <p className="truncate text-[12.5px] text-muted">{tx(session.title)}</p>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {switching ? (
                <motion.div key="sw" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                  <button onClick={() => setSwitching(false)} className={cn(item, "text-muted")}><ArrowLeft className="h-4 w-4" /> {t("Pilih peran", "Choose a role")}</button>
                  {(Object.keys(PEOPLE) as Role[]).map((r) => {
                    const p = PEOPLE[r];
                    const cur = p.role === session.role;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          signIn(p);
                          setOpen(false);
                          setSwitching(false);
                          onSwitched(p.name);
                        }}
                        className={cn(item, cur && "bg-peach/50")}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-2 text-[11px] font-semibold text-maroon">{p.initials}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                          <span className="block truncate text-[11.5px] text-muted">{tx(p.title)}</span>
                        </span>
                        {cur && <Check className="h-4 w-4 text-maroon" />}
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div key="main" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.15 }}>
                  <button onClick={() => setSwitching(true)} className={cn(item, "bg-peach/50 font-medium text-maroon hover:bg-peach")}><ArrowLeftRight className="h-[18px] w-[18px]" /> {t("Ganti peran", "Switch role")}</button>
                  <div className="my-1.5 h-px bg-line" />
                  <Link href="/mobile" className={item}><Smartphone className="h-[18px] w-[18px] text-muted" /> {t("Buka aplikasi warga", "Open resident app")}</Link>
                  <Link href="/" className={item}><ArrowLeft className="h-[18px] w-[18px] text-muted" /> {t("Kembali ke situs", "Back to website")}</Link>
                  <div className="my-1.5 h-px bg-line" />
                  <button
                    onClick={() => {
                      signOut();
                      import("@/lib/auth").then((m) => m.operatorSignOut());
                      router.replace("/app/login");
                    }}
                    className={item}
                  >
                    <LogOut className="h-[18px] w-[18px] text-muted" /> {t("Keluar", "Sign out")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="px-3 pb-2 pt-3 text-[12px] text-muted">{session.org}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Notifications ---------- */

function Notifications() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const alerts = useAlerts(5).data;
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label={t("Notifikasi", "Notifications")} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition hover:ring-maroon/30">
        <Bell className="h-4 w-4 text-wine" />
        {!read && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson ring-2 ring-white" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-12 z-50 w-[340px] origin-top-right rounded-3xl bg-surface p-2 shadow-2xl ring-1 ring-black/5 max-sm:fixed max-sm:inset-x-3 max-sm:top-16 max-sm:w-auto">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="font-display text-[15px] font-semibold text-wine">{t("Notifikasi", "Notifications")}</p>
              <button onClick={() => setRead(true)} className="text-[12px] font-medium text-maroon">{t("Tandai dibaca", "Mark as read")}</button>
            </div>
            <div className={cn("max-h-[360px] overflow-y-auto transition", read && "opacity-60")}>
              <AlertList items={alerts.slice(0, 5)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Command palette (⌘K) ---------- */

function CommandPalette({ items, go, close }: { items: { key: Tab; icon: typeof Map; label: string }[]; go: (t: string) => void; close: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const setLevel = useApp((s) => s.setLevel);
  const setLang = useApp((s) => s.setLang);
  const lang = useApp((s) => s.lang);
  const signOut = useApp((s) => s.signOut);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const cmds = useMemo(
    () => [
      ...items.map((i) => ({ id: i.key, icon: i.icon, label: i.label, hint: t("Buka", "Open"), run: () => go(i.key) })),
      ...([1, 2, 3, 4] as Level[]).map((l) => ({ id: `lv${l}`, icon: Bell, label: t(`Set status ke Level ${LEVELS[l].roman}`, `Set status to Level ${LEVELS[l].roman}`), hint: "PVMBG", run: () => setLevel(l) })),
      { id: "lang", icon: ArrowLeftRight, label: lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia", hint: t("Bahasa", "Language"), run: () => setLang(lang === "id" ? "en" : "id") },
      { id: "mobile", icon: Smartphone, label: t("Buka aplikasi warga", "Open resident app"), hint: "/mobile", run: () => router.push("/mobile") },
      { id: "out", icon: LogOut, label: t("Keluar", "Sign out"), hint: "", run: () => { signOut(); import("@/lib/auth").then((m) => m.operatorSignOut()); router.replace("/app/login"); } },
    ],
    [items, t, go, setLevel, lang, setLang, router, signOut],
  );
  const list = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const run = (i: number) => {
    const c = list[i];
    if (!c) return;
    c.run();
    close();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-start justify-center bg-night/40 px-4 pt-[14vh] backdrop-blur-sm" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <motion.div initial={{ y: -10, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, scale: 0.97 }} transition={spring} className="w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-black/5" role="dialog" aria-label={t("Perintah", "Commands")}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
              if (e.key === "Enter") run(idx);
              if (e.key === "Escape") close();
            }}
            placeholder={t("Ketik perintah atau halaman…", "Type a command or page…")}
            className="h-14 flex-1 bg-transparent text-[15px] outline-none"
          />
          <kbd className="rounded bg-sand px-1.5 font-mono text-[10.5px] text-muted">esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {list.map((c, i) => (
            <li key={c.id}>
              <button onMouseEnter={() => setIdx(i)} onClick={() => run(i)} className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px]">
                {i === idx && <motion.span layoutId="cmd-hl" className="absolute inset-0 rounded-xl bg-peach/60" transition={spring} />}
                <c.icon className="relative h-4 w-4 text-maroon" />
                <span className="relative flex-1 text-ink">{c.label}</span>
                <span className="relative text-[11.5px] text-muted">{c.hint}</span>
                {i === idx && <CornerDownLeft className="relative h-3.5 w-3.5 text-muted" />}
              </button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-6 text-center text-[13px] text-muted">{t("Tidak ada hasil", "No results")}</li>}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/** DEMO / LIVE indicator; live mode also starts from the official PVMBG level once */
function ModeBadge() {
  const { t } = useT();
  const mode = useDataMode();
  const operator = useApp((s) => !!s.session?.uid);
  const official = useOfficialLevel();
  const setLevel = useApp((s) => s.setLevel);
  const synced = useRef(false);
  useEffect(() => {
    if (official && !synced.current) {
      synced.current = true;
      setLevel(official);
    }
  }, [official, setLevel]);
  if (mode === "demo") return <span className="rounded-full bg-ember/15 px-1.5 py-px text-[10.5px] font-semibold uppercase tracking-wide text-[#b4500f]" title={t("Data contoh, tidak tersimpan", "Sample data, nothing is saved")}>Demo</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf/12 px-1.5 py-px text-[10.5px] font-semibold uppercase tracking-wide text-leaf" title={operator ? t("Operator: perubahan tersimpan", "Operator: changes are saved") : t("Hanya lihat", "View only")}>
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-current" /></span>
      Live{operator ? "" : ` · ${t("lihat", "view")}`}
    </span>
  );
}
