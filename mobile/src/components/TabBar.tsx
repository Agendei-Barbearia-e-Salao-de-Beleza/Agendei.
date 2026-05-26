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
    <div className="fixed bottom-6 left-6 right-6 h-16 bg-zinc-900/80 backdrop-blur-2xl rounded-2xl flex items-center justify-around px-2 border border-zinc-800/80 z-50 shadow-2xl">
      {/* Home Tab */}
      <button 
        onClick={() => navigate('/dashboard')}
        className={`w-12 h-12 flex items-center justify-center transition-all ${
          deducedTab === 'home' 
            ? 'bg-[#fd9602] rounded-xl text-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.3)]' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className="w-6 h-6" strokeWidth={deducedTab === 'home' ? 2.5 : 2} />
      </button>

      {/* Booking Tab */}
      <button 
        onClick={() => navigate('/explore')}
        className={`w-12 h-12 flex items-center justify-center transition-all ${
          deducedTab === 'booking' 
            ? 'bg-[#fd9602] rounded-xl text-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.3)]' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Scissors className="w-6 h-6" strokeWidth={deducedTab === 'booking' ? 2.5 : 2} />
      </button>

      {/* History Tab */}
      <button 
        onClick={() => navigate('/history')}
        className={`w-12 h-12 flex items-center justify-center transition-all ${
          deducedTab === 'history' 
            ? 'bg-[#fd9602] rounded-xl text-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.3)]' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <CalendarRange className="w-6 h-6" strokeWidth={deducedTab === 'history' ? 2.5 : 2} />
      </button>

      {/* Settings Tab */}
      <button 
        onClick={() => navigate('/settings')}
        className={`w-12 h-12 flex items-center justify-center transition-all ${
          deducedTab === 'settings' 
            ? 'bg-[#fd9602] rounded-xl text-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.3)]' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Settings className="w-6 h-6" strokeWidth={deducedTab === 'settings' ? 2.5 : 2} />
      </button>
    </div>
  );
};

export default TabBar;
