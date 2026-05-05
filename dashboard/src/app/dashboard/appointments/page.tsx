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

const mockServices: Service[] = [
  { id: 'm1', nome: "Corte Degradê", preco: 45, duracao_minutos: 30 },
  { id: 'm2', nome: "Barba Terapia", preco: 35, duracao_minutos: 25 },
  { id: 'm3', nome: "Sobrancelha", preco: 15, duracao_minutos: 10 },
  { id: 'm4', nome: "Corte + Barba", preco: 75, duracao_minutos: 60 },
  { id: 'm5', nome: "Limpeza de Pele", preco: 50, duracao_minutos: 40 },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, customer: "Carlos Alberto", services: [mockServices[0]], date: "05 Mai 2026", time: "14:00", totalPrice: 45.0, status: "Confirmado" },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>(mockServices);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer: "",
    time: "10:00",
  });


  // Carrega serviços reais do Supabase e mescla com os de demo
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('servicos').select('*');
      if (data && data.length > 0) {
          // Converte campos do banco se necessário
          const formatted = data.map((s: any) => ({
              id: s.id,
              nome: s.nome,
              preco: s.preco,
              duracao_minutos: s.duracao_minutos
          }));
          setAvailableServices([...formatted, ...mockServices]);
      }
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
          className="btn-primary px-6 py-3"
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
          <FilterButton 
            label="Filtros" 
            id="filtros" 
            activeId={activeFilter} 
            setActiveId={setActiveFilter} 
          />
          <FilterButton 
            label="Hoje" 
            id="hoje" 
            activeId={activeFilter} 
            setActiveId={setActiveFilter} 
            icon={<CalendarIcon className="w-4 h-4" />} 
          />
        </div>

      </div>

      {/* Table */}
      <div className="bg-card border border-subtle rounded-3xl shadow-sm">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" 
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 30 }} 
                className="relative w-full max-w-lg bg-card border border-subtle rounded-[40px] p-8 sm:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Efeito de brilho no topo do modal */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black text-title tracking-tight">Agendar Horário</h3>
                    <p className="text-sm text-zinc-500 font-medium">Preencha os detalhes do atendimento.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-3 hover:bg-zinc-500/10 rounded-2xl text-zinc-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    Cliente
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-accent transition-colors" />
                    <input 
                      required 
                      value={formData.customer} 
                      onChange={e => setFormData({...formData, customer: e.target.value})}
                      type="text" 
                      placeholder="Nome do cliente..." 
                      className="w-full bg-zinc-500/5 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    Serviços & Procedimentos
                  </label>
                  
                  <div className="relative group">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-accent transition-colors" />
                    <input 
                        type="text"
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        placeholder="Pesquisar serviço (ex: Corte, Barba...)"
                        className="w-full bg-zinc-500/5 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                    />
                    
                    <AnimatePresence>
                      {serviceSearch && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 w-full mt-3 bg-card border border-subtle rounded-3xl shadow-2xl max-h-56 overflow-y-auto p-3 backdrop-blur-xl"
                        >
                            {availableServices
                                .filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()))
                                .map(s => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => addServiceToApp(s)}
                                        className="w-full text-left p-4 hover:bg-accent hover:text-white rounded-2xl flex justify-between items-center transition-all group/item"
                                    >
                                        <span className="font-bold text-sm">{s.nome}</span>
                                        <span className="text-xs font-medium opacity-60">R$ {s.preco}</span>
                                    </button>
                                ))
                            }
                            {availableServices.filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-sm text-zinc-500 font-medium">Nenhum serviço encontrado.</div>
                            )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map(s => (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={s.id} 
                          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-accent/20"
                        >
                            <Tag size={14} />
                            {s.nome}
                            <button onClick={() => removeServiceFromApp(s.id)} type="button" className="ml-1 p-0.5 hover:bg-white/20 rounded-md">
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Horário</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="time" 
                        value={formData.time} 
                        onChange={e => setFormData({...formData, time: e.target.value})} 
                        className="w-full bg-zinc-500/5 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Total</label>
                    <div className="w-full px-6 py-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-black text-xl flex items-center justify-center">
                        R$ {calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full py-5 text-lg mt-4"
                >
                  Confirmar Agendamento
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function FilterButton({ label, icon, id, activeId, setActiveId }: any) {
    const isOpen = activeId === id;
    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(isOpen ? null : id);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-500/5 hover:bg-zinc-500/10 rounded-xl text-sm font-bold text-zinc-500 transition-all"
            >
                {icon || <Filter className="w-4 h-4" />}
                {label}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 right-0 w-52 bg-card border border-subtle rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-2 z-[100] backdrop-blur-xl"
                    >
                        <div className="p-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-subtle mb-1">Ordenar por</div>
                        <DropdownItem icon={<Clock size={14}/>} label="Mais Recentes" onClick={() => setActiveId(null)} />
                        <DropdownItem icon={<Tag size={14}/>} label="Menor Preço" onClick={() => setActiveId(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
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
