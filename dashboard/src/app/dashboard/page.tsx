"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, DollarSign, Clock,
  MoreHorizontal, TrendingUp, ChevronRight,
  Eye, Coffee, Ban, Tag, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tooltip } from "@/components/Tooltip";
import { Modal } from "@/components/Modal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function DashboardOverview() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 8640, target: 12000 });

  const stats = [
    { label: "Clientes Totais", value: "1.284", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%", href: "/dashboard/customers" },
    { label: "Agendamentos/Mês", value: "456", icon: Calendar, color: "text-[#fd9602]", bg: "bg-[#fd9602]/10", trend: "+8%", href: "/dashboard/appointments" },
    { label: "Receita Mensal", value: "R$ 12.450", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+18%", href: "/dashboard/finance" },
    { label: "Taxa de Retorno", value: "84%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5%", href: "/dashboard/finance" },
  ];

  const todayAppointments = [
    { id: 1, customer: "Carlos Alberto", service: "Corte Degradê + Barba", time: "14:00", avatar: "CA", status: "CONFIRMADO" },
    { id: 2, customer: "Juliana Silva", service: "Coloração Completa", time: "15:30", avatar: "JS", status: "EM ESPERA" },
    { id: 3, customer: "Roberto Mendes", service: "Corte Masculino", time: "16:15", avatar: "RM", status: "CONCLUÍDO" },
    { id: 4, customer: "Amanda Ferreira", service: "Hidratação Profunda", time: "17:00", avatar: "AF", status: "CONFIRMADO" },
    { id: 5, customer: "Ricardo Oliveira", service: "Barba + Sobrancelha", time: "18:30", avatar: "RO", status: "EM ESPERA" },
  ];

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Despesa lançada com sucesso!");
    setShowExpensesModal(false);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Meta atualizada!");
    setShowGoalsModal(false);
  };

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-title dark:text-white">Olá, Matheus Lucindo! 👋</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Veja o que está acontecendo no seu negócio hoje.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Tooltip key={stat.label} text={`Ir para ${stat.label}`}>
            <Link href={stat.href} className="block">
              <motion.div 
                whileHover={{ y: -6, borderColor: "rgba(245, 158, 11, 0.4)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Agenda de Hoje */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-title dark:text-white tracking-tight">Agenda de Hoje</h3>
            <Link href="/dashboard/appointments" className="text-xs font-bold text-[#fd9602] hover:text-[#fd9602]/80 transition-colors uppercase tracking-[0.2em]">
              Ver tudo
            </Link>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 dark:divide-zinc-800 shadow-xl">
            {todayAppointments.map((app) => (
              <div
                key={app.id}
                className="p-5 flex items-center justify-between group relative hover:bg-zinc-500/5 dark:hover:bg-white/5 transition-colors"
              >
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
                      app.status === "CONFIRMADO" && "text-blue-500 bg-blue-500/10",
                      app.status === "EM ESPERA" && "text-[#fd9602] bg-[#fd9602]/10",
                      app.status === "CONCLUÍDO" && "text-emerald-500 bg-emerald-500/10"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                      className="p-2.5 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-title dark:hover:text-white transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {openMenuId === app.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)} 
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-subtle dark:border-zinc-800 rounded-2xl shadow-2xl z-20 p-1.5 overflow-hidden">
                          <button 
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailsModal(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fd9602] hover:text-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-all group/item"
                          >
                            <Eye className="w-4 h-4 group-hover/item:text-zinc-950" />
                            Ver detalhes
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sidebar Stats */}
        <div className="space-y-6">
          {/* Meta Semanal Card */}
          <Tooltip text="Clique para gerenciar suas metas">
            <motion.div 
              whileHover={{ scale: 1.02, borderColor: "rgba(245, 158, 11, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setShowGoalsModal(true)}
              className="relative overflow-hidden group p-8 rounded-2xl border border-[#fd9602]/20 glass-card bg-gradient-to-br from-[#fd9602]/5 to-transparent cursor-pointer w-full shadow-lg"
            >
              <div className="absolute inset-0 bg-accent opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">Meta Semanal</h3>
                    <p className="text-4xl font-bold text-title dark:text-white tracking-tighter">
                      {Math.round((weeklyGoal.current / weeklyGoal.target) * 100)}%
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-2xl">
                    <TrendingUp className="text-accent w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    <span>Progresso</span>
                    <span className="text-[#fd9602] font-bold">R$ {weeklyGoal.current.toLocaleString()} / {weeklyGoal.target / 1000}k</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-accent h-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </Tooltip>

          {/* Ações Rápidas Section */}
          <div className="glass-card p-8 rounded-2xl space-y-6 shadow-lg">
            <h3 className="text-title dark:text-white font-bold text-lg">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton 
                icon={<Calendar />} 
                label="Novo Agendamento" 
                tooltip="Marcar horário para cliente" 
                href="/dashboard/appointments?openModal=true" 
              />
              <QuickActionButton 
                icon={isPaused ? <Coffee className="text-emerald-500" /> : <Ban />} 
                label={isPaused ? "Pausa Ativa" : "Marcar Pausa"} 
                tooltip="Definir período sem trabalho" 
                onClick={() => setShowPauseModal(true)}
                statusIndicator={isPaused}
              />
              <QuickActionButton 
                icon={<DollarSign />} 
                label="Lançar Despesa" 
                tooltip="Registrar saída de caixa" 
                onClick={() => setShowExpensesModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        title="Detalhes do Agendamento"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl border border-subtle dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-[#fd9602] flex items-center justify-center font-bold text-zinc-950 text-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                {selectedApp.avatar}
              </div>
              <div>
                <h4 className="font-bold text-title dark:text-white">{selectedApp.customer}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedApp.service}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-subtle dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Horário</span>
                <p className="text-sm font-bold text-title dark:text-white">{selectedApp.time}</p>
              </div>
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-subtle dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</span>
                <p className="text-sm font-bold text-[#fd9602]">{selectedApp.status}</p>
              </div>
            </div>

            <button 
              className="w-full btn-primary py-4"
              onClick={() => setShowDetailsModal(false)}
            >
              Fechar Detalhes
            </button>
          </div>
        )}
      </Modal>

      {/* Expenses Modal */}
      <Modal 
        isOpen={showExpensesModal} 
        onClose={() => setShowExpensesModal(false)} 
        title="Lançar Nova Despesa"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Descrição</label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input required type="text" placeholder="Ex: Aluguel, Produtos..." className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Valor (R$)</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input required type="number" step="0.01" placeholder="0,00" className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-4">Confirmar Lançamento</button>
        </form>
      </Modal>

      {/* Goals Modal */}
      <Modal 
        isOpen={showGoalsModal} 
        onClose={() => setShowGoalsModal(false)} 
        title="Gerenciar Metas"
      >
        <form onSubmit={handleGoalSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Meta Semanal (R$)</label>
            <input 
              required 
              type="number" 
              defaultValue={weeklyGoal.target}
              onChange={(e) => setWeeklyGoal({ ...weeklyGoal, target: Number(e.target.value) })}
              className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl p-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" 
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Sua meta semanal atual de R$ {weeklyGoal.target.toLocaleString()} é fundamental para o seu faturamento mensal.</p>
          <button type="submit" className="w-full btn-primary py-4">Salvar Nova Meta</button>
        </form>
      </Modal>

      <Modal 
        isOpen={showPauseModal} 
        onClose={() => setShowPauseModal(false)} 
        title={isPaused ? "Gerenciar Pausa" : "Definir Pausa"}
      >
        <div className="space-y-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Selecione no calendário abaixo os dias de folga ou recesso.
          </p>
          
          <div className="flex justify-center p-4 bg-zinc-100 dark:bg-zinc-900 border border-subtle dark:border-zinc-800 rounded-2xl shadow-inner">
            <DayPicker
              mode="multiple"
              selected={selectedDays}
              onSelect={(days) => setSelectedDays(days || [])}
              locale={ptBR}
              className="m-0 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              className="flex-1 btn-primary py-4"
              onClick={() => {
                setIsPaused(!isPaused);
                setShowPauseModal(false);
              }}
            >
              {isPaused ? "Remover Pausa" : "Confirmar Pausa"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function QuickActionButton({ 
  icon, label, tooltip, href, onClick, statusIndicator 
}: { 
  icon: any; label: string; tooltip: string; href?: string; onClick?: () => void; statusIndicator?: boolean 
}) {
  const content = (
    <motion.div 
      whileHover={{ 
        x: 10, 
        backgroundColor: "rgba(245, 158, 11, 0.08)", 
        borderColor: "rgba(245, 158, 11, 0.3)",
        scale: 1.01
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 transition-colors group cursor-pointer relative"
    >
      <div className="flex items-center gap-4">
        <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-[#fd9602] transition-colors">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
            {label}
          </span>
          {statusIndicator && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-[#fd9602] transition-all group-hover:translate-x-1" />
    </motion.div>
  );

  return (
    <Tooltip text={tooltip}>
      {href ? (
        <Link href={href} className="w-full block">
          {content}
        </Link>
      ) : (
        content
      )}
    </Tooltip>
  );
}
