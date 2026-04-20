import { Lock } from "lucide-react";

export function LockedOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-[1px] rounded-lg">
      <div className="w-10 h-10 rounded-full bg-ink-1/10 flex items-center justify-center text-ink-2">
        <Lock size={18}/>
      </div>
      <div className="text-cap-md text-ink-2 font-medium text-center max-w-[260px]">{message}</div>
    </div>
  );
}
