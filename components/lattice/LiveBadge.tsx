import { cn } from "@/lib/utils"

interface LiveBadgeProps {
  isLive: boolean
  className?: string
}

export function LiveBadge({ isLive, className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        isLive
          ? "bg-friendly/10 text-friendly"
          : "bg-ghost/10 text-ghost",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isLive ? "bg-friendly" : "bg-ghost"
        )}
      />
      {isLive ? "Live" : "Expired"}
    </span>
  )
}
