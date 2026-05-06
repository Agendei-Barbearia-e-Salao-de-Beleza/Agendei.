"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, DollarSign, Clock,
  MoreHorizontal, TrendingUp, ChevronRight,
  Eye, Coffee, Ban, Tag, Plus, Loader2, CheckCircle2,
  CalendarDays, Trash2, ArrowUpRight, ArrowDownRight,
  Sparkles, Rocket, PartyPopper, ChevronLeft, CheckCircle, X, User, PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tooltip } from "@/components/Tooltip";
import { Modal } from "@/components/Modal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  nome: string;
  preco: number;
}

const calendarStyles = `
  .rdp-custom {
    --rdp-accent-color: #fd9602;
    --rdp-background-color: #fd9602;
    margin: 0;
  }
  .rdp-nav_button {
    color: #fd9602 !important;
    background: rgba(253, 150, 2, 0.1) !important;
    border-radius: 12px !important;
  }
  .rdp-nav_button:hover {
    background: #fd9602 !important;
    color: #000 !important;
  }
  .rdp-head_cell {
    color: #666 !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
    padding-bottom: 15px !important;
  }
  .rdp-day {
    font-weight: 600 !important;
    border-radius: 12px !important;
    transition: all 0.2s ease !important;
  }
  .rdp-day:hover:not(.rdp-day_selected) {
    background: rgba(253, 150, 2, 0.1) !important;
    color: #fd9602 !important;
  }
  .rdp-day_selected {
    background: #fd9602 !important;
    color: #000 !important;
    font-weight: 900 !important;
    box-shadow: 0 8px 20px rgba(253, 150, 2, 0.3) !important;
  }
  .rdp-day_today:not(.rdp-day_selected) {
    color: #fd9602 !important;
    font-weight: 900 !important;
    border: 2px solid rgba(253, 150, 2, 0.3) !important;
  }
`;

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: "Clientes Totais", value: "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "0%", href: "/dashboard/customers" },
    { label: "Agendamentos/Mês", value: "0", icon: Calendar, color: "text-[#fd9602]", bg: "bg-[#fd9602]/10", trend: "0%", href: "/dashboard/appointments" },
    { label: "Receita Mensal", value: "R$ 0,00", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "0%", href: "/dashboard/finance" },
    { label: "Taxa de Retorno", value: "0%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", trend: "0%", href: "/dashboard/finance" },
  ]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  
  // Dashboard UI State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Onboarding Logic
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // New Appointment Logic
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [appFormData, setAppFormData] = useState({
    customer: "",
    time: "10:00",
    date: new Date().toISOString().split('T')[0]
  });

  // Pause Logic
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [pauseReason, setPauseReason] = useState("");
  const [allPauses, setAllPauses] = useState<any[]>([]);

  // Expenses Logic
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseData, setExpenseData] = useState({ description: "", value: "", category: "Outros" });

  // Goals Logic
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, target: 12000 });
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    fetchDashboardData();
    checkOnboarding();
  }, []);

  function checkOnboarding() {
    const completed = localStorage.getItem('agendei_onboarding_completed');
    if (!completed) {
      setTimeout(() => setShowOnboarding(true), 1500);
    }
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.nome || "Matheus Lucindo");

      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', user.id)
        .single();

      if (estData) {
        setEstablishmentId(estData.id);
        await Promise.all([
          fetchStats(estData.id),
          fetchTodayAppointments(estData.id),
          fetchPauses(estData.id),
          fetchGoal(estData.id),
          fetchServices(estData.id)
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAppointment(appId: string) {
    if (!establishmentId) return;

    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'CANCELADO' })
        .eq('id', appId);

      if (error) throw error;
      toast.success("Agendamento cancelado!");
      fetchTodayAppointments(establishmentId);
      setOpenMenuId(null);
    } catch (error: any) {
      toast.error("Erro ao cancelar: " + error.message);
    }
  }

  async function fetchStats(estId: string) {
    const { count: clientCount } = await supabase
      .from('clientes_estabelecimentos')
      .select('cliente_id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthAppCount } = await supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId)
      .gte('data_hora', startOfMonth.toISOString());

    const { data: payments } = await supabase
      .from('pagamentos')
      .select('valor')
      .gte('pago_em', startOfMonth.toISOString())
      .eq('status', 'PAGO');
    
    const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    setStats(prev => [
      { ...prev[0], value: (clientCount || 0).toString() },
      { ...prev[1], value: (monthAppCount || 0).toString() },
      { ...prev[2], value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
      { ...prev[3], value: "100%" }
    ]);

    setWeeklyGoal(prev => ({ ...prev, current: totalRevenue }));
  }

  async function fetchTodayAppointments(estId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('agendamentos')
      .select(`
        *,
        usuarios!agendamentos_cliente_id_fkey(nome)
      `)
      .eq('estabelecimento_id', estId)
      .gte('data_hora', startOfDay.toISOString())
      .lte('data_hora', endOfDay.toISOString())
      .order('data_hora', { ascending: true });

    if (data) {
      setTodayAppointments(data.map(app => ({
        id: app.id,
        customer: (app.usuarios as any)?.nome || "Cliente",
        service: Array.isArray(app.servicos) ? app.servicos.map((s: any) => s.nome).join(", ") : "Serviço",
        time: new Date(app.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        avatar: ((app.usuarios as any)?.nome || "C").substring(0, 2).toUpperCase(),
        status: app.status
      })));
    }
  }

  async function fetchPauses(estId: string) {
    const { data } = await supabase
      .from('indisponibilidades')
      .select('*')
      .eq('estabelecimento_id', estId)
      .gte('data', new Date().toISOString().split('T')[0])
      .order('data', { ascending: true });

    if (data) {
      setAllPauses(data);
      const todayStr = new Date().toISOString().split('T')[0];
      setIsPaused(data.some((p: any) => p.data === todayStr));
    }
  }

  async function fetchGoal(estId: string) {
    const { data } = await supabase
      .from('metas')
      .select('valor_meta')
      .eq('estabelecimento_id', estId)
      .single();
    
    if (data) {
      setWeeklyGoal(prev => ({ ...prev, target: Number(data.valor_meta) }));
      setGoalInput(data.valor_meta.toString());
    }
  }

  async function fetchServices(estId: string) {
    const { data } = await supabase
      .from('servicos')
      .select('id, nome, preco')
      .eq('estabelecimento_id', estId);
    if (data) setAvailableServices(data);
  }

  const handleAppSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
    if (selectedServices.length === 0) {
      toast.error("Adicione ao menos um serviço.");
      return;
    }

    setAppLoading(true);
    try {
      let clientId = null;
      const { data: userData } = await supabase.from('usuarios').select('id').eq('nome', appFormData.customer).eq('perfil', 'CLIENTE').limit(1);
      
      if (userData && userData.length > 0) {
        clientId = userData[0].id;
      } else {
        const fakeEmail = `${appFormData.customer.toLowerCase().replace(/\s+/g, '.')}.${Math.random().toString(36).substring(7)}@agendei.auto`;
        const { data: newUser, error: userError } = await supabase.from('usuarios').insert([{ nome: appFormData.customer, perfil: 'CLIENTE', email: fakeEmail }]).select().single();
        if (userError) throw userError;
        clientId = newUser.id;
        await supabase.from('clientes_estabelecimentos').insert([{ cliente_id: clientId, estabelecimento_id: establishmentId }]);
      }

      const dataHora = `${appFormData.date}T${appFormData.time}:00`;
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.preco, 0);

      const { error } = await supabase.from('agendamentos').insert([{
        cliente_id: clientId,
        estabelecimento_id: establishmentId,
        servicos: selectedServices,
        preco_total: totalPrice,
        data_hora: dataHora,
        status: 'APROVADO'
      }]);

      if (error) throw error;
      toast.success("Agendamento realizado com sucesso!");
      setShowAppointmentModal(false);
      setSelectedServices([]);
      setAppFormData({ ...appFormData, customer: "" });
      fetchTodayAppointments(establishmentId);
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setAppLoading(false);
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('agendei_onboarding_completed', 'true');
    setShowOnboarding(false);
    toast.success("Tudo pronto! Vamos começar.");
  };

  const handlePauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || selectedDays.length === 0) {
      toast.error("Selecione ao menos um dia no calendário.");
      return;
    }
    setPauseLoading(true);
    try {
      const records = selectedDays.map(day => ({
        estabelecimento_id: establishmentId,
        data: day.toISOString().split('T')[0],
        motivo: pauseReason
      }));

      const { error } = await supabase
        .from('indisponibilidades')
        .insert(records);

      if (error) throw error;
      setShowPauseModal(false);
      await fetchPauses(establishmentId);
      setSelectedDays([]);
      setPauseReason("");
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setPauseLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
    setExpenseLoading(true);
    try {
      const { error } = await supabase
        .from('despesas')
        .insert([{
          estabelecimento_id: establishmentId,
          descricao: expenseData.description,
          valor: parseFloat(expenseData.value.replace(',', '.')),
          categoria: expenseData.category
        }]);
      if (error) throw error;
      toast.success("Despesa registrada no financeiro!");
      setShowExpensesModal(false);
      setExpenseData({ description: "", value: "", category: "Outros" });
      fetchStats(establishmentId);
    } catch (error: any) {
      toast.error("Erro ao lançar despesa: " + error.message);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
    setGoalLoading(true);
    try {
      const { error } = await supabase
        .from('metas')
        .upsert([{
          estabelecimento_id: establishmentId,
          valor_meta: parseFloat(goalInput.replace(',', '.'))
        }]);
      if (error) throw error;
      toast.success("Meta atualizada!");
      setWeeklyGoal(prev => ({ ...prev, target: parseFloat(goalInput) }));
      setShowGoalsModal(false);
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setGoalLoading(false);
    }
  };

  const removePause = async (id: string) => {
    try {
      const { error } = await supabase
        .from('indisponibilidades')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAllPauses(allPauses.filter(p => p.id !== id));
      const todayStr = new Date().toISOString().split('T')[0];
      if (allPauses.find(p => p.id === id)?.data === todayStr) setIsPaused(false);
      toast.success("Pausa removida.");
    } catch (error) {
      toast.error("Erro ao remover pausa.");
    }
  };

  const onboardingSteps = [
    {
      title: "Seja bem-vindo ao Agendei!",
      description: "Preparamos um sistema limpo e pronto para você começar a crescer. Vamos te mostrar o básico em 1 minuto.",
      icon: <Rocket className="w-12 h-12 text-[#fd9602]" />,
      color: "from-[#fd9602]/20"
    },
    {
      title: "Sua Agenda Inteligente",
      description: "Aqui no topo você acompanha seus compromissos do dia. Tudo sincronizado em tempo real com o banco de dados.",
      icon: <CalendarDays className="w-12 h-12 text-blue-500" />,
      color: "from-blue-500/20"
    },
    {
      title: "Controle Financeiro",
      description: "Lance suas despesas e acompanhe suas metas semanais. Nosso sistema calcula seu lucro automaticamente.",
      icon: <DollarSign className="w-12 h-12 text-emerald-500" />,
      color: "from-emerald-500/20"
    },
    {
      title: "Pronto para decolar?",
      description: "Agora é com você. Comece cadastrando seus serviços e clientes para liberar todo o poder do Agendei.",
      icon: <PartyPopper className="w-12 h-12 text-purple-500" />,
      color: "from-purple-500/20"
    }
  ];

  return (
    <div className="space-y-10">
      <style>{calendarStyles}</style>
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-title dark:text-white">Olá, {userName}! 👋</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Gerencie seu negócio com precisão e facilidade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Tooltip key={stat.label} text={`Ir para ${stat.label}`}>
            <Link href={stat.href} className="block">
              <motion.div 
                whileHover={{ y: -6, borderColor: "rgba(245, 158, 11, 0.4)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="glass-card p-6 rounded-2xl w-full cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Tooltip text="Comparação com mês anterior">
                    <motion.span 
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
                      className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-tighter cursor-help transition-colors"
                    >
                      {stat.trend}
                    </motion.span>
                  </Tooltip>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-title dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            </Link>
          </Tooltip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-title dark:text-white tracking-tight">Agenda de Hoje</h3>
            <Link href="/dashboard/appointments" className="text-xs font-bold text-[#fd9602] hover:text-[#fd9602]/80 transition-colors uppercase tracking-[0.2em]">
              Ver tudo
            </Link>
          </div>

          <div className="glass-card rounded-2xl divide-y divide-white/5 dark:divide-zinc-800 shadow-xl min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-[#fd9602] animate-spin" />
              </div>
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((app) => (
                <div key={app.id} className="p-5 flex items-center justify-between group hover:bg-zinc-500/5 dark:hover:bg-white/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/50 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:bg-[#fd9602] group-hover:text-zinc-950 transition-all">
                      {app.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-title dark:text-white">{app.customer}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{app.service}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center gap-1.5 w-24">
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">
                        <Clock className="w-3.5 h-3.5 text-[#fd9602]" />
                        {app.time}
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-lg",
                        (app.status === "CONFIRMADO" || app.status === "APROVADO") && "text-blue-500 bg-blue-500/10",
                        app.status === "PENDENTE" && "text-[#fd9602] bg-[#fd9602]/10",
                        app.status === "CONCLUIDO" && "text-emerald-500 bg-emerald-500/10"
                      )}>
                        {app.status}
                      </span>
                    </div>
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)} className="p-2.5 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-title dark:hover:text-white transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === app.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: -20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -20 }}
                              className="absolute right-0 mt-3 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-3 overflow-hidden"
                            >
                              <button 
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowDetailsModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                              >
                                <div className="p-2 rounded-xl bg-[#fd9602]/10 text-[#fd9602] group-hover:bg-[#fd9602] group-hover:text-zinc-950 transition-all">
                                  <Eye size={18} />
                                </div>
                                Ver Detalhes
                              </button>
                              <button 
                                onClick={() => handleCancelAppointment(app.id)}
                                className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                              >
                                <div className="p-2 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                  <Trash2 size={18} />
                                </div>
                                Cancelar Agendamento
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 gap-2">
                <Calendar className="w-10 h-10 text-zinc-800/50" />
                <p className="text-zinc-500 text-sm font-medium">Nenhum agendamento para hoje.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Tooltip text="Clique para gerenciar suas metas">
            <motion.div 
              whileHover={{ scale: 1.02, borderColor: "rgba(245, 158, 11, 0.5)" }}
              onClick={() => setShowGoalsModal(true)}
              className="relative overflow-hidden group p-8 rounded-2xl border border-[#fd9602]/20 glass-card bg-gradient-to-br from-[#fd9602]/5 to-transparent cursor-pointer shadow-lg"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">Meta Semanal</h3>
                    <p className="text-4xl font-bold text-title dark:text-white tracking-tighter">
                      {weeklyGoal.target > 0 ? Math.round((weeklyGoal.current / weeklyGoal.target) * 100) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-2xl">
                    <TrendingUp className="text-accent w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    <span>Progresso</span>
                    <span className="text-[#fd9602] font-bold">R$ {weeklyGoal.current.toLocaleString()} / {(weeklyGoal.target / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(100, (weeklyGoal.current / weeklyGoal.target) * 100)}%` }} className="bg-accent h-full shadow-[0_0_20px_rgba(245, 158, 11, 0.4)] transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Tooltip>

          <div className="glass-card p-8 rounded-2xl space-y-6 shadow-lg border border-white/5 bg-zinc-900/50">
            <h3 className="text-title dark:text-white font-black text-lg uppercase tracking-tight">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton icon={<Calendar className="text-[#fd9602]" />} label="Marcar Consulta" color="text-[#fd9602]" onClick={() => setShowAppointmentModal(true)} />
              
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

              <QuickActionButton icon={<DollarSign className="text-red-500" />} label="Lançar Despesa" color="text-red-500" onClick={() => setShowExpensesModal(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(253,150,2,0.15)]"
            >
              <div className={cn("h-40 bg-gradient-to-b flex items-center justify-center transition-all duration-500", onboardingSteps[onboardingStep].color)}>
                 <motion.div
                  key={onboardingStep}
                  initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                 >
                    {onboardingSteps[onboardingStep].icon}
                 </motion.div>
              </div>
              
              <div className="p-10 space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                    {onboardingSteps[onboardingStep].title}
                  </h3>
                  <p className="text-zinc-400 font-medium text-base">
                    {onboardingSteps[onboardingStep].description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {onboardingSteps.map((_, i) => (
                    <div key={i} className={cn("h-1.5 transition-all duration-300 rounded-full", onboardingStep === i ? "w-8 bg-[#fd9602]" : "w-1.5 bg-zinc-800")} />
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  {onboardingStep > 0 && (
                    <button 
                      onClick={() => setOnboardingStep(s => s - 1)}
                      className="flex-1 py-4 px-6 rounded-2xl border border-white/5 bg-white/5 text-zinc-400 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} /> Voltar
                    </button>
                  )}
                  <button 
                    onClick={() => onboardingStep === onboardingSteps.length - 1 ? finishOnboarding() : setOnboardingStep(s => s + 1)}
                    className="flex-[2] py-4 px-6 rounded-2xl bg-[#fd9602] text-zinc-950 font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(253,150,2,0.2)] flex items-center justify-center gap-2"
                  >
                    {onboardingStep === onboardingSteps.length - 1 ? "Começar Agora" : "Continuar"} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Modal */}
      <Modal isOpen={showAppointmentModal} onClose={() => setShowAppointmentModal(false)} title="Marcar Consulta">
        <form onSubmit={handleAppSave} className="space-y-6">
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
              <input required type="date" value={appFormData.date} onChange={e => setAppFormData({...appFormData, date: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl p-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Horário</label>
              <input required type="time" value={appFormData.time} onChange={e => setAppFormData({...appFormData, time: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl p-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Serviços</label>
            <div className="relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602]" />
              <input type="text" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} placeholder="Pesquisar serviço..." className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" />
              {serviceSearch && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-100 dark:bg-zinc-900 border border-subtle rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                  {availableServices.filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase())).map(s => (
                    <button key={s.id} type="button" onClick={() => {
                      if (!selectedServices.find(x => x.id === s.id)) setSelectedServices([...selectedServices, s]);
                      setServiceSearch("");
                    }} className="w-full text-left p-3 hover:bg-[#fd9602] hover:text-zinc-950 rounded-xl flex justify-between items-center font-bold text-sm">
                      {s.nome} <span>R$ {s.preco}</span>
                    </button>
                  ))}
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

      {/* Pause Modal */}
      <Modal isOpen={showPauseModal} onClose={() => setShowPauseModal(false)} title="Planejar Folga">
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
            {pauseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Agendar Folga ☕"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showExpensesModal} onClose={() => setShowExpensesModal(false)} title="Lançar Despesa">
        <form className="space-y-8" onSubmit={handleExpenseSubmit}>
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
          <button type="submit" disabled={expenseLoading} className="w-full btn-primary py-6 text-lg font-black flex items-center justify-center gap-3">
            {expenseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Saída"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} title="Meta de Faturamento">
        <form className="space-y-8" onSubmit={handleGoalSubmit}>
           <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Valor da Meta Semanal</label>
            <input required type="text" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="Ex: 15.000" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl px-6 py-6 dark:text-white outline-none focus:ring-4 focus:ring-[#fd9602]/10 transition-all font-black text-3xl placeholder:text-zinc-600" />
          </div>
          <button type="submit" disabled={goalLoading} className="w-full btn-primary py-6 text-lg font-black flex items-center justify-center gap-3">
            {goalLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Salvar Nova Meta"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalhes do Agendamento">
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl border border-subtle dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-[#fd9602] flex items-center justify-center font-bold text-zinc-950 text-xl">{selectedApp.avatar}</div>
              <div>
                <h4 className="font-bold text-title dark:text-white">{selectedApp.customer}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedApp.service}</p>
              </div>
            </div>
            <button className="w-full btn-primary py-4" onClick={() => setShowDetailsModal(false)}>Fechar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick, color, statusIndicator }: any) {
  return (
    <motion.button 
      whileHover={{ 
        scale: 1.01, 
        x: 6,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-white/10 transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-xl flex items-center justify-center", color)}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{label}</span>
          {statusIndicator && (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
}
