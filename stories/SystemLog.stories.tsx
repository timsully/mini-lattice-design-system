import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SystemLog } from "@/components/lattice/SystemLog"
import { MOCK_LOG_ENTRIES } from "@/lib/mock-data"

const meta: Meta<typeof SystemLog> = {
  title: "Lattice/SystemLog",
  component: SystemLog,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof SystemLog>

export const WithEntries: Story = {
  args: { entries: MOCK_LOG_ENTRIES },
  decorators: [(Story) => <div className="h-80"><Story /></div>],
}

export const Empty: Story = {
  args: { entries: [] },
  decorators: [(Story) => <div className="h-40"><Story /></div>],
}
