import figma from "@figma/code-connect"
import { MetricCard } from "@/components/lattice/MetricCard"

figma.connect(
  MetricCard,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-255",
  {
    props: {
      highlight: figma.enum("Highlight", {
        Default:     false,
        Highlighted: true,
      }),
    },
    example: ({ highlight }) => (
      <MetricCard
        label="ACTIVE TASKS"
        value={1}
        sublabel="STATUS_EXECUTING"
        highlight={highlight}
      />
    ),
  }
)
