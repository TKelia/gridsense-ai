// Ingestion contract — the JSON shape the ESP32 + SCT-013 (and smart plugs) will POST
// to /api/ingest in Phase 2. The simulator emits the SAME shape, so swapping
// simulated -> live is a one-line change of the data source.

export type DataSource = 'simulated' | 'live'

export interface PowerReading {
  deviceId: string // e.g. "gridsense-main" or a smart-plug id
  ts: number // epoch ms
  watts: number // instantaneous real power
  source: DataSource
}

export interface ApplianceReading {
  key: string
  label: string
  watts: number
}

// What the dashboard renders from, regardless of source.
export interface HomeSnapshot {
  ts: number
  source: DataSource
  totalWatts: number
  appliances: ApplianceReading[]
  monthToDateKwh: number
}
