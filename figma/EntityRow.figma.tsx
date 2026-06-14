/**
 * Code Connect: EntityRow
 *
 * Figma component setup:
 *   - Component name: "EntityRow"
 *   - Nested instances: "DispositionBadge", "TemplateBadge", "LiveBadge"
 *   - Text layers: "Name", "EntityId", "Latitude", "Longitude", "DataType", "UpdatedAt"
 */

import figma from "@figma/code-connect"
import { EntityRow } from "@/components/lattice/EntityRow"
import type { Entity } from "@/lib/types"

figma.connect(
  EntityRow,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      // EntityRow takes a full Entity object. Map key display fields:
      name: figma.string("Name"),
    },
    example: ({ name }) => (
      <EntityRow
        entity={{
          entity_id: "asset-01",
          aliases: { name },
          is_live: true,
          expiry_time: new Date().toISOString(),
          mil_view: { disposition: "DISPOSITION_FRIENDLY", environment: "ENVIRONMENT_SURFACE" },
          ontology: { template: "TEMPLATE_ASSET", platform_type: "USV" },
          location: { position: { latitude_degrees: 1.0, longitude_degrees: 1.0 } },
          provenance: {
            data_type: "Simulated Asset",
            integration_name: "auto-reconnaissance-sample-app",
            source_update_time: new Date().toISOString(),
          },
        } satisfies Entity}
      />
    ),
  }
)
