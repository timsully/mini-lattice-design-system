export type Disposition =
  | "DISPOSITION_FRIENDLY"
  | "DISPOSITION_ASSUMED_FRIENDLY"
  | "DISPOSITION_SUSPICIOUS"
  | "DISPOSITION_HOSTILE"
  | "DISPOSITION_UNKNOWN"

export type OntologyTemplate = "TEMPLATE_ASSET" | "TEMPLATE_TRACK"

export type TaskStatusValue =
  | "STATUS_EXECUTING"
  | "STATUS_DONE_OK"
  | "STATUS_DONE_NOT_OK"
  | "STATUS_PENDING"

export type LogLevel = "INFO" | "WARN" | "ERROR"

export interface EntityLocation {
  position: {
    latitude_degrees: number
    longitude_degrees: number
    altitude_hae_meters?: number
  }
  speed_mps?: number
}

export interface Entity {
  entity_id: string
  aliases: { name: string }
  is_live: boolean
  expiry_time: string
  mil_view: {
    disposition: Disposition
    environment: string
  }
  ontology: {
    template: OntologyTemplate
    platform_type?: string
  }
  location: EntityLocation
  provenance: {
    data_type: string
    integration_name: string
    source_update_time: string
  }
}

export interface Task {
  task_id: string
  description: string
  specification_type: string
  objective_entity_id: string
  author_service: string
  assignee_entity_id: string
  status: TaskStatusValue
}

export interface ProximityEvent {
  asset: Entity
  track: Entity
  distance_miles: number
}

export interface SystemLogEntryData {
  id: string
  level: LogLevel
  logger: string
  message: string
  timestamp: Date
}
