import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, DollarSign, Sparkles, Building } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLight, setIsLight] = useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      const isLightMode = window.document.documentElement.classList.contains('light');
      setIsLight(isLightMode);
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  const bookingState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
  const { service, date, time, establishment } = bookingState;

  // Redirect back if essential state is missing
  React.useEffect(() => {
    if (!service || !date || !time) {
      toast.error("Fluxo de agendamento inconsistente. Iniciando do início.");
      navigate('/explore');
    }
  }, [service, date, time, navigate]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // 1. Get logged in user from session
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        toast.error('Por favor, faça login para realizar o seu agendamento.');
        navigate('/login');
        return;
      }
      
      const estId = establishment?.id || location.state?.establishmentId;
      if (!estId) {
        throw new Error("ID do Estabelecimento não fornecido.");
      }

      // 2. Format date_hora to ISO 8601 with local timezone offset
      let isoDateTime = '';
      if (date && time) {
        const parts = date.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          
          // Get local timezone offset (e.g., -03:00) to prevent Supabase/Postgres from treating it as UTC
          const tzOffset = (() => {
            const offset = new Date().getTimezoneOffset();
            const absOffset = Math.abs(offset);
            const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
            const minutes = (absOffset % 60).toString().padStart(2, '0');
            const sign = offset <= 0 ? '+' : '-';
            return `${sign}${hours}:${minutes}`;
          })();

          isoDateTime = `${year}-${month}-${day}T${time}:00${tzOffset}`;
        }
      }

      if (!isoDateTime) {
        throw new Error("Formato de data/hora inválido.");
      }

      // 3. Save to Supabase agendamentos table
      const { error } = await supabase.from('agendamentos').insert([{
        cliente_id: user.id,
        estabelecimento_id: estId,
        servicos: [{
          id: service.id,
          nome: service.title,
          preco: service.rawPrice || 40.00
        }],
        preco_total: service.rawPrice || 40.00,
        data_hora: isoDateTime,
        status: 'SOLICITADO',
        para_convidado: false
      }]);

      if (error) throw error;

      toast.success('Agendamento solicitado com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro de agendamento em produção:', err);
      toast.error(`Falha ao registrar agendamento: ${err.message || 'Verifique conexão.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans relative overflow-x-hidden pb-28 transition-colors duration-300 ${
      isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      <Header />

      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-6 relative z-10 mt-28"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#fd9602]" />
          Confirmação Final
        </span>
        <h2 className={`text-[24px] font-black text-center tracking-tight px-8 ${isLight ? 'text-zinc-950' : 'text-white'}`}>
          Resumo do Agendamento
        </h2>
      </motion.div>

      {/* Summary Flat Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`mx-6 rounded-xl p-5 shadow-xl border relative z-10 space-y-5 transition-all ${
          isLight 
            ? 'bg-white border-zinc-200 shadow-zinc-200/50' 
            : 'bg-zinc-900 border-zinc-850'
        }`}
      >
        {/* Establishment Info */}
        <div className={`pb-4 flex items-center space-x-3 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800/40'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-sm' 
              : 'bg-zinc-800 border-zinc-700'
          }`}>
            <Building className={`w-5 h-5 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`} />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Estabelecimento</span>
            <h3 className={`text-base font-black truncate mt-0.5 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
              {establishment?.nome || 'Mytasky Salon & Barber'}
            </h3>
          </div>
        </div>

        {/* Selected Service */}
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-sm' 
              : 'bg-zinc-800 border-zinc-700'
          }`}>
            <Sparkles className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Serviço Escolhido</span>
            <p className={`text-sm font-bold mt-1 uppercase tracking-wide ${isLight ? 'text-zinc-850' : 'text-zinc-100'}`}>{service?.title}</p>
          </div>
        </div>

        {/* Selected Date */}
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-sm' 
              : 'bg-zinc-800 border-zinc-700'
          }`}>
            <Calendar className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Data</span>
            <p className={`text-sm font-bold mt-1 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>{date}</p>
          </div>
        </div>

        {/* Selected Time */}
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-sm' 
              : 'bg-zinc-800 border-zinc-700'
          }`}>
            <Clock className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Horário</span>
            <p className={`text-sm font-bold mt-1 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>{time}</p>
          </div>
        </div>

        {/* Value */}
        <div className={`flex items-start space-x-3.5 pt-4 border-t ${isLight ? 'border-zinc-100' : 'border-zinc-800/40'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-sm' 
              : 'bg-zinc-800 border-zinc-700'
          }`}>
            <DollarSign className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>Valor Total</span>
            <p className="text-[#fd9602] text-xl font-black mt-1 tracking-wider">{service?.price}</p>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <div className="px-8 mt-6 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className={`transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center space-x-1.5 ${
            isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-6 mt-auto relative z-10 px-6"
      >
        <motion.button
          onClick={handleConfirm}
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-[280px] py-4 bg-[#fd9602] text-zinc-955 font-black text-xs rounded-2xl shadow-lg shadow-[#fd9602]/10 hover:bg-[#e08500] cursor-pointer transition-all active:scale-98 tracking-widest uppercase"
        >
          {isSubmitting ? 'Solicitando...' : 'Solicitar Agendamento'}
        </motion.button>
      </motion.div>

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SummaryScreen;
