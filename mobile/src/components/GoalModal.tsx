import React from 'react'
import { motion } from 'framer-motion'
import { X, Target } from 'lucide-react'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalInput: string
  onGoalInputChange: (val: string) => void
  onSave: () => void
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalInput,
  onGoalInputChange,
  onSave
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
        className="w-full max-w-md bg-zinc-900 light:bg-white border-t border-white/10 light:border-black/5 ios-sheet p-6 relative z-10"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-[var(--foreground)] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#fd9602]" /> Ajustar Meta Mensal
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 light:bg-zinc-100 border border-white/5 light:border-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Defina um objetivo financeiro de faturamento ou saldo do mês para seu negócio. Isso ajuda a acompanhar a barra de progresso no painel inicial.
          </p>

          <div>
            <label className="block text-zinc-400 light:text-zinc-500 text-xs font-bold mb-1.5 uppercase tracking-wider">Valor Alvo (R$)</label>
            <input 
              type="number" 
              required
              placeholder="Ex: 5000"
              value={goalInput}
              onChange={e => onGoalInputChange(e.target.value)}
              className="w-full bg-zinc-950 light:bg-white border border-white/5 light:border-zinc-200 rounded-2xl px-4 py-3 text-sm text-zinc-200 light:text-zinc-950 focus:outline-none focus:border-[#fd9602]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-zinc-950 light:bg-zinc-100 border border-white/5 light:border-zinc-200 text-zinc-400 light:text-zinc-600 font-bold py-3.5 rounded-2xl text-xs active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={onSave}
              className="bg-[#fd9602] hover:bg-[#e08502] text-zinc-950 font-black py-3.5 rounded-2xl text-xs active:scale-95 transition-transform shadow-lg shadow-[#fd9602]/10"
            >
              Salvar Meta
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
