/**
 * Code Connect: LiveBadge
 *
 * Figma component setup:
 *   - Component name: "LiveBadge"
 *   - Boolean variant property: "IsLive"
 */

import figma from "@figma/code-connect"
import { LiveBadge } from "@/components/lattice/LiveBadge"

figma.connect(
  LiveBadge,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      isLive: figma.boolean("IsLive"),
    },
    example: ({ isLive }) => <LiveBadge isLive={isLive} />,
  }
)
