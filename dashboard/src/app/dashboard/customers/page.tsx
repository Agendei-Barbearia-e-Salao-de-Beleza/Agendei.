"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Mail, Phone, Calendar as CalendarIcon, X, Check, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', user.id)
        .single();

      if (estData) {
        setEstablishmentId(estData.id);
        await fetchCustomers(estData.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers(estId: string) {
    // Busca usuários que possuem agendamentos neste estabelecimento
    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select('usuarios!agendamentos_cliente_id_fkey(*)')
      .eq('estabelecimento_id', estId);

    if (error) {
      toast.error("Erro ao carregar clientes.");
      return;
    }

    // Extrair usuários únicos dos agendamentos
    const uniqueCustomers = Array.from(new Set(appointments?.map(a => JSON.stringify(a.usuarios))))
      .map(s => JSON.parse(s))
      .filter(u => u !== null);

    setCustomers(uniqueCustomers);
  }

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      (c.nome?.toLowerCase() || "").includes(term) ||
      (c.email?.toLowerCase() || "").includes(term) ||
      (c.telefone || "").includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;

    setLoading(true);
    try {
      // Cria o usuário cliente
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          nome: newCustomer.name,
          email: newCustomer.email,
          telefone: newCustomer.phone,
          perfil: 'CLIENTE'
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Cria um agendamento "fantasma" ou apenas vincula? 
      // Por enquanto, apenas atualizamos a lista localmente para simular o vínculo
      setCustomers([userData, ...customers]);
      
      setIsModalOpen(false);
      toast.success("Cliente cadastrado com sucesso!");
      setNewCustomer({ name: "", email: "", phone: "" });
    } catch (error: any) {
      toast.error("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Remover este cliente da sua base?")) return;
    
    try {
      // Como o cliente pode estar em outros estabelecimentos, aqui apenas removemos localmente
      // No mundo real, deletaríamos o vínculo.
      setCustomers(customers.filter(c => c.id !== id));
      toast.success("Cliente removido da sua visualização.");
    } catch (error) {
      toast.error("Erro ao remover cliente.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight dark:text-white">Clientes</h2>
          <p className="text-zinc-500 font-medium">Base de dados completa dos seus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#fd9602] text-zinc-950 font-bold px-6 py-4 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#fd9602]/20 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#fd9602] transition-colors" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="w-full bg-zinc-900/50 border border-subtle rounded-xl pl-12 pr-4 py-4 text-sm text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 transition-all"
        />
      </div>

      {loading && customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#fd9602] animate-spin" />
          <p className="text-zinc-500 font-medium">Carregando clientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <motion.div 
                  key={customer.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card dark:bg-zinc-900 border border-subtle dark:border-zinc-800 p-6 rounded-2xl hover:border-[#fd9602]/30 transition-all group relative shadow-sm"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#fd9602] flex items-center justify-center text-xl font-bold text-zinc-950 group-hover:scale-105 transition-transform">
                        {(customer.nome || "??").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-title dark:text-white">{customer.nome}</h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em]">Cliente Fiel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Faturamento</p>
                      <p className="text-lg font-bold text-[#fd9602]">R$ 0,00</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-subtle dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-medium truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs font-medium">{customer.telefone || "Não informado"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">Cadastrado em: {new Date(customer.criado_em).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-3 bg-zinc-800 dark:bg-zinc-800 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all cursor-pointer border border-subtle dark:border-zinc-700 shadow-sm"
                        title="Excluir Cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-subtle">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                  <p className="text-title font-bold text-lg dark:text-white">Nenhum cliente encontrado</p>
                  <p className="text-zinc-500">Tente buscar por outro termo ou cadastre um novo cliente.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Cliente"
      >
        <form onSubmit={handleAddCustomer} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} type="text" placeholder="Ex: João Silva" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 rounded-xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">E-mail</label>
            <input required value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} type="email" placeholder="joao@email.com" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 rounded-xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Telefone</label>
            <input required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} type="text" placeholder="(11) 99999-0000" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-800 rounded-xl px-4 py-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cadastrar Cliente"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
