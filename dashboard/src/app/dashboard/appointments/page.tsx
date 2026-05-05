"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, Calendar as CalendarIcon,
  Clock, ChevronDown, X, Check, MoreHorizontal,
  Trash2, Edit3, User, Sparkles, Tag, PlusCircle,
  LayoutGrid, List
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// FullCalendar Imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";

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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, customer: "Carlos Alberto", services: [mockServices[0]], date: "2026-05-05", time: "14:00", totalPrice: 45.0, status: "Confirmado" },
    { id: 2, customer: "Juliana Silva", services: [mockServices[1]], date: "2026-05-05", time: "15:30", totalPrice: 35.0, status: "Confirmado" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>(mockServices);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  
  const [formData, setFormData] = useState({
    customer: "",
    time: "10:00",
    date: "2026-05-05"
  });

  const events = appointments.map(app => ({
    id: String(app.id),
    title: `${app.customer} - ${app.services.map(s => s.nome).join(", ")}`,
    start: `${app.date}T${app.time}`,
    extendedProps: { ...app }
  }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Adicione ao menos um serviço.");
      return;
    }

    const newApp: Appointment = {
      id: editingApp ? editingApp.id : Date.now(),
      customer: formData.customer,
      services: selectedServices,
      date: formData.date,
      time: formData.time,
      totalPrice: calculateTotal(),
      status: "Confirmado"
    };

    if (editingApp) {
      setAppointments(appointments.map(a => a.id === editingApp.id ? newApp : a));
      toast.success("Agendamento atualizado!");
    } else {
      setAppointments([newApp, ...appointments]);
      toast.success("Agendamento criado!");
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
    setSelectedServices([]);
    setFormData({ customer: "", time: "10:00", date: "2026-05-05" });
  };

  const calculateTotal = () => selectedServices.reduce((sum, s) => sum + s.preco, 0);

  const addServiceToApp = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) return;
    setSelectedServices([...selectedServices, service]);
    setServiceSearch("");
  };

  const removeServiceFromApp = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };

  const handleEventClick = (info: any) => {
    const app = info.event.extendedProps;
    openEditModal(app);
  };

  const openEditModal = (app: Appointment) => {
    setEditingApp(app);
    setFormData({
      customer: app.customer,
      time: app.time,
      date: app.date
    });
    setSelectedServices(app.services);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight">Agenda</h2>
          <p className="text-zinc-500 font-medium text-sm">Gerencie seus horários e agendamentos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-card border border-subtle p-1.5 rounded-2xl flex gap-1 items-center">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                viewMode === "list" ? "bg-[#fd9602] text-zinc-950 shadow-lg shadow-[#fd9602]/10" : "text-zinc-500 hover:text-title"
              )}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                viewMode === "calendar" ? "bg-[#fd9602] text-zinc-950 shadow-lg shadow-[#fd9602]/10" : "text-zinc-500 hover:text-title"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendário
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-3.5 px-6 shadow-lg shadow-[#fd9602]/20"
          >
            <PlusCircle className="w-5 h-5" />
            Novo
          </button>
        </div>
      </div>

      <div>
        {viewMode === "calendar" ? (
          <div className="bg-card border border-subtle p-6 rounded-2xl shadow-2xl overflow-hidden">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              locale={ptBrLocale}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              nowIndicator={true}
            />
          </div>
        ) : (
          <div className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-subtle bg-zinc-500/5">
                  <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Serviços</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Horário</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-500/5 group transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-title">{app.customer}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {app.services.map((s, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-1 bg-[#fd9602]/10 text-[#fd9602] rounded-lg font-bold uppercase tracking-tighter">
                            {s.nome}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-title font-bold text-sm">
                        <Clock size={14} className="text-[#fd9602]" />
                        {app.time}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[#fd9602] font-bold text-base">R$ {app.totalPrice.toFixed(2)}</td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-3 hover:bg-[#fd9602] hover:text-zinc-950 rounded-xl text-zinc-500 transition-all group/edit"
                      >
                        <Edit3 size={18} className="group-hover/edit:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingApp ? "Editar Agendamento" : "Novo Agendamento"}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Cliente</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
              <input
                required
                value={formData.customer}
                onChange={e => setFormData({ ...formData, customer: e.target.value })}
                type="text"
                className="w-full bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-zinc-800 border border-subtle rounded-2xl p-4 text-title outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Horário</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-zinc-800 border border-subtle rounded-2xl p-4 text-title outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Serviços</label>
            <div className="relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
              <input
                type="text"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                placeholder="Adicionar serviço..."
                className="w-full bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
              {serviceSearch && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-subtle rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2 backdrop-blur-xl">
                  {availableServices
                    .filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => addServiceToApp(s)}
                        className="w-full text-left p-3 hover:bg-[#fd9602] hover:text-zinc-950 rounded-xl flex justify-between items-center font-bold text-sm"
                      >
                        {s.nome} <span>R$ {s.preco}</span>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedServices.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-[#fd9602] text-zinc-950 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-lg shadow-[#fd9602]/10">
                  {s.nome}
                  <button onClick={() => removeServiceFromApp(s.id)} type="button"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#fd9602]/5 rounded-2xl border border-[#fd9602]/10">
            <span className="text-zinc-500 font-bold text-sm">Total estimado:</span>
            <span className="text-2xl font-bold text-[#fd9602]">R$ {calculateTotal().toFixed(2)}</span>
          </div>

          <button type="submit" className="btn-primary w-full py-5 text-lg">
            {editingApp ? "Salvar Alterações" : "Confirmar Agendamento"}
          </button>

          {editingApp && (
            <button
              type="button"
              onClick={() => {
                setAppointments(appointments.filter(a => a.id !== editingApp.id));
                closeModal();
                toast.success("Agendamento excluído.");
              }}
              className="w-full text-red-500 font-bold text-sm hover:underline"
            >
              Excluir Agendamento
            </button>
          )}
        </form>
      </Modal>
    </div>
  );
}
