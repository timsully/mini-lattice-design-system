import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: number | string
  sublabel?: string
  highlight?: boolean
  className?: string
}

export function MetricCard({ label, value, sublabel, highlight, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-sm border border-border bg-panel px-4 py-3",
        highlight && "border-accent/30",
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-widest text-ghost font-medium">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-bold leading-none tabular-nums",
          highlight ? "text-accent" : "text-ink"
        )}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-[10px] text-ghost">{sublabel}</span>
      )}
    </div>
  )
}
