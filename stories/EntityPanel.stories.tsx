import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { EntityPanel } from "@/components/lattice/EntityPanel"
import { MOCK_ENTITIES } from "@/lib/mock-data"

const meta: Meta<typeof EntityPanel> = {
  title: "Lattice/EntityPanel",
  component: EntityPanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    filter: {
      control: "select",
      options: ["all", "TEMPLATE_ASSET", "TEMPLATE_TRACK"],
    },
  },
}
export default meta
type Story = StoryObj<typeof EntityPanel>

export const All: Story = {
  args: { entities: MOCK_ENTITIES, filter: "all" },
  decorators: [(Story) => <div className="h-[500px] w-[300px]"><Story /></div>],
}

export const AssetsOnly: Story = {
  args: { entities: MOCK_ENTITIES, filter: "TEMPLATE_ASSET" },
  decorators: [(Story) => <div className="h-[500px] w-[300px]"><Story /></div>],
}

export const TracksOnly: Story = {
  args: { entities: MOCK_ENTITIES, filter: "TEMPLATE_TRACK" },
  decorators: [(Story) => <div className="h-[500px] w-[300px]"><Story /></div>],
}
