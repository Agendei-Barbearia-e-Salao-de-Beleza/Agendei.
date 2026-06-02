import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';


export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [initials, setInitials] = useState('UN');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          // Check cached name to get initials instantly
          const cacheKeyFresh = `agendei_profile_${user.id}`;
          const cached = localStorage.getItem(cacheKeyFresh);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.nome) {
              const names = parsed.nome.trim().split(' ');
              if (names.length >= 2) {
                setInitials((names[0][0] + names[1][0]).toUpperCase());
              } else if (names.length === 1) {
                setInitials(names[0].substring(0, 2).toUpperCase());
              }
            }
          }

          const { data } = await supabase
            .from('usuarios')
            .select('nome, avatar_url')
            .eq('id', user.id)
            .single();
            
          if (data && data.nome) {
            const names = data.nome.trim().split(' ');
            if (names.length >= 2) {
              setInitials((names[0][0] + names[1][0]).toUpperCase());
            } else if (names.length === 1) {
              setInitials(names[0].substring(0, 2).toUpperCase());
            }
            // Update profile cache
            localStorage.setItem(cacheKeyFresh, JSON.stringify({ nome: data.nome }));
          }
          if (data?.avatar_url) {
            setAvatar(data.avatar_url);
          } else {
            const localAvatar = localStorage.getItem(`avatar_${user.id}`);
            if (localAvatar) setAvatar(localAvatar);
          }
        }
      } catch (err) {
        console.log('Use fallback initials', err);
      }
    };
    fetchUserData();

    // Check notifications
    const checkNotifications = () => {
      const stored = localStorage.getItem('agendei_notifications');
      if (stored) {
        const list = JSON.parse(stored);
        setHasNotifications(list.some((n: any) => !n.read));
      } else {
        const defaultNotifications = [
          {
            id: '1',
            title: 'Agendamento Aprovado! 🎉',
            description: 'Seu corte de cabelo na BarberMaster foi confirmado.',
            time: 'Há 10 minutos',
            read: false,
            type: 'approved'
          },
          {
            id: '2',
            title: 'Desconto Premium Disponível 💈',
            description: 'Aproveite 15% de desconto em qualquer serviço de barba esta semana!',
            time: 'Há 2 horas',
            read: false,
            type: 'promo'
          },
          {
            id: '3',
            title: 'Perfil Atualizado',
            description: 'Seu cadastro foi sincronizado com sucesso.',
            time: 'Ontem',
            read: true,
            type: 'info'
          }
        ];
        localStorage.setItem('agendei_notifications', JSON.stringify(defaultNotifications));
        setHasNotifications(true);
      }
    };
    checkNotifications();

    const interval = setInterval(checkNotifications, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 pt-12 pb-4 z-50 bg-[#131313]/90 backdrop-blur-xl border-b border-transparent shadow-sm"
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div style={{ backgroundColor: '#fd9602' }} className="p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Scissors className="text-zinc-950 w-5 h-5" strokeWidth={2} />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          Agendei<span style={{ color: '#fd9602' }}>.</span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/history', { state: { activeTab: 'notifications' } })}
          className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 relative hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#fd9602] rounded-full" />
          )}
        </button>
        {/* Avatar Profile */}
        <div 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center font-black text-sm text-[#fd9602] cursor-pointer hover:border-[#fd9602] transition-colors overflow-hidden"
        >
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
