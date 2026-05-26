import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, CalendarCheck, Clock, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Cliente');
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [lastCuts, setLastCuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', user.id)
        .single();
        
      if (profile && profile.nome) {
        setUserName(profile.nome.split(' ')[0]);
      }

      // Fetch active appointments (SOLICITADO, APROVADO)
      const { data: activeAppointments, error: activeErr } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          preco_total,
          servicos,
          estabelecimento:estabelecimento_id (
            nome
          )
        `)
        .eq('cliente_id', user.id)
        .in('status', ['SOLICITADO', 'APROVADO'])
        .order('data_hora', { ascending: true })
        .limit(1);

      if (!activeErr && activeAppointments && activeAppointments.length > 0) {
        const appt = activeAppointments[0];
        
        // Handle single object vs array returned from relation safely
        const estData = appt.estabelecimento;
        const estName = estData 
          ? (Array.isArray(estData) ? estData[0]?.nome : (estData as any).nome) 
          : 'Estabelecimento';

        setNextAppointment({
          id: appt.id,
          data: new Date(appt.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
          horario: new Date(appt.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          servico: appt.servicos && appt.servicos[0] ? appt.servicos[0].nome : 'Serviço',
          estabelecimento: estName,
          status: appt.status
        });
      } else {
        setNextAppointment(null);
      }

      // Fetch completed appointments (CONCLUIDO)
      const { data: pastAppointments, error: pastErr } = await supabase
        .from('agendamentos')
        .select(`
          data_hora,
          preco_total,
          servicos
        `)
        .eq('cliente_id', user.id)
        .eq('status', 'CONCLUIDO')
        .order('data_hora', { ascending: false })
        .limit(3);

      if (!pastErr && pastAppointments) {
        setLastCuts(pastAppointments.map(p => ({
          servico: p.servicos && p.servicos[0] ? p.servicos[0].nome : 'Corte',
          data: new Date(p.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          valor: p.preco_total ? `R$ ${Number(p.preco_total).toFixed(2).replace('.', ',')}` : 'R$ 40,00'
        })));
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar seu próximo agendamento?')) return;
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'CANCELADO' })
        .eq('id', id);

      if (error) throw error;
      alert('Agendamento cancelado com sucesso!');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar o agendamento.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 left-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_left,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-8 relative z-10"
      >
        <h1 className="text-[28px] font-bold text-white tracking-tight">Olá, {userName}</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">Bem-vindo ao seu painel pessoal.</p>
      </motion.div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-sm font-semibold">Carregando painel...</span>
        </div>
      ) : (
        <>
          {/* Next Appointment Card - Premium Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-6 bg-[#0c0c0e]/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-2xl border border-zinc-800/80 relative z-10"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="bg-[#fd9602]/10 rounded-xl p-2 flex items-center justify-center border border-[#fd9602]/20">
                  <CalendarCheck className="w-5 h-5 text-[#fd9602]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[13px] font-black text-[#fd9602] tracking-widest uppercase">Seu próximo horário</h2>
              </div>
              {nextAppointment && (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                  nextAppointment.status === 'APROVADO' 
                    ? 'text-green-400 bg-green-450/10 border-green-400/25' 
                    : 'text-amber-500 bg-amber-500/10 border-amber-500/25'
                }`}>
                  {nextAppointment.status}
                </span>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {nextAppointment ? (
                <>
                  <p className="text-zinc-300 text-lg font-bold capitalize">
                    {nextAppointment.data} 
                    <span className="text-[#fd9602] font-black ml-2">{nextAppointment.horario}</span>
                  </p>
                  <p className="text-zinc-400 text-[15px] font-medium flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-zinc-500" strokeWidth={2} /> 
                    {nextAppointment.servico}
                  </p>
                  <p className="text-zinc-450 text-[13px] font-semibold flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] text-[#fd9602] font-bold">S</div> 
                    {nextAppointment.estabelecimento}
                  </p>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-zinc-400 text-sm font-semibold">Nenhum agendamento pendente</p>
                  <p className="text-zinc-600 text-xs mt-1">Selecione o botão abaixo para marcar seu corte!</p>
                </div>
              )}
            </div>

            {nextAppointment && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleCancelAppointment(nextAppointment.id)}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-red-400">Cancelar</span>
                </button>
                <button 
                  onClick={() => navigate('/explore')}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-450" strokeWidth={2} />
                  <span className="text-sm font-semibold text-zinc-300">Novo Agendamento</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* New Appointment Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="px-6 relative z-10"
          >
            <motion.button
              onClick={() => navigate('/explore')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 mt-8 rounded-2xl border border-[#fd9602]/30 bg-[#fd9602]/5 flex items-center justify-center space-x-2 text-[#fd9602] font-bold shadow-[0_0_20px_rgba(253,150,2,0.1)] hover:bg-[#fd9602]/10 transition-all cursor-pointer"
            >
              <span className="text-2xl leading-none font-light">+</span>
              <span className="tracking-wide">Marcar novo horário</span>
            </motion.button>
          </motion.div>

          {/* Last Cuts List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="px-6 mt-10 relative z-10"
          >
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <Clock className="w-4 h-4 text-[#fd9602]" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">Últimos Cortes Concluídos</h2>
            </div>
            
            <div className="space-y-3">
              {lastCuts && lastCuts.length > 0 ? (
                lastCuts.map((cut, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-[#0c0c0e]/60 backdrop-blur-xl border border-zinc-800/80">
                    <div className="flex flex-col">
                      <span className="text-zinc-200 font-semibold">{cut.servico}</span>
                      <span className="text-zinc-500 text-xs font-semibold mt-0.5">{cut.data}</span>
                    </div>
                    <span className="text-[#fd9602] font-black text-sm">{cut.valor}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-[#0c0c0e]/40 border border-zinc-900 rounded-xl flex flex-col items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-zinc-750 mb-1" />
                  <span className="text-zinc-650 text-xs font-semibold">Sem cortes anteriores concluídos</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      <TabBar activeTab="home" />
    </div>
  );
};

export default DashboardScreen;
