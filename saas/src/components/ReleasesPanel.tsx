"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, Plus, Package, Smartphone, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react"
import type { AppTarget, Release } from "@/types"
import { supabase } from "@/lib/supabase"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { LastUpdatedBadge } from "@/components/ui/LastUpdatedBadge"

interface ReleasesPanelProps {
  isLight?: boolean
}

function nextSemver(releases: Release[], app: AppTarget): string {
  const appReleases = releases.filter((r) => r.app === app)
  if (!appReleases.length) return "1.0.0"

  const latest = appReleases.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
  const [major, minor, patch] = latest.version.split(".").map(Number)
  return `${major}.${minor}.${(patch ?? 0) + 1}`
}

function ReleaseCard({ release, isLight }: { release: Release; isLight?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const appColor = release.app === "mobile" ? "text-blue-400" : "text-violet-400"
  const appBg = release.app === "mobile" ? "bg-blue-500/10 border-blue-500/20" : "bg-violet-500/10 border-violet-500/20"
  const appLabel = release.app === "mobile" ? "Cliente" : "Gerente"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 cursor-pointer hover:border-[#fd9602]/30 transition-colors ${
        isLight ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-[#fd9602]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black ${isLight ? "text-zinc-900" : "text-white"}`}>
              v{release.version}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${appBg} ${appColor}`}>
              {appLabel}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isLight ? "bg-zinc-100 text-zinc-600" : "bg-zinc-800 text-zinc-400"
            }`}>
              {release.platform}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-[10px] font-mono text-zinc-500">{release.commit_hash.slice(0, 7)}</code>
            <span className="text-[10px] text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-500">
              {new Date(release.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
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
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
              {release.changelog && (
                <p className="text-[11px] text-zinc-400 whitespace-pre-line">{release.changelog}</p>
              )}
              <div className="flex items-center gap-2">
                {release.required_update && (
                  <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Atualização obrigatória
                  </span>
                )}
                {release.download_url && (
                  <a
                    href={release.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-[#fd9602] hover:underline"
                  >
                    Download →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface NewReleaseForm {
  version: string
  app: AppTarget
  commit_hash: string
  platform: string
  download_url: string
  required_update: boolean
  changelog: string
}

export function ReleasesPanel({ isLight }: ReleasesPanelProps) {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [form, setForm] = useState<NewReleaseForm>({
    version: "",
    app: "mobile",
    commit_hash: "",
    platform: "android",
    download_url: "",
    required_update: false,
    changelog: "",
  })

  const loadReleases = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("releases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)

    setReleases((data as Release[]) ?? [])
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { loadReleases() }, [loadReleases])

  const handleOpenForm = (app: AppTarget = "mobile") => {
    setForm((f) => ({
      ...f,
      app,
      version: nextSemver(releases, app),
    }))
    setShowForm(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { error } = await supabase.from("releases").insert({
      version: form.version,
      app: form.app,
      commit_hash: form.commit_hash,
      platform: form.platform,
      download_url: form.download_url,
      required_update: form.required_update,
      changelog: form.changelog || null,
    })

    if (!error) {
      // Também atualiza app_versions para que os apps mobile leiam a nova versão
      await supabase.from("app_versions").upsert({
        platform: form.platform,
        latest_version: form.version,
        download_url: form.download_url,
        required_update: form.required_update,
        changelog: form.changelog || "Melhorias gerais",
      }, { onConflict: "platform" })

      await loadReleases()
      setShowForm(false)
    }
    setSubmitting(false)
    setConfirmOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-zinc-800" : "text-white"}`}>
          Gestão de Releases
        </h3>
        <div className="flex items-center gap-3">
          <LastUpdatedBadge timestamp={lastUpdated} onRefresh={loadReleases} isLoading={loading} isLight={isLight} />
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fd9602] hover:bg-amber-600 text-zinc-950 font-black text-[10px] uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3 h-3" /> Nova Release
          </button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-2xl border p-5 space-y-4 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900/80 border-zinc-800"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-black ${isLight ? "text-zinc-800" : "text-white"}`}>Nova Release</p>
                <button onClick={() => setShowForm(false)} className="w-6 h-6 rounded-full hover:bg-zinc-800 flex items-center justify-center">
                  <X className="w-3 h-3 text-zinc-400" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Versão</label>
                  <input
                    value={form.version}
                    onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                    placeholder="Ex: 1.2.0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[#fd9602]/25"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">App</label>
                  <select
                    value={form.app}
                    onChange={(e) => setForm((f) => ({ ...f, app: e.target.value as AppTarget, version: nextSemver(releases, e.target.value as AppTarget) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="mobile">Cliente</option>
                    <option value="manager">Gerente</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Plataforma</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Hash do Commit</label>
                <input
                  value={form.commit_hash}
                  onChange={(e) => setForm((f) => ({ ...f, commit_hash: e.target.value }))}
                  placeholder="Ex: abc1234"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:ring-2 focus:ring-[#fd9602]/25"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">URL de Download</label>
                <input
                  value={form.download_url}
                  onChange={(e) => setForm((f) => ({ ...f, download_url: e.target.value }))}
                  placeholder="Ex: https://..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[#fd9602]/25"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Changelog</label>
                <textarea
                  value={form.changelog}
                  onChange={(e) => setForm((f) => ({ ...f, changelog: e.target.value }))}
                  placeholder="Descreva as mudanças desta versão..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[#fd9602]/25 resize-none"
                />
              </div>

              <label className={`flex items-center gap-2 text-[10px] font-bold cursor-pointer ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                <input
                  type="checkbox"
                  checked={form.required_update}
                  onChange={(e) => setForm((f) => ({ ...f, required_update: e.target.checked }))}
                />
                Atualização obrigatória
              </label>

              <div className="flex justify-end">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!form.version || !form.commit_hash || !form.download_url || submitting}
                  className="px-4 py-2 rounded-xl bg-[#fd9602] hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-[10px] uppercase tracking-wider transition-colors"
                >
                  Criar Release
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </>
        ) : releases.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhuma release publicada"
            description="Crie a primeira release promovendo um commit aprovado do pipeline CI/CD."
            action={{ label: "Nova Release", onClick: () => handleOpenForm() }}
            isLight={isLight}
          />
        ) : (
          <AnimatePresence>
            {releases.map((r) => <ReleaseCard key={r.id} release={r} isLight={isLight} />)}
          </AnimatePresence>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Publicar v${form.version} — ${form.app === "mobile" ? "App Cliente" : "App Gerente"}?`}
        description="Um release é imutável após criado. O commit e o número de versão não poderão ser alterados."
        confirmLabel="Publicar Release"
        variant="warning"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
