"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Clock, DollarSign, Edit2, Trash2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

const initialServices: Service[] = [
  { id: 1, name: "Corte Degradê", description: "Corte moderno com acabamento na máquina e tesoura.", price: "45,00", duration: "40 min", category: "Cabelo" },
  { id: 2, name: "Barba Terapia", description: "Corte de barba com toalha quente e massagem facial.", price: "35,00", duration: "30 min", category: "Barba" },
  { id: 3, name: "Corte + Barba", description: "Combo completo para renovar o visual.", price: "70,00", duration: "60 min", category: "Combo" },
  { id: 4, name: "Coloração Masculina", description: "Cobertura de fios brancos ou mudança de tom.", price: "90,00", duration: "90 min", category: "Química" },
];

import { supabase } from "@/lib/supabase";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration: "30",
    category: "Cabelo"
  });

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.price) {
      toast.error("Preencha ao menos o nome e o preço.");
      return;
    }

    // Tenta salvar no Supabase real
    const { data, error } = await supabase
      .from('servicos')
      .insert([
        { 
          nome: newService.name, 
          descricao: newService.description, 
          preco: parseFloat(newService.price.replace(',', '.')), 
          duracao_minutos: parseInt(newService.duration) 
        }
      ])
      .select();

    if (error) {
      console.error("Erro no Supabase:", error);
      toast.error("Erro ao salvar no banco. Salvando localmente para demo.");
    }

    const service: Service = {
      id: Date.now(),
      ...newService
    };

    setServices([service, ...services]);
    setIsModalOpen(false);
    setNewService({ name: "", description: "", price: "", duration: "30", category: "Cabelo" });
    toast.success("Serviço cadastrado com sucesso!");
  };


  const handleDelete = (id: number) => {
    setServices(services.filter(s => s.id !== id));
    toast.success("Serviço removido.");
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Serviços e Planos</h2>
          <p className="text-zinc-500">Gerencie seu catálogo de serviços e preços.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-zinc-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar serviço..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-amber-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Edit2 size={14} /></button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400"
                ><Trash2 size={14} /></button>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-widest">
                  {service.category}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">{service.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{service.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                   <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <span className="text-sm font-medium">{service.duration}</span>
                   </div>
                   <div className="text-lg font-bold text-white">
                      R$ {service.price}
                   </div>
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Novo Serviço</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X />
                </button>
              </div>

              <form onSubmit={handleAddService} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nome do Serviço</label>
                  <input 
                    required
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Ex: Corte Americano"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Preço (R$)</label>
                    <input 
                      required
                      type="text" 
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="45,00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Duração</label>
                    <input 
                      type="text" 
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="30 min"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Categoria</label>
                  <select 
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Combo">Combo</option>
                    <option value="Química">Química</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Descrição</label>
                  <textarea 
                    rows={3}
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Breve descrição do serviço..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  Cadastrar Serviço
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
