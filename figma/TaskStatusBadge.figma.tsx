/**
 * Code Connect: TaskStatusBadge
 *
 * Figma component setup:
 *   - Component name: "TaskStatusBadge"
 *   - Variant property: "Status" with values:
 *     "Executing", "Done", "Failed", "Pending"
 */

import figma from "@figma/code-connect"
import { TaskStatusBadge } from "@/components/lattice/TaskStatusBadge"
import type { TaskStatusValue } from "@/lib/types"

figma.connect(
  TaskStatusBadge,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-90",
  {
    props: {
      status: figma.enum<TaskStatusValue>("Status", {
        Executing: "STATUS_EXECUTING",
        Done: "STATUS_DONE_OK",
        Failed: "STATUS_DONE_NOT_OK",
        Pending: "STATUS_PENDING",
      }),
    },
    example: ({ status }) => <TaskStatusBadge status={status} />,
  }
)
