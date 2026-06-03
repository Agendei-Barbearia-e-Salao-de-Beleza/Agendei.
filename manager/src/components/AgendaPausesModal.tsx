import React from 'react'
import { motion } from 'framer-motion'
import { X, Clock } from 'lucide-react'

interface Pause {
  id: string
  motivo: string
  data: string
}

interface AgendaPausesModalProps {
  isOpen: boolean
  onClose: () => void
  pauses: Pause[]
  onDeletePause: (id: string) => void
}

export const AgendaPausesModal: React.FC<AgendaPausesModalProps> = ({
  isOpen,
  onClose,
  pauses,
  onDeletePause
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
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[60vh] flex flex-col"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" /> Bloqueios de Agenda
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {pauses.length === 0 ? (
            <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-2xl text-center text-zinc-500 text-xs font-semibold py-10">
              Nenhum bloqueio programado
            </div>
          ) : (
            <div className="space-y-2">
              {pauses.map(p => (
                <div 
                  key={p.id}
                  className="bg-zinc-950 border border-white/5 px-4 py-3 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300">Motivo: {p.motivo}</h4>
                    <p className="text-zinc-500 text-[9px] mt-0.5">
                      Data: {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeletePause(p.id)}
                    className="px-2.5 py-1 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl active:scale-95 transition-all shrink-0"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
