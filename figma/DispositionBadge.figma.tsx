/**
 * Code Connect: DispositionBadge
 *
 * After publishing your Figma design system:
 * 1. Open the Figma file and select the DispositionBadge component
 * 2. Right-click → Copy link to selection
 * 3. Replace https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-66 below with that URL
 *
 * Figma component setup:
 *   - Component name: "DispositionBadge"
 *   - Variant property: "Disposition" with values:
 *     "Friendly", "Assumed Friendly", "Suspicious", "Hostile", "Unknown"
 *   - Text layer: "Label"
 */

import figma from "@figma/code-connect"
import { DispositionBadge } from "@/components/lattice/DispositionBadge"
import type { Disposition } from "@/lib/types"

figma.connect(
  DispositionBadge,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-66",
  {
    props: {
      disposition: figma.enum<Disposition>("Disposition", {
        Friendly: "DISPOSITION_FRIENDLY",
        "Assumed Friendly": "DISPOSITION_ASSUMED_FRIENDLY",
        Suspicious: "DISPOSITION_SUSPICIOUS",
        Hostile: "DISPOSITION_HOSTILE",
        Unknown: "DISPOSITION_UNKNOWN",
      }),
    },
    example: ({ disposition }) => <DispositionBadge disposition={disposition} />,
  }
)
