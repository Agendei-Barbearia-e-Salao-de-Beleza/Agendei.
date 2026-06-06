"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Activity, Database, Bell, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { ApmResponse, ApmMetric, ServiceStatus } from "@/types"
import { SkeletonKpi } from "@/components/ui/SkeletonCard"
import { LastUpdatedBadge } from "@/components/ui/LastUpdatedBadge"

interface ApmDashboardProps {
  isLight?: boolean
}

const REFRESH_INTERVAL_MS = 30_000

const STATUS_CONFIG: Record<ServiceStatus, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  OPERATIONAL: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Operacional" },
  DEGRADED: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degradado" },
  OFFLINE: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Offline" },
}

const SERVICE_ICONS = {
  "Backend API": Activity,
  "Supabase DB": Database,
  "Firebase FCM": Bell,
}

function MetricCard({ metric, isLight }: { metric: ApmMetric; isLight?: boolean }) {
  const stat = STATUS_CONFIG[metric.status]
  const StatIcon = stat.icon
  const ServiceIcon = SERVICE_ICONS[metric.service as keyof typeof SERVICE_ICONS] ?? Activity

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-5 flex flex-col gap-4 ${
        isLight ? "bg-white border-zinc-200" : `border-zinc-800 bg-zinc-900/60`
      } ${metric.status === "OFFLINE" ? "border-red-500/30" : metric.status === "DEGRADED" ? "border-amber-500/20" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isLight ? "bg-zinc-100" : "bg-zinc-800"
        }`}>
          <ServiceIcon className={`w-5 h-5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${stat.bg} ${stat.color}`}>
          <StatIcon className="w-3 h-3" />
          {stat.label}
        </div>
      </div>

      <div>
        <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
          {metric.service}
        </p>
        {metric.latencyMs !== null ? (
          <p className={`text-2xl font-black ${isLight ? "text-zinc-900" : "text-white"}`}>
            {metric.latencyMs}
            <span className={`text-xs font-bold ml-1 ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>ms</span>
          </p>
        ) : (
          <p className={`text-2xl font-black ${isLight ? "text-zinc-900" : "text-white"}`}>—</p>
        )}
        {metric.error && (
          <p className="text-[10px] text-red-400 mt-1 leading-snug">{metric.error}</p>
        )}
      </div>

      <p className={`text-[10px] ${isLight ? "text-zinc-400" : "text-zinc-600"}`}>
        Verificado: {metric.lastChecked ? new Date(metric.lastChecked).toLocaleTimeString("pt-BR") : "—"}
      </p>
    </motion.div>
  )
}

export function ApmDashboard({ isLight }: ApmDashboardProps) {
  const [data, setData] = useState<ApmResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [hasAlert, setHasAlert] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/apm", { cache: "no-store" })
      if (res.ok) {
        const json: ApmResponse = await res.json()
        setData(json)
        setHasAlert(
          json.backend.status !== "OPERATIONAL" ||
          json.database.status !== "OPERATIONAL" ||
          json.firebase.status !== "OPERATIONAL"
        )
      }
    } catch {
      // Silencioso — APM é não-crítico
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-zinc-800" : "text-white"}`}>
            Observabilidade
          </h3>
          {hasAlert && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
              Atenção
            </span>
          )}
        </div>
        <LastUpdatedBadge timestamp={lastUpdated} onRefresh={load} isLoading={loading} isLight={isLight} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loading || !data ? (
          <>
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
          </>
        ) : (
          [data.backend, data.database, data.firebase].map((m) => (
            <MetricCard key={m.service} metric={m} isLight={isLight} />
          ))
        )}
      </div>
    </div>
  )
}
