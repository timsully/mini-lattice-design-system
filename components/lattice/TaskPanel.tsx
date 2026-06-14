import { cn } from "@/lib/utils"
import { TaskRow } from "./TaskRow"
import type { Task } from "@/lib/types"

interface TaskPanelProps {
  tasks: Task[]
  className?: string
}

export function TaskPanel({ tasks, className }: TaskPanelProps) {
  const active = tasks.filter((t) => t.status === "STATUS_EXECUTING" || t.status === "STATUS_PENDING")

  return (
    <div className={cn("flex flex-col h-full bg-panel border border-border rounded-sm", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ghost">
          Active Tasks
        </h2>
        <span className="text-[10px] text-ghost">
          <span className="text-executing font-semibold">{active.length}</span> active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[11px] text-ghost">
            No tasks
          </div>
        ) : (
          <div className="flex flex-col gap-px p-2">
            {tasks.map((task) => (
              <TaskRow key={task.task_id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
