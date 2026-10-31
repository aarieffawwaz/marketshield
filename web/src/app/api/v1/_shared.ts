import { NextResponse } from "next/server";
import type { Level } from "@/lib/data";

export const json = (data: unknown, init?: number) =>
  NextResponse.json(data, { status: init ?? 200, headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } });

export const parseLevel = (v: string | null, fallback: Level = 3): Level => {
  const n = Number(v);
  return n >= 1 && n <= 4 ? (n as Level) : fallback;
};
