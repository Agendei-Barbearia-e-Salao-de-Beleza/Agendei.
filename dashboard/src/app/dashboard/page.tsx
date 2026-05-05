"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Calendar, 
    DollarSign, 
    TrendingUp,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const stats = [
  { label: "Clientes Totais", value: "1,284", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
  { label: "Agendamentos/Mês", value: "456", icon: Calendar, iconColor: "text-amber-500", bg: "bg-amber-500/10", trend: "+8%" },
  { label: "Receita Mensal", value: "R$ 12.450", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+18%" },
  { label: "Taxa de Retorno", value: "84%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5%" },
];

const todayAppointments = [
  { id: 1, customer: "Carlos Alberto", service: "Corte Degradê + Barba", time: "14:00", status: "Confirmado", avatar: "CA" },
  { id: 2, customer: "Juliana Silva", service: "Coloração Completa", time: "15:30", status: "Em Espera", avatar: "JS" },
  { id: 3, customer: "Roberto Mendes", service: "Corte Masculino", time: "16:15", status: "Concluído", avatar: "RM" },
  { id: 4, customer: "Amanda Ferreira", service: "Hidratação Profunda", time: "17:00", status: "Confirmado", avatar: "AF" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Olá, Matheus Lucindo! 👋</h2>
        <p className="text-zinc-500">Veja o que está acontecendo no seu negócio hoje.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor || stat.color}`} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Today's Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Agenda de Hoje</h3>
            <button className="text-sm font-bold text-amber-500 hover:underline">Ver tudo</button>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {todayAppointments.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                      {app.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{app.customer}</h4>
                      <p className="text-xs text-zinc-500">{app.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-bold">{app.time}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        app.status === "Confirmado" && "text-blue-500",
                        app.status === "Em Espera" && "text-amber-500",
                        app.status === "Concluído" && "text-emerald-500"
                      )}>
                        {app.status}
                      </span>
                    </div>
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards: Stats/Alerts */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-3xl shadow-xl shadow-amber-500/10">
            <h3 className="text-zinc-950 font-extrabold text-lg mb-2">Meta Semanal</h3>
            <div className="flex items-end justify-between mb-4">
              <p className="text-zinc-950 font-bold text-3xl">72%</p>
              <p className="text-zinc-800 text-sm font-bold">R$ 8.640 / R$ 12k</p>
            </div>
            <div className="w-full bg-zinc-950/20 h-2.5 rounded-full overflow-hidden">
              <div className="bg-zinc-950 h-full w-[72%]" />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <h3 className="text-white font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton icon={<Calendar />} label="Novo Agendamento" color="bg-amber-500" />
              <QuickActionButton icon={<Users />} label="Cadastrar Cliente" color="bg-blue-500" />
              <QuickActionButton icon={<DollarSign />} label="Lançar Despesa" color="bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all text-left">
      <div className={`p-2 rounded-xl ${color} text-zinc-950`}>
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <span className="text-sm font-bold text-zinc-300">{label}</span>
    </button>
  );
}
