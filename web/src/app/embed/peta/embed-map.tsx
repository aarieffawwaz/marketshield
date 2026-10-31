"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RealMap } from "@/components/map/real-map";

function Inner() {
  const q = useSearchParams();
  const sim = q.get("sim") === "1";
  return <RealMap start={q.get("start") === "indonesia" ? "indonesia" : "semeru"} autoSim={sim} className="h-[100dvh] w-full" />;
}

export function EmbedMap() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-night">
      <Suspense fallback={<div className="h-full w-full bg-night" />}>
        <Inner />
      </Suspense>
    </main>
  );
}
