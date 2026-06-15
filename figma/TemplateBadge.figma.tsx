import figma from "@figma/code-connect"
import { TemplateBadge } from "@/components/lattice/TemplateBadge"
import type { OntologyTemplate } from "@/lib/types"

figma.connect(
  TemplateBadge,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-74",
  {
    props: {
      template: figma.enum<OntologyTemplate>("Template", {
        Asset: "TEMPLATE_ASSET",
        AssetWithUSV: "TEMPLATE_ASSET",
        Track: "TEMPLATE_TRACK",
      }),
    },
    example: ({ template }) => (
      <TemplateBadge template={template} />
    ),
  }
)
