"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, Clock, X, Sparkles, Tag, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { supabase } from "@/lib/supabase";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "SERVICE" | "PLAN">("ALL");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    category: "CABELO",
    description: "",
    type: "SERVICE"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { data: estData, error: estError } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', user.id)
        .single();

      if (estError || !estData) {
        toast.error("Erro ao localizar seu estabelecimento.");
        return;
      }

      setEstablishmentId(estData.id);
      await fetchServices(estData.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices(estId: string) {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('estabelecimento_id', estId)
      .order('criado_em', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar serviços.");
      return;
    }

    setServices(data || []);
  }

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "ALL" || s.tipo === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [services, searchTerm, activeTab]);

  const handleOpenModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.nome,
        price: service.preco.toString().replace('.', ','),
        duration: service.duracao_minutos.toString(),
        category: service.categoria || "CABELO",
        description: service.descricao || "",
        type: service.tipo || "SERVICE"
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        price: "",
        duration: "",
        category: activeTab === "PLAN" ? "PLAN" : "CABELO",
        description: "",
        type: activeTab === "PLAN" ? "PLAN" : "SERVICE"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;

    const payload = {
      nome: formData.name,
      preco: parseFloat(formData.price.replace(',', '.')),
      duracao_minutos: parseInt(formData.duration) || 30,
      categoria: formData.category,
      descricao: formData.description,
      tipo: formData.type,
      estabelecimento_id: establishmentId
    };

    setLoading(true);
    try {
      if (editingService) {
        const { error } = await supabase
          .from('servicos')
          .update(payload)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success("Item atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([payload]);

        if (error) throw error;
        toast.success(`${formData.type === "PLAN" ? "Plano" : "Serviço"} criado com sucesso!`);
      }
      
      await fetchServices(establishmentId);
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este item?")) return;
    
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(services.filter(s => s.id !== id));
      toast.success("Item removido.");
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight dark:text-white">Serviços e Planos</h2>
          <p className="text-zinc-500 font-medium">Gerencie seu catálogo de serviços e planos de fidelidade.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setActiveTab("PLAN"); handleOpenModal(); }}
            className="bg-zinc-800 text-zinc-300 font-bold px-6 py-4 rounded-xl flex items-center gap-2 hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer border border-subtle dark:border-zinc-700"
          >
            <Layers className="w-5 h-5" />
            Novo Plano
          </button>
          <button 
            onClick={() => { setActiveTab("SERVICE"); handleOpenModal(); }}
            className="btn-primary px-6 py-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Serviço
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-subtle dark:border-zinc-800">
          {(["ALL", "SERVICE", "PLAN"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab 
                  ? "bg-[#fd9602] text-zinc-950 shadow-lg" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "ALL" ? "Todos" : tab === "SERVICE" ? "Serviços" : "Planos"}
            </button>
          ))}
        </div>

        <div className="relative w-full max-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602] transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-zinc-900/50 border border-subtle rounded-xl pl-12 pr-4 py-4 text-sm text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading && services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#fd9602] animate-spin" />
          <p className="text-zinc-500 font-medium">Carregando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-8 rounded-[2rem] hover:border-[#fd9602]/30 transition-all group relative overflow-hidden shadow-sm ${
                  item.tipo === "PLAN" ? "ring-2 ring-[#fd9602]/20" : ""
                }`}
              >
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2 z-10">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="p-2.5 bg-zinc-800 dark:bg-zinc-800 hover:bg-[#fd9602]/10 text-zinc-500 hover:text-[#fd9602] rounded-xl transition-all cursor-pointer border border-subtle dark:border-zinc-700"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 bg-zinc-800 dark:bg-zinc-800 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all cursor-pointer border border-subtle dark:border-zinc-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#fd9602]/10 text-[#fd9602] uppercase tracking-widest border border-[#fd9602]/20">
                      {item.tipo === "PLAN" ? <Sparkles size={10} className="mr-1.5" /> : null}
                      {item.categoria}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-title dark:text-white group-hover:text-[#fd9602] transition-colors tracking-tight">
                      {item.nome}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-subtle dark:border-zinc-800/50">
                     <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Clock className="w-5 h-5 text-zinc-600" />
                        <span className="text-sm font-bold uppercase tracking-tighter">
                          {item.tipo === "PLAN" ? `${item.duracao_minutos} dias` : `${item.duracao_minutos} min`}
                        </span>
                     </div>
                     <div className="text-2xl font-bold text-title dark:text-white tracking-tighter">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredServices.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 font-medium">Nenhum item encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingService ? `Editar ${formData.type === "PLAN" ? "Plano" : "Serviço"}` : `Novo ${formData.type === "PLAN" ? "Plano" : "Serviço"}`}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Nome</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Corte Americano"
              className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Preço (R$)</label>
              <input 
                required
                type="text" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="45,00"
                className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
                {formData.type === "PLAN" ? "Validade (dias)" : "Duração (min)"}
              </label>
              <input 
                required
                type="number" 
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder={formData.type === "PLAN" ? "30" : "30"}
                className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Categoria</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 cursor-pointer"
            >
              <option value="CABELO">Cabelo</option>
              <option value="BARBA">Barba</option>
              <option value="COMBO">Combo</option>
              <option value="PLAN">Plano de Assinatura</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Descrição</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as vantagens..."
              className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingService ? "Salvar Alterações" : "Cadastrar Agora")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
