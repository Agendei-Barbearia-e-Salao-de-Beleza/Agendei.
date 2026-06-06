"use client"

import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  isLight?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, isLight }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
        isLight ? "bg-zinc-100" : "bg-zinc-900"
      }`}>
        <Icon className={`w-8 h-8 ${isLight ? "text-zinc-400" : "text-zinc-600"}`} />
      </div>
      <p className={`text-sm font-black tracking-tight mb-1 ${isLight ? "text-zinc-800" : "text-white"}`}>
        {title}
      </p>
      <p className={`text-xs max-w-xs ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-[#fd9602] hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
