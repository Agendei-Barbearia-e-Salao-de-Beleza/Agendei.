export type TabId = "OVERVIEW" | "PARTNERS" | "LOGINS" | "UPDATES" | "BUGS"
export type AppTarget = "mobile" | "manager"
export type CommitStatus = "PENDING" | "BUILDING" | "APPROVED" | "FAILED"
export type BugStatus = "OPEN" | "INVESTIGATING" | "RESOLVED"
export type BugSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ServiceStatus = "OPERATIONAL" | "DEGRADED" | "OFFLINE"

export interface Tenant {
  id: string
  nome: string
  proprietario_nome: string
  telefone: string
  endereco: string
  plano: string
  valor_plano: number
  status: string
  lat: number | null
  lng: number | null
  geocoded_at: string | null
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: string
  app: AppTarget
  status: CommitStatus
  status_note?: string
  files_changed?: string[]
  committed_at?: string
}

export interface Release {
  id: string
  version: string
  app: AppTarget
  commit_hash: string
  platform: string
  download_url: string
  required_update: boolean
  changelog: string | null
  created_at: string
}

export interface BugReport {
  id: string
  platform: string
  app_version: string
  error_message: string
  error_stack: string | null
  device_model: string | null
  os_version: string | null
  user_email: string | null
  severity: BugSeverity
  status: BugStatus
  created_at: string
  resolution_note?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
}

export interface AppVersion {
  id: string
  platform: string
  latest_version: string
  download_url: string
  required_update: boolean
  changelog: string | null
  created_at: string
}

export interface UserLogin {
  id: string
  nome: string
  email: string
  cargo: string
  created_at: string
  status: string
}

export interface ApmMetric {
  service: string
  status: ServiceStatus
  latencyMs: number | null
  uptimePercent: number | null
  lastChecked: string
  error?: string
}

export interface ApmResponse {
  backend: ApmMetric
  database: ApmMetric
  firebase: ApmMetric
}
