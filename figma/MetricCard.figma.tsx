/**
 * Code Connect: MetricCard
 *
 * Figma component setup:
 *   - Component name: "MetricCard"
 *   - Text layers: "Label", "Value", "Sublabel"
 *   - Boolean variant property: "Highlight"
 */

import figma from "@figma/code-connect"
import { MetricCard } from "@/components/lattice/MetricCard"

figma.connect(
  MetricCard,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      label: figma.string("Label"),
      value: figma.string("Value"),
      sublabel: figma.string("Sublabel"),
      highlight: figma.boolean("Highlight"),
    },
    example: ({ label, value, sublabel, highlight }) => (
      <MetricCard label={label} value={value} sublabel={sublabel} highlight={highlight} />
    ),
  }
)
