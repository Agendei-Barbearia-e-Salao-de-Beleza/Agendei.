"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, Plus, Calendar as CalendarIcon,
  Clock, ChevronDown, X, Check, MoreHorizontal,
  Trash2, Edit3, User, Sparkles, Tag, PlusCircle,
  LayoutGrid, List, Loader2, AlertTriangle
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
import { CustomDatePicker, CustomTimePicker } from "@/components/Pickers";
import "react-day-picker/dist/style.css";

interface Service {
  id: string;
  nome: string;
  preco: number;
}

interface Appointment {
  id: string;
  customer: string;
  services: Service[];
  date: string;
  time: string;
  totalPrice: number;
  status: string;
}

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  
  const [formData, setFormData] = useState({
    customer: "",
    time: "10:00",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', user.id)
        .single();

      if (estData) {
        setEstablishmentId(estData.id);
        await Promise.all([
          fetchAppointments(estData.id),
          fetchServices(estData.id)
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointments(estId: string) {
    const { data } = await supabase
      .from('agendamentos')
      .select(`
        *,
        usuarios!agendamentos_cliente_id_fkey(nome)
      `)
      .eq('estabelecimento_id', estId)
      .order('data_hora', { ascending: false });

    if (data) {
      setAppointments(data.map(app => {
        const dt = new Date(app.data_hora);
        return {
          id: app.id,
          customer: (app.usuarios as any)?.nome || "Cliente",
          services: app.servicos || [],
          date: dt.toISOString().split('T')[0],
          time: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          totalPrice: app.preco_total,
          status: app.status
        };
      }));
    }
  }

  async function fetchServices(estId: string) {
    const { data } = await supabase
      .from('servicos')
      .select('id, nome, preco')
      .eq('estabelecimento_id', estId);
    
    if (data) setAvailableServices(data);
  }

  const events = useMemo(() => appointments.map(app => ({
    id: app.id,
    title: `${app.customer} - ${app.services.map(s => s.nome).join(", ")}`,
    start: `${app.date}T${app.time}`,
    extendedProps: { ...app }
  })), [appointments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
    if (selectedServices.length === 0) {
      toast.error("Adicione ao menos um serviço.");
      return;
    }

    setLoading(true);
    try {
      let clientId = null;
      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome', formData.customer)
        .eq('perfil', 'CLIENTE')
        .limit(1);
      
      if (userData && userData.length > 0) {
        clientId = userData[0].id;
      } else {
        const fakeEmail = `${formData.customer.toLowerCase().replace(/\s+/g, '.')}.${Math.random().toString(36).substring(7)}@agendei.auto`;
        
        const { data: newUser, error: userError } = await supabase
          .from('usuarios')
          .insert([{ 
            nome: formData.customer, 
            perfil: 'CLIENTE',
            email: fakeEmail
          }])
          .select()
          .single();
        
        if (userError) throw userError;
        clientId = newUser.id;

        await supabase
          .from('clientes_estabelecimentos')
          .insert([{ cliente_id: clientId, estabelecimento_id: establishmentId }]);
      }

      if (!clientId) throw new Error("Falha ao identificar ou criar cliente.");

      const dataHora = `${formData.date}T${formData.time}:00`;
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.preco, 0);

      const payload = {
        cliente_id: clientId,
        estabelecimento_id: establishmentId,
        servicos: selectedServices,
        preco_total: totalPrice,
        data_hora: dataHora,
        status: editingApp ? editingApp.status : 'APROVADO'
      };

      if (editingApp) {
        const { error } = await supabase
          .from('agendamentos')
          .update(payload)
          .eq('id', editingApp.id);
        if (error) throw error;
        toast.success("Agendamento atualizado!");
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .insert([payload]);
        if (error) throw error;
        toast.success("Agendamento criado!");
      }

      await fetchAppointments(establishmentId);
      closeModal();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setAppToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appToDelete);

      if (error) throw error;
      
      setAppointments(appointments.filter(a => a.id !== appToDelete));
      toast.success("Agendamento excluído.");
      setIsConfirmOpen(false);
      closeModal();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
    setSelectedServices([]);
    setFormData({ customer: "", time: "10:00", date: new Date().toISOString().split('T')[0] });
  };

  const addServiceToApp = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) return;
    setSelectedServices([...selectedServices, service]);
    setServiceSearch("");
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
      {/* Custom styles for FullCalendar header */}
      <style>{`
        .fc-col-header-cell {
          background-color: #fd9602 !important;
          color: #000 !important;
          border-color: rgba(0,0,0,0.1) !important;
          padding: 12px 0 !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.1em !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(255,255,255,0.05) !important;
        }
        .fc-col-header-cell-cushion {
          color: #000 !important;
          text-decoration: none !important;
        }
        .fc-event {
          background-color: rgba(253, 150, 2, 0.15) !important;
          border: 1px solid #fd9602 !important;
          border-left: 4px solid #fd9602 !important;
          color: #fff !important;
          border-radius: 12px !important;
          padding: 6px 10px !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .fc-event:hover {
          background-color: rgba(253, 150, 2, 0.3) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(253, 150, 2, 0.2) !important;
        }
        .fc-now-indicator-line {
          border-color: #fd9602 !important;
          border-width: 2px !important;
        }
        .fc-now-indicator-arrow {
          border-color: #fd9602 !important;
          background-color: #fd9602 !important;
        }
        .fc-timegrid-slot {
          height: 3.5em !important;
        }
        .fc-timegrid-axis-cushion {
          font-size: 11px !important;
          font-weight: bold !important;
          color: #666 !important;
          text-transform: uppercase !important;
        }
        .fc-v-event .fc-event-main {
          color: #fff !important;
        }
        .fc-timegrid-event .fc-event-time {
          font-weight: 900 !important;
          color: #fd9602 !important;
          margin-bottom: 2px !important;
        }
        .dark .fc-col-header-cell {
          background-color: #fd9602 !important;
          color: #000 !important;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight dark:text-white">Agenda</h2>
          <p className="text-zinc-500 font-medium text-sm">Gerencie seus horários e agendamentos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-card border border-subtle p-1.5 rounded-2xl flex gap-1 items-center">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                viewMode === "list" ? "bg-[#fd9602] text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-title"
              )}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                viewMode === "calendar" ? "bg-[#fd9602] text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-title"
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
        {loading && appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-10 h-10 text-[#fd9602] animate-spin" />
             <p className="text-zinc-500 font-medium">Carregando agenda...</p>
          </div>
        ) : viewMode === "calendar" ? (
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
              eventClick={(info) => openEditModal(info.event.extendedProps as Appointment)}
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
                      <span className="text-sm font-bold text-title dark:text-white">{app.customer}</span>
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
                      <div className="flex items-center gap-2 text-title dark:text-white font-bold text-sm">
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
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Cliente</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
              <input
                required
                value={formData.customer}
                onChange={e => setFormData({ ...formData, customer: e.target.value })}
                type="text"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Data</label>
              <CustomDatePicker 
                date={formData.date} 
                onChange={(d) => setFormData({ ...formData, date: d })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Horário</label>
              <CustomTimePicker 
                time={formData.time} 
                onChange={(t) => setFormData({ ...formData, time: t })} 
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
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
              {serviceSearch && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-100 dark:bg-zinc-900 border border-subtle rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2 backdrop-blur-xl">
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
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => addServiceToApp(s)}
                        className="w-full text-left p-3 hover:bg-[#fd9602] hover:text-zinc-950 rounded-xl flex justify-between items-center font-bold text-sm"
                      >
                        {s.nome} <span>R$ {s.preco}</span>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedServices.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-[#fd9602] text-zinc-950 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-lg shadow-[#fd9602]/10">
                  {s.nome}
                  <button onClick={() => setSelectedServices(selectedServices.filter(x => x.id !== s.id))} type="button"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#fd9602]/5 rounded-2xl border border-[#fd9602]/10">
            <span className="text-zinc-500 font-bold text-sm">Total estimado:</span>
            <span className="text-2xl font-bold text-[#fd9602]">R$ {selectedServices.reduce((sum, s) => sum + s.preco, 0).toFixed(2)}</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingApp ? "Salvar Alterações" : "Confirmar Agendamento")}
          </button>

          {editingApp && (
            <button
              type="button"
              onClick={() => confirmDelete(editingApp.id)}
              className="w-full text-red-500 font-bold text-sm hover:underline"
            >
              Excluir Agendamento
            </button>
          )}
        </form>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-500 w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">Tem certeza?</h4>
            <p className="text-zinc-500 text-sm">Esta ação não pode ser desfeita. O agendamento será removido permanentemente.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 py-4 px-6 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-4 px-6 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
