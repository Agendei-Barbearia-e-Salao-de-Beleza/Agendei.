"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, X, Wifi, Battery, Signal } from "lucide-react"
import type { AppTarget, GitCommit } from "@/types"

interface DevicePreviewProps {
  commit: GitCommit | null
  isLight?: boolean
  onClose: () => void
}

type PreviewMode = "LIVE" | "MOCK"

const APP_URLS: Record<AppTarget, string> = {
  mobile: "http://localhost:5173",
  manager: "http://localhost:5174",
}

const APP_LABELS: Record<AppTarget, string> = {
  mobile: "App Cliente",
  manager: "App Gerente",
}

export function DevicePreview({ commit, isLight, onClose }: DevicePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("MOCK")
  const [activeApp, setActiveApp] = useState<AppTarget>(commit?.app ?? "mobile")

  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <AnimatePresence>
      {commit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center gap-4"
          >
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* App switcher */}
              <div className="flex rounded-xl overflow-hidden border border-zinc-700">
                {(["mobile", "manager"] as AppTarget[]).map((app) => (
                  <button
                    key={app}
                    onClick={() => setActiveApp(app)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                      activeApp === app ? "bg-[#fd9602] text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {APP_LABELS[app]}
                  </button>
                ))}
              </div>

              {/* Mode switcher */}
              <div className="flex rounded-xl overflow-hidden border border-zinc-700">
                {(["MOCK", "LIVE"] as PreviewMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                      mode === m ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center transition-colors ml-2"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Commit info */}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                {APP_LABELS[activeApp]} — Commit{" "}
                <span className="font-mono text-[#fd9602]">{commit.hash}</span>
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{commit.message}</p>
            </div>

            {/* iPhone frame */}
            <div
              className="relative flex flex-col"
              style={{
                width: 320,
                height: 640,
                background: "#09090b",
                borderRadius: "42px",
                border: "8px solid #1a1a1f",
                boxShadow:
                  "0 0 0 2px #27272a, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              {/* Notch */}
              <div className="relative flex items-center justify-center pt-3 pb-1 px-6 shrink-0">
                <div
                  className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full"
                  style={{ width: 110, height: 28, top: 0 }}
                />
                {/* Status bar */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <span className="text-white text-[11px] font-bold ml-1">{now}</span>
                  <div className="flex items-center gap-1 mr-1">
                    <Signal className="w-3 h-3 text-white" />
                    <Wifi className="w-3 h-3 text-white" />
                    <Battery className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Screen content */}
              <div className="flex-1 overflow-hidden bg-zinc-950 relative">
                {mode === "LIVE" ? (
                  <iframe
                    src={APP_URLS[activeApp]}
                    className="w-full h-full border-0"
                    title={`Preview ${APP_LABELS[activeApp]}`}
                  />
                ) : (
                  <MockAppUI app={activeApp} />
                )}
              </div>

              {/* Home indicator */}
              <div className="flex items-center justify-center py-2 bg-zinc-950 shrink-0">
                <div className="w-28 h-1 rounded-full bg-zinc-600" />
              </div>
            </div>

            {mode === "LIVE" && (
              <p className="text-[10px] text-zinc-600 text-center max-w-xs">
                Modo LIVE conecta ao servidor de desenvolvimento local.{" "}
                <span className="text-zinc-500">Certifique-se que {APP_URLS[activeApp]} está rodando.</span>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MockAppUI({ app }: { app: AppTarget }) {
  if (app === "mobile") return <MockClientApp />
  return <MockManagerApp />
}

function MockClientApp() {
  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Bem-vindo</p>
        <p className="text-base font-black">Agendei<span className="text-[#fd9602]">.</span></p>
      </div>

      {/* Featured card */}
      <div className="mx-4 rounded-2xl bg-[#fd9602] p-4 mb-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-950 mb-1">Próximo Agendamento</p>
        <p className="text-sm font-black text-zinc-950">Corte + Barba</p>
        <p className="text-xs text-zinc-800">Amanhã · 14:30</p>
      </div>

      {/* Services grid */}
      <div className="px-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2">Serviços</p>
        <div className="grid grid-cols-3 gap-2">
          {["Corte", "Barba", "Combo"].map((s) => (
            <div key={s} className="bg-zinc-900 rounded-xl p-3 text-center">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 mx-auto mb-1" />
              <p className="text-[9px] font-bold text-zinc-400">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-auto border-t border-zinc-900 flex">
        {["Início", "Explorar", "Agenda", "Perfil"].map((tab) => (
          <div key={tab} className="flex-1 flex flex-col items-center py-3">
            <div className={`w-5 h-5 rounded-lg mb-1 ${tab === "Início" ? "bg-[#fd9602]" : "bg-zinc-800"}`} />
            <p className="text-[8px] font-bold text-zinc-500">{tab}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockManagerApp() {
  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-900">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Painel</p>
        <p className="text-base font-black">Grooming<span className="text-[#fd9602]"> &</span> Style</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 p-4">
        {[["Hoje", "12"], ["Semana", "48"], ["Receita", "R$ 840"], ["Clientes", "8"]].map(([label, val]) => (
          <div key={label} className="bg-zinc-900 rounded-xl p-3">
            <p className="text-[8px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="text-sm font-black text-white">{val}</p>
          </div>
        ))}
      </div>

      {/* Agenda */}
      <div className="px-4 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2">Próximos</p>
        {[["14:00", "João Silva", "Corte"], ["15:30", "Carlos M.", "Barba"]].map(([time, name, svc]) => (
          <div key={time} className="flex items-center gap-3 py-2 border-b border-zinc-900">
            <span className="text-[10px] font-bold text-[#fd9602] w-10 shrink-0">{time}</span>
            <div>
              <p className="text-[10px] font-bold text-white">{name}</p>
              <p className="text-[9px] text-zinc-500">{svc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-zinc-900 flex">
        {["Painel", "Agenda", "Caixa", "Perfil"].map((tab) => (
          <div key={tab} className="flex-1 flex flex-col items-center py-3">
            <div className={`w-5 h-5 rounded-lg mb-1 ${tab === "Painel" ? "bg-[#fd9602]" : "bg-zinc-800"}`} />
            <p className="text-[8px] font-bold text-zinc-500">{tab}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
