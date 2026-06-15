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
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-418",
  {
    props: {},
    example: () => <SystemLog entries={MOCK_LOG_ENTRIES} />,
  }
)
