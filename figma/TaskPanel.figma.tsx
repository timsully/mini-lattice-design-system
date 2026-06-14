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
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {},
    example: () => <TaskPanel tasks={MOCK_TASKS} />,
  }
)
