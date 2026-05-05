"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, Calendar as CalendarIcon, Clock, ChevronDown, X, Check, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const initialAppointments = [
  { id: 1, customer: "Carlos Alberto", service: "Corte Degradê + Barba", date: "05 Mai 2026", time: "14:00", price: "R$ 65,00", status: "Confirmado" },
  { id: 2, customer: "Juliana Silva", service: "Coloração Completa", date: "05 Mai 2026", time: "15:30", price: "R$ 180,00", status: "Em Espera" },
  { id: 3, customer: "Roberto Mendes", service: "Corte Masculino", time: "16:15", date: "05 Mai 2026", price: "R$ 45,00", status: "Concluído" },
  { id: 4, customer: "Amanda Ferreira", service: "Hidratação Profunda", date: "05 Mai 2026", time: "17:00", price: "R$ 120,00", status: "Confirmado" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    customer: "",
    service: "",
    time: "",
    price: "",
  });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const app = {
      id: Date.now(),
      ...newApp,
      date: "05 Mai 2026",
      status: "Confirmado"
    };
    setAppointments([app, ...appointments]);
    setIsModalOpen(false);
    toast.success("Agendamento criado com sucesso!");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Agenda</h2>
          <p className="text-zinc-500">Gerencie todos os seus compromissos e horários.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-zinc-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/30 border border-zinc-800 p-4 rounded-3xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar cliente ou serviço..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800">
            <CalendarIcon className="w-4 h-4" />
            Hoje
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Serviço</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Data/Hora</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <AnimatePresence mode="popLayout">
              {appointments.map((app, i) => (
                <motion.tr 
                  key={app.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-100">{app.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-400">{app.service}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-100">{app.time}</span>
                      <span className="text-[10px] text-zinc-500">{app.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-amber-500">{app.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest",
                      app.status === "Confirmado" ? "bg-blue-500/10 text-blue-500" :
                      app.status === "Concluído" ? "bg-emerald-500/10 text-emerald-500" :
                      app.status === "Em Espera" ? "bg-amber-500/10 text-amber-500" :
                      "bg-zinc-500/10 text-zinc-500"
                    )}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-600 hover:text-white transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Novo Agendamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Cliente</label>
                  <input required value={newApp.customer} onChange={e => setNewApp({...newApp, customer: e.target.value})} type="text" placeholder="Nome do cliente" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Serviço</label>
                  <input required value={newApp.service} onChange={e => setNewApp({...newApp, service: e.target.value})} type="text" placeholder="Ex: Corte Degradê" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Horário</label>
                    <input required value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} type="time" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Valor (R$)</label>
                    <input required value={newApp.price} onChange={e => setNewApp({...newApp, price: `R$ ${e.target.value}`})} type="text" placeholder="65,00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl">Confirmar Agendamento</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
