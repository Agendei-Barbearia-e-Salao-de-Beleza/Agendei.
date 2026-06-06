"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitCommit as GitIcon, CheckCircle, XCircle, Clock, Loader2, Eye, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import type { AppTarget, GitCommit, CommitStatus } from "@/types"
import { supabase } from "@/lib/supabase"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { LastUpdatedBadge } from "@/components/ui/LastUpdatedBadge"
import { DevicePreview } from "@/components/DevicePreview"

interface CicdPipelineProps {
  isLight?: boolean
}

const STATUS_CONFIG: Record<CommitStatus, { icon: typeof Clock; color: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-zinc-500", label: "Pendente" },
  BUILDING: { icon: Loader2, color: "text-amber-400", label: "Em Build" },
  APPROVED: { icon: CheckCircle, color: "text-emerald-400", label: "Aprovado" },
  FAILED: { icon: XCircle, color: "text-red-400", label: "Falhou" },
}

function formatCommitDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

function CommitCard({
  commit,
  onStatusChange,
  onPreview,
  isLight,
}: {
  commit: GitCommit
  onStatusChange: (hash: string, status: CommitStatus) => void
  onPreview: (commit: GitCommit) => void
  isLight?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const stat = STATUS_CONFIG[commit.status]
  const StatIcon = stat.icon

  const borderColor =
    commit.status === "FAILED" ? "border-red-500/30" :
    commit.status === "APPROVED" ? "border-emerald-500/20" :
    isLight ? "border-zinc-200" : "border-zinc-800"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl border p-4 transition-colors ${
        isLight ? "bg-white" : "bg-zinc-900/50"
      } ${borderColor} ${commit.status === "FAILED" ? "bg-red-500/5" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${stat.color}`}>
          <StatIcon className={`w-4 h-4 ${commit.status === "BUILDING" ? "animate-spin" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-[10px] font-mono text-[#fd9602]">{commit.hash}</code>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.color}`}>{stat.label}</span>
          </div>
          <p className={`text-xs font-bold leading-snug ${isLight ? "text-zinc-900" : "text-white"}`}>
            {commit.message}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {commit.author} · {commit.date ? formatCommitDate(commit.date) : ""}
          </p>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="shrink-0 mt-0.5">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-zinc-500" />
            : <ChevronDown className="w-4 h-4 text-zinc-500" />
          }
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
              <button
                onClick={() => onPreview(commit)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                  isLight ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-700" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                <Eye className="w-3 h-3" /> Pré-visualizar
              </button>
              {commit.status !== "APPROVED" && (
                <button
                  onClick={() => onStatusChange(commit.hash, "APPROVED")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Aprovar
                </button>
              )}
              {commit.status !== "FAILED" && (
                <button
                  onClick={() => onStatusChange(commit.hash, "FAILED")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Falhou
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CommitColumn({
  app,
  label,
  commits,
  loading,
  error,
  onStatusChange,
  onPreview,
  isLight,
}: {
  app: AppTarget
  label: string
  commits: GitCommit[]
  loading: boolean
  error: string | null
  onStatusChange: (app: AppTarget, hash: string, status: CommitStatus) => void
  onPreview: (commit: GitCommit) => void
  isLight?: boolean
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      <div className={`flex items-center gap-2 pb-2 border-b ${isLight ? "border-zinc-200" : "border-zinc-800"}`}>
        <div className="w-2 h-2 rounded-full bg-[#fd9602]" />
        <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-zinc-800" : "text-white"}`}>{label}</span>
        <span className={`ml-auto text-[10px] font-bold ${isLight ? "text-zinc-500" : "text-zinc-600"}`}>{commits.length} commits</span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {loading ? (
          <>
            <SkeletonCard lines={3} className="border-zinc-800" />
            <SkeletonCard lines={3} className="border-zinc-800" />
          </>
        ) : error ? (
          <div className={`rounded-2xl border p-4 ${isLight ? "border-zinc-200 bg-zinc-50" : "border-zinc-800 bg-zinc-900/50"}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Commits indisponíveis</p>
                <p className="text-[10px] text-zinc-500">{error}</p>
              </div>
            </div>
          </div>
        ) : commits.length === 0 ? (
          <EmptyState
            icon={GitIcon}
            title="Nenhum commit encontrado"
            description={`O diretório ${app}/ não tem histórico git acessível.`}
            isLight={isLight}
          />
        ) : (
          <AnimatePresence>
            {commits.map((c) => (
              <CommitCard
                key={c.hash}
                commit={c}
                onStatusChange={(hash, status) => onStatusChange(app, hash, status)}
                onPreview={onPreview}
                isLight={isLight}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export function CicdPipeline({ isLight }: CicdPipelineProps) {
  const [mobileCommits, setMobileCommits] = useState<GitCommit[]>([])
  const [managerCommits, setManagerCommits] = useState<GitCommit[]>([])
  const [mobileLoading, setMobileLoading] = useState(true)
  const [managerLoading, setManagerLoading] = useState(true)
  const [mobileError, setMobileError] = useState<string | null>(null)
  const [managerError, setManagerError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previewCommit, setPreviewCommit] = useState<GitCommit | null>(null)

  const mergeWithSupabaseStatus = useCallback(async (commits: GitCommit[], app: AppTarget): Promise<GitCommit[]> => {
    const hashes = commits.map((c) => c.hash)
    const { data } = await supabase
      .from("pipeline_commits")
      .select("hash, status, status_note")
      .eq("app", app)
      .in("hash", hashes)

    if (!data) return commits

    const statusMap = new Map<string, CommitStatus>(
      data.map((r: { hash: string; status: string }) => [r.hash, r.status as CommitStatus] as [string, CommitStatus])
    )
    return commits.map((c) => ({ ...c, status: statusMap.get(c.hash) ?? c.status }))
  }, [])

  const loadCommits = useCallback(async (app: AppTarget) => {
    const setLoading = app === "mobile" ? setMobileLoading : setManagerLoading
    const setError = app === "mobile" ? setMobileError : setManagerError
    const setCommits = app === "mobile" ? setMobileCommits : setManagerCommits

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/git-commits?app=${app}`)
      const json = await res.json()

      if (json.error || !res.ok) {
        setError(json.error || "Erro ao carregar commits")
        setCommits([])
      } else {
        const enriched = await mergeWithSupabaseStatus(json.commits, app)
        setCommits(enriched)
      }
    } catch {
      setError("Não foi possível conectar ao servidor")
      setCommits([])
    } finally {
      setLoading(false)
    }
  }, [mergeWithSupabaseStatus])

  const loadAll = useCallback(() => {
    loadCommits("mobile")
    loadCommits("manager")
    setLastUpdated(new Date())
  }, [loadCommits])

  useEffect(() => { loadAll() }, [loadAll])

  const handleStatusChange = async (app: AppTarget, hash: string, status: CommitStatus) => {
    await supabase
      .from("pipeline_commits")
      .upsert({ hash, app, status, updated_at: new Date().toISOString() }, { onConflict: "hash" })

    const update = (commits: GitCommit[]) =>
      commits.map((c) => (c.hash === hash ? { ...c, status } : c))

    if (app === "mobile") setMobileCommits(update)
    else setManagerCommits(update)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-zinc-800" : "text-white"}`}>
          Pipeline CI/CD
        </h3>
        <LastUpdatedBadge
          timestamp={lastUpdated}
          onRefresh={loadAll}
          isLoading={mobileLoading || managerLoading}
          isLight={isLight}
        />
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        <CommitColumn
          app="mobile"
          label="App Cliente"
          commits={mobileCommits}
          loading={mobileLoading}
          error={mobileError}
          onStatusChange={handleStatusChange}
          onPreview={setPreviewCommit}
          isLight={isLight}
        />
        <div className={`w-px shrink-0 ${isLight ? "bg-zinc-200" : "bg-zinc-800"}`} />
        <CommitColumn
          app="manager"
          label="App Gerente"
          commits={managerCommits}
          loading={managerLoading}
          error={managerError}
          onStatusChange={handleStatusChange}
          onPreview={setPreviewCommit}
          isLight={isLight}
        />
      </div>

      <DevicePreview commit={previewCommit} isLight={isLight} onClose={() => setPreviewCommit(null)} />
    </div>
  )
}
