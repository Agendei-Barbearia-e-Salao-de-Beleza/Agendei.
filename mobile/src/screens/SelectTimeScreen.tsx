import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SelectTimeScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dateState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const times = [
    '09:00', '10:00',
    '11:00', '13:00',
    '14:00', '15:00',
    '16:00', '17:00',
    '18:00', '19:00',
    '20:00', '21:00'
  ];

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
        className="flex flex-col items-center justify-center space-y-2 mb-8 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full">Passo 4 de 4</span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8">
          Escolha o Horário
        </h2>
        {dateState?.date && (
          <p className="text-zinc-500 text-xs font-semibold text-center flex items-center justify-center gap-1">
            Data selecionada: <span className="text-[#fd9602] font-black">{dateState.date}</span>
          </p>
        )}
      </motion.div>

      {/* Time Grid Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-6 bg-[#0c0c0e]/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-xl border border-zinc-800/80 relative z-10"
      >
        <div className="flex items-center space-x-2.5 mb-5 border-b border-zinc-850/60 pb-3">
          <Clock className="w-5 h-5 text-[#fd9602]" />
          <span className="text-zinc-300 text-sm font-bold uppercase tracking-wider">Horários Disponíveis</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {times.map((time, index) => {
            const isSelected = selectedTime === time;
            return (
              <motion.button
                key={index}
                onClick={() => setSelectedTime(time)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className={`py-3.5 rounded-xl border text-sm font-black tracking-widest transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#fd9602]/10 border-[#fd9602] text-[#fd9602] shadow-[0_0_15px_rgba(253,150,2,0.25)]' 
                    : 'bg-zinc-950/45 border-zinc-850/80 text-zinc-400 hover:border-zinc-700/80 hover:text-white'
                }`}
              >
                {time}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Confirm Button */}
      {selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6 mt-8 relative z-10"
        >
          <motion.button
            onClick={() => {
              const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
              const nextState = { ...currentState, time: selectedTime };
              sessionStorage.setItem('agendei_booking_state', JSON.stringify(nextState));
              navigate('/summary', { state: nextState });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-[260px] py-4 bg-[#fd9602] text-zinc-950 font-black text-[15px] rounded-2xl shadow-[0_0_20px_rgba(253,150,2,0.4)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Confirmar Agendamento</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SelectTimeScreen;
