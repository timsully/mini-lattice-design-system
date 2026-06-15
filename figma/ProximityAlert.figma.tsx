import figma from "@figma/code-connect"
import { ProximityAlert } from "@/components/lattice/ProximityAlert"
import { MOCK_ENTITIES, MOCK_PROXIMITY } from "@/lib/mock-data"

figma.connect(
  ProximityAlert,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-246",
  {
    example: () => (
      <ProximityAlert
        asset={MOCK_ENTITIES[0]}
        track={MOCK_ENTITIES[2]}
        distance_miles={MOCK_PROXIMITY.distance_miles}
      />
    ),
  }
)
