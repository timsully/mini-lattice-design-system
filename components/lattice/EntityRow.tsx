import { cn } from "@/lib/utils"
import { DispositionBadge } from "./DispositionBadge"
import { TemplateBadge } from "./TemplateBadge"
import { LiveBadge } from "./LiveBadge"
import type { Entity } from "@/lib/types"

interface EntityRowProps {
  entity: Entity
  className?: string
}

export function EntityRow({ entity, className }: EntityRowProps) {
  const { aliases, entity_id, is_live, mil_view, ontology, location, provenance } = entity
  const { latitude_degrees, longitude_degrees } = location.position

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-sm border border-border bg-card px-3 py-2.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold text-ink truncate">{aliases.name}</span>
          <span className="text-[10px] text-ghost font-mono">
            ID: {entity_id}
          </span>
        </div>
        <LiveBadge isLive={is_live} className="shrink-0" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <TemplateBadge
          template={ontology.template}
          platformType={ontology.platform_type}
        />
        <DispositionBadge disposition={mil_view.disposition} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
        <span className="text-ghost uppercase tracking-wide">Location</span>
        <span className="text-ghost uppercase tracking-wide">Environment</span>
        <span className="text-dim font-mono">
          {latitude_degrees.toFixed(4)}°, {longitude_degrees.toFixed(4)}°
        </span>
        <span className="text-dim">{mil_view.environment.replace("ENVIRONMENT_", "")}</span>

        <span className="text-ghost uppercase tracking-wide">Data Type</span>
        <span className="text-ghost uppercase tracking-wide">Updated</span>
        <span className="text-dim">{provenance.data_type}</span>
        <span className="text-dim">
          {new Date(provenance.source_update_time).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
