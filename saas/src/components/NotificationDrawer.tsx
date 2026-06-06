"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Bot, Bell, AlertTriangle, AlertCircle,
  CheckCircle, Info, Send, User
} from "lucide-react"

export interface BotAlert {
  id: string
  type: "info" | "warning" | "danger" | "success"
  title: string
  body: string
  timestamp: Date
  read: boolean
}

interface ChatMessage {
  id: string
  sender: "user" | "bot"
  text: string
  time: string
}

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  isLight?: boolean
  alerts: BotAlert[]
  onMarkAllRead: () => void
  onDismissAlert: (id: string) => void
  messages: ChatMessage[]
  onSendMessage: (e: React.FormEvent) => void
  inputMessage: string
  onInputChange: (v: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

const ALERT_CONFIG: Record<BotAlert["type"], { icon: typeof Info; color: string; bg: string }> = {
  info:    { icon: Info,          color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"     },
  warning: { icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
  danger:  { icon: AlertCircle,   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30"       },
  success: { icon: CheckCircle,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20"},
}

export function NotificationDrawer({
  isOpen, onClose, isLight,
  alerts, onMarkAllRead, onDismissAlert,
  messages, onSendMessage, inputMessage, onInputChange, messagesEndRef,
}: NotificationDrawerProps) {
  const [activeSection, setActiveSection] = useState<"alerts" | "chat">("alerts")
  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className={`fixed top-0 right-0 h-screen w-[30rem] border-l shadow-2xl z-50 flex flex-col ${
              isLight
                ? "bg-white/96 border-zinc-200/70 backdrop-blur-2xl text-zinc-900"
                : "bg-zinc-950/97 border-zinc-800/70 backdrop-blur-2xl text-zinc-100"
            }`}
          >
            {/* Subtle inner glow strip */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fd9602]/30 to-transparent" />
            </div>

            {/* Header */}
            <div className={`px-5 pt-5 pb-3 border-b shrink-0 ${isLight ? "border-zinc-200" : "border-zinc-800/60"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/25 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-[#fd9602]" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Central de Alertas</h3>
                    <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" />
                      Bot de Respeito ativo
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Section tabs */}
              <div className={`flex gap-1 p-1 rounded-xl ${isLight ? "bg-zinc-100" : "bg-zinc-900"}`}>
                {(["alerts", "chat"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSection(s)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeSection === s
                        ? "bg-[#fd9602] text-zinc-950"
                        : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s === "alerts" ? (
                      <span className="inline-flex items-center justify-center gap-1">
                        Alertas
                        {unreadCount > 0 && (
                          <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    ) : (
                      "Chat Bot"
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section body */}
            <AnimatePresence mode="wait">
              {activeSection === "alerts" && (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {unreadCount > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={onMarkAllRead}
                      className="text-[9px] font-black text-[#fd9602] hover:text-amber-600 uppercase tracking-wider w-full text-right transition-colors cursor-pointer"
                    >
                      Marcar todas como lidas
                    </motion.button>
                  )}

                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className={`text-xs font-bold mt-1 ${isLight ? "text-zinc-600" : "text-zinc-300"}`}>
                        Nenhum alerta ativo
                      </p>
                      <p className="text-[10px] text-zinc-500">Sistema operando normalmente</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {alerts.map((alert) => {
                        const cfg = ALERT_CONFIG[alert.type]
                        const AlertIcon = cfg.icon
                        return (
                          <motion.div
                            key={alert.id}
                            layout
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: alert.read ? 0.55 : 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
                            className={`p-3.5 rounded-2xl border relative ${cfg.bg}`}
                          >
                            {!alert.read && (
                              <div className="absolute top-3 right-9 w-1.5 h-1.5 rounded-full bg-[#fd9602]" />
                            )}
                            <div className="flex items-start gap-2.5">
                              <AlertIcon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-black leading-snug ${isLight ? "text-zinc-800" : "text-white"}`}>
                                  {alert.title}
                                </p>
                                <p className={`text-[10px] mt-0.5 leading-snug ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                                  {alert.body}
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-1">
                                  {alert.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onDismissAlert(alert.id)}
                                className={`shrink-0 p-1 rounded-lg transition-colors cursor-pointer mt-0.5 ${
                                  isLight ? "hover:bg-white/60 text-zinc-400" : "hover:bg-zinc-800 text-zinc-600"
                                }`}
                              >
                                <X size={10} />
                              </motion.button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </motion.div>
              )}

              {activeSection === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  {/* Bot identity bar */}
                  <div className={`px-4 py-2.5 flex items-center gap-2.5 border-b shrink-0 ${
                    isLight ? "border-zinc-100 bg-zinc-50/60" : "border-zinc-800/40 bg-zinc-900/30"
                  }`}>
                    <div className="w-6 h-6 rounded-lg bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-[#fd9602] animate-pulse" />
                    </div>
                    <div>
                      <p className={`text-[9px] font-black ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>
                        Agendei SaaS AI
                      </p>
                      <span className="flex items-center gap-1 text-[8px] text-emerald-500 font-bold">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" />
                        online
                      </span>
                    </div>
                  </div>

                  {/* Messages body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-2 max-w-[88%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                          m.sender === "user"
                            ? "bg-zinc-800 border-zinc-700 text-[#fd9602]"
                            : "bg-[#fd9602]/10 border-[#fd9602]/20 text-[#fd9602]"
                        }`}>
                          {m.sender === "user" ? <User size={10} /> : <Bot size={10} />}
                        </div>
                        <div className={`p-3 rounded-xl text-[10px] leading-relaxed font-medium whitespace-pre-wrap ${
                          m.sender === "user"
                            ? isLight
                              ? "bg-zinc-900 text-white rounded-tr-none"
                              : "bg-white text-zinc-950 rounded-tr-none"
                            : isLight
                              ? "bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-tl-none"
                              : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input */}
                  <form
                    onSubmit={onSendMessage}
                    className={`flex gap-2 p-4 border-t shrink-0 ${isLight ? "border-zinc-200" : "border-zinc-800/60"}`}
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => onInputChange(e.target.value)}
                      placeholder="Perguntar sobre MRR, bugs, parceiros..."
                      className={`flex-1 border rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#fd9602]/20 transition-shadow ${
                        isLight
                          ? "bg-zinc-50 border-zinc-200 text-zinc-900"
                          : "bg-zinc-900 border-zinc-800 text-white"
                      }`}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                        isLight
                          ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                          : "bg-white hover:bg-zinc-100 text-zinc-950"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
