import {
  DashboardLayout,
  MetricCard,
  EntityPanel,
  TaskPanel,
  ProximityAlert,
  SystemLog,
} from "@/components/lattice"
import {
  MOCK_ENTITIES,
  MOCK_TASKS,
  MOCK_PROXIMITY,
  MOCK_LOG_ENTRIES,
} from "@/lib/mock-data"
import { DISTANCE_THRESHOLD_MILES } from "@/lib/tokens"

export default function EarsDashboard() {
  const assets = MOCK_ENTITIES.filter((e) => e.ontology.template === "TEMPLATE_ASSET")
  const tracks = MOCK_ENTITIES.filter((e) => e.ontology.template === "TEMPLATE_TRACK")
  const activeTasks = MOCK_TASKS.filter(
    (t) => t.status === "STATUS_EXECUTING" || t.status === "STATUS_PENDING"
  )

  return (
    <DashboardLayout
      header={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ghost">
              EARS
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="text-sm font-semibold text-ink">
              Entity Auto Reconnaissance System
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-friendly animate-pulse" />
            <span className="text-[10px] text-friendly uppercase tracking-wide font-semibold">
              Live
            </span>
          </div>
        </>
      }
      metrics={
        <>
          <MetricCard label="Assets" value={assets.length} sublabel="TEMPLATE_ASSET" />
          <MetricCard label="Tracks" value={tracks.length} sublabel="TEMPLATE_TRACK" />
          <MetricCard
            label="Active Tasks"
            value={activeTasks.length}
            sublabel="STATUS_EXECUTING"
            highlight={activeTasks.length > 0}
          />
          <MetricCard
            label="Distance Threshold"
            value={`${DISTANCE_THRESHOLD_MILES} mi`}
            sublabel="Proximity trigger"
          />
        </>
      }
    >
      <div className="grid grid-cols-[300px_1fr_300px] gap-px h-full bg-border">
        {/* Left: Entity list */}
        <div className="flex flex-col gap-px bg-canvas overflow-hidden">
          <EntityPanel entities={MOCK_ENTITIES} className="flex-1 rounded-none border-0 border-r border-border" />
        </div>

        {/* Center: Proximity alerts + system log */}
        <div className="flex flex-col gap-px bg-canvas overflow-hidden">
          <div className="flex flex-col gap-2 p-3 border-b border-border bg-panel shrink-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ghost">
              Proximity Alerts
            </h2>
            <ProximityAlert
              asset={MOCK_PROXIMITY.asset}
              track={MOCK_PROXIMITY.track}
              distance_miles={MOCK_PROXIMITY.distance_miles}
            />
          </div>
          <SystemLog
            entries={MOCK_LOG_ENTRIES}
            className="flex-1 rounded-none border-0"
          />
        </div>

        {/* Right: Task panel */}
        <div className="flex flex-col gap-px bg-canvas overflow-hidden">
          <TaskPanel
            tasks={MOCK_TASKS}
            className="flex-1 rounded-none border-0 border-l border-border"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
