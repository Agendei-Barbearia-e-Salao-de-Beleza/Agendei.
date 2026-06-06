"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bug, List, Columns, Filter, CheckCircle, AlertCircle, AlertTriangle, Clock, ChevronDown, ChevronUp } from "lucide-react"
import type { BugReport, BugStatus, BugSeverity } from "@/types"
import { supabase } from "@/lib/supabase"
import { EmptyState } from "@/components/ui/EmptyState"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

interface BugTrackerProps {
  bugs: BugReport[]
  onBugsUpdate: (bugs: BugReport[]) => void
  isLight?: boolean
}

type ViewMode = "LIST" | "KANBAN"

const SEVERITY_CONFIG: Record<BugSeverity, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  HIGH: { label: "Alto", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  MEDIUM: { label: "Médio", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  LOW: { label: "Baixo", color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700" },
}

const STATUS_CONFIG: Record<BugStatus, { label: string; icon: typeof Bug; color: string }> = {
  OPEN: { label: "Aberto", icon: AlertCircle, color: "text-red-400" },
  INVESTIGATING: { label: "Em análise", icon: Clock, color: "text-amber-400" },
  RESOLVED: { label: "Resolvido", icon: CheckCircle, color: "text-emerald-400" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

function BugCard({
  bug,
  onResolve,
  onStatusChange,
  isLight,
}: {
  bug: BugReport
  onResolve: (bug: BugReport) => void
  onStatusChange: (bug: BugReport, status: BugStatus) => void
  isLight?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_CONFIG[bug.severity]
  const stat = STATUS_CONFIG[bug.status]
  const StatIcon = stat.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-2xl border p-4 ${sev.bg} ${isLight ? "bg-white" : ""} cursor-pointer`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${sev.color}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${sev.color}`}>{sev.label}</span>
            <span className="text-[10px] text-zinc-600">·</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.color} flex items-center gap-1`}>
              <StatIcon className="w-3 h-3" />
              {stat.label}
            </span>
          </div>
          <p className={`text-xs font-bold truncate ${isLight ? "text-zinc-900" : "text-white"}`}>
            {bug.error_message}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-zinc-500">{bug.platform}</span>
            <span className="text-[10px] text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-500">v{bug.app_version}</span>
            <span className="text-[10px] text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-500">{formatDate(bug.created_at)}</span>
          </div>
        </div>
        <div className="shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
              {bug.error_stack && (
                <pre className="text-[10px] text-zinc-400 font-mono bg-zinc-950 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {bug.error_stack}
                </pre>
              )}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {bug.device_model && (
                  <div><span className="text-zinc-600">Dispositivo: </span><span className="text-zinc-400">{bug.device_model}</span></div>
                )}
                {bug.os_version && (
                  <div><span className="text-zinc-600">OS: </span><span className="text-zinc-400">{bug.os_version}</span></div>
                )}
                {bug.user_email && (
                  <div className="col-span-2"><span className="text-zinc-600">Usuário: </span><span className="text-zinc-400">{bug.user_email}</span></div>
                )}
              </div>
              {bug.status !== "RESOLVED" && (
                <div className="flex gap-2 pt-1">
                  {bug.status === "OPEN" && (
                    <button
                      onClick={() => onStatusChange(bug, "INVESTIGATING")}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      Iniciar Análise
                    </button>
                  )}
                  <button
                    onClick={() => onResolve(bug)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    Marcar Resolvido
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function KanbanColumn({
  title,
  status,
  bugs,
  onResolve,
  onStatusChange,
  isLight,
}: {
  title: string
  status: BugStatus
  bugs: BugReport[]
  onResolve: (bug: BugReport) => void
  onStatusChange: (bug: BugReport, status: BugStatus) => void
  isLight?: boolean
}) {
  const conf = STATUS_CONFIG[status]
  const Icon = conf.icon

  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800"}`}>
        <Icon className={`w-4 h-4 ${conf.color}`} />
        <span className={`text-[10px] font-black uppercase tracking-wider ${conf.color}`}>{title}</span>
        <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${isLight ? "bg-zinc-100 text-zinc-600" : "bg-zinc-800 text-zinc-400"}`}>
          {bugs.length}
        </span>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        <AnimatePresence>
          {bugs.map((bug) => (
            <BugCard key={bug.id} bug={bug} onResolve={onResolve} onStatusChange={onStatusChange} isLight={isLight} />
          ))}
        </AnimatePresence>
        {bugs.length === 0 && (
          <p className="text-[10px] text-zinc-600 text-center py-6">Nenhum bug aqui</p>
        )}
      </div>
    </div>
  )
}

export function BugTracker({ bugs, onBugsUpdate, isLight }: BugTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("LIST")
  const [filterSeverity, setFilterSeverity] = useState<BugSeverity | "ALL">("ALL")
  const [filterApp, setFilterApp] = useState<string>("ALL")
  const [showResolved, setShowResolved] = useState(false)
  const [confirmBug, setConfirmBug] = useState<BugReport | null>(null)

  const platforms = useMemo(() => ["ALL", ...Array.from(new Set(bugs.map((b) => b.platform)))], [bugs])

  const filtered = useMemo(() => {
    return bugs.filter((b) => {
      if (!showResolved && b.status === "RESOLVED") return false
      if (filterSeverity !== "ALL" && b.severity !== filterSeverity) return false
      if (filterApp !== "ALL" && b.platform !== filterApp) return false
      return true
    })
  }, [bugs, showResolved, filterSeverity, filterApp])

  const byStatus = useMemo(() => ({
    OPEN: filtered.filter((b) => b.status === "OPEN"),
    INVESTIGATING: filtered.filter((b) => b.status === "INVESTIGATING"),
    RESOLVED: filtered.filter((b) => b.status === "RESOLVED"),
  }), [filtered])

  const handleStatusChange = async (bug: BugReport, newStatus: BugStatus) => {
    const { error } = await supabase
      .from("system_bugs")
      .update({ status: newStatus })
      .eq("id", bug.id)
    if (!error) {
      onBugsUpdate(bugs.map((b) => (b.id === bug.id ? { ...b, status: newStatus } : b)))
    }
  }

  const handleResolve = async () => {
    if (!confirmBug) return
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("system_bugs")
      .update({ status: "RESOLVED", resolved_at: now })
      .eq("id", confirmBug.id)
    if (!error) {
      onBugsUpdate(bugs.map((b) => (b.id === confirmBug.id ? { ...b, status: "RESOLVED" as BugStatus, resolved_at: now } : b)))
    }
    setConfirmBug(null)
  }

  if (bugs.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="Nenhum bug reportado"
        description="Os aplicativos não reportaram erros de produção ainda. Quando ocorrerem, aparecerão aqui."
        isLight={isLight}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className={`flex rounded-xl overflow-hidden border ${isLight ? "border-zinc-200" : "border-zinc-800"}`}>
          <button
            onClick={() => setViewMode("LIST")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
              viewMode === "LIST"
                ? "bg-[#fd9602] text-zinc-950"
                : isLight ? "text-zinc-600 hover:bg-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            <List className="w-3 h-3" /> Lista
          </button>
          <button
            onClick={() => setViewMode("KANBAN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
              viewMode === "KANBAN"
                ? "bg-[#fd9602] text-zinc-950"
                : isLight ? "text-zinc-600 hover:bg-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            <Columns className="w-3 h-3" /> Kanban
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-zinc-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as BugSeverity | "ALL")}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none ${
              isLight ? "bg-white border-zinc-200 text-zinc-700" : "bg-zinc-900 border-zinc-800 text-zinc-300"
            }`}
          >
            <option value="ALL">Severidade: Todas</option>
            <option value="CRITICAL">Crítico</option>
            <option value="HIGH">Alto</option>
            <option value="MEDIUM">Médio</option>
            <option value="LOW">Baixo</option>
          </select>
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none ${
              isLight ? "bg-white border-zinc-200 text-zinc-700" : "bg-zinc-900 border-zinc-800 text-zinc-300"
            }`}
          >
            {platforms.map((p) => (
              <option key={p} value={p}>{p === "ALL" ? "Plataforma: Todas" : p}</option>
            ))}
          </select>
        </div>

        <label className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer ml-auto ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Mostrar resolvidos
        </label>
      </div>

      {/* Content */}
      {viewMode === "LIST" ? (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Bug}
                title="Nenhum bug com estes filtros"
                description="Tente ajustar os filtros de severidade ou plataforma."
                isLight={isLight}
              />
            ) : (
              filtered.map((bug) => (
                <BugCard key={bug.id} bug={bug} onResolve={setConfirmBug} onStatusChange={handleStatusChange} isLight={isLight} />
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <KanbanColumn title="Aberto" status="OPEN" bugs={byStatus.OPEN} onResolve={setConfirmBug} onStatusChange={handleStatusChange} isLight={isLight} />
          <KanbanColumn title="Em Análise" status="INVESTIGATING" bugs={byStatus.INVESTIGATING} onResolve={setConfirmBug} onStatusChange={handleStatusChange} isLight={isLight} />
          {showResolved && (
            <KanbanColumn title="Resolvido" status="RESOLVED" bugs={byStatus.RESOLVED} onResolve={setConfirmBug} onStatusChange={handleStatusChange} isLight={isLight} />
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmBug}
        title="Marcar como Resolvido?"
        description={`O bug "${confirmBug?.error_message?.slice(0, 60)}..." será marcado como resolvido. Esta ação pode ser revertida alterando o status manualmente.`}
        confirmLabel="Marcar Resolvido"
        variant="warning"
        onConfirm={handleResolve}
        onCancel={() => setConfirmBug(null)}
      />
    </div>
  )
}
