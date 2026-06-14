import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SystemLogEntry } from "@/components/lattice/SystemLogEntry"
import { MOCK_LOG_ENTRIES } from "@/lib/mock-data"

const meta: Meta<typeof SystemLogEntry> = {
  title: "Lattice/SystemLogEntry",
  component: SystemLogEntry,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    level: { control: "select", options: ["INFO", "WARN", "ERROR"] },
    logger: { control: "select", options: ["EARS", "SIMASSET", "SIMTRACK"] },
  },
}
export default meta
type Story = StoryObj<typeof SystemLogEntry>

export const Info: Story = { args: { ...MOCK_LOG_ENTRIES[1] } }
export const Warn: Story = {
  args: {
    id: "w1",
    level: "WARN",
    logger: "EARS",
    message: "Task c7d8e9f0 status unknown — retrying",
    timestamp: new Date(),
  },
}
export const Error: Story = {
  args: {
    id: "e1",
    level: "ERROR",
    logger: "EARS",
    message: "lattice api stream entities error: connection refused",
    timestamp: new Date(),
  },
}

export const LogStream: Story = {
  render: () => (
    <div className="flex flex-col bg-panel rounded w-full">
      {MOCK_LOG_ENTRIES.map((entry) => (
        <SystemLogEntry key={entry.id} {...entry} />
      ))}
    </div>
  ),
}
