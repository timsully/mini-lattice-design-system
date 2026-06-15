import figma from "@figma/code-connect"
import { EntityRow } from "@/components/lattice/EntityRow"
import { MOCK_ENTITIES } from "@/lib/mock-data"

figma.connect(
  EntityRow,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-1945",
  {
    props: {
      entity: figma.enum("Entity", {
        FriendlyAsset:        MOCK_ENTITIES[0],
        AssumedFriendlyAsset: MOCK_ENTITIES[1],
        SuspiciousTrack:      MOCK_ENTITIES[2],
      }),
    },
    example: ({ entity }) => <EntityRow entity={entity} />,
  }
)
