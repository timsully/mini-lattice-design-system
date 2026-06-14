import { cn } from "@/lib/utils"
import type { OntologyTemplate } from "@/lib/types"

interface TemplateBadgeProps {
  template: OntologyTemplate
  platformType?: string
  className?: string
}

const TEMPLATE_CONFIG: Record<OntologyTemplate, { label: string; classes: string }> = {
  TEMPLATE_ASSET: {
    label: "Asset",
    classes: "bg-assumed/10 text-assumed",
  },
  TEMPLATE_TRACK: {
    label: "Track",
    classes: "bg-suspicious/10 text-suspicious",
  },
}

export function TemplateBadge({ template, platformType, className }: TemplateBadgeProps) {
  const config = TEMPLATE_CONFIG[template]
  const display = platformType ? `${config.label} · ${platformType}` : config.label

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        config.classes,
        className
      )}
    >
      {display}
    </span>
  )
}
