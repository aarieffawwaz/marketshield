import { cn } from "@/lib/utils";

/** Android-style device shell; children fill a 9:20 screen */
export function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative aspect-[9/19.6] rounded-[2.6rem] bg-[#141012] p-[10px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10", className)}>
      <span className="absolute -right-[3px] top-[22%] h-14 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <span className="absolute -right-[3px] top-[34%] h-20 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
      <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-[#fff8f3]">
        <span className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black" aria-hidden />
        {children}
      </div>
    </div>
  );
}
