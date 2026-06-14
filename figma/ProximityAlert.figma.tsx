/**
 * Code Connect: ProximityAlert
 *
 * Figma component setup:
 *   - Component name: "ProximityAlert"
 *   - Boolean variant property: "WithinRange"
 *   - Text layers: "AssetName", "TrackName", "Distance", "Threshold"
 */

import figma from "@figma/code-connect"
import { ProximityAlert } from "@/components/lattice/ProximityAlert"
import { MOCK_ENTITIES, MOCK_PROXIMITY } from "@/lib/mock-data"

figma.connect(
  ProximityAlert,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      withinRange: figma.boolean("WithinRange"),
    },
    example: ({ withinRange }) => (
      <ProximityAlert
        asset={MOCK_ENTITIES[0]}
        track={MOCK_ENTITIES[2]}
        distance_miles={withinRange ? MOCK_PROXIMITY.distance_miles : 7.5}
      />
    ),
  }
)
