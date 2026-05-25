import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Home, Settings, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const SelectTimeScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dateState = location.state;
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
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans relative overflow-x-hidden pb-24">
      
      {/* Top Bar - Social Icons */}
      <div className="relative z-10 w-full flex justify-end p-6 space-x-2 pb-2">
        <motion.a 
          href="#"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-[#F59E0B] hover:text-white transition-colors"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.347-.272.273-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </motion.a>
        <motion.a 
          href="#"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-[#F59E0B] hover:text-white transition-colors"
        >
          {/* Instagram SVG Icon */}
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </motion.a>
      </div>

      {/* Header Logo & Subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-6 mb-10"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F59E0B] rounded-sm">
            <Scissors className="w-6 h-6 text-black" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-widest text-white">
            AGENDEI
          </h1>
        </div>
        <h2 className="text-white text-[24px] font-bold text-center px-8 tracking-wide">
          Selecione um horário
        </h2>
      </motion.div>

      {/* Time Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-8 mt-4 mb-4"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {times.map((time, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedTime(time)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`py-3.5 rounded-full border border-[#D97706] text-[17px] font-bold tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-colors ${
                selectedTime === time 
                  ? 'bg-[#F59E0B] text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
                  : 'bg-[#1A1A1A] text-[#F59E0B]'
              }`}
            >
              {time}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Navigation Arrow */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-8 mt-8 mb-4"
      >
        <button 
          onClick={() => navigate(-1)}
          className="text-[#E65100] hover:text-[#F59E0B] transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-12 h-12" strokeWidth={3.5} />
        </button>
      </motion.div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex justify-center mb-8 mt-auto"
      >
        <motion.button
          onClick={() => {
            if (selectedTime) {
              navigate('/summary', { state: { ...dateState, time: selectedTime } })
            }
          }}
          disabled={!selectedTime}
          whileHover={selectedTime ? { scale: 1.02 } : {}}
          whileTap={selectedTime ? { scale: 0.95 } : {}}
          className={`w-full max-w-[240px] py-3.5 bg-[#F59E0B] text-black font-extrabold text-[15px] rounded-xl shadow-lg tracking-wide ${!selectedTime && 'opacity-50 cursor-not-allowed'}`}
        >
          CONFIRMAR
        </motion.button>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0A] flex items-center justify-around px-8 pb-6 pt-4 border-t border-white/5 z-50">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-14 h-14 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
        >
          <Home className="w-7 h-7 text-white" strokeWidth={2} />
        </button>
        <button 
          onClick={() => navigate('/select-category')}
          className="w-14 h-14 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform"
        >
          <Scissors className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="w-14 h-14 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
        >
          <Settings className="w-7 h-7 text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SelectTimeScreen;
