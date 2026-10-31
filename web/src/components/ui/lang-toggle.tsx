"use client";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function LangToggle({ dark }: { dark?: boolean }) {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  return (
    <div className={cn("label flex rounded-full p-0.5", dark ? "bg-white/8 ring-1 ring-white/10" : "bg-sand-2 ring-1 ring-line")} role="group" aria-label="Language">
      {(["id", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 !text-[10px] transition",
            lang === l ? (dark ? "bg-bone text-night" : "bg-maroon text-white") : dark ? "text-bone/60 hover:text-bone" : "text-muted hover:text-ink",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Light/dark switch; the class on <html> is restored before paint by the script in layout.tsx */
export function ThemeToggle({ dark }: { dark?: boolean }) {
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "Dark mode" : "Light mode"}
      className={cn("relative flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-full transition", dark ? "bg-white/8 text-bone ring-1 ring-white/10 hover:bg-white/15" : "bg-sand-2 text-wine ring-1 ring-line hover:bg-sand")}
    >
      <Sun className={cn("absolute h-4 w-4 transition duration-300", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
      <Moon className={cn("absolute h-4 w-4 transition duration-300", theme === "dark" ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")} />
    </button>
  );
}
