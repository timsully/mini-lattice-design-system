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
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-81",
  {
    props: {
      isLive: figma.boolean("IsLive"),
    },
    example: ({ isLive }) => <LiveBadge isLive={isLive} />,
  }
)
