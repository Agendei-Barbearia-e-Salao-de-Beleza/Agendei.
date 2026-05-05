"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, Calendar, DollarSign, Clock, 
  MoreHorizontal, TrendingUp, AlertCircle, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardOverview() {
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  const todayAppointments = [
    { id: 1, customer: "Carlos Alberto", service: "Corte Degradê + Barba", time: "14:00", avatar: "CA", status: "CONFIRMADO" },
    { id: 2, customer: "Juliana Silva", service: "Coloração Completa", time: "15:30", avatar: "JS", status: "EM ESPERA" },
    { id: 3, customer: "Roberto Mendes", service: "Corte Masculino", time: "16:15", avatar: "RM", status: "CONCLUÍDO" },
    { id: 4, customer: "Amanda Ferreira", service: "Hidratação Profunda", time: "17:00", avatar: "AF", status: "CONFIRMADO" },
  ];

  const handleQuickAction = (action: string) => {
    toast.info(`Abrindo: ${action}`);
    // Aqui no futuro abriremos o modal específico
  };

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight text-title">Olá, Matheus Lucindo! 👋</h2>
        <p className="text-zinc-500 font-medium">Veja o que temos para hoje na sua barbearia.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Agenda de Hoje */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-title">Agenda de Hoje</h3>
            <Link href="/dashboard/appointments" className="text-sm font-bold text-accent hover:underline">
              Ver tudo
            </Link>
          </div>

          <div className="bg-card border border-subtle rounded-[32px] overflow-hidden divide-y divide-subtle">
            {todayAppointments.map((app) => (
              <motion.div 
                key={app.id}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                className="p-5 flex items-center justify-between group cursor-pointer"
                onClick={() => toast.info(`Editando agendamento de ${app.customer}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center font-black text-zinc-500 group-hover:bg-accent group-hover:text-zinc-950 transition-all">
                    {app.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-title">{app.customer}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{app.service}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {app.time}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black tracking-widest",
                      app.status === "CONFIRMADO" && "text-blue-500",
                      app.status === "EM ESPERA" && "text-amber-500",
                      app.status === "CONCLUÍDO" && "text-emerald-500"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-zinc-500/10 rounded-xl text-zinc-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Sidebar Stats */}
        <div className="space-y-6">
          {/* Meta Semanal Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-accent p-8 rounded-[40px] shadow-2xl shadow-accent/10 cursor-pointer group"
            onClick={() => setIsEditingMeta(true)}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-zinc-950 font-black text-xl">Meta Semanal</h3>
              <TrendingUp className="text-zinc-950/40 w-6 h-6" />
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-zinc-950 font-black text-5xl tracking-tighter">72%</p>
              <p className="text-zinc-950/60 text-xs font-black uppercase tracking-widest">R$ 8.640 / R$ 12k</p>
            </div>
            <div className="w-full bg-zinc-950/10 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                className="bg-zinc-950 h-full" 
              />
            </div>
          </motion.div>

          {/* Ações Rápidas Section */}
          <div className="bg-card border border-subtle p-8 rounded-[40px] space-y-6">
            <h3 className="text-title font-black text-lg">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton 
                icon={<Calendar />} 
                label="Novo Agendamento" 
                onClick={() => handleQuickAction("Novo Agendamento")}
              />
              <QuickActionButton 
                icon={<Users />} 
                label="Cadastrar Cliente" 
                onClick={() => handleQuickAction("Cadastrar Cliente")}
              />
              <QuickActionButton 
                icon={<DollarSign />} 
                label="Lançar Despesa" 
                onClick={() => handleQuickAction("Lançar Despesa")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-3xl bg-zinc-500/5 border border-subtle hover:border-accent/30 hover:bg-zinc-500/10 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="text-zinc-500 group-hover:text-accent transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-sm font-bold text-zinc-500 group-hover:text-title transition-colors">
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-accent transition-all group-hover:translate-x-1" />
    </button>
  );
}
