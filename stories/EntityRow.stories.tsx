import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { EntityRow } from "@/components/lattice/EntityRow"
import { MOCK_ENTITIES } from "@/lib/mock-data"

const meta: Meta<typeof EntityRow> = {
  title: "Lattice/EntityRow",
  component: EntityRow,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof EntityRow>

export const FriendlyAsset: Story = { args: { entity: MOCK_ENTITIES[0] } }
export const AssumedFriendlyAsset: Story = { args: { entity: MOCK_ENTITIES[1] } }
export const SuspiciousTrack: Story = { args: { entity: MOCK_ENTITIES[2] } }

export const AllEntityTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-1 p-4 bg-panel w-[320px] rounded">
      {MOCK_ENTITIES.map((e) => (
        <EntityRow key={e.entity_id} entity={e} />
      ))}
    </div>
  ),
}
