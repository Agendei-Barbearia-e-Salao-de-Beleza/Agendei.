"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Financeiro</h2>
        <p className="text-zinc-500">Controle de entradas, saídas e faturamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard label="Saldo Total" value="R$ 15.420,00" icon={<Wallet />} color="text-amber-500" bg="bg-amber-500/10" />
        <FinanceCard label="Entradas (Mês)" value="R$ 8.940,00" icon={<ArrowUpRight />} color="text-emerald-500" bg="bg-emerald-500/10" />
        <FinanceCard label="Saídas (Mês)" value="R$ 2.150,00" icon={<ArrowDownRight />} color="text-red-500" bg="bg-red-500/10" />
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Relatórios Detalhados</h3>
        <p className="text-zinc-500 max-w-sm">Esta funcionalidade está sendo preparada para a demonstração final. Em breve você terá gráficos interativos de fluxo de caixa.</p>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          {icon}
        </div>
        <span className="text-zinc-500 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
import { BarChart3 } from "lucide-react";
