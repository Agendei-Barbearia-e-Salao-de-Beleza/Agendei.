import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Coffee, Ban, DollarSign, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  setShowAppointmentModal: (show: boolean) => void;
  setShowPauseModal: (show: boolean) => void;
  setShowExpensesModal: (show: boolean) => void;
  isPaused: boolean;
}

export function QuickActions({
  setShowAppointmentModal,
  setShowPauseModal,
  setShowExpensesModal,
  isPaused,
}: QuickActionsProps) {
  return (
    <div className="glass-card p-8 rounded-2xl space-y-6 shadow-lg border border-white/5 bg-zinc-900/50">
      <h3 className="text-title dark:text-white font-black text-lg uppercase tracking-tight">Ações Rápidas</h3>
      <div className="space-y-3">
        <QuickActionButton 
          icon={<Calendar className="text-[#fd9602]" />} 
          label="Marcar Consulta" 
          color="text-[#fd9602]" 
          onClick={() => setShowAppointmentModal(true)} 
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isPaused ? "folga" : "pausa"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <QuickActionButton 
              icon={isPaused ? <Coffee className="text-emerald-500" /> : <Ban className="text-blue-500" />} 
              label={isPaused ? "Pausa Ativada" : "Marcar Pausa"} 
              color={isPaused ? "text-emerald-500" : "text-blue-500"}
              onClick={() => setShowPauseModal(true)} 
              statusIndicator={isPaused} 
            />
          </motion.div>
        </AnimatePresence>

        <QuickActionButton 
          icon={<DollarSign className="text-red-500" />} 
          label="Lançar Despesa" 
          color="text-red-500" 
          onClick={() => setShowExpensesModal(true)} 
        />
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick, statusIndicator, color }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/80 border border-white/5 transition-all group"
    >
      <div className="flex items-center gap-4">
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {statusIndicator && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
        )}
        <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}
