"use client"

import { RefreshCw } from "lucide-react"

interface LastUpdatedBadgeProps {
  timestamp: Date | null
  onRefresh?: () => void
  isLoading?: boolean
  isLight?: boolean
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 10) return "agora"
  if (diffSec < 60) return `há ${diffSec}s`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  return `há ${diffH}h`
}

export function LastUpdatedBadge({ timestamp, onRefresh, isLoading, isLight }: LastUpdatedBadgeProps) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${
      isLight ? "text-zinc-400" : "text-zinc-600"
    }`}>
      <span>{timestamp ? `Atualizado ${formatRelative(timestamp)}` : "Carregando..."}</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isLight ? "hover:bg-zinc-200" : "hover:bg-zinc-800"
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  )
}
