import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ProximityAlert } from "@/components/lattice/ProximityAlert"
import { MOCK_PROXIMITY, MOCK_ENTITIES } from "@/lib/mock-data"
import { DISTANCE_THRESHOLD_MILES } from "@/lib/tokens"

const meta: Meta<typeof ProximityAlert> = {
  title: "Lattice/ProximityAlert",
  component: ProximityAlert,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof ProximityAlert>

export const WithinRange: Story = {
  args: MOCK_PROXIMITY,
}

export const OutsideRange: Story = {
  args: {
    asset: MOCK_ENTITIES[0],
    track: MOCK_ENTITIES[2],
    distance_miles: DISTANCE_THRESHOLD_MILES + 1.5,
  },
}
