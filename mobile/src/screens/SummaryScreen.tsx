import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, DollarSign, Sparkles, Building } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bookingState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
  const { service, date, time, establishment } = bookingState;

  // Redirect back if essential state is missing
  React.useEffect(() => {
    if (!service || !date || !time) {
      alert("Fluxo de agendamento inconsistente. Iniciando do início.");
      navigate('/explore');
    }
  }, [service, date, time, navigate]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Por favor, faça login para realizar o seu agendamento.');
        navigate('/login');
        return;
      }
      
      const estId = establishment?.id || location.state?.establishmentId;
      if (!estId) {
        throw new Error("ID do Estabelecimento não fornecido.");
      }

      // 2. Format date_hora to ISO 8601
      let isoDateTime = '';
      if (date && time) {
        const parts = date.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          isoDateTime = `${year}-${month}-${day}T${time}:00`;
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

      alert('Agendamento solicitado com sucesso! Acompanhe a aprovação no seu painel.');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro de agendamento em produção:', err);
      alert(`Falha ao registrar agendamento: ${err.message || 'Verifique sua conexão com o banco de dados.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-6 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#fd9602]" />
          Confirmação Final
        </span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8">
          Resumo do Agendamento
        </h2>
      </motion.div>

      {/* Summary Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-6 bg-[#0c0c0e]/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-xl border border-zinc-800/80 relative z-10 space-y-6"
      >
        {/* Establishment Info */}
        <div className="border-b border-zinc-900/60 pb-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/65 flex items-center justify-center border border-zinc-850">
            <Building className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Estabelecimento</span>
            <h3 className="text-zinc-100 text-base font-black truncate mt-0.5">
              {establishment?.nome || 'Mytasky Salon & Barber'}
            </h3>
          </div>
        </div>

        {/* Selected Service */}
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/65 flex items-center justify-center flex-shrink-0 border border-zinc-850">
            <Sparkles className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Serviço Escolhido</span>
            <p className="text-zinc-100 text-sm font-bold mt-1 uppercase tracking-wide">{service?.title}</p>
          </div>
        </div>

        {/* Selected Date */}
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/65 flex items-center justify-center flex-shrink-0 border border-zinc-850">
            <Calendar className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Data</span>
            <p className="text-zinc-100 text-sm font-bold mt-1">{date}</p>
          </div>
        </div>

        {/* Selected Time */}
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/65 flex items-center justify-center flex-shrink-0 border border-zinc-850">
            <Clock className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Horário</span>
            <p className="text-zinc-100 text-sm font-bold mt-1">{time}</p>
          </div>
        </div>

        {/* Value */}
        <div className="flex items-start space-x-3.5 border-t border-zinc-900/60 pt-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/65 flex items-center justify-center flex-shrink-0 border border-zinc-850">
            <DollarSign className="w-5 h-5 text-[#fd9602]" />
          </div>
          <div>
            <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Valor Total</span>
            <p className="text-[#fd9602] text-xl font-black mt-1 tracking-wider">{service?.price}</p>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <div className="px-8 mt-6 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center space-x-1.5"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-6 mt-auto relative z-10"
      >
        <motion.button
          onClick={handleConfirm}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-[260px] py-4 bg-[#fd9602] text-zinc-950 font-black text-[15px] rounded-2xl shadow-[0_0_20px_rgba(253,150,2,0.4)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase"
        >
          {isSubmitting ? 'Solicitando...' : 'Solicitar Agendamento'}
        </motion.button>
      </motion.div>

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SummaryScreen;
