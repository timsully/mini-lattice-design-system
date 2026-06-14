import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LiveBadge } from "@/components/lattice/LiveBadge"

const meta: Meta<typeof LiveBadge> = {
  title: "Lattice/LiveBadge",
  component: LiveBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    isLive: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof LiveBadge>

export const Live: Story = { args: { isLive: true } }
export const Expired: Story = { args: { isLive: false } }

export const BothStates: Story = {
  render: () => (
    <div className="flex gap-2 p-4 bg-panel rounded">
      <LiveBadge isLive={true} />
      <LiveBadge isLive={false} />
    </div>
  ),
}
