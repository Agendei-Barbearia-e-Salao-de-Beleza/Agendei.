import React from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { CustomDatePicker } from "@/components/Pickers";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  expenseData: {
    description: string;
    value: string;
    category: string;
    date: string;
  };
  setExpenseData: (data: any) => void;
  expenseLoading: boolean;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  expenseData,
  setExpenseData,
  expenseLoading
}: ExpenseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Despesa">
      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">O que você pagou?</label>
          <input required type="text" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} placeholder="Ex: Aluguel..." className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl px-6 py-5 dark:text-white outline-none focus:ring-4 focus:ring-[#fd9602]/10 transition-all font-bold placeholder:text-zinc-600" />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Valor (R$)</label>
          <input required type="text" value={expenseData.value} onChange={e => setExpenseData({...expenseData, value: e.target.value})} placeholder="0,00" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl px-6 py-5 dark:text-white outline-none focus:ring-4 focus:ring-[#fd9602]/10 transition-all font-black text-2xl placeholder:text-zinc-600" />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Categoria</label>
          <select 
            value={expenseData.category} 
            onChange={e => setExpenseData({...expenseData, category: e.target.value})}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl px-6 py-5 dark:text-white outline-none focus:ring-4 focus:ring-[#fd9602]/10 transition-all font-bold appearance-none cursor-pointer"
          >
            <option value="Suprimentos">Suprimentos</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Energia/Água">Energia/Água</option>
            <option value="Marketing">Marketing</option>
            <option value="Equipamentos">Equipamentos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Data do Pagamento</label>
          <CustomDatePicker 
            date={expenseData.date} 
            onChange={(d) => setExpenseData({ ...expenseData, date: d })} 
          />
        </div>
        <button type="submit" disabled={expenseLoading} className="w-full btn-primary py-6 text-lg font-black flex items-center justify-center gap-3">
          {expenseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Saída"}
        </button>
      </form>
    </Modal>
  );
}
