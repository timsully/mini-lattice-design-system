import { cn } from "@/lib/utils"
import { DISTANCE_THRESHOLD_MILES } from "@/lib/tokens"
import type { ProximityEvent } from "@/lib/types"

interface ProximityAlertProps extends ProximityEvent {
  className?: string
}

export function ProximityAlert({ asset, track, distance_miles, className }: ProximityAlertProps) {
  const isWithinThreshold = distance_miles <= DISTANCE_THRESHOLD_MILES

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-sm border px-3 py-2.5",
        isWithinThreshold
          ? "border-suspicious/40 bg-suspicious/5"
          : "border-border bg-card",
        className
      )}
    >
      <span
        className={cn(
          "mt-0.5 text-base leading-none shrink-0",
          isWithinThreshold ? "text-suspicious" : "text-ghost"
        )}
        aria-hidden
      >
        ⚠
      </span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-semibold text-ink">{asset.aliases.name}</span>
          <span className="text-ghost">within range of</span>
          <span className="font-semibold text-suspicious">{track.aliases.name}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-ghost">
          <span>
            Distance:{" "}
            <span className={cn("font-semibold", isWithinThreshold ? "text-suspicious" : "text-dim")}>
              {distance_miles.toFixed(2)} mi
            </span>
          </span>
          <span>
            Threshold:{" "}
            <span className="text-dim">{DISTANCE_THRESHOLD_MILES} mi</span>
          </span>
        </div>
      </div>
    </div>
  )
}
