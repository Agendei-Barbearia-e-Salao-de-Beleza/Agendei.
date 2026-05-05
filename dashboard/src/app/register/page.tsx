"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scissors, User, Mail, Lock, Store, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    establishment: "",
    type: "BARBERSHOP"
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, establishment } = formData;

    if (!name || !email || !password || !establishment) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    // Simulação de cadastro
    setTimeout(() => {
      setLoading(false);
      toast.success("Conta criada com sucesso! Verifique seu e-mail.");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-xl"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-amber-500 p-2 rounded-xl">
            <Scissors className="text-zinc-950 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            Agendei<span className="text-amber-500">.</span>
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-amber-500/5 rounded-3xl blur-2xl" />
          <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-zinc-100">Criar Nova Conta</h3>
              <p className="text-zinc-500 text-sm mt-1">Comece a gerenciar seu estabelecimento hoje mesmo</p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Nome do Estabelecimento</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <input 
                    type="text" 
                    name="establishment"
                    value={formData.establishment}
                    onChange={handleInputChange}
                    placeholder="Ex: Barbearia do João"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-zinc-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Tipo de Negócio</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer appearance-none"
                >
                  <option value="BARBERSHOP">Barbearia</option>
                  <option value="SALON">Salão de Beleza</option>
                  <option value="UNISEX">Unissex</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="md:col-span-2 mt-4 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Processando..." : (
                  <>
                    Criar minha conta <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-zinc-600">
              Já tem uma conta? <a href="/" className="text-amber-500 hover:underline cursor-pointer font-medium flex items-center justify-center gap-1 mt-1">
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
