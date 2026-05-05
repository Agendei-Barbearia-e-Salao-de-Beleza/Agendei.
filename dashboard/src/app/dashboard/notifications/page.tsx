"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Smartphone, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    token: "",
    title: "",
    body: "",
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.token || !formData.title || !formData.body) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    
    try {
      // Chamada para o endpoint que criamos no backend
      const response = await fetch("http://localhost:8080/api/v1/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Notificação enviada com sucesso para o dispositivo!");
        setFormData({ ...formData, title: "", body: "" }); // Limpa apenas o conteúdo, mantém o token
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao enviar: ${errorText || "Erro no servidor"}`);
      }
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast.error("Não foi possível conectar ao servidor. Verifique se o Backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-white">Notificações Push</h2>
        <p className="text-zinc-500">Envie mensagens instantâneas para os aplicativos mobile dos seus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSend} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Token do Dispositivo (FCM)</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input 
                  type="text" 
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder="Ex: fLp_3s... (Token gerado pelo App Mobile)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50"
                />
              </div>
              <p className="text-[10px] text-zinc-600">Este token identifica unicamente o celular do cliente.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Título da Notificação</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Agendamento Confirmado! ✂️"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Mensagem (Corpo)</label>
              <textarea 
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Escreva a mensagem que o cliente receberá..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#fd9602] hover:bg-[#fd9602]/90 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? "Enviando..." : "Enviar Notificação Agora"}
            </button>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-[#fd9602]/5 border border-[#fd9602]/10 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-[#fd9602]">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">Como funciona?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O Agendei utiliza o **Firebase Cloud Messaging (FCM)** para garantir que suas notificações cheguem em milissegundos aos clientes.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[11px] text-zinc-500">
                <CheckCircle2 className="w-3 h-3 text-[#fd9602] mt-0.5 shrink-0" />
                Entrega garantida para Android e iOS.
              </li>
              <li className="flex items-start gap-2 text-[11px] text-zinc-500">
                <CheckCircle2 className="w-3 h-3 text-[#fd9602] mt-0.5 shrink-0" />
                Funciona com o app em segundo plano.
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <h3 className="text-white font-bold text-sm mb-4">Status da Integração</h3>
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-300 font-medium">Backend Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
