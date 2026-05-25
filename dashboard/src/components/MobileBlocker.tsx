"use client";

import React from "react";
import { Smartphone, Download, Sparkles, ShieldCheck } from "lucide-react";

export default function MobileBlocker() {
  return (
    <>
      {/* Global CSS to handle visibility and block page scroll on mobile only */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            overflow: hidden !important;
          }
          .mobile-blocker-active {
            display: flex !important;
          }
        }
      `}</style>

      <div className="hidden mobile-blocker-active fixed inset-0 z-[999999] flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white font-sans text-center overflow-y-auto">
        {/* Neon glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#fd9602]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-sm w-full space-y-8 relative z-10 py-8">
          {/* Logo Brand area */}
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#fd9602] to-amber-400 flex items-center justify-center shadow-lg shadow-[#fd9602]/20 animate-pulse">
              <Sparkles className="w-8 h-8 text-zinc-950" />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Agendei<span className="text-[#fd9602]">.</span>
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-[#fd9602]/10 text-[#fd9602] uppercase tracking-widest border border-[#fd9602]/20">
              Painel do Gestor
            </span>
          </div>

          {/* Interactive Illustration */}
          <div className="relative mx-auto w-36 h-36 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fd9602]/5 to-transparent rounded-[2.5rem]" />
            <Smartphone className="w-16 h-16 text-zinc-500 animate-bounce" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Information content */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Painel Otimizado para Telas Maiores
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Para gerenciar serviços, visualizar gráficos de faturamento e configurar sua agenda com total precisão, utilize um tablet ou computador.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Ou use nosso App</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* Action buttons (Direct apps download) */}
          <div className="space-y-3">
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-14 bg-gradient-to-r from-[#fd9602] to-amber-500 hover:from-[#fd9602]/90 hover:to-amber-500/90 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#fd9602]/10 cursor-pointer"
            >
              <Download className="w-4.5 h-4.5 text-zinc-950" />
              Baixar App do Gerente
            </a>
            
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-850 text-white border border-white/5 font-black rounded-2xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-4.5 h-4.5 text-[#fd9602]" />
              Baixar App do Cliente
            </a>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-zinc-650 font-semibold uppercase tracking-wider">
            © 2026 Agendei Inc. • Todos os direitos reservados.
          </p>
        </div>
      </div>
    </>
  );
}
