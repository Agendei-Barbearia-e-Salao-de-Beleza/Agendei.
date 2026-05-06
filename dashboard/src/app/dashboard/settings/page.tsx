"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Palette, Smartphone, Save, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white light:text-zinc-950">Configurações</h2>
        <p className="text-zinc-500">Personalize o Agendei. para o seu estabelecimento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
            <SettingsTab icon={<User />} label="Perfil" id="perfil" active={activeTab === "perfil"} onClick={setActiveTab} />
            <SettingsTab icon={<Smartphone />} label="App Mobile" id="mobile" active={activeTab === "mobile"} onClick={setActiveTab} />
            <SettingsTab icon={<Bell />} label="Notificações" id="notificacoes" active={activeTab === "notificacoes"} onClick={setActiveTab} />
            <SettingsTab icon={<Shield />} label="Segurança" id="seguranca" active={activeTab === "seguranca"} onClick={setActiveTab} />
            <SettingsTab icon={<Palette />} label="Aparência" id="aparencia" active={activeTab === "aparencia"} onClick={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 bg-card border border-subtle p-8 rounded-3xl h-fit shadow-sm transition-all">
            <AnimatePresence mode="wait">
                {activeTab === "perfil" && (
                    <motion.div 
                        key="perfil"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Informações Gerais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Logo do Estabelecimento (URL)</label>
                                <input type="text" placeholder="https://..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Avatar do Proprietário (URL)</label>
                                <input type="text" placeholder="https://..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Nome do Estabelecimento</label>
                                <input type="text" defaultValue="Agendei. Demo" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Telefone Comercial</label>
                                <input type="text" defaultValue="(11) 99999-8888" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Endereço Completo</label>
                            <input type="text" defaultValue="Rua das Belezas, 123 - São Paulo, SP" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                        </div>
                        <button 
                            onClick={() => toast.success("Configurações salvas com sucesso!")}
                            className="bg-[#fd9602] text-zinc-950 font-bold px-8 py-3 rounded-xl hover:bg-[#fd9602]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#fd9602]/10 active:scale-95"
                        >
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </motion.div>
                )}

                {activeTab === "mobile" && (
                    <motion.div 
                        key="mobile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">App Mobile</h3>
                        <p className="text-zinc-500 text-sm">Leve o Agendei. no seu bolso e gerencie tudo de onde estiver.</p>
                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200 gap-4 text-center">
                            <Smartphone size={48} className="text-[#fd9602]" />
                            <div className="space-y-1">
                                <p className="font-bold text-white light:text-zinc-950">Disponível em breve nas lojas</p>
                                <p className="text-xs text-zinc-500">Estamos finalizando os últimos detalhes das versões iOS e Android.</p>
                            </div>
                            <button className="mt-2 bg-[#fd9602]/10 text-[#fd9602] font-bold px-6 py-2 rounded-xl border border-[#fd9602]/20 text-sm cursor-not-allowed opacity-50 transition-all">
                                Baixar App
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === "notificacoes" && (
                    <motion.div 
                        key="notificacoes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Notificações</h3>
                        <p className="text-zinc-500 text-sm">Controle como você e seus clientes são avisados.</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm">Lembretes de Agendamento</p>
                                    <p className="text-xs text-zinc-500">Envia SMS/Email para o cliente 24h antes.</p>
                                </div>
                                <div className="w-12 h-6 bg-[#fd9602] rounded-full relative cursor-pointer shadow-inner">
                                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm">Alertas Financeiros</p>
                                    <p className="text-xs text-zinc-500">Avisos de metas atingidas e fechamento de caixa.</p>
                                </div>
                                <div className="w-12 h-6 bg-zinc-700 rounded-full relative cursor-pointer shadow-inner">
                                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "seguranca" && (
                    <motion.div 
                        key="seguranca"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Segurança</h3>
                        <p className="text-zinc-500 text-sm">Proteja sua conta e seus dados financeiros.</p>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Senha Atual</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Nova Senha</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Confirmar Senha</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                </div>
                            </div>
                            <button className="bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-zinc-700 transition-all text-sm mt-2">
                                Atualizar Senha
                            </button>
                        </div>

                        <div className="pt-6 border-t border-zinc-800 light:border-zinc-200">
                            <div className="flex items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm flex items-center gap-2">Autenticação em 2 Fatores <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full">Recomendado</span></p>
                                    <p className="text-xs text-zinc-500">Adicione uma camada extra de segurança.</p>
                                </div>
                                <button className="text-[#fd9602] font-bold text-sm bg-[#fd9602]/10 px-4 py-2 rounded-xl">Ativar</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "aparencia" && (
                    <motion.div 
                        key="aparencia"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Aparência</h3>
                        <p className="text-zinc-500 text-sm">Personalize a cara do seu dashboard.</p>
                        
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Tema do Sistema</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl border-2 border-[#fd9602] bg-zinc-950 flex flex-col items-center gap-3 cursor-pointer">
                                    <div className="w-full h-12 bg-zinc-900 rounded-lg flex gap-2 p-2">
                                        <div className="w-3 h-full bg-zinc-800 rounded"></div>
                                        <div className="flex-1 bg-zinc-800 rounded"></div>
                                    </div>
                                    <span className="text-xs font-bold text-white">Escuro</span>
                                </div>
                                <div className="p-4 rounded-2xl border-2 border-zinc-800 bg-white flex flex-col items-center gap-3 cursor-pointer opacity-50">
                                    <div className="w-full h-12 bg-zinc-100 rounded-lg flex gap-2 p-2">
                                        <div className="w-3 h-full bg-zinc-200 rounded"></div>
                                        <div className="flex-1 bg-zinc-200 rounded"></div>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-950">Claro</span>
                                </div>
                                <div className="p-4 rounded-2xl border-2 border-zinc-800 bg-gradient-to-r from-zinc-950 to-white flex flex-col items-center gap-3 cursor-pointer opacity-50">
                                     <div className="w-full h-12 flex rounded-lg overflow-hidden border border-zinc-500/20">
                                        <div className="flex-1 bg-zinc-900 p-2"><div className="w-full h-full bg-zinc-800 rounded"></div></div>
                                        <div className="flex-1 bg-zinc-100 p-2"><div className="w-full h-full bg-zinc-200 rounded"></div></div>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500">Sistema</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, id, active, onClick }: any) {
    return (
        <button 
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 ${
                active 
                    ? "bg-[#fd9602]/10 text-[#fd9602] shadow-sm border border-[#fd9602]/20" 
                    : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 border border-transparent"
            }`}
        >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
            <span className="font-bold text-sm">{label}</span>
        </button>
    );
}
