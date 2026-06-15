/**
 * Code Connect: TaskPanel
 *
 * Figma component setup:
 *   - Component name: "TaskPanel"
 *   - Contains repeated "TaskRow" instances
 *   - Shows "Active" count in header
 */

import figma from "@figma/code-connect"
import { TaskPanel } from "@/components/lattice/TaskPanel"
import { MOCK_TASKS } from "@/lib/mock-data"

figma.connect(
  TaskPanel,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-2238",
  {
    props: {},
    example: () => <TaskPanel tasks={MOCK_TASKS} />,
  }
)
