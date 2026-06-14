import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TaskPanel } from "@/components/lattice/TaskPanel"
import { MOCK_TASKS } from "@/lib/mock-data"

const meta: Meta<typeof TaskPanel> = {
  title: "Lattice/TaskPanel",
  component: TaskPanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof TaskPanel>

export const WithTasks: Story = {
  args: { tasks: MOCK_TASKS },
  decorators: [(Story) => <div className="h-[400px] w-[300px]"><Story /></div>],
}

export const Empty: Story = {
  args: { tasks: [] },
  decorators: [(Story) => <div className="h-[200px] w-[300px]"><Story /></div>],
}
