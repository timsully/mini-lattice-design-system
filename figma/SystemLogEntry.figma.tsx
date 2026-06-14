/**
 * Code Connect: SystemLogEntry
 *
 * Figma component setup:
 *   - Component name: "SystemLogEntry"
 *   - Variant property: "Level" with values: "INFO", "WARN", "ERROR"
 *   - Variant property: "Logger" with values: "EARS", "SIMASSET", "SIMTRACK"
 *   - Text layers: "Timestamp", "Message"
 */

import figma from "@figma/code-connect"
import { SystemLogEntry } from "@/components/lattice/SystemLogEntry"
import type { LogLevel } from "@/lib/types"

figma.connect(
  SystemLogEntry,
  "FIGMA_NODE_URL_PLACEHOLDER",
  {
    props: {
      level: figma.enum<LogLevel>("Level", {
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR",
      }),
      logger: figma.string("Logger"),
      message: figma.string("Message"),
    },
    example: ({ level, logger, message }) => (
      <SystemLogEntry
        id="example"
        level={level}
        logger={logger}
        message={message}
        timestamp={new Date()}
      />
    ),
  }
)
