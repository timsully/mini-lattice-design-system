import { cn } from "@/lib/utils"
import type { SystemLogEntryData } from "@/lib/types"

type SystemLogEntryProps = SystemLogEntryData & { className?: string }

const LEVEL_STYLES = {
  INFO: "text-dim",
  WARN: "text-suspicious",
  ERROR: "text-hostile",
}

const LOGGER_STYLES: Record<string, string> = {
  EARS: "text-assumed",
  SIMASSET: "text-friendly",
  SIMTRACK: "text-suspicious",
}

export function SystemLogEntry({ level, logger, message, timestamp, className }: SystemLogEntryProps) {
  return (
    <div
      className={cn("flex items-start gap-2 text-[11px] font-mono leading-relaxed px-3 py-0.5 hover:bg-elevated/50", className)}
    >
      <span className="text-ghost shrink-0 tabular-nums">
        {timestamp.toLocaleTimeString("en-US", { hour12: false })}
      </span>
      <span className={cn("shrink-0 font-semibold uppercase w-5", LEVEL_STYLES[level])}>
        {level[0]}
      </span>
      <span className={cn("shrink-0 font-semibold", LOGGER_STYLES[logger] ?? "text-dim")}>
        {logger}:
      </span>
      <span className="text-dim break-all">{message}</span>
    </div>
  )
}
