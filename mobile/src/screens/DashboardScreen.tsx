import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scissors, Bell, CalendarCheck, 
  X, RefreshCw, Clock, Home, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans relative overflow-x-hidden pb-24">
      
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between p-6 pt-10"
      >
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-[#F59E0B] rounded-sm">
            <Scissors className="w-5 h-5 text-black" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">
            Agendei
          </span>
        </div>
        <div className="flex items-center space-x-5">
          <Bell className="w-6 h-6 text-[#F59E0B]" strokeWidth={2.5} />
          {/* Avatar / User icon */}
          <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center">
            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-8"
      >
        <h1 className="text-[28px] font-semibold text-white tracking-wide">Olá, Wesley</h1>
      </motion.div>

      {/* Next Appointment Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-6 bg-[#202020] rounded-[1.25rem] p-5 shadow-lg border border-white/5"
      >
        <div className="flex items-center space-x-3 mb-5">
          <div className="bg-[#F59E0B] rounded-md p-1.5 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-[15px] font-bold text-white tracking-widest uppercase">Seu próximo horário</h2>
        </div>

        <div className="space-y-1.5 mb-6">
          <p className="text-[#AAAAAA] text-[15px] font-medium">Quinta-feira, 14 de Maio - 15:30</p>
          <p className="text-[#AAAAAA] text-[15px] font-medium">Serviço: Corte Degradê + Sobrancelha</p>
          <p className="text-[#AAAAAA] text-[15px] font-medium">Profissional: Alex Sandrê</p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex-1 flex items-center justify-center space-x-2 py-2.5 border border-gray-500 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-[#FF453A]" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-gray-200">Cancelar</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 py-2.5 border border-gray-500 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw className="w-4 h-4 text-[#0A84FF]" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-gray-200">Reagendar</span>
          </button>
        </div>
      </motion.div>

      {/* New Appointment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-6"
      >
        <motion.button
          onClick={() => navigate('/select-category')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 mt-8 rounded-xl border border-[#7A3E14] bg-transparent flex items-center justify-center space-x-2 text-[#E65100] font-bold shadow-[0_0_15px_rgba(230,81,0,0.1)] hover:bg-[#E65100]/10 transition-colors"
        >
          <span className="text-xl leading-none">+</span>
          <span>Marcar novo horário</span>
        </motion.button>
      </motion.div>

      {/* Last Cuts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mt-12"
      >
        <div className="flex items-center space-x-2 mb-5">
          <Clock className="w-5 h-5 text-[#F59E0B]" strokeWidth={2.5} />
          <h2 className="text-xl font-bold text-white tracking-wide">Últimos Cortes</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-[#AAAAAA] text-base font-medium">
            - 10/04 - Corte Social (Alex) [ 40,00 ]
          </p>
          <p className="text-[#AAAAAA] text-base font-medium">
            - 10/04 - Corte Social (Alex) [ 40,00 ]
          </p>
        </div>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0A] flex items-center justify-around px-8 pb-6 pt-4 border-t border-white/5 z-50">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-14 h-14 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <Home className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => navigate('/select-category')}
          className="w-14 h-14 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
        >
          <Scissors className="w-7 h-7 text-white" strokeWidth={2} />
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

export default DashboardScreen;
