/**
 * Code Connect: SystemLog
 *
 * Figma component setup:
 *   - Component name: "SystemLog"
 *   - Contains repeated "SystemLogEntry" instances
 *   - Shows entry count in header
 */

import figma from "@figma/code-connect"
import { SystemLog } from "@/components/lattice/SystemLog"
import { MOCK_LOG_ENTRIES } from "@/lib/mock-data"

figma.connect(
  SystemLog,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {},
    example: () => <SystemLog entries={MOCK_LOG_ENTRIES} />,
  }
)
