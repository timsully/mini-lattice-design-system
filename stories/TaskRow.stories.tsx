import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TaskRow } from "@/components/lattice/TaskRow"
import { MOCK_TASKS } from "@/lib/mock-data"
import type { Task } from "@/lib/types"

const meta: Meta<typeof TaskRow> = {
  title: "Lattice/TaskRow",
  component: TaskRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof TaskRow>

export const Executing: Story = { args: { task: MOCK_TASKS[0] } }

export const DoneOk: Story = {
  args: {
    task: { ...MOCK_TASKS[0], task_id: "a1b2c3d4", status: "STATUS_DONE_OK" } satisfies Task,
  },
}

export const DoneNotOk: Story = {
  args: {
    task: { ...MOCK_TASKS[0], task_id: "e5f6a7b8", status: "STATUS_DONE_NOT_OK" } satisfies Task,
  },
}

export const Pending: Story = {
  args: {
    task: { ...MOCK_TASKS[0], task_id: "c9d0e1f2", status: "STATUS_PENDING" } satisfies Task,
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-1 p-4 bg-panel w-[320px] rounded">
      <TaskRow task={MOCK_TASKS[0]} />
      <TaskRow task={{ ...MOCK_TASKS[0], task_id: "a1b2c3d4", status: "STATUS_DONE_OK" }} />
      <TaskRow task={{ ...MOCK_TASKS[0], task_id: "e5f6a7b8", status: "STATUS_DONE_NOT_OK" }} />
      <TaskRow task={{ ...MOCK_TASKS[0], task_id: "c9d0e1f2", status: "STATUS_PENDING" }} />
    </div>
  ),
}
