"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, Calendar, BarChart3, Loader2, Edit2, Trash2, MoreVertical, X, Check } from "lucide-react";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ 
    balance: 0, income: 0, expense: 0, 
    balanceTrend: '0%', incomeTrend: '0%', expenseTrend: '0%' 
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  
  // Actions State
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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
        setEstablishmentId(estData.id);
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

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setMilliseconds(-1);

    // Current Month Entradas Reais
    const { data: incomeData } = await supabase
      .from('agendamentos')
      .select('pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO')
      .gte('pagamentos.pago_em', startOfMonth.toISOString());

    const income = incomeData?.reduce((acc, curr: any) => {
      const pays = Array.isArray(curr.pagamentos) ? curr.pagamentos : [curr.pagamentos];
      return acc + pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0);
    }, 0) || 0;

    // Current Month Saídas
    const { data: expenseData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfMonth.toISOString().split('T')[0]);

    const expense = expenseData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    // Last Month Entradas Reais
    const { data: lastIncomeData } = await supabase
      .from('agendamentos')
      .select('pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO')
      .gte('pagamentos.pago_em', startOfLastMonth.toISOString())
      .lte('pagamentos.pago_em', endOfLastMonth.toISOString());

    const lastIncome = lastIncomeData?.reduce((acc, curr: any) => {
      const pays = Array.isArray(curr.pagamentos) ? curr.pagamentos : [curr.pagamentos];
      return acc + pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0);
    }, 0) || 0;

    // Last Month Saídas
    const { data: lastExpenseData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfLastMonth.toISOString().split('T')[0])
      .lte('data', endOfLastMonth.toISOString().split('T')[0]);

    const lastExpense = lastExpenseData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    // Saldo Total (Geral)
    const { data: allIncome } = await supabase
      .from('agendamentos')
      .select('pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO');

    const { data: allExpense } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId);
    
    const totalInc = allIncome?.reduce((acc, curr: any) => {
      const pays = Array.isArray(curr.pagamentos) ? curr.pagamentos : [curr.pagamentos];
      return acc + pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0);
    }, 0) || 0;

    const totalExp = allExpense?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    };

    setTotals({
      balance: totalInc - totalExp,
      income,
      expense,
      balanceTrend: calcTrend(totalInc - totalExp, (totalInc - income) - (totalExp - expense)), // Trend of overall balance growth
      incomeTrend: calcTrend(income, lastIncome),
      expenseTrend: calcTrend(expense, lastExpense)
    });
  }

  async function fetchTransactions(estId: string) {
    // Buscar agendamentos e despesas recentes
    const [incRes, expRes] = await Promise.all([
      supabase.from('agendamentos').select('id, preco_total, data_hora, status, usuarios!agendamentos_cliente_id_fkey(nome)').eq('estabelecimento_id', estId).order('data_hora', { ascending: false }).limit(10),
      supabase.from('despesas').select('id, valor, descricao, data, categoria').eq('estabelecimento_id', estId).order('data', { ascending: false }).limit(10)
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
        category: e.categoria || "Despesa",
        date: new Date(e.data).toLocaleDateString('pt-BR'),
        value: Number(e.valor),
        type: "expense",
        rawDate: e.data
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

  const handleEdit = (transaction: any) => {
    setEditingTransaction({
      ...transaction,
      value: transaction.value.toString().replace('.', ',')
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || !editingTransaction) return;

    setIsSaving(true);
    try {
      if (editingTransaction.type === 'expense') {
        const { error } = await supabase
          .from('despesas')
          .update({
            descricao: editingTransaction.title,
            valor: parseFloat(editingTransaction.value.replace(',', '.')),
            categoria: editingTransaction.category
          })
          .eq('id', editingTransaction.id);
        if (error) throw error;
      } else {
        // Income (Agendamento)
        const { error } = await supabase
          .from('agendamentos')
          .update({
            preco_total: parseFloat(editingTransaction.value.replace(',', '.'))
          })
          .eq('id', editingTransaction.id);
        if (error) throw error;
      }

      toast.success("Transação atualizada!");
      setShowEditModal(false);
      fetchFinanceData();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (transaction: any) => {
    if (!establishmentId) return;

    setIsDeleting(true);
    try {
      if (transaction.type === 'expense') {
        const { error } = await supabase
          .from('despesas')
          .delete()
          .eq('id', transaction.id);
        if (error) throw error;
      } else {
        // First delete associated payments
        await supabase.from('pagamentos').delete().eq('agendamento_id', transaction.id);

        const { error } = await supabase
          .from('agendamentos')
          .delete()
          .eq('id', transaction.id);
        if (error) throw error;
      }

      toast.success("Transação excluída!");
      setDeleteConfirmId(null);
      fetchFinanceData();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
        <FinanceCard label="Saldo Total" value={`R$ ${totals.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Wallet />} color="text-[#fd9602]" bg="bg-[#fd9602]/10" trend={totals.balanceTrend} />
        <FinanceCard label="Entradas (Mês)" value={`R$ ${totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowUpRight />} color="text-emerald-500" bg="bg-emerald-500/10" trend={totals.incomeTrend} />
        <FinanceCard label="Saídas (Mês)" value={`R$ ${totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowDownRight />} color="text-red-500" bg="bg-red-500/10" trend={totals.expenseTrend} />
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
                   <th className="px-8 py-5 text-right">Ações</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-subtle dark:divide-zinc-800">
                {transactions.map((t) => (
                  <TransactionRow 
                    key={t.id} 
                    transaction={t}
                    onEdit={() => handleEdit(t)}
                    onDelete={() => setDeleteConfirmId(t.id)}
                  />
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

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={editingTransaction?.type === 'income' ? "Ajustar Receita" : "Editar Despesa"}>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Descrição</label>
            <input 
              required 
              disabled={editingTransaction?.type === 'income'}
              value={editingTransaction?.title || ""} 
              onChange={e => setEditingTransaction({...editingTransaction, title: e.target.value})} 
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl p-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold disabled:opacity-50" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Valor (R$)</label>
              <input 
                required 
                value={editingTransaction?.value || ""} 
                onChange={e => setEditingTransaction({...editingTransaction, value: e.target.value})} 
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl p-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categoria</label>
              <select 
                disabled={editingTransaction?.type === 'income'}
                value={editingTransaction?.category || ""} 
                onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value})}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle rounded-2xl p-4 dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="Serviço">Serviço</option>
                <option value="Suprimentos">Suprimentos</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Energia/Água">Energia/Água</option>
                <option value="Marketing">Marketing</option>
                <option value="Equipamentos">Equipamentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="btn-primary w-full py-5 text-lg font-black flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Excluir Transação">
        <div className="space-y-6">
          <p className="text-zinc-500 font-medium">Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
            <button onClick={() => deleteConfirmId && handleDelete(transactions.find(t => t.id === deleteConfirmId))} disabled={isDeleting} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2">
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sim, Excluir"}
            </button>
          </div>
        </div>
      </Modal>
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

function TransactionRow({ transaction, onEdit, onDelete }: any) {
  const { title, category, date, value, type } = transaction;
  
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
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border",
            type === "income" ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-subtle dark:border-zinc-700"
          )}>
             {category}
          </span>
       </td>
       <td className="px-8 py-6 text-sm text-zinc-500 dark:text-zinc-400 font-bold">{date}</td>
       <td className={cn(
          "px-8 py-6 text-right font-bold text-base",
          type === "income" ? "text-emerald-500" : "text-red-500"
       )}>
          {type === "income" ? "+" : "-"} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
       </td>
       <td className="px-8 py-6 text-right">
          <div className="flex justify-end gap-2">
            <button 
              onClick={onEdit}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-[#fd9602] hover:bg-[#fd9602]/10 rounded-xl transition-all"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={onDelete}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
       </td>
    </tr>
  );
}
