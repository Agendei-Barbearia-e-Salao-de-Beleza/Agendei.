import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, CalendarCheck, Clock, RefreshCw, X, Heart, Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Cliente');
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);

  // Personalized insights states
  const [favService, setFavService] = useState('Corte Degradê');
  const [favBarber, setFavBarber] = useState('BarberMaster');
  const [favTime, setFavTime] = useState('Sábados às 10:00');

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate('/login');
        return;
      }

      // 1. Try to load cached data instantly
      const cacheKey = `agendei_dashboard_${user.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserName(parsed.userName || 'Cliente');
        setNextAppointment(parsed.nextAppointment || null);
        if (parsed.favService) setFavService(parsed.favService);
        if (parsed.favBarber) setFavBarber(parsed.favBarber);
        if (parsed.favTime) setFavTime(parsed.favTime);
        setLoading(false); // Turn off loading immediately since we have cached data!
      }

      // 2. Fetch fresh data in parallel using Promise.all (remove limit on past to do full analysis)
      const [profileResult, activeResult, pastResult] = await Promise.all([
        supabase
          .from('usuarios')
          .select('nome')
          .eq('id', user.id)
          .single(),
        supabase
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
          .gte('data_hora', new Date().toISOString())
          .order('data_hora', { ascending: true })
          .limit(1),
        supabase
          .from('agendamentos')
          .select(`
            data_hora,
            preco_total,
            servicos,
            estabelecimento:estabelecimento_id (
              nome
            )
          `)
          .eq('cliente_id', user.id)
          .eq('status', 'CONCLUIDO')
          .order('data_hora', { ascending: false })
      ]);

      let freshUserName = 'Cliente';
      if (profileResult.data && profileResult.data.nome) {
        freshUserName = profileResult.data.nome.split(' ')[0];
        setUserName(freshUserName);
      }

      let freshNextAppt = null;
      if (!activeResult.error && activeResult.data && activeResult.data.length > 0) {
        const appt = activeResult.data[0];
        const estData = appt.estabelecimento;
        const estName = estData 
          ? (Array.isArray(estData) ? estData[0]?.nome : (estData as any).nome) 
          : 'Estabelecimento';

        freshNextAppt = {
          id: appt.id,
          data: new Date(appt.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
          horario: new Date(appt.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          servico: appt.servicos && appt.servicos[0] ? appt.servicos[0].nome : 'Serviço',
          estabelecimento: estName,
          status: appt.status
        };
        setNextAppointment(freshNextAppt);
      } else {
        setNextAppointment(null);
      }

      let topService = 'Corte Degradê';
      let topBarber = 'BarberMaster';
      let topTime = 'Sábados às 10:00';

      if (!pastResult.error && pastResult.data) {
        // Perform preference analysis if past history exists
        if (pastResult.data.length > 0) {
          const servicesMap: Record<string, number> = {};
          const establishmentMap: Record<string, number> = {};
          const timesMap: Record<string, number> = {};
          const weekdays = ['Domingos', 'Segundas', 'Terças', 'Quartas', 'Quintas', 'Sextas', 'Sábados'];

          pastResult.data.forEach((apt: any) => {
            const sName = apt.servicos && apt.servicos[0] ? apt.servicos[0].nome : '';
            const estData = apt.estabelecimento;
            const estName = estData 
              ? (Array.isArray(estData) ? estData[0]?.nome : (estData as any).nome) 
              : '';
            
            let weekdayStr = '';
            let hourStr = '';
            if (apt.data_hora) {
              const d = new Date(apt.data_hora);
              weekdayStr = weekdays[d.getDay()];
              hourStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' H';
            }

            if (sName) servicesMap[sName] = (servicesMap[sName] || 0) + 1;
            if (estName) establishmentMap[estName] = (establishmentMap[estName] || 0) + 1;
            if (weekdayStr && hourStr) {
              const key = `${weekdayStr} às ${hourStr}`;
              timesMap[key] = (timesMap[key] || 0) + 1;
            }
          });

          const serviceWinner = Object.entries(servicesMap).sort((a, b) => b[1] - a[1])[0]?.[0];
          const barberWinner = Object.entries(establishmentMap).sort((a, b) => b[1] - a[1])[0]?.[0];
          const timeWinner = Object.entries(timesMap).sort((a, b) => b[1] - a[1])[0]?.[0];

          if (serviceWinner) {
            topService = serviceWinner;
            setFavService(serviceWinner);
          }
          if (barberWinner) {
            topBarber = barberWinner;
            setFavBarber(barberWinner);
          }
          if (timeWinner) {
            topTime = timeWinner;
            setFavTime(timeWinner);
          }
        }
      }

      // 3. Cache the fresh data in local storage
      localStorage.setItem(cacheKey, JSON.stringify({
        userName: freshUserName,
        nextAppointment: freshNextAppt,
        favService: topService,
        favBarber: topBarber,
        favTime: topTime
      }));
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelAppointment = (id: string) => {
    setSelectedApptId(id);
    setCancelModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!selectedApptId) return;
    try {
      await supabase
        .from('agendamentos')
        .update({ status: 'CANCELADO' })
        .eq('id', selectedApptId);

      toast.success('Agendamento cancelado com sucesso!');
      setCancelModalOpen(false);
      setSelectedApptId(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cancelar o agendamento.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Removed radial glowing light for minimal SaaS aesthetics */}
      
      <Header />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-6 relative z-10 mt-28 flex justify-between items-end"
      >
        <div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">Bem-vindo, {userName}</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">Visão Geral do Painel</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-sm font-semibold">Carregando painel...</span>
        </div>
      ) : (
        <>
          {/* Next Appointment Card - Premium Minimalist SaaS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mx-6 ${nextAppointment ? 'bg-[#131313]' : 'bg-transparent border border-zinc-800/60 border-dashed'} rounded-[24px] p-5 relative overflow-hidden z-10`}
          >
            {nextAppointment ? (
              <>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fd9602] to-amber-400" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4 text-[#fd9602]" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Próximo Agendamento</h2>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                    nextAppointment.status === 'APROVADO' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {nextAppointment.status}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white text-sm font-black capitalize flex items-center gap-1.5">
                        {nextAppointment.data} 
                        <span className="text-[#fd9602] mx-1">•</span> 
                        {nextAppointment.horario}
                      </p>
                      <p className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                        <Scissors className="w-3 h-3" strokeWidth={2} /> 
                        {nextAppointment.servico}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[5px] text-[#fd9602] font-black">S</span> 
                        {nextAppointment.estabelecimento}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-zinc-800/50">
                  <button 
                    onClick={() => handleCancelAppointment(nextAppointment.id)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
                  >
                    <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Cancelar</span>
                  </button>
                  <button 
                    onClick={() => navigate('/explore')}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-[#fd9602]/10 border border-[#fd9602]/20 rounded-lg hover:bg-[#fd9602]/20 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-[#fd9602]" strokeWidth={2} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#fd9602]">Reagendar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <h2 className="text-zinc-300 text-sm font-black uppercase tracking-widest">Sua agenda está vazia</h2>
                  <p className="text-zinc-500 text-[10px] font-semibold mt-1">Aproveite para marcar um horário hoje mesmo.</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* New Appointment Button SaaS Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="px-6 mt-6 relative z-10"
          >
            <motion.button
              onClick={() => navigate('/explore')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-[#fd9602] flex items-center justify-center space-x-2 text-zinc-950 font-black shadow-lg hover:bg-amber-600 transition-colors cursor-pointer uppercase tracking-widest text-[11px]"
            >
              <span>+ Novo Agendamento</span>
            </motion.button>
          </motion.div>
 
          {/* Planos e Assinaturas (Memberships Card) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mx-6 mt-6 bg-[#131313] rounded-[24px] p-5 border border-zinc-800/40 relative overflow-hidden z-10 shadow-lg"
          >
            {/* Ambient luxury light background */}
            <div className="absolute top-0 right-0 w-[45%] h-[75%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.1),transparent_55%)] pointer-events-none z-0" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-[#fd9602]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Planos & Assinaturas</h2>
                  <p className="text-[8px] font-bold text-zinc-550 uppercase tracking-wider mt-0.5">Clube de Benefícios</p>
                </div>
              </div>
              
              <span className="text-[8px] font-black px-2 py-0.5 rounded border border-[#fd9602]/25 text-[#fd9602] bg-[#fd9602]/5 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(253,150,2,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fd9602] animate-pulse" />
                VIP ATIVO
              </span>
            </div>
 
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-wide">Plano Premium Mensal</p>
                  <p className="text-zinc-400 text-xs font-medium mt-1">Cabelo e barba ilimitados com preferência de agenda.</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3.5 border-t border-zinc-800/40">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Corte Ilimitado</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Barba Ilimitada</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">10% Off Produtos</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Prioridade VIP</span>
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="pt-4 mt-1">
                <button 
                  onClick={() => navigate('/select-category')}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors shadow-sm"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#fd9602]">Agendar com meu Plano</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Suas Preferências - Data Insights */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="px-6 mt-8 relative z-10"
          >
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Suas Preferências</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pb-2">
              {/* Card 1 - Service */}
              <div className="bg-[#131313] border border-zinc-800/40 rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-2">
                  <Scissors className="w-4 h-4 text-[#fd9602]" />
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">Estilo Favorito</span>
                  <h4 className="text-zinc-200 text-[10px] font-black uppercase truncate mt-0.5">{favService}</h4>
                  <span className="text-[#fd9602] text-[7px] font-black uppercase mt-0.5 block">Mais Escolhido</span>
                </div>
              </div>

              {/* Card 2 - Professional */}
              <div className="bg-[#131313] border border-zinc-800/40 rounded-2xl p-4 flex flex-col justify-between h-28 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">Estabelecimento</span>
                  <h4 className="text-zinc-200 text-[10px] font-black uppercase truncate mt-0.5">{favBarber}</h4>
                  <span className="text-[#fd9602] text-[7px] font-black uppercase mt-0.5 block">Sua Preferência</span>
                </div>
              </div>

              {/* Card 3 - Time (Spans full width for premium balance!) */}
              <div className="col-span-2 bg-[#131313] border border-zinc-800/40 rounded-2xl p-4 flex items-center justify-between h-18 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block">Período Ideal</span>
                    <h4 className="text-zinc-200 text-[10px] font-black uppercase truncate mt-0.5">{favTime}</h4>
                  </div>
                </div>
                <span className="text-[#fd9602] text-[8px] font-black uppercase bg-[#fd9602]/10 px-2 py-0.5 rounded border border-[#fd9602]/20">Frequente</span>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <TabBar activeTab="home" />

      {/* Cancel Custom Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-zinc-900 border-0 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <X className="w-6 h-6 text-red-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-white text-lg font-black tracking-wide">Cancelar Agendamento?</h3>
                <p className="text-zinc-400 text-xs font-semibold mt-2">
                  Esta ação não pode ser desfeita e você perderá seu horário garantido. Deseja realmente cancelar?
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button 
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedApptId(null);
                }}
                className="flex-1 py-3.5 bg-zinc-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={confirmCancellation}
                className="flex-1 py-3.5 bg-red-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Cancelar Horário
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
