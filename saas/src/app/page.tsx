"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Lock, Mail, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Se o superadmin já estiver autenticado, redireciona direto
    const session = localStorage.getItem("agendei_saas_session");
    if (session === "authenticated_super_admin") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Credenciais exclusivas estritas fornecidas
    if (email === "managersaas@gmail.com" && password === "agendei20260501") {
      setTimeout(() => {
        localStorage.setItem("agendei_saas_session", "authenticated_super_admin");
        router.push("/dashboard");
      }, 1000);
    } else {
      setTimeout(() => {
        setError("Credenciais administrativas incorretas. Acesso restrito!");
        setLoading(false);
      }, 800);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Background ambient glowing neon lights (only for dark mode compatibility) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#fd9602]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="mx-auto w-14 h-14 rounded-2xl bg-[#fd9602] flex items-center justify-center shadow-lg shadow-[#fd9602]/10"
          >
            <Sparkles className="w-7 h-7 text-zinc-950" />
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Agendei<span className="text-[#fd9602]">.</span> Control
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Acesso SuperAdmin</p>
          </motion.div>
        </div>

        {/* Login Form Container - Mytasky-Inspired Aesthetics */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">E-mail Administrativo</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-zinc-450 dark:text-zinc-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl pl-11 pr-4 py-3.5 text-zinc-900 dark:text-white text-xs outline-none focus:border-[#fd9602] dark:focus:border-[#fd9602] transition-colors font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Chave de Segurança</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-zinc-450 dark:text-zinc-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl pl-11 pr-12 py-3.5 text-zinc-900 dark:text-white text-xs outline-none focus:border-[#fd9602] dark:focus:border-[#fd9602] transition-colors font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-zinc-900 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
            >
              {loading ? "Autenticando..." : "Entrar no Control Panel"}
            </button>
          </form>
        </motion.div>

        {/* Footer text */}
        <p className="text-center text-[9px] text-zinc-400 font-black uppercase tracking-widest">
          © 2026 Agendei Inc. • Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
