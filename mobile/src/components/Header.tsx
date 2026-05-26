import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [initials, setInitials] = useState('WE');
  const hasNotifications = true;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('usuarios')
            .select('nome')
            .eq('id', user.id)
            .single();
            
          if (data && data.nome) {
            const names = data.nome.trim().split(' ');
            if (names.length >= 2) {
              setInitials((names[0][0] + names[1][0]).toUpperCase());
            } else if (names.length === 1) {
              setInitials(names[0].substring(0, 2).toUpperCase());
            }
          }
        }
      } catch (err) {
        console.log('Use fallback initials', err);
      }
    };
    fetchUserData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-6 pt-10 relative z-10 w-full"
    >
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 rounded-2xl bg-[#fd9602] flex items-center justify-center shadow-lg shadow-[#fd9602]/20">
          <Scissors className="w-5 h-5 text-zinc-950" strokeWidth={2} />
        </div>
        <span className="text-lg font-bold tracking-widest text-white uppercase">
          Agendei
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 relative hover:text-white hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#fd9602] rounded-full" />
          )}
        </button>
        {/* Avatar Profile */}
        <div 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center font-black text-sm text-[#fd9602] cursor-pointer hover:border-[#fd9602] transition-colors"
        >
          {initials}
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
