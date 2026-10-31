"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Sticky table of contents with scroll-spy */
export function DocsNav({ groups }: { groups: { title: string; items: { id: string; label: string }[] }[] }) {
  const [active, setActive] = useState(groups[0]?.items[0]?.id);
  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const on = () => {
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [groups]);
  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 lg:block" aria-label="Docs">
      {groups.map((g) => (
        <div key={g.title} className="mb-6">
          <p className="label mb-2 text-maroon/60">{g.title}</p>
          <ul className="space-y-0.5 border-l border-line">
            {g.items.map((i) => (
              <li key={i.id} className="relative">
                {active === i.id && <motion.span layoutId="docs-active" className="absolute -left-px top-0 h-full w-0.5 bg-maroon" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <a href={`#${i.id}`} className={cn("block py-1.5 pl-4 text-[13.5px] transition", active === i.id ? "font-medium text-wine" : "text-muted hover:text-ink")}>{i.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
