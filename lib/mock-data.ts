import type { Entity, Task, SystemLogEntryData, ProximityEvent } from "./types"

const NOW = new Date("2024-12-09T19:17:00Z")
const expiry = new Date(NOW.getTime() + 15_000).toISOString()

export const MOCK_ENTITIES: Entity[] = [
  {
    entity_id: "asset-01",
    aliases: { name: "Simulated Asset asset-01" },
    is_live: true,
    expiry_time: expiry,
    mil_view: {
      disposition: "DISPOSITION_FRIENDLY",
      environment: "ENVIRONMENT_SURFACE",
    },
    ontology: {
      template: "TEMPLATE_ASSET",
      platform_type: "USV",
    },
    location: {
      position: {
        latitude_degrees: 1.0,
        longitude_degrees: 1.0,
        altitude_hae_meters: 55,
      },
      speed_mps: 1,
    },
    provenance: {
      data_type: "Simulated Asset",
      integration_name: "auto-reconnaissance-sample-app",
      source_update_time: NOW.toISOString(),
    },
  },
  {
    entity_id: "asset-02",
    aliases: { name: "Simulated Asset asset-02" },
    is_live: true,
    expiry_time: expiry,
    mil_view: {
      disposition: "DISPOSITION_ASSUMED_FRIENDLY",
      environment: "ENVIRONMENT_SURFACE",
    },
    ontology: {
      template: "TEMPLATE_ASSET",
      platform_type: "USV",
    },
    location: {
      position: {
        latitude_degrees: 1.01,
        longitude_degrees: 1.01,
        altitude_hae_meters: 55,
      },
      speed_mps: 0.5,
    },
    provenance: {
      data_type: "Simulated Asset",
      integration_name: "auto-reconnaissance-sample-app",
      source_update_time: NOW.toISOString(),
    },
  },
  {
    entity_id: "track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    aliases: { name: "Simulated Track" },
    is_live: true,
    expiry_time: expiry,
    mil_view: {
      disposition: "DISPOSITION_SUSPICIOUS",
      environment: "ENVIRONMENT_SURFACE",
    },
    ontology: {
      template: "TEMPLATE_TRACK",
    },
    location: {
      position: {
        latitude_degrees: 1.03,
        longitude_degrees: 1.03,
      },
    },
    provenance: {
      data_type: "Simulated Track",
      integration_name: "auto-reconnaissance-sample-app",
      source_update_time: NOW.toISOString(),
    },
  },
]

export const MOCK_TASKS: Task[] = [
  {
    task_id: "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    description:
      "Asset asset-01 tasked to perform ISR on Track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    specification_type: "type.googleapis.com/anduril.tasks.v2.Investigate",
    objective_entity_id: "track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    author_service: "auto-reconnaissance",
    assignee_entity_id: "asset-01",
    status: "STATUS_EXECUTING",
  },
]

export const MOCK_PROXIMITY: ProximityEvent = {
  asset: MOCK_ENTITIES[0],
  track: MOCK_ENTITIES[2],
  distance_miles: 2.93,
}

export const MOCK_LOG_ENTRIES: SystemLogEntryData[] = [
  {
    id: "1",
    level: "INFO",
    logger: "EARS",
    message: "# of assets being tracked: 2, # of tracks being tracked: 1",
    timestamp: new Date(NOW.getTime() - 8000),
  },
  {
    id: "2",
    level: "INFO",
    logger: "EARS",
    message: "ASSET WITHIN RANGE OF NON-FRIENDLY TRACK",
    timestamp: new Date(NOW.getTime() - 7000),
  },
  {
    id: "3",
    level: "INFO",
    logger: "EARS",
    message: "overriding disposition for track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    timestamp: new Date(NOW.getTime() - 6500),
  },
  {
    id: "4",
    level: "INFO",
    logger: "EARS",
    message: "Asset asset-01 tasked to perform ISR on Track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    timestamp: new Date(NOW.getTime() - 6000),
  },
  {
    id: "5",
    level: "INFO",
    logger: "EARS",
    message: "Task created - view Lattice UI, task id is c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    timestamp: new Date(NOW.getTime() - 5800),
  },
  {
    id: "6",
    level: "INFO",
    logger: "SIMASSET",
    message: "received execute request, sending execute confirmation",
    timestamp: new Date(NOW.getTime() - 5500),
  },
  {
    id: "7",
    level: "INFO",
    logger: "EARS",
    message: "Current task status for this task_id is STATUS_EXECUTING",
    timestamp: new Date(NOW.getTime() - 4000),
  },
  {
    id: "8",
    level: "INFO",
    logger: "EARS",
    message: "INVESTIGATION ALREADY IN PROGRESS - SKIPPING",
    timestamp: new Date(NOW.getTime() - 3000),
  },
  {
    id: "9",
    level: "INFO",
    logger: "EARS",
    message: "# of assets being tracked: 2, # of tracks being tracked: 1",
    timestamp: new Date(NOW.getTime() - 2000),
  },
  {
    id: "10",
    level: "INFO",
    logger: "EARS",
    message: "# of assets being tracked: 2, # of tracks being tracked: 1",
    timestamp: new Date(NOW.getTime() - 1000),
  },
]
