"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinancePage() {
  const chartData = [45, 52, 48, 70, 65, 85, 78, 95, 110, 105, 120, 115];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight">Financeiro</h2>
          <p className="text-zinc-500 font-medium">Controle total de faturamento e fluxo de caixa.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-subtle p-1.5 rounded-2xl">
           <button className="px-5 py-2.5 rounded-xl bg-[#fd9602] text-zinc-950 text-xs font-bold shadow-lg shadow-[#fd9602]/10">Mensal</button>
           <button className="px-5 py-2.5 rounded-xl text-zinc-500 text-xs font-bold hover:text-title transition-colors">Anual</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard label="Saldo Total" value="R$ 15.420,00" icon={<Wallet />} color="text-[#fd9602]" bg="bg-[#fd9602]/10" trend="+12.5%" />
        <FinanceCard label="Entradas (Mês)" value="R$ 8.940,00" icon={<ArrowUpRight />} color="text-emerald-500" bg="bg-emerald-500/10" trend="+8.2%" />
        <FinanceCard label="Saídas (Mês)" value="R$ 2.150,00" icon={<ArrowDownRight />} color="text-red-500" bg="bg-red-500/10" trend="-2.4%" />
      </div>

      {/* Main Chart Card */}
      <div className="bg-card border border-subtle p-8 rounded-2xl space-y-10 shadow-xl">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-bold text-title tracking-tight">Análise de Faturamento</h3>
            <p className="text-zinc-500 text-sm font-medium">Desempenho financeiro comparativo.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
            <TrendingUp size={14} />
            Crescimento de 24%
          </div>
        </div>

        {/* Custom SVG Chart - Perfectly Centered */}
        <div className="relative h-[300px] w-full flex items-end justify-between px-4">
          <div className="absolute inset-0 flex flex-col justify-between py-10 pointer-events-none opacity-20">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-zinc-700" />
             ))}
          </div>
          
          {chartData.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-6 flex-1 h-full justify-end">
              <div className="relative w-full flex justify-center items-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 130) * 100}%` }}
                  transition={{ duration: 1.2, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full max-w-[32px] bg-gradient-to-t from-[#fd9602]/10 via-[#fd9602]/40 to-[#fd9602] rounded-t-xl relative group cursor-help"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl scale-95 group-hover:scale-100 z-50">
                    R$ {(val * 100).toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-subtle bg-zinc-500/5">
           <h3 className="text-lg font-bold text-title tracking-tight">Fluxo de Caixa Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="border-b border-subtle text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50">
                   <th className="px-8 py-5">Descrição</th>
                   <th className="px-8 py-5">Categoria</th>
                   <th className="px-8 py-5">Data</th>
                   <th className="px-8 py-5 text-right">Valor</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-subtle">
                <TransactionRow title="Corte + Barba (Carlos)" category="Serviço" date="Hoje, 14:00" value="R$ 75,00" type="income" />
                <TransactionRow title="Aluguel Salão" category="Fixo" date="Ontem" value="R$ 1.500,00" type="expense" />
                <TransactionRow title="Produtos L'Oreal" category="Estoque" date="03 Mai" value="R$ 420,00" type="expense" />
                <TransactionRow title="Coloração (Juliana)" category="Serviço" date="02 Mai" value="R$ 180,00" type="income" />
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, icon, color, bg, trend }: any) {
  return (
    <div className="bg-card border border-subtle p-8 rounded-2xl space-y-4 hover:border-[#fd9602]/30 transition-all cursor-pointer group shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("p-3.5 rounded-xl", bg, color)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tighter",
          trend.startsWith("+") ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-bold text-title tracking-tight group-hover:text-[#fd9602] transition-colors">{value}</p>
      </div>
    </div>
  );
}

function TransactionRow({ title, category, date, value, type }: any) {
  return (
    <tr className="hover:bg-zinc-500/5 transition-colors group">
       <td className="px-8 py-6">
          <div className="flex items-center gap-4">
             <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border border-subtle transition-colors",
                type === "income" ? "bg-emerald-500/5 text-emerald-500 group-hover:bg-emerald-500/10" : "bg-red-500/5 text-red-500 group-hover:bg-red-500/10"
             )}>
                {type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
             </div>
             <span className="text-sm font-bold text-title">{title}</span>
          </div>
       </td>
       <td className="px-8 py-6">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-subtle">
             {category}
          </span>
       </td>
       <td className="px-8 py-6 text-sm text-zinc-500 font-bold">{date}</td>
       <td className={cn(
          "px-8 py-6 text-right font-bold text-base",
          type === "income" ? "text-emerald-500" : "text-white"
       )}>
          {type === "income" ? "+" : "-"} {value}
       </td>
    </tr>
  );
}
