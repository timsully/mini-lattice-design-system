import { cn } from "@/lib/utils"
import { EntityRow } from "./EntityRow"
import type { Entity, OntologyTemplate } from "@/lib/types"

type EntityFilter = "all" | OntologyTemplate

interface EntityPanelProps {
  entities: Entity[]
  filter?: EntityFilter
  className?: string
}

export function EntityPanel({ entities, filter = "all", className }: EntityPanelProps) {
  const filtered = filter === "all"
    ? entities
    : entities.filter((e) => e.ontology.template === filter)

  const assets = entities.filter((e) => e.ontology.template === "TEMPLATE_ASSET")
  const tracks = entities.filter((e) => e.ontology.template === "TEMPLATE_TRACK")

  return (
    <div className={cn("flex flex-col h-full bg-panel border border-border rounded-sm", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ghost">
          Entities
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-ghost">
          <span className="text-assumed">{assets.length} asset{assets.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span className="text-suspicious">{tracks.length} track{tracks.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[11px] text-ghost">
            No entities
          </div>
        ) : (
          <div className="flex flex-col gap-px p-2">
            {filtered.map((entity) => (
              <EntityRow key={entity.entity_id} entity={entity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
