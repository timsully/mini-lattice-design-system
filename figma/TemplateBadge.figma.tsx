/**
 * Code Connect: TemplateBadge
 *
 * Figma component setup:
 *   - Component name: "TemplateBadge"
 *   - Variant property: "Template" with values: "Asset", "Track"
 *   - Optional text layer: "PlatformType" (show only when Template = "Asset")
 */

import figma from "@figma/code-connect"
import { TemplateBadge } from "@/components/lattice/TemplateBadge"
import type { OntologyTemplate } from "@/lib/types"

figma.connect(
  TemplateBadge,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      template: figma.enum<OntologyTemplate>("Template", {
        Asset: "TEMPLATE_ASSET",
        Track: "TEMPLATE_TRACK",
      }),
      platformType: figma.string("PlatformType"),
    },
    example: ({ template, platformType }) => (
      <TemplateBadge template={template} platformType={platformType} />
    ),
  }
)
