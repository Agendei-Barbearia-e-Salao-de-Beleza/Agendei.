import React from 'react';
import { Home, Scissors, Settings, CalendarRange } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TabBarProps {
  activeTab?: 'home' | 'booking' | 'history' | 'settings';
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Deduce active tab if not supplied
  const currentPath = location.pathname;
  const deducedTab = activeTab || (
    currentPath.includes('/dashboard') ? 'home' :
    currentPath.includes('/settings') ? 'settings' :
    currentPath.includes('/history') ? 'history' :
    (currentPath.includes('/select-') || currentPath.includes('/explore') || currentPath.includes('/summary')) ? 'booking' : 'home'
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950 flex items-center justify-around px-2 border-t border-zinc-900 z-50 transition-colors duration-300">
      {/* Home Tab */}
      <button 
        onClick={() => navigate('/dashboard')}
        className={`flex flex-col items-center justify-center gap-1 transition-all w-16 h-full ${
          deducedTab === 'home' 
            ? 'text-[#fd9602]' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <Home className="w-6 h-6" strokeWidth={deducedTab === 'home' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">Home</span>
      </button>

      {/* Booking Tab */}
      <button 
        onClick={() => navigate('/explore')}
        className={`flex flex-col items-center justify-center gap-1 transition-all w-16 h-full ${
          deducedTab === 'booking' 
            ? 'text-[#fd9602]' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <Scissors className="w-6 h-6" strokeWidth={deducedTab === 'booking' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">Agenda</span>
      </button>

      {/* History Tab */}
      <button 
        onClick={() => navigate('/history')}
        className={`flex flex-col items-center justify-center gap-1 transition-all w-16 h-full ${
          deducedTab === 'history' 
            ? 'text-[#fd9602]' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <CalendarRange className="w-6 h-6" strokeWidth={deducedTab === 'history' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">Histórico</span>
      </button>

      {/* Settings Tab */}
      <button 
        onClick={() => navigate('/settings')}
        className={`flex flex-col items-center justify-center gap-1 transition-all w-16 h-full ${
          deducedTab === 'settings' 
            ? 'text-[#fd9602]' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <Settings className="w-6 h-6" strokeWidth={deducedTab === 'settings' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">Ajustes</span>
      </button>
    </div>
  );
};

export default TabBar;
