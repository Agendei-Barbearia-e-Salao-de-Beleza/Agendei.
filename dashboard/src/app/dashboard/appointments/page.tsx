"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Plus, Calendar as CalendarIcon, 
  Clock, ChevronDown, X, Check, MoreHorizontal, 
  Trash2, Edit3, User, Sparkles, Tag, PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
}

interface Appointment {
  id: string | number;
  customer: string;
  services: Service[];
  date: string;
  time: string;
  totalPrice: number;
  status: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, customer: "Carlos Alberto", services: [{ id: '1', nome: "Corte Degradê", preco: 45, duracao_minutos: 30 }], date: "05 Mai 2026", time: "14:00", totalPrice: 45.0, status: "Confirmado" },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | string | null>(null);

  const [formData, setFormData] = useState({
    customer: "",
    time: "10:00",
  });

  // Carrega serviços reais do Supabase
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('servicos').select('*');
      if (data) setAvailableServices(data);
    };
    fetchServices();
  }, []);

  const addServiceToApp = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      toast.error("Serviço já adicionado!");
      return;
    }
    setSelectedServices([...selectedServices, service]);
    setServiceSearch("");
  };

  const removeServiceFromApp = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };

  const calculateTotal = () => selectedServices.reduce((sum, s) => sum + s.preco, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
        toast.error("Adicione ao menos um serviço.");
        return;
    }

    const newApp: Appointment = {
      id: Date.now(),
      customer: formData.customer,
      services: selectedServices,
      date: "05 Mai 2026",
      time: formData.time,
      totalPrice: calculateTotal(),
      status: "Confirmado"
    };

    setAppointments([newApp, ...appointments]);
    setIsModalOpen(false);
    setSelectedServices([]);
    setFormData({ customer: "", time: "10:00" });
    toast.success("Agendamento multi-serviço criado!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-title">Agenda</h2>
          <p className="text-zinc-500">Gerencie horários e serviços combinados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:opacity-90 shadow-lg shadow-indigo-500/10"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      {/* Toolbar with Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-subtle p-4 rounded-3xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar agendamento..."
            className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterButton label="Filtros" />
          <FilterButton label="Hoje" icon={<CalendarIcon className="w-4 h-4" />} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-subtle rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-subtle bg-zinc-500/5">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Serviços</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Horário</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y border-subtle">
            <AnimatePresence mode="popLayout">
              {appointments.map((app) => (
                <motion.tr 
                    key={app.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-500/5 group"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-title">{app.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                        {app.services.map((s, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-zinc-500/10 text-zinc-500 rounded-full font-medium">
                                {s.nome}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-title font-bold text-sm">
                        <Clock size={14} className="text-accent" />
                        {app.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-accent font-bold">R$ {app.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                        onClick={() => setIsDropdownOpen(isDropdownOpen === app.id ? null : app.id)}
                        className="p-2 hover:bg-zinc-500/10 rounded-lg text-zinc-400 hover:text-title"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {isDropdownOpen === app.id && (
                        <div className="absolute right-6 top-12 z-50 w-40 bg-card border border-subtle rounded-xl shadow-xl p-1">
                            <DropdownItem icon={<Edit3 size={14}/>} label="Editar" />
                            <DropdownItem icon={<Check size={14}/>} label="Concluir" color="text-emerald-500" />
                            <div className="h-px bg-subtle my-1" />
                            <DropdownItem 
                                icon={<Trash2 size={14}/>} 
                                label="Excluir" 
                                color="text-red-500" 
                                onClick={() => {
                                    setAppointments(appointments.filter(a => a.id !== app.id));
                                    toast.success("Agendamento removido.");
                                }}
                            />
                        </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Multi-Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-xl bg-card border border-subtle rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-xl">
                        <CalendarIcon className="text-accent w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-title">Novo Agendamento</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-500/10 rounded-full text-zinc-500"><X /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} /> Cliente
                  </label>
                  <input 
                    required 
                    value={formData.customer} 
                    onChange={e => setFormData({...formData, customer: e.target.value})}
                    type="text" 
                    placeholder="Quem vamos atender?" 
                    className="w-full px-4 py-3 rounded-2xl outline-none" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} /> Adicionar Serviços
                  </label>
                  
                  {/* Autocomplete / Search */}
                  <div className="relative">
                    <input 
                        type="text"
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        placeholder="Pesquisar serviço cadastrado..."
                        className="w-full px-4 py-3 rounded-2xl outline-none border-dashed border-accent/30"
                    />
                    {serviceSearch && (
                        <div className="absolute z-50 w-full mt-2 bg-card border border-subtle rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                            {availableServices
                                .filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()))
                                .map(s => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => addServiceToApp(s)}
                                        className="w-full text-left p-3 hover:bg-accent/5 rounded-xl flex justify-between items-center group"
                                    >
                                        <span className="text-sm font-bold group-hover:text-accent">{s.nome}</span>
                                        <span className="text-xs text-zinc-500">R$ {s.preco}</span>
                                    </button>
                                ))
                            }
                        </div>
                    )}
                  </div>

                  {/* Selected Services Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-bold">
                            <Tag size={12} />
                            {s.nome}
                            <button onClick={() => removeServiceFromApp(s.id)} type="button" className="hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Horário</label>
                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Estimado</label>
                    <div className="w-full px-4 py-3 rounded-2xl bg-zinc-500/5 text-accent font-bold text-lg flex items-center">
                        R$ {calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-accent text-white font-bold py-4 rounded-[20px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                  Finalizar Agendamento
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, icon }: any) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-500/5 hover:bg-zinc-500/10 rounded-xl text-sm font-bold text-zinc-500"
            >
                {icon || <Filter className="w-4 h-4" />}
                {label}
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-card border border-subtle rounded-xl shadow-2xl p-2 z-50">
                    <div className="p-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Opções</div>
                    <button className="w-full text-left p-2 text-sm hover:bg-zinc-500/5 rounded-lg text-title">Mais Recentes</button>
                    <button className="w-full text-left p-2 text-sm hover:bg-zinc-500/5 rounded-lg text-title">Por Valor</button>
                </div>
            )}
        </div>
    );
}

function DropdownItem({ icon, label, color, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-2.5 text-sm font-bold rounded-lg hover:bg-zinc-500/5 transition-all ${color || 'text-zinc-500 hover:text-title'}`}
        >
            {icon}
            {label}
        </button>
    );
}
