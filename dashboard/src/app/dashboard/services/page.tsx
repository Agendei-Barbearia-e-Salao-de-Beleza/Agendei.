"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, Clock, X, Sparkles, Tag, Layers, Loader2, Camera, Play } from "lucide-react";
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
  const [viewingService, setViewingService] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "SERVICE" | "PLAN">("ALL");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    category: "CABELO",
    description: "",
    type: "SERVICE",
    imagem_url: "",
    video_url: ""
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
        type: service.tipo || "SERVICE",
        imagem_url: service.imagem_url || "",
        video_url: service.video_url || ""
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        price: "",
        duration: "",
        category: activeTab === "PLAN" ? "PLAN" : "CABELO",
        description: "",
        type: activeTab === "PLAN" ? "PLAN" : "SERVICE",
        imagem_url: "",
        video_url: ""
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
      imagem_url: formData.imagem_url,
      video_url: formData.video_url,
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
                onClick={() => setViewingService(item)}
                className={`glass-card p-8 rounded-[2rem] hover:border-[#fd9602]/30 transition-all group relative overflow-hidden shadow-sm cursor-pointer ${
                  item.tipo === "PLAN" ? "ring-2 ring-[#fd9602]/20" : ""
                }`}
              >
                <div className="absolute top-6 right-6 flex gap-2 z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-[#fd9602]/15 text-zinc-650 dark:text-zinc-400 hover:text-[#fd9602] rounded-xl transition-all cursor-pointer border border-subtle dark:border-zinc-700 shadow-sm"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/15 text-zinc-650 dark:text-zinc-400 hover:text-red-500 rounded-xl transition-all cursor-pointer border border-subtle dark:border-zinc-700 shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="w-full h-44 rounded-[20px] overflow-hidden relative bg-zinc-100 dark:bg-zinc-900 border border-subtle dark:border-zinc-800/80 shadow-inner group-hover:border-[#fd9602]/20 transition-all">
                    {item.imagem_url ? (
                      (() => {
                        const imgs = item.imagem_url.split('||').filter(Boolean);
                        if (imgs.length === 0) return null;
                        return (
                          <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth">
                            {imgs.map((img: string, idx: number) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`${item.nome} ${idx}`}
                                className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-500 group-hover:scale-105"
                              />
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      /* Premium category-based placeholder with dynamic HSL gradient and icons */
                      <div className={`w-full h-full flex flex-col items-center justify-center gap-3 transition-colors ${
                        item.tipo === "PLAN" 
                          ? "bg-gradient-to-br from-[#fd9602]/10 via-[#fd9602]/5 to-zinc-950/20" 
                          : "bg-gradient-to-br from-zinc-100 to-zinc-200/50 dark:from-zinc-900 dark:to-zinc-950"
                      }`}>
                        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-subtle dark:border-zinc-800 text-[#fd9602] shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {item.categoria === "CABELO" && <Sparkles className="w-8 h-8" />}
                          {item.categoria === "BARBA" && <Tag className="w-8 h-8" />}
                          {item.categoria === "COMBO" && <Layers className="w-8 h-8" />}
                          {item.categoria === "PLAN" && <Sparkles className="w-8 h-8" />}
                          {!(["CABELO", "BARBA", "COMBO", "PLAN"].includes(item.categoria)) && <Layers className="w-8 h-8" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Sem Foto Cadastrada</span>
                      </div>
                    )}
                    {item.video_url && (
                      <a 
                        href={item.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-3 right-3 bg-zinc-950/80 hover:bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer z-10"
                      >
                        <Play size={10} className="fill-current" /> Assistir Vídeo
                      </a>
                    )}
                  </div>

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

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
              Imagens do Serviço ({formData.imagem_url ? formData.imagem_url.split('||').filter(Boolean).length : 0})
            </label>
            
            {/* Adição manual de links */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Adicionar link de imagem..."
                id="manual-service-web-img-url"
                className="flex-1 bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const current = formData.imagem_url ? formData.imagem_url.split('||').filter(Boolean) : [];
                      if (!current.includes(val)) current.push(val);
                      setFormData({ ...formData, imagem_url: current.join('||') });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('manual-service-web-img-url') as HTMLInputElement;
                  if (el && el.value.trim()) {
                    const val = el.value.trim();
                    const current = formData.imagem_url ? formData.imagem_url.split('||').filter(Boolean) : [];
                    if (!current.includes(val)) current.push(val);
                    setFormData({ ...formData, imagem_url: current.join('||') });
                    el.value = '';
                  }
                }}
                className="bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 rounded-2xl text-xs font-bold border border-subtle dark:border-zinc-700 transition-all cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Importação Local */}
            <label className="bg-zinc-150 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-subtle dark:border-zinc-700 rounded-2xl py-3 px-4 text-center text-xs font-bold text-title dark:text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all">
              <Camera size={14} className="text-[#fd9602]" /> Importar Fotos Locais (Múltiplas)
              <input 
                type="file" 
                multiple
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result && typeof reader.result === 'string') {
                          const val = reader.result;
                          const current = formData.imagem_url ? formData.imagem_url.split('||').filter(Boolean) : [];
                          if (!current.includes(val)) current.push(val);
                          setFormData(prev => ({ ...prev, imagem_url: current.join('||') }));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }}
              />
            </label>

            {/* Miniaturas de visualização */}
            {formData.imagem_url && formData.imagem_url.split('||').filter(Boolean).length > 0 && (
              <div className="grid grid-cols-6 gap-2 pt-1.5 max-h-24 overflow-y-auto pr-1">
                {formData.imagem_url.split('||').filter(Boolean).map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-subtle dark:border-zinc-800 bg-zinc-950 shrink-0">
                    <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.imagem_url ? formData.imagem_url.split('||').filter(Boolean) : [];
                        current.splice(i, 1);
                        setFormData({ ...formData, imagem_url: current.join('||') });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-650 transition-all cursor-pointer border-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Vídeo Demonstrativo (URL)</label>
            <input 
              type="url" 
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://exemplo.com/video.mp4 ou link do YouTube"
              className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-subtle dark:border-zinc-800 rounded-2xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20"
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

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingService}
        onClose={() => setViewingService(null)}
        title="Detalhes do Catálogo"
      >
        {viewingService && (
          <div className="space-y-6 pb-2">
            {/* Media Area (Carrossel ou Placeholder + Video Player Embutido) */}
            <div className="w-full rounded-[24px] overflow-hidden border border-subtle dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 relative">
              {viewingService.imagem_url ? (
                <div className="w-full h-64 flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth">
                  {viewingService.imagem_url.split('||').filter(Boolean).map((img: string, idx: number) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`${viewingService.nome} ${idx}`}
                      className="w-full h-full object-cover shrink-0 snap-center"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-50 to-zinc-150 dark:from-zinc-900 dark:to-zinc-950">
                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-850 border border-subtle dark:border-zinc-800 text-[#fd9602] shadow-sm">
                    {viewingService.categoria === "CABELO" && <Sparkles className="w-10 h-10" />}
                    {viewingService.categoria === "BARBA" && <Tag className="w-10 h-10" />}
                    {viewingService.categoria === "COMBO" && <Layers className="w-10 h-10" />}
                    {viewingService.categoria === "PLAN" && <Sparkles className="w-10 h-10" />}
                    {!(["CABELO", "BARBA", "COMBO", "PLAN"].includes(viewingService.categoria)) && <Layers className="w-10 h-10" />}
                  </div>
                  <span className="text-xs font-bold tracking-wider text-zinc-500">Sem Foto Cadastrada</span>
                </div>
              )}
            </div>

            {/* Video embed if present */}
            {viewingService.video_url && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#fd9602]">Vídeo Demonstrativo</span>
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-subtle dark:border-zinc-800 bg-zinc-950 flex items-center justify-center relative">
                  {viewingService.video_url.includes('youtube.com') || viewingService.video_url.includes('youtu.be') ? (
                    (() => {
                      const ytId = viewingService.video_url.split('v=')[1] || viewingService.video_url.split('/').pop();
                      return (
                        <iframe 
                          src={`https://www.youtube.com/embed/${ytId}`} 
                          className="w-full h-full border-none"
                          allowFullScreen
                          title="Vídeo do Serviço"
                        />
                      );
                    })()
                  ) : (
                    <video 
                      src={viewingService.video_url} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#fd9602]/10 text-[#fd9602] uppercase tracking-widest border border-[#fd9602]/20">
                  {viewingService.tipo === "PLAN" ? <Sparkles size={10} className="mr-1.5" /> : null}
                  {viewingService.categoria}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-bold text-xs">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>{viewingService.tipo === "PLAN" ? `${viewingService.duracao_minutos} dias` : `${viewingService.duracao_minutos} minutos`}</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                {viewingService.nome}
              </h3>
            </div>

            {/* Price with giant styling */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-subtle dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Investimento</span>
              <span className="text-3xl font-black text-[#fd9602]">
                R$ {viewingService.preco.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Description card */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Sobre o Serviço / Plano</span>
              <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium bg-zinc-50/50 dark:bg-zinc-900/20 p-5 rounded-2xl border border-subtle dark:border-zinc-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {viewingService.descricao || "Nenhuma descrição fornecida."}
              </p>
            </div>

            {/* Actions button */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => { setEditingService(viewingService); setFormData({
                  name: viewingService.nome,
                  price: viewingService.preco.toString().replace('.', ','),
                  duration: viewingService.duracao_minutos.toString(),
                  category: viewingService.categoria || "CABELO",
                  description: viewingService.descricao || "",
                  type: viewingService.tipo || "SERVICE",
                  imagem_url: viewingService.imagem_url || "",
                  video_url: viewingService.video_url || ""
                }); setViewingService(null); setIsModalOpen(true); }}
                className="flex-1 bg-zinc-100 hover:bg-[#fd9602]/15 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-[#fd9602] border border-subtle dark:border-zinc-700 h-12 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit2 size={14} /> Editar Item
              </button>
              <button 
                onClick={() => setViewingService(null)}
                className="flex-1 btn-primary h-12 text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
