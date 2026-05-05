"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scissors, Calendar, BarChart3, ShieldCheck, ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        setLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso! Acessando painel...");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Ocorreu um erro ao tentar fazer login.");
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fd9602]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side: Branding & Info */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="bg-[#fd9602] p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Scissors className="text-zinc-950 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">
              Agendei<span className="text-[#fd9602]">.</span>
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.1]">
              A gestão do seu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-[#fd9602]">
                negócio elevada.
              </span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-md mx-auto lg:mx-0">
              Unifique o controle de agendamentos, finanças e clientes em uma única plataforma elegante e intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <FeatureItem icon={<Calendar className="w-5 h-5" />} text="Agenda Inteligente" />
            <FeatureItem icon={<BarChart3 className="w-5 h-5" />} text="Relatórios Financeiros" />
            <FeatureItem icon={<ShieldCheck className="w-5 h-5" />} text="Controle de Acesso" />
            <FeatureItem icon={<ArrowRight className="w-5 h-5" />} text="Integração WhatsApp" />
          </div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#fd9602]/5 rounded-3xl blur-2xl" />
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-100">Painel Administrativo</h3>
              <p className="text-zinc-500 text-sm mt-1">Entre com sua conta para gerenciar seu estabelecimento</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@agendei.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-zinc-400">Senha</label>
                  <a href="/forgot-password" className="text-xs text-[#fd9602] hover:underline cursor-pointer">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#fd9602] hover:bg-[#fd9602]/90 text-zinc-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#fd9602]/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar no Painel"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-600">Ou continue com</span></div>
              </div>

              <button type="button" className="w-full bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google Workspace
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-zinc-600">
              Ainda não tem conta? <a href="/register" className="text-[#fd9602] hover:underline cursor-pointer font-medium">Cadastre seu estabelecimento</a>
            </p>
            <p className="mt-2 text-center text-xs text-zinc-600">
              Precisa de ajuda? Entre em contato com o suporte.
            </p>
            <div className="mt-6 p-3 bg-[#fd9602]/5 border border-[#fd9602]/10 rounded-xl">
              <p className="text-[10px] text-[#fd9602]/60 uppercase tracking-widest font-bold text-center mb-1">Conta de Demonstração</p>
              <p className="text-xs text-zinc-400 text-center">E-mail: <span className="text-zinc-200 font-mono">matheus@agendei.com</span></p>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <footer className="mt-12 z-10 text-zinc-700 text-sm font-medium tracking-widest uppercase">
        Agendei. Platform &copy; 2026
      </footer>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 p-3 rounded-xl">
      <div className="text-[#fd9602]">{icon}</div>
      <span className="text-sm text-zinc-300 font-medium">{text}</span>
    </div>
  );
}
