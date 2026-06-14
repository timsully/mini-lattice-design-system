import { cn } from "@/lib/utils"
import { TaskStatusBadge } from "./TaskStatusBadge"
import type { Task } from "@/lib/types"

interface TaskRowProps {
  task: Task
  className?: string
}

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

export function TaskRow({ task, className }: TaskRowProps) {
  const {
    task_id,
    description,
    status,
    assignee_entity_id,
    objective_entity_id,
    author_service,
    specification_type,
  } = task

  const taskName = specification_type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? "Task"

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-sm border border-border bg-card px-3 py-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TaskStatusBadge status={status} />
          <span className="text-sm font-semibold text-ink">{taskName}</span>
        </div>
        <span className="text-[10px] text-ghost font-mono shrink-0">
          {truncateId(task_id)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-dim">
        <span className="text-ghost truncate max-w-[100px]">{assignee_entity_id}</span>
        <span className="text-ghost">→</span>
        <span className="text-suspicious truncate max-w-[100px]">{objective_entity_id}</span>
      </div>

      <p className="text-[11px] text-ghost leading-relaxed line-clamp-2">{description}</p>

      <div className="text-[10px] text-ghost">
        Initiated by <span className="text-dim">{author_service}</span>
      </div>
    </div>
  )
}
