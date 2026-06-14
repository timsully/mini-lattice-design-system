import { cn } from "@/lib/utils"
import { SystemLogEntry } from "./SystemLogEntry"
import type { SystemLogEntryData } from "@/lib/types"

interface SystemLogProps {
  entries: SystemLogEntryData[]
  className?: string
}

export function SystemLog({ entries, className }: SystemLogProps) {
  return (
    <div className={cn("flex flex-col h-full bg-panel border border-border rounded-sm", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ghost">
          System Log
        </h2>
        <span className="text-[10px] text-ghost">{entries.length} entries</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[11px] text-ghost">
            No log entries
          </div>
        ) : (
          <div className="flex flex-col py-1">
            {entries.map((entry) => (
              <SystemLogEntry key={entry.id} {...entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
