"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Palette, Smartphone, Save } from "lucide-react";
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
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Nome do Estabelecimento</label>
                                <input type="text" defaultValue="Agendei. Demo" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Telefone Comercial</label>
                                <input type="text" defaultValue="(11) 99999-8888" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Endereço Completo</label>
                            <input type="text" defaultValue="Rua das Belezas, 123 - São Paulo, SP" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
                        </div>
                        <button 
                            onClick={() => toast.success("Configurações salvas com sucesso!")}
                            className="bg-amber-500 text-zinc-950 font-bold px-8 py-3 rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
                        >
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </motion.div>
                )}

                {activeTab !== "perfil" && (
                    <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="p-4 bg-zinc-800 rounded-full mb-4">
                            <Settings className="w-8 h-8 text-zinc-600 animate-spin-slow" />
                        </div>
                        <h3 className="text-lg font-bold text-white light:text-zinc-950">Funcionalidade em Breve</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mt-1">
                            A aba <b>{activeTab}</b> está sendo preparada para o lançamento final do projeto.
                        </p>
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
                    ? "bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/20" 
                    : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 border border-transparent"
            }`}
        >
            {React.cloneElement(icon, { size: 20 })}
            <span className="font-bold text-sm">{label}</span>
        </button>
    );
}
