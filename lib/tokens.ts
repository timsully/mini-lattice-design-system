import type { Disposition, TaskStatusValue } from "./types"

export const DISTANCE_THRESHOLD_MILES = 5

export const REFRESH_INTERVAL_SECONDS = 5

export const EXPIRY_OFFSET_SECONDS = 15

export const CACHE_CAPACITY = 150

export const DISPOSITION_COLORS: Record<Disposition, { text: string; bg: string; dot: string }> = {
  DISPOSITION_FRIENDLY: {
    text: "text-friendly",
    bg: "bg-friendly/10",
    dot: "bg-friendly",
  },
  DISPOSITION_ASSUMED_FRIENDLY: {
    text: "text-assumed",
    bg: "bg-assumed/10",
    dot: "bg-assumed",
  },
  DISPOSITION_SUSPICIOUS: {
    text: "text-suspicious",
    bg: "bg-suspicious/10",
    dot: "bg-suspicious",
  },
  DISPOSITION_HOSTILE: {
    text: "text-hostile",
    bg: "bg-hostile/10",
    dot: "bg-hostile",
  },
  DISPOSITION_UNKNOWN: {
    text: "text-unknown",
    bg: "bg-unknown/10",
    dot: "bg-unknown",
  },
}

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  DISPOSITION_FRIENDLY: "Friendly",
  DISPOSITION_ASSUMED_FRIENDLY: "Assumed Friendly",
  DISPOSITION_SUSPICIOUS: "Suspicious",
  DISPOSITION_HOSTILE: "Hostile",
  DISPOSITION_UNKNOWN: "Unknown",
}

export const TASK_STATUS_COLORS: Record<TaskStatusValue, { text: string; bg: string }> = {
  STATUS_EXECUTING: { text: "text-executing", bg: "bg-executing/10" },
  STATUS_DONE_OK: { text: "text-done-ok", bg: "bg-done-ok/10" },
  STATUS_DONE_NOT_OK: { text: "text-done-not-ok", bg: "bg-done-not-ok/10" },
  STATUS_PENDING: { text: "text-pending-status", bg: "bg-pending-status/10" },
}

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  STATUS_EXECUTING: "Executing",
  STATUS_DONE_OK: "Done",
  STATUS_DONE_NOT_OK: "Failed",
  STATUS_PENDING: "Pending",
}
