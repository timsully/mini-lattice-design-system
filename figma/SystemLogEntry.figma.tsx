import figma from "@figma/code-connect"
import { SystemLogEntry } from "@/components/lattice/SystemLogEntry"
import type { LogLevel } from "@/lib/types"

figma.connect(
  SystemLogEntry,
  "https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System?node-id=77-417",
  {
    props: {
      level: figma.enum<LogLevel>("Level", {
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR",
      }),
      logger: figma.enum("Logger", {
        EARS:     "EARS",
        SIMASSET: "SIMASSET",
        SIMTRACK: "SIMTRACK",
      }),
    },
    example: ({ level, logger }) => (
      <SystemLogEntry
        level={level}
        logger={logger}
        message="ASSET WITHIN RANGE OF NON-FRIENDLY TRACK"
        timestamp={new Date("2026-01-01T11:16:53")}
      />
    ),
  }
)
