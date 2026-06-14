import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DispositionBadge } from "@/components/lattice/DispositionBadge"

const meta: Meta<typeof DispositionBadge> = {
  title: "Lattice/DispositionBadge",
  component: DispositionBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disposition: {
      control: "select",
      options: [
        "DISPOSITION_FRIENDLY",
        "DISPOSITION_ASSUMED_FRIENDLY",
        "DISPOSITION_SUSPICIOUS",
        "DISPOSITION_HOSTILE",
        "DISPOSITION_UNKNOWN",
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof DispositionBadge>

export const Friendly: Story = { args: { disposition: "DISPOSITION_FRIENDLY" } }
export const AssumedFriendly: Story = { args: { disposition: "DISPOSITION_ASSUMED_FRIENDLY" } }
export const Suspicious: Story = { args: { disposition: "DISPOSITION_SUSPICIOUS" } }
export const Hostile: Story = { args: { disposition: "DISPOSITION_HOSTILE" } }
export const Unknown: Story = { args: { disposition: "DISPOSITION_UNKNOWN" } }

export const AllDispositions: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-4 bg-panel rounded">
      <DispositionBadge disposition="DISPOSITION_FRIENDLY" />
      <DispositionBadge disposition="DISPOSITION_ASSUMED_FRIENDLY" />
      <DispositionBadge disposition="DISPOSITION_SUSPICIOUS" />
      <DispositionBadge disposition="DISPOSITION_HOSTILE" />
      <DispositionBadge disposition="DISPOSITION_UNKNOWN" />
    </div>
  ),
}
