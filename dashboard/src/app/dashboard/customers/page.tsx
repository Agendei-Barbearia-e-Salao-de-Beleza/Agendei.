"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Mail, Phone, Calendar as CalendarIcon, X, Check, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

const initialCustomers = [
  { id: 1, name: "Carlos Alberto", email: "carlos@gmail.com", phone: "(11) 98765-4321", lastVisit: "02 Mai 2026", totalSpent: "R$ 450,00", avatar: "CA" },
  { id: 2, name: "Juliana Silva", email: "ju.silva@outlook.com", phone: "(11) 91234-5678", lastVisit: "28 Abr 2026", totalSpent: "R$ 1.280,00", avatar: "JS" },
  { id: 3, name: "Roberto Mendes", email: "roberto.m@empresa.com", phone: "(11) 97777-6666", lastVisit: "05 Mai 2026", totalSpent: "R$ 320,00", avatar: "RM" },
  { id: 4, name: "Amanda Ferreira", email: "amanda.f@gmail.com", phone: "(11) 94444-3333", lastVisit: "30 Abr 2026", totalSpent: "R$ 950,00", avatar: "AF" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = {
      id: Date.now(),
      ...newCustomer,
      lastVisit: "Nunca",
      totalSpent: "R$ 0,00",
      avatar: newCustomer.name.substring(0, 2).toUpperCase()
    };
    setCustomers([customer, ...customers]);
    setIsModalOpen(false);
    toast.success("Cliente cadastrado com sucesso!");
    setNewCustomer({ name: "", email: "", phone: "" });
  };

  const deleteCustomer = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success("Cliente removido.");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Clientes</h2>
          <p className="text-zinc-500">Base de dados completa dos seus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-zinc-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {customers.map((customer, i) => (
            <motion.div 
              key={customer.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-amber-500/30 transition-all group relative"
            >
              <button 
                onClick={() => deleteCustomer(customer.id)}
                className="absolute top-4 right-4 p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    {customer.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{customer.name}</h3>
                    <p className="text-sm text-zinc-500">Cliente desde 2025</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Gasto</p>
                  <p className="text-lg font-bold text-amber-500">{customer.totalSpent}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-600" />
                  <span className="text-xs truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-4 h-4 text-zinc-600" />
                  <span className="text-xs">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CalendarIcon className="w-4 h-4 text-zinc-600" />
                  <span className="text-xs">Última visita: {customer.lastVisit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Novo Cliente</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nome Completo</label>
                  <input required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} type="text" placeholder="Ex: João Silva" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">E-mail</label>
                  <input required value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} type="email" placeholder="joao@email.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Telefone</label>
                  <input required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} type="text" placeholder="(11) 99999-0000" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl">Cadastrar Cliente</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
