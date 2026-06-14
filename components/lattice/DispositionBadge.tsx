import { cn } from "@/lib/utils"
import { DISPOSITION_COLORS, DISPOSITION_LABELS } from "@/lib/tokens"
import type { Disposition } from "@/lib/types"

interface DispositionBadgeProps {
  disposition: Disposition
  className?: string
}

export function DispositionBadge({ disposition, className }: DispositionBadgeProps) {
  const colors = DISPOSITION_COLORS[disposition]
  const label = DISPOSITION_LABELS[disposition]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5",
        colors.bg,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colors.dot)} />
      <span className={cn("text-[10px] font-semibold uppercase tracking-wide leading-none", colors.text)}>
        {label}
      </span>
    </span>
  )
}
