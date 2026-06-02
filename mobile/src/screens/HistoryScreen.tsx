import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Trash2, ShieldAlert, Bell, CheckCircle2, XCircle, Tag, Inbox, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'appointments' | 'notifications'>(
    (location.state as any)?.activeTab || 'appointments'
  );

  // Automatically mark all notifications as read when entering the notifications tab
  useEffect(() => {
    if (activeTab === 'notifications') {
      const stored = localStorage.getItem('agendei_notifications');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((n: any) => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('agendei_notifications', JSON.stringify(updated));
      }
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Load cached history first for instantaneous feel
      const cacheKey = `agendei_history_${user.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setAppointments(JSON.parse(cachedData));
        setLoading(false);
      } else {
        setLoading(true);
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
      
      // Cache the fresh results
      localStorage.setItem(cacheKey, JSON.stringify(data || []));
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = () => {
    const stored = localStorage.getItem('agendei_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      const defaultNotifications = [
        {
          id: '1',
          title: 'Agendamento Aprovado! 🎉',
          description: 'Seu corte de cabelo na BarberMaster foi confirmado.',
          time: 'Há 10 minutos',
          read: false,
          type: 'approved'
        },
        {
          id: '2',
          title: 'Desconto Premium Disponível 💈',
          description: 'Aproveite 15% de desconto em qualquer serviço de barba esta semana!',
          time: 'Há 2 horas',
          read: false,
          type: 'promo'
        },
        {
          id: '3',
          title: 'Perfil Atualizado',
          description: 'Seu cadastro foi sincronizado com sucesso.',
          time: 'Ontem',
          read: true,
          type: 'info'
        }
      ];
      localStorage.setItem('agendei_notifications', JSON.stringify(defaultNotifications));
      setNotifications(defaultNotifications);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchNotifications();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'CANCELADO' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Agendamento cancelado com sucesso!');
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cancelar agendamento.');
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('agendei_notifications', JSON.stringify(updated));
  };

  const handleClearNotifications = () => {
    if (!window.confirm('Deseja limpar todas as notificações?')) return;
    setNotifications([]);
    localStorage.setItem('agendei_notifications', JSON.stringify([]));
    toast.success('Todas as notificações foram limpas.');
  };

  const getStatusBadge = (status: string) => {
    const uppercaseStatus = status?.toUpperCase();
    switch (uppercaseStatus) {
      case 'SOLICITADO':
        return <span className="text-[9px] font-black tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">SOLICITADO</span>;
      case 'APROVADO':
        return <span className="text-[9px] font-black tracking-wider text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-md">APROVADO</span>;
      case 'CANCELADO':
        return <span className="text-[9px] font-black tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">CANCELADO</span>;
      case 'CONCLUIDO':
        return <span className="text-[9px] font-black tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-md">CONCLUÍDO</span>;
      default:
        return <span className="text-[9px] font-black tracking-wider text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-md">{status}</span>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case 'cancelled':
        return (
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
        );
      case 'promo':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5 text-[#fd9602]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-zinc-400" />
          </div>
        );
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
      <Header />

      {/* Screen Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 mb-6 relative z-10 mt-28 flex justify-between items-end"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'appointments' ? 'bg-blue-500' : 'bg-[#fd9602]'}`}></span>
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {activeTab === 'appointments' ? 'Painel de Atividades' : 'Notificações recebidas'}
            </h2>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            {activeTab === 'appointments' ? 'Histórico' : 'Notificações'}
          </h1>
        </div>
        
        {activeTab === 'notifications' && notifications.length > 0 && (
          <button
            onClick={handleClearNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition-colors text-[9px] font-black text-red-500 uppercase tracking-wider"
          >
            <Trash2 className="w-3 h-3" /> Limpar Tudo
          </button>
        )}
      </motion.div>

      {/* Premium Sliding Tabs Selector */}
      <div className="px-6 mb-6 relative z-10">
        <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/60 max-w-sm mx-auto">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'appointments' 
                ? 'bg-[#fd9602] text-zinc-950 shadow-md shadow-[#fd9602]/10' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative ${
              activeTab === 'notifications' 
                ? 'bg-[#fd9602] text-zinc-950 shadow-md shadow-[#fd9602]/10' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Notificações
            {notifications.some(n => !n.read) && activeTab !== 'notifications' && (
              <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="px-6 space-y-4 relative z-10 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'appointments' ? (
            <motion.div
              key="appointments-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
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
                      whileHover={{ scale: 1.005 }}
                      className="bg-zinc-900 rounded-2xl p-4 shadow-xl border border-zinc-850/80 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                            <CalendarCheck className="w-4 h-4 text-zinc-400" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-zinc-100 text-xs font-black uppercase tracking-wide leading-tight">{serviceName}</h3>
                            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">{estName}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-zinc-800/50 pt-3 mt-1">
                        <div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Data e Hora</span>
                          <p className="text-zinc-300 text-[11px] font-bold mt-0.5">
                            {formatDate(appointment.data_hora)} <span className="text-[#fd9602] mx-1">•</span> <span className="text-white font-black">{formatTime(appointment.data_hora)}</span>
                          </p>
                        </div>
                        <span className="text-[#fd9602] font-mono text-xs font-black bg-[#fd9602]/10 px-2.5 py-1 rounded-lg border border-[#fd9602]/10">
                          R$ {Number(appointment.preco_total).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {canCancel && (
                        <div className="mt-4 pt-1">
                          <button 
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 hover:border-red-500/20 hover:bg-red-500/5 rounded-xl text-red-500 hover:text-red-400 transition-colors text-[9px] font-black uppercase tracking-widest"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Cancelar Horário</span>
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
                    <p className="text-zinc-650 text-xs mt-1 px-8">Marque seu primeiro corte navegando até o catálogo de serviços!</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notifications-list"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    whileHover={{ scale: 1.005 }}
                    className={`rounded-2xl p-4 shadow-xl border cursor-pointer transition-all flex space-x-4 relative overflow-hidden ${
                      notif.read 
                        ? 'bg-zinc-900/60 border-zinc-850/60 opacity-80' 
                        : 'bg-zinc-900 border-[#fd9602]/20 shadow-[0_4px_25px_rgba(253,150,2,0.03)]'
                    }`}
                  >
                    {/* Unread Glowing Dot Badge */}
                    {!notif.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 bg-[#fd9602] rounded-full shadow-[0_0_10px_#fd9602]" />
                    )}

                    {getNotificationIcon(notif.type)}

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-zinc-100 text-xs font-black uppercase tracking-wide truncate pr-4">
                            {notif.title}
                          </h4>
                        </div>
                        <p className="text-zinc-450 text-[10px] font-medium leading-relaxed mt-1 pr-2">
                          {notif.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-1.5 border-t border-zinc-800/10">
                        <span className="text-zinc-650 text-[8px] font-black uppercase tracking-widest">{notif.time}</span>
                        {!notif.read && (
                          <span className="text-[#fd9602] text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} /> Não lida
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                    <Inbox className="w-6 h-6 text-zinc-650" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-semibold">Sua caixa de entrada está limpa.</p>
                    <p className="text-zinc-650 text-xs mt-1">Você não possui novas notificações no momento.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TabBar activeTab="history" />
    </div>
  );
};

export default HistoryScreen;
