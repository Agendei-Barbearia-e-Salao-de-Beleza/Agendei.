import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDays: Date[];
  setSelectedDays: (days: Date[]) => void;
  pauseReason: string;
  setPauseReason: (reason: string) => void;
  handlePauseSubmit: (e: any) => void | Promise<void>;
  pauseLoading: boolean;
  allPauses: any[];
  removePause: (id: string) => void;
}

export function PauseModal({
  isOpen,
  onClose,
  selectedDays,
  setSelectedDays,
  pauseReason,
  setPauseReason,
  handlePauseSubmit,
  pauseLoading,
  allPauses,
  removePause
}: PauseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Planejar Folga">
      <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar p-1">
        <div className="bg-zinc-100 dark:bg-zinc-900/50 p-6 rounded-3xl border border-subtle dark:border-zinc-800 flex flex-col items-center">
            <DayPicker
              mode="multiple"
              selected={selectedDays}
              onSelect={(days) => setSelectedDays(days || [])}
              locale={ptBR}
              className="rdp-custom"
            />
        </div>
        <div className="space-y-4">
          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Motivo da Folga</label>
          <input value={pauseReason} onChange={e => setPauseReason(e.target.value)} placeholder="Ex: Reforma, Feriado..." className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl px-6 py-5 dark:text-white outline-none focus:ring-4 focus:ring-[#fd9602]/10 transition-all font-bold placeholder:text-zinc-600" />
        </div>
        <button onClick={handlePauseSubmit} disabled={pauseLoading} className="w-full btn-primary py-6 text-lg font-black flex items-center justify-center gap-3">
          {pauseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Agendar Folga"}
        </button>

        {allPauses.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-subtle dark:border-zinc-800">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Folgas Agendadas</label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {allPauses.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-subtle dark:border-zinc-800 group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-title dark:text-white">
                      {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">{p.motivo || "Sem motivo informado"}</span>
                  </div>
                  <button 
                    onClick={() => removePause(p.id)} 
                    className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    title="Remover Folga"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
