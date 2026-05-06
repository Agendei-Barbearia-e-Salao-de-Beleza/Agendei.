"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, DollarSign, Clock,
  MoreHorizontal, TrendingUp, ChevronRight,
  Eye, Coffee, Ban, Tag, Plus, Loader2, CheckCircle2
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
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Pause Logic
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [pauseReason, setPauseReason] = useState("");

  // Expenses Logic
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseData, setExpenseData] = useState({ description: "", value: "" });

  // Goals Logic
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, target: 12000 });
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          checkTodayPause(estData.id),
          fetchGoal(estData.id)
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        customer: app.usuarios?.nome || "Cliente",
        service: Array.isArray(app.servicos) ? app.servicos.map((s: any) => s.nome).join(", ") : "Serviço",
        time: new Date(app.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        avatar: (app.usuarios?.nome || "C").substring(0, 2).toUpperCase(),
        status: app.status
      })));
    }
  }

  async function checkTodayPause(estId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('indisponibilidades')
      .select('*')
      .eq('estabelecimento_id', estId)
      .eq('data', today);

    if (data && data.length > 0) {
      setIsPaused(true);
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
      toast.success("Pausa(s) registrada(s)!");
      setShowPauseModal(false);
      
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDays.some(d => d.toISOString().split('T')[0] === todayStr)) {
        setIsPaused(true);
      }
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
          valor: parseFloat(expenseData.value.replace(',', '.'))
        }]);
      if (error) throw error;
      toast.success("Despesa lançada!");
      setShowExpensesModal(false);
      setExpenseData({ description: "", value: "" });
    } catch (error: any) {
      toast.error("Erro: " + error.message);
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

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-title dark:text-white">Olá, {userName}! 👋</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Veja o que está acontecendo no seu negócio hoje.</p>
      </div>

      {/* Top Stats Grid */}
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
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {stat.trend}
                  </span>
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

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 dark:divide-zinc-800 shadow-xl min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-[#fd9602] animate-spin" />
              </div>
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((app) => (
                <div key={app.id} className="p-5 flex items-center justify-between group hover:bg-zinc-500/5 dark:hover:bg-white/5 transition-colors">
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 gap-2">
                <Calendar className="w-10 h-10 text-zinc-800" />
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

          <div className="glass-card p-8 rounded-2xl space-y-6 shadow-lg">
            <h3 className="text-title dark:text-white font-bold text-lg">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton icon={<Calendar />} label="Novo Agendamento" tooltip="Marcar horário para cliente" href="/dashboard/appointments" />
              <QuickActionButton icon={isPaused ? <Coffee className="text-emerald-500" /> : <Ban />} label={isPaused ? "Pausa Ativa" : "Marcar Pausa"} tooltip="Definir período sem trabalho" onClick={() => setShowPauseModal(true)} statusIndicator={isPaused} />
              <QuickActionButton icon={<DollarSign />} label="Lançar Despesa" tooltip="Registrar saída de caixa" onClick={() => setShowExpensesModal(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showPauseModal} onClose={() => setShowPauseModal(false)} title="Registrar Pausa">
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 self-start ml-1">Selecione os dias</label>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl border border-subtle dark:border-zinc-800 shadow-inner">
              <DayPicker
                mode="multiple"
                selected={selectedDays}
                onSelect={(days) => setSelectedDays(days || [])}
                locale={ptBR}
                className="dark:text-white"
                modifiersStyles={{
                  selected: { backgroundColor: '#fd9602', color: '#000', fontWeight: 'bold' }
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
            <textarea 
              value={pauseReason} 
              onChange={e => setPauseReason(e.target.value)} 
              placeholder="Ex: Reforma, Folga, Feriado..." 
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-xl px-4 py-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 resize-none" 
              rows={3} 
            />
          </div>

          <div className="p-4 bg-[#fd9602]/5 rounded-xl border border-[#fd9602]/10">
            <p className="text-xs text-zinc-500 font-medium">
              {selectedDays.length === 0 
                ? "Nenhum dia selecionado." 
                : `${selectedDays.length} dia(s) selecionado(s) para pausa.`}
            </p>
          </div>

          <button 
            onClick={handlePauseSubmit} 
            disabled={pauseLoading} 
            className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2"
          >
            {pauseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Pausa"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showExpensesModal} onClose={() => setShowExpensesModal(false)} title="Lançar Despesa">
        <form className="space-y-6" onSubmit={handleExpenseSubmit}>
           <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Descrição</label>
            <input required type="text" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} placeholder="Ex: Aluguel..." className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-xl px-4 py-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor (R$)</label>
            <input required type="text" value={expenseData.value} onChange={e => setExpenseData({...expenseData, value: e.target.value})} placeholder="0,00" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-xl px-4 py-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <button type="submit" disabled={expenseLoading} className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2">
            {expenseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lançar Agora"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} title="Meta Semanal">
        <form className="space-y-6" onSubmit={handleGoalSubmit}>
           <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor da Meta (R$)</label>
            <input required type="text" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="Ex: 12000" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-xl px-4 py-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <button type="submit" disabled={goalLoading} className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2">
            {goalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Meta"}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-subtle dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Horário</span>
                <p className="text-sm font-bold dark:text-white">{selectedApp.time}</p>
              </div>
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-subtle dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</span>
                <p className="text-sm font-bold text-[#fd9602]">{selectedApp.status}</p>
              </div>
            </div>
            <button className="w-full btn-primary py-4" onClick={() => setShowDetailsModal(false)}>Fechar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function QuickActionButton({ icon, label, tooltip, href, onClick, statusIndicator }: any) {
  const content = (
    <motion.div 
      whileHover={{ x: 10, backgroundColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.3)", scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 transition-colors group cursor-pointer relative"
    >
      <div className="flex items-center gap-4">
        <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-[#fd9602] transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">{label}</span>
          {statusIndicator && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-[#fd9602] transition-all group-hover:translate-x-1" />
    </motion.div>
  );

  return (
    <Tooltip text={tooltip}>
      {href ? <Link href={href} className="w-full block">{content}</Link> : content}
    </Tooltip>
  );
}
