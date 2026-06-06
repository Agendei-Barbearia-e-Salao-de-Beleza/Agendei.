"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const accentColor = variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-[#fd9602] hover:bg-amber-600"
  const iconColor = variant === "danger" ? "text-red-400" : "text-amber-400"
  const iconBg = variant === "danger" ? "bg-red-500/10" : "bg-amber-500/10"

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>

            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
              <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
            </div>

            <h3 className="text-sm font-black text-white mb-2">{title}</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{description}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl ${accentColor} text-white font-black text-xs uppercase tracking-wider transition-colors`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
