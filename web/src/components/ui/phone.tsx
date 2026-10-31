import Image from "next/image";
import { cn } from "@/lib/utils";

const SCREEN_BG = "#fef8f3";

/**
 * Android-style device shell with an even bezel. The screen keeps the exact 1080:2424
 * capture aspect so screenshots are never cropped. No synthetic status or gesture bar:
 * some captures already include the device's own, and drawing a second one doubles it.
 */
export function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-[2.5rem] bg-[#141012] p-[9px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10", className)}>
      <span className="absolute -right-[3px] top-[22%] h-14 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <span className="absolute -right-[3px] top-[34%] h-20 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem]" style={{ background: SCREEN_BG }}>
        <div className="relative aspect-[1080/2424] w-full">{children}</div>
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
