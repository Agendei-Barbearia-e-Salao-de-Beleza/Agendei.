import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Trash2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redireciona para o login se não estiver autenticado
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          preco_total,
          servicos,
          estabelecimento:estabelecimento_id (
            nome,
            logo_url
          )
        `)
        .eq('cliente_id', user.id)
        .order('data_hora', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'CANCELADO' })
        .eq('id', id);

      if (error) throw error;
      alert('Agendamento cancelado com sucesso!');
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar agendamento.');
    }
  };

  const getStatusBadge = (status: string) => {
    const uppercaseStatus = status?.toUpperCase();
    switch (uppercaseStatus) {
      case 'SOLICITADO':
        return <span className="text-[10px] font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">SOLICITADO</span>;
      case 'APROVADO':
        return <span className="text-[10px] font-bold tracking-wider text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded">APROVADO</span>;
      case 'CANCELADO':
        return <span className="text-[10px] font-bold tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">CANCELADO</span>;
      case 'CONCLUIDO':
        return <span className="text-[10px] font-bold tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded">CONCLUÍDO</span>;
      default:
        return <span className="text-[10px] font-bold tracking-wider text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 mb-6 relative z-10"
      >
        <h1 className="text-[28px] font-bold text-white tracking-tight">Histórico de Cortes</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">Acompanhe seus horários agendados e anteriores.</p>
      </motion.div>

      {/* Appointment History List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 space-y-4 relative z-10 flex-1"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Buscando histórico...</span>
          </div>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => {
            const serviceName = appointment.servicos && appointment.servicos[0]
              ? appointment.servicos[0].nome
              : 'Serviço Personalizado';
              
            const estName = appointment.estabelecimento
              ? appointment.estabelecimento.nome
              : 'Estabelecimento';

            const canCancel = appointment.status !== 'CANCELADO' && appointment.status !== 'CONCLUIDO';

            return (
              <motion.div
                key={appointment.id}
                whileHover={{ scale: 1.01 }}
                className="bg-[#0c0c0e]/60 backdrop-blur-xl rounded-[1.5rem] p-5 shadow-xl border border-zinc-800/80 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <div className="bg-[#fd9602]/10 rounded-xl p-2.5 flex items-center justify-center border border-[#fd9602]/20">
                      <CalendarCheck className="w-5 h-5 text-[#fd9602]" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-zinc-100 text-base font-bold">{serviceName}</h3>
                      <p className="text-zinc-500 text-xs font-semibold mt-0.5">{estName}</p>
                      <p className="text-zinc-400 text-sm font-medium mt-2">
                        {formatDate(appointment.data_hora)} às <span className="text-white font-bold">{formatTime(appointment.data_hora)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(appointment.status)}
                    <span className="text-white font-black text-sm">
                      R$ {Number(appointment.preco_total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {canCancel && (
                  <div className="mt-4 pt-3 border-t border-zinc-900/60 flex justify-end">
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 active:scale-95 transition-all text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desmarcar Horário</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
              <ShieldAlert className="w-6 h-6 text-zinc-650" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-semibold">Nenhum agendamento realizado.</p>
              <p className="text-zinc-600 text-xs mt-1 px-8">Marque seu primeiro corte usando o botão Scissors abaixo!</p>
            </div>
          </div>
        )}
      </motion.div>

      <TabBar activeTab="history" />
    </div>
  );
};

export default HistoryScreen;
