"use client"

interface SkeletonCardProps {
  lines?: number
  height?: string
  className?: string
}

export function SkeletonCard({ lines = 3, height = "h-4", className = "" }: SkeletonCardProps) {
  return (
    <div className={`rounded-3xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 p-6 space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer rounded-full ${height} ${i === 0 ? "w-2/3" : i === lines - 1 ? "w-1/3" : "w-full"}`}
        />
      ))}
    </div>
  )
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 ${className}`}>
      <div className="skeleton-shimmer rounded-full w-8 h-8 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer rounded-full h-3 w-1/2" />
        <div className="skeleton-shimmer rounded-full h-3 w-1/3" />
      </div>
      <div className="skeleton-shimmer rounded-full h-6 w-16" />
    </div>
  )
}

export function SkeletonKpi({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 ${className}`}>
      <div className="skeleton-shimmer rounded-full h-3 w-1/2" />
      <div className="skeleton-shimmer rounded-full h-8 w-2/3" />
      <div className="skeleton-shimmer rounded-full h-3 w-1/3" />
    </div>
  )
}
