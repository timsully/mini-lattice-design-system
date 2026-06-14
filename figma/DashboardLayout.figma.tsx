/**
 * Code Connect: DashboardLayout
 *
 * Figma component setup:
 *   - Component name: "DashboardLayout"
 *   - Frame with 3 slot regions: header, metrics row, main content
 *   - Main content splits into 3 columns: EntityPanel | center | TaskPanel
 */

import figma from "@figma/code-connect"
import { DashboardLayout } from "@/components/lattice/DashboardLayout"
import { MetricCard, EntityPanel, TaskPanel, SystemLog } from "@/components/lattice"
import { MOCK_ENTITIES, MOCK_TASKS, MOCK_LOG_ENTRIES } from "@/lib/mock-data"
import { DISTANCE_THRESHOLD_MILES } from "@/lib/tokens"

figma.connect(
  DashboardLayout,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {},
    example: () => (
      <DashboardLayout
        header={<span className="text-sm font-semibold text-ink">EARS — Entity Auto Reconnaissance System</span>}
        metrics={
          <>
            <MetricCard label="Assets" value={2} sublabel="TEMPLATE_ASSET" />
            <MetricCard label="Tracks" value={1} sublabel="TEMPLATE_TRACK" />
            <MetricCard label="Active Tasks" value={1} sublabel="STATUS_EXECUTING" highlight />
            <MetricCard label="Distance Threshold" value={`${DISTANCE_THRESHOLD_MILES} mi`} sublabel="Proximity trigger" />
          </>
        }
      >
        <div className="grid grid-cols-[300px_1fr_300px] h-full">
          <EntityPanel entities={MOCK_ENTITIES} />
          <SystemLog entries={MOCK_LOG_ENTRIES} />
          <TaskPanel tasks={MOCK_TASKS} />
        </div>
      </DashboardLayout>
    ),
  }
)
