/**
 * Code Connect: EntityPanel
 *
 * Figma component setup:
 *   - Component name: "EntityPanel"
 *   - Variant property: "Filter" with values: "All", "Assets", "Tracks"
 *   - Contains repeated "EntityRow" instances
 */

import figma from "@figma/code-connect"
import { EntityPanel } from "@/components/lattice/EntityPanel"
import { MOCK_ENTITIES } from "@/lib/mock-data"
import type { OntologyTemplate } from "@/lib/types"

figma.connect(
  EntityPanel,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-2207",
  {
    props: {
      filter: figma.enum<"all" | OntologyTemplate>("Filter", {
        All: "all",
        Assets: "TEMPLATE_ASSET",
        Tracks: "TEMPLATE_TRACK",
      }),
    },
    example: ({ filter }) => (
      <EntityPanel entities={MOCK_ENTITIES} filter={filter} />
    ),
  }
)
