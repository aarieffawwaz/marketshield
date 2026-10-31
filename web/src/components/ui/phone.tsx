import Image from "next/image";
import { cn } from "@/lib/utils";

// App captures in /public/screens are 1080×2424 with no system status bar
const SCREEN_BG = "#fef8f3";

/**
 * Android-style device shell. The frame has an even bezel on all sides; inside it a
 * status bar (with the punch-hole camera) and a gesture strip frame the screen area, which
 * keeps the exact 1080:2424 capture aspect so screenshots are never cropped or pushed
 * against the rounded corners. Children fill the screen area (position: relative).
 */
export function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-[2.5rem] bg-[#141012] p-[9px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10", className)}>
      <span className="absolute -right-[3px] top-[22%] h-14 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <span className="absolute -right-[3px] top-[34%] h-20 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem]" style={{ background: SCREEN_BG }}>
        <div className="relative flex h-7 items-center justify-between px-6 font-sans text-[10.5px] font-semibold text-[#2a1a1c]" aria-hidden>
          <span className="tabular">09.41</span>
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <svg width="12" height="9" viewBox="0 0 12 9" fill="currentColor"><rect x="0" y="6" width="2" height="3" rx=".5" /><rect x="3.3" y="4" width="2" height="5" rx=".5" /><rect x="6.6" y="2" width="2" height="7" rx=".5" /><rect x="9.9" y="0" width="2" height="9" rx=".5" /></svg>
            <svg width="17" height="9" viewBox="0 0 17 9" fill="none"><rect x=".5" y=".5" width="14" height="8" rx="2" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="9.5" height="5" rx="1" fill="currentColor" /><rect x="15.3" y="3" width="1.2" height="3" rx=".5" fill="currentColor" opacity=".5" /></svg>
          </span>
        </div>
        <div className="relative aspect-[1080/2424] w-full">{children}</div>
        <div className="flex h-5 items-center justify-center" aria-hidden><span className="h-1 w-20 rounded-full bg-[#2a1a1c]/30" /></div>
      </div>
    </div>
  );
}

/** A Phone showing one capture from /public/screens */
export function PhoneShot({ src, alt = "", sizes = "280px", className, priority }: { src: string; alt?: string; sizes?: string; className?: string; priority?: boolean }) {
  return (
    <Phone className={className}>
      <Image src={`/screens/${src}.webp`} alt={alt} fill sizes={sizes} priority={priority} className="object-contain object-top" />
    </Phone>
  );
}
