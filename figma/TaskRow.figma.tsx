/**
 * Code Connect: TaskRow
 *
 * Figma component setup:
 *   - Component name: "TaskRow"
 *   - Nested instance: "TaskStatusBadge"
 *   - Text layers: "TaskName", "TaskId", "Assignee", "Target", "Description", "Author"
 */

import figma from "@figma/code-connect"
import { TaskRow } from "@/components/lattice/TaskRow"
import type { Task, TaskStatusValue } from "@/lib/types"

figma.connect(
  TaskRow,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-221",
  {
    props: {
      status: figma.enum<TaskStatusValue>("Status", {
        Executing: "STATUS_EXECUTING",
        Done: "STATUS_DONE_OK",
        Failed: "STATUS_DONE_NOT_OK",
        Pending: "STATUS_PENDING",
      }),
    },
    example: ({ status }) => (
      <TaskRow
        task={{
          task_id: "c7d8e9f0",
          description: "Asset asset-01 tasked to perform ISR on Track track-abc",
          specification_type: "type.googleapis.com/anduril.tasks.v2.Investigate",
          objective_entity_id: "track-abc",
          author_service: "auto-reconnaissance",
          assignee_entity_id: "asset-01",
          status,
        } satisfies Task}
      />
    ),
  }
)
