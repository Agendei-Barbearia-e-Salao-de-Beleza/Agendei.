"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, Calendar, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  useEffect(() => {
    fetchFinanceData();
  }, []);

  async function fetchFinanceData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', user.id)
        .single();

      if (estData) {
        await Promise.all([
          fetchTotals(estData.id),
          fetchTransactions(estData.id),
          fetchChartData(estData.id)
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTotals(estId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Entradas (Agendamentos)
    const { data: incomeData } = await supabase
      .from('agendamentos')
      .select('preco_total')
      .eq('estabelecimento_id', estId)
      .gte('data_hora', startOfMonth.toISOString());

    const income = incomeData?.reduce((acc, curr) => acc + Number(curr.preco_total), 0) || 0;

    // Saídas (Despesas)
    const { data: expenseData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfMonth.toISOString().split('T')[0]);

    const expense = expenseData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    // Saldo Total (Geral)
    const { data: allIncome } = await supabase.from('agendamentos').select('preco_total').eq('estabelecimento_id', estId);
    const { data: allExpense } = await supabase.from('despesas').select('valor').eq('estabelecimento_id', estId);
    
    const totalInc = allIncome?.reduce((acc, curr) => acc + Number(curr.preco_total), 0) || 0;
    const totalExp = allExpense?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    setTotals({
      balance: totalInc - totalExp,
      income,
      expense
    });
  }

  async function fetchTransactions(estId: string) {
    // Buscar agendamentos e despesas recentes
    const [incRes, expRes] = await Promise.all([
      supabase.from('agendamentos').select('id, preco_total, data_hora, usuarios!agendamentos_cliente_id_fkey(nome)').eq('estabelecimento_id', estId).order('data_hora', { ascending: false }).limit(5),
      supabase.from('despesas').select('id, valor, descricao, data').eq('estabelecimento_id', estId).order('data', { ascending: false }).limit(5)
    ]);

    const combined = [
      ...(incRes.data?.map(i => ({
        id: i.id,
        title: `Agendamento: ${(i.usuarios as any)?.nome || "Cliente"}`,
        category: "Serviço",
        date: new Date(i.data_hora).toLocaleDateString('pt-BR'),
        value: Number(i.preco_total),
        type: "income"
      })) || []),
      ...(expRes.data?.map(e => ({
        id: e.id,
        title: e.descricao,
        category: "Despesa",
        date: new Date(e.data).toLocaleDateString('pt-BR'),
        value: Number(e.valor),
        type: "expense"
      })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(combined.slice(0, 8));
  }

  async function fetchChartData(estId: string) {
    const { data } = await supabase
      .from('agendamentos')
      .select('preco_total, data_hora')
      .eq('estabelecimento_id', estId);

    if (data) {
      const monthlyValues = new Array(12).fill(0);
      data.forEach(item => {
        const month = new Date(item.data_hora).getMonth();
        monthlyValues[month] += Number(item.preco_total);
      });
      setChartData(monthlyValues);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#fd9602] animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Carregando Finanças...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-title tracking-tight dark:text-white">Financeiro</h2>
          <p className="text-zinc-500 font-medium">Controle total de faturamento e fluxo de caixa.</p>
        </div>
        <div className="flex items-center gap-2 bg-card dark:bg-zinc-900 border border-subtle dark:border-zinc-800 p-1.5 rounded-2xl">
            <button className="px-5 py-2.5 rounded-xl bg-[#fd9602] text-zinc-950 text-xs font-bold shadow-lg shadow-[#fd9602]/10">Mensal</button>
            <button className="px-5 py-2.5 rounded-xl text-zinc-500 text-xs font-bold hover:text-title transition-colors">Anual</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard label="Saldo Total" value={`R$ ${totals.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Wallet />} color="text-[#fd9602]" bg="bg-[#fd9602]/10" trend="+100%" />
        <FinanceCard label="Entradas (Mês)" value={`R$ ${totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowUpRight />} color="text-emerald-500" bg="bg-emerald-500/10" trend="+100%" />
        <FinanceCard label="Saídas (Mês)" value={`R$ ${totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowDownRight />} color="text-red-500" bg="bg-red-500/10" trend="-0%" />
      </div>

      {/* Chart Card */}
      <div className="bg-card dark:bg-zinc-900 border border-subtle dark:border-zinc-800 p-8 rounded-3xl space-y-12 shadow-xl">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-bold text-title dark:text-white tracking-tight">Análise de Faturamento</h3>
            <p className="text-zinc-500 text-sm font-medium">Desempenho mensal do estabelecimento.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
            <TrendingUp size={14} />
            Faturamento Real
          </div>
        </div>

        <div className="relative h-[300px] w-full flex items-end justify-between px-4">
          <div className="absolute inset-0 flex flex-col justify-between py-10 pointer-events-none opacity-5">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-zinc-400 dark:bg-zinc-700" />
             ))}
          </div>
          
          {chartData.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-6 flex-1 h-full justify-end">
              <div className="relative w-full flex justify-center items-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(5, (val / (Math.max(...chartData) || 1)) * 100)}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-[#fd9602]/20 to-[#fd9602] rounded-t-xl relative group cursor-help"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 px-3 py-2 rounded-xl text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-50 whitespace-nowrap">
                    R$ {val.toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-tighter">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card dark:bg-zinc-900 border border-subtle dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 border-b border-subtle dark:border-zinc-800 bg-zinc-500/5">
           <h3 className="text-lg font-bold text-title dark:text-white tracking-tight">Fluxo de Caixa Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="border-b border-subtle dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-500/5">
                   <th className="px-8 py-5">Descrição</th>
                   <th className="px-8 py-5">Categoria</th>
                   <th className="px-8 py-5">Data</th>
                   <th className="px-8 py-5 text-right">Valor</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-subtle dark:divide-zinc-800">
                {transactions.map((t) => (
                  <TransactionRow key={t.id} title={t.title} category={t.category} date={t.date} value={`R$ ${t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} type={t.type} />
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-medium">Nenhuma transação encontrada.</td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, icon, color, bg, trend }: any) {
  return (
    <div className="bg-card dark:bg-zinc-900 border border-subtle dark:border-zinc-800 p-8 rounded-3xl space-y-4 hover:border-[#fd9602]/30 transition-all group shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("p-3.5 rounded-xl", bg, color)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tighter",
          trend.startsWith("+") ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-bold text-title dark:text-white tracking-tight group-hover:text-[#fd9602] transition-colors">{value}</p>
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
                "w-10 h-10 rounded-xl flex items-center justify-center border border-subtle dark:border-zinc-800 transition-colors",
                type === "income" ? "bg-emerald-500/5 text-emerald-500" : "bg-red-500/5 text-red-500"
             )}>
                {type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
             </div>
             <span className="text-sm font-bold text-title dark:text-white">{title}</span>
          </div>
       </td>
       <td className="px-8 py-6">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-subtle dark:border-zinc-700">
             {category}
          </span>
       </td>
       <td className="px-8 py-6 text-sm text-zinc-500 dark:text-zinc-400 font-bold">{date}</td>
       <td className={cn(
          "px-8 py-6 text-right font-bold text-base",
          type === "income" ? "text-emerald-500" : "text-red-500"
       )}>
          {type === "income" ? "+" : "-"} {value}
       </td>
    </tr>
  );
}
