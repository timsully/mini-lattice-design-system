import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TemplateBadge } from "@/components/lattice/TemplateBadge"

const meta: Meta<typeof TemplateBadge> = {
  title: "Lattice/TemplateBadge",
  component: TemplateBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    template: {
      control: "select",
      options: ["TEMPLATE_ASSET", "TEMPLATE_TRACK"],
    },
  },
}
export default meta
type Story = StoryObj<typeof TemplateBadge>

export const Asset: Story = { args: { template: "TEMPLATE_ASSET" } }
export const AssetWithPlatformType: Story = { args: { template: "TEMPLATE_ASSET", platformType: "USV" } }
export const Track: Story = { args: { template: "TEMPLATE_TRACK" } }

export const AllTemplates: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-4 bg-panel rounded">
      <TemplateBadge template="TEMPLATE_ASSET" />
      <TemplateBadge template="TEMPLATE_ASSET" platformType="USV" />
      <TemplateBadge template="TEMPLATE_TRACK" />
    </div>
  ),
}
