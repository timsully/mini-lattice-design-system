import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { MetricCard } from "@/components/lattice/MetricCard"

const meta: Meta<typeof MetricCard> = {
  title: "Lattice/MetricCard",
  component: MetricCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    highlight: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof MetricCard>

export const Default: Story = { args: { label: "Assets", value: 2, sublabel: "TEMPLATE_ASSET" } }
export const Highlighted: Story = {
  args: { label: "Active Tasks", value: 1, sublabel: "STATUS_EXECUTING", highlight: true },
}

export const DashboardRow: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-px bg-border">
      <MetricCard label="Assets" value={2} sublabel="TEMPLATE_ASSET" />
      <MetricCard label="Tracks" value={1} sublabel="TEMPLATE_TRACK" />
      <MetricCard label="Active Tasks" value={1} sublabel="STATUS_EXECUTING" highlight />
      <MetricCard label="Distance Threshold" value="5 mi" sublabel="Proximity trigger" />
    </div>
  ),
}
