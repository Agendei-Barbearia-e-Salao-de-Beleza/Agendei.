"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scissors, Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Erro ao enviar e-mail de recuperação.");
        setLoading(false);
        return;
      }

      toast.success("E-mail de recuperação enviado com sucesso!");
      setEmail("");
    } catch (err) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
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
        className="z-10 w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-[#fd9602] p-2 rounded-xl">
            <Scissors className="text-zinc-950 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            Agendei<span className="text-[#fd9602]">.</span>
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#fd9602]/5 rounded-3xl blur-2xl" />
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-zinc-100">Recuperar Senha</h3>
              <p className="text-zinc-500 text-sm mt-1">Enviaremos um link de recuperação para o seu e-mail</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Seu E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Enviando..." : (
                  <>
                    Enviar Link <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-zinc-600">
              Lembrou a senha? <a href="/" className="text-[#fd9602] hover:underline cursor-pointer font-medium flex items-center justify-center gap-1 mt-1">
                <ArrowLeft className="w-3 h-3" /> Voltar para o Login
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <footer className="mt-12 z-10 text-zinc-700 text-xs font-medium tracking-widest uppercase">
        Agendei. Platform &copy; 2026
      </footer>
    </div>
  );
}
