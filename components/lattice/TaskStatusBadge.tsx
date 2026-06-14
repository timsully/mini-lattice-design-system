import { cn } from "@/lib/utils"
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/tokens"
import type { TaskStatusValue } from "@/lib/types"

interface TaskStatusBadgeProps {
  status: TaskStatusValue
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const colors = TASK_STATUS_COLORS[status]
  const label = TASK_STATUS_LABELS[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        colors.bg,
        colors.text,
        className
      )}
    >
      {label}
    </span>
  )
}
