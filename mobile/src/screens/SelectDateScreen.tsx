import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SelectDateScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Real calendar state starting from current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate padding cells before first day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const emptyDays = Array.from({ length: firstDayIndex }, () => null);

  // Total days in current month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setSelectedDay(null);
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const renderDays = () => {
    const allCells = [...emptyDays, ...daysInMonth];
    return allCells.map((day, index) => {
      const isSunday = index % 7 === 0;
      const dayIsToday = day ? isToday(day) : false;
      const isSelected = day === selectedDay;

      return (
        <motion.div 
          key={index}
          onClick={() => day !== null && setSelectedDay(day)}
          whileHover={day ? { scale: 1.1 } : {}}
          whileTap={day ? { scale: 0.95 } : {}}
          className={`flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm font-bold transition-all relative ${
            day ? 'cursor-pointer' : ''
          } ${
            isSelected 
              ? 'bg-[#fd9602] text-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.45)] font-black z-10' 
              : day 
                ? 'text-zinc-200 hover:bg-zinc-800' 
                : 'text-transparent pointer-events-none'
          } ${isSunday && day && !isSelected ? 'text-zinc-550' : ''}`}
        >
          {day}
          {dayIsToday && !isSelected && (
            <span className="absolute bottom-1 w-1 h-1 bg-[#fd9602] rounded-full" />
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Back Button */}
      <div className="relative z-10 px-6 mt-28 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>
      </div>

      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-6 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full">Passo 3 de 4</span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8">
          Escolha a Melhor Data
        </h2>
        <p className="text-zinc-500 text-xs font-semibold text-center">Navegue pelas semanas e meses para agendar.</p>
      </motion.div>

      {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-6 bg-zinc-900 backdrop-blur-xl rounded-xl p-6 shadow-xl border border-zinc-800 relative z-10 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-[#fd9602] text-base font-black tracking-widest uppercase">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4 border-b border-zinc-800 pb-3">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{day}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-3">
          {renderDays()}
        </div>
      </motion.div>

      {/* Confirm Button */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6 mt-8 relative z-10"
        >
          <motion.button
            onClick={() => {
              const formattedDate = `${selectedDay.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}/${currentYear}`;
              const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
              const nextState = { ...currentState, date: formattedDate };
              sessionStorage.setItem('agendei_booking_state', JSON.stringify(nextState));
              navigate('/select-time', { state: nextState });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-[260px] py-3.5 bg-[#fd9602] text-zinc-950 font-black text-[11px] rounded-xl shadow-[0_0_15px_rgba(253,150,2,0.2)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Escolher Horário</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SelectDateScreen;
