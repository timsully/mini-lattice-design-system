import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TaskStatusBadge } from "@/components/lattice/TaskStatusBadge"

const meta: Meta<typeof TaskStatusBadge> = {
  title: "Lattice/TaskStatusBadge",
  component: TaskStatusBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["STATUS_EXECUTING", "STATUS_DONE_OK", "STATUS_DONE_NOT_OK", "STATUS_PENDING"],
    },
  },
}
export default meta
type Story = StoryObj<typeof TaskStatusBadge>

export const Executing: Story = { args: { status: "STATUS_EXECUTING" } }
export const DoneOk: Story = { args: { status: "STATUS_DONE_OK" } }
export const DoneNotOk: Story = { args: { status: "STATUS_DONE_NOT_OK" } }
export const Pending: Story = { args: { status: "STATUS_PENDING" } }

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-4 bg-panel rounded">
      <TaskStatusBadge status="STATUS_EXECUTING" />
      <TaskStatusBadge status="STATUS_DONE_OK" />
      <TaskStatusBadge status="STATUS_DONE_NOT_OK" />
      <TaskStatusBadge status="STATUS_PENDING" />
    </div>
  ),
}
