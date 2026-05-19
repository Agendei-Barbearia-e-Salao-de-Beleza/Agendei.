import React from "react";
import { User, Sparkles, X, Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { CustomDatePicker, CustomTimePicker } from "@/components/Pickers";

interface Service {
  id: string;
  nome: string;
  preco: number;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  appFormData: any;
  setAppFormData: (data: any) => void;
  serviceSearch: string;
  setServiceSearch: (search: string) => void;
  availableServices: Service[];
  selectedServices: Service[];
  setSelectedServices: (services: Service[]) => void;
  appLoading: boolean;
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  appFormData,
  setAppFormData,
  serviceSearch,
  setServiceSearch,
  availableServices,
  selectedServices,
  setSelectedServices,
  appLoading
}: AppointmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marcar Agendamento">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cliente</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
            <input required value={appFormData.customer} onChange={e => setAppFormData({...appFormData, customer: e.target.value})} type="text" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Data</label>
            <CustomDatePicker 
              date={appFormData.date} 
              onChange={(d) => setAppFormData({ ...appFormData, date: d })} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Horário</label>
            <CustomTimePicker 
              time={appFormData.time} 
              onChange={(t) => setAppFormData({ ...appFormData, time: t })} 
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Serviços</label>
          <div className="relative group">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
            <input type="text" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} placeholder="Pesquisar serviço..." className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" />
            {serviceSearch && (
              <div className="absolute z-50 w-full mt-2 bg-zinc-100 dark:bg-zinc-900 border border-subtle rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                {(() => {
                  const filtered = availableServices.filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()));
                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-zinc-500 font-bold text-sm">Não encontrado</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Tente outro nome</p>
                      </div>
                    );
                  }
                  return filtered.map(s => (
                    <button key={s.id} type="button" onClick={() => {
                      if (!selectedServices.find(x => x.id === s.id)) setSelectedServices([...selectedServices, s]);
                      setServiceSearch("");
                    }} className="w-full text-left p-3 hover:bg-[#fd9602] hover:text-zinc-950 rounded-xl flex justify-between items-center font-bold text-sm">
                      {s.nome} <span>R$ {s.preco}</span>
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map(s => (
              <div key={s.id} className="flex items-center gap-2 bg-[#fd9602] text-zinc-950 px-3 py-1.5 rounded-xl text-[10px] font-black">
                {s.nome} <button onClick={() => setSelectedServices(selectedServices.filter(x => x.id !== s.id))} type="button"><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" disabled={appLoading} className="btn-primary w-full py-5 text-lg font-black flex items-center justify-center gap-2">
          {appLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Agendamento"}
        </button>
      </form>
    </Modal>
  );
}
