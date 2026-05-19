import React from 'react'
import { motion } from 'framer-motion'
import { X, Bell } from 'lucide-react'

interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: AppNotification[]
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[70vh] flex flex-col"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#fd9602]" /> Notificações
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id}
                className={`p-4 rounded-2xl border transition-all ${
                  n.unread 
                    ? 'bg-[#fd9602]/5 border-[#fd9602]/15 shadow-sm shadow-[#fd9602]/5' 
                    : 'bg-zinc-950/40 border-white/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#fd9602] shrink-0" />}
                    {n.title}
                  </h4>
                  <span className="text-[9px] text-zinc-500 font-medium">{n.time}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{n.description}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
