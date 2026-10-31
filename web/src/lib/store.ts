"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Bi, Level } from "./data";

type Lang = "id" | "en";

export type Role = "bpbd" | "posko" | "donor";
export type Session = { name: string; initials: string; role: Role; title: Bi; org: string; email: string };

export const PEOPLE: Record<Role, Session> = {
  bpbd: { name: "Rizky Wardhana", initials: "RW", role: "bpbd", title: { id: "Operator Pusdalops", en: "Operations officer" }, org: "BPBD Kab. Lumajang", email: "rizky.w@bpbd-lumajang.go.id" },
  posko: { name: "Sari Wulandari", initials: "SW", role: "posko", title: { id: "Koordinator Posko Sumbermujur", en: "Sumbermujur post coordinator" }, org: "Desa Sumbermujur", email: "sari@sumbermujur.desa.id" },
  donor: { name: "Andi Pratama", initials: "AP", role: "donor", title: { id: "Distributor & donatur", en: "Distributor & donor" }, org: "Apotek Sehat Pasirian", email: "andi@apoteksehat.co.id" },
};

export type Theme = "light" | "dark";

type AppState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  level: Level;
  session: Session | null;
  hydrated: boolean;
  collapsed: boolean;
  setLang: (l: Lang) => void;
  setLevel: (l: Level) => void;
  signIn: (s: Session) => void;
  signOut: () => void;
  setCollapsed: (c: boolean) => void;
};

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export const useApp = create<AppState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    write("ms-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  lang: "id",
  level: 3,
  session: null,
  hydrated: false,
  collapsed: false,
  signIn: (session) => {
    write("ms-session", JSON.stringify(session));
    set({ session });
  },
  signOut: () => {
    try {
      localStorage.removeItem("ms-session");
    } catch {}
    set({ session: null });
  },
  setCollapsed: (collapsed) => {
    write("ms-collapsed", collapsed ? "1" : "0");
    set({ collapsed });
  },
  setLang: (lang) => {
    write("ms-lang", lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
  setLevel: (level) => {
    write("ms-level", String(level));
    set({ level });
  },
}));

/** Restores saved language and level after hydration */
export function StoreHydrator() {
  useEffect(() => {
    const lang = read("ms-lang");
    const level = Number(read("ms-level"));
    let session: Session | null = null;
    try {
      const raw = read("ms-session");
      const parsed = raw ? (JSON.parse(raw) as Session) : null;
      if (parsed && parsed.role in PEOPLE) session = PEOPLE[parsed.role];
    } catch {}
    useApp.setState({
      ...(lang === "en" || lang === "id" ? { lang } : {}),
      ...(level >= 1 && level <= 4 ? { level: level as Level } : {}),
      session,
      collapsed: read("ms-collapsed") === "1",
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      hydrated: true,
    });
  }, []);
  return null;
}

/** t("Indonesia", "English") or tx({ id, en }) */
export function useT() {
  const lang = useApp((s) => s.lang);
  const t = (id: string, en: string) => (lang === "en" ? en : id);
  const tx = (b: Bi) => b[lang];
  return { t, tx, lang };
}
