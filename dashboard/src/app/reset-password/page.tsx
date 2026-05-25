"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error("Erro ao atualizar senha. O link pode ter expirado.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      toast.error("Ocorreu um erro inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center p-6">
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
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="bg-emerald-500/20 p-4 rounded-full">
                    <CheckCircle2 className="text-emerald-500 w-12 h-12" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-zinc-100">Senha Alterada!</h3>
                <p className="text-zinc-500 text-sm">Sua senha foi atualizada com sucesso. Redirecionando para o login...</p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-zinc-100">Nova Senha</h3>
                  <p className="text-zinc-500 text-sm mt-1">Defina sua nova senha de acesso</p>
                </div>

                <form className="space-y-6" onSubmit={handleReset}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Confirmar Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#fd9602] hover:bg-[#fd9602]/90 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#fd9602]/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Atualizando..." : "Salvar Nova Senha"}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      <footer className="mt-12 z-10 text-zinc-700 text-xs font-medium tracking-widest uppercase">
        Agendei. Platform &copy; 2026
      </footer>
    </div>
  );
}
