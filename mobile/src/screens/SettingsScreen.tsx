import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Phone, Eye, EyeOff, Mail, Calendar, Sparkles, Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import { StatusBar, Style } from '@capacitor/status-bar';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'perfil' | 'notificacoes' | 'seguranca' | 'aparencia'>('perfil');
  
  // Theme state with local storage persistence
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('agendei_theme') as 'dark' | 'light' | 'system') || 'dark';
  });

  // Profile fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Date Helpers: database YYYY-MM-DD <=> display DD/MM/YYYY
  const dbDateToDisplay = (dbDate: string | null | undefined): string => {
    if (!dbDate) return '';
    if (dbDate.includes('/')) return dbDate;
    const parts = dbDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dbDate;
  };

  const displayDateToDb = (displayDate: string | null | undefined): string | null => {
    if (!displayDate) return null;
    const parts = displayDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return null;
  };

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onClose?: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type, onClose });
  };
  
  // Security fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [secLoading, setSecLoading] = useState(false);

  // Notification fields
  const [notifications, setNotifications] = useState({
    reminders: true,
    promo: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 11);
    if (limited.length <= 2) {
      return limited.length > 0 ? `(${limited}` : '';
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const formatDOB = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 8);
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  // Sync theme with DOM and native StatusBar
  useEffect(() => {
    localStorage.setItem('agendei_theme', themeMode);
    const root = window.document.documentElement;
    const isLight = themeMode === 'light' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    const syncNativeStatusBar = async () => {
      try {
        if (isLight) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#f4f4f5' });
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#09090b' });
        }
      } catch (err) {
        console.log('StatusBar not available in browser:', err);
      }
    };
    syncNativeStatusBar();
  }, [themeMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          if (data) {
            setUsername(data.nome || '');
            setPhone(data.telefone || '');
            setAvatarUrl(data.avatar_url || localStorage.getItem(`avatar_${user.id}`) || '');
            
            // Load and format birthdate dynamically
            const rawDob = data.data_nascimento || user.user_metadata?.data_nascimento || localStorage.getItem(`dob_${user.id}`) || '1998-05-14';
            setDob(dbDateToDisplay(rawDob));
          }

          // Load notifications from local storage first, then merge with auth user_metadata
          const localReminders = localStorage.getItem(`notif_reminders_${user.id}`);
          const localPromo = localStorage.getItem(`notif_promo_${user.id}`);
          
          const metaReminders = user.user_metadata?.notif_reminders;
          const metaPromo = user.user_metadata?.notif_promo;

          setNotifications({
            reminders: localReminders !== null 
              ? localReminders === 'true' 
              : (metaReminders !== undefined ? !!metaReminders : true),
            promo: localPromo !== null 
              ? localPromo === 'true' 
              : (metaPromo !== undefined ? !!metaPromo : false)
          });
        }
      } catch (err) {
        console.error('Erro ao carregar perfil do Supabase:', err);
        setUsername('Wesley Souza');
        setEmail('wesley.souza@gmail.com');
        setPhone('(11) 99999-7777');
        setDob('14/05/1998');
        setAvatarUrl(localStorage.getItem('avatar_fallback') || '');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            localStorage.setItem(`avatar_${user.id}`, base64);
            // Optional: try saving to Supabase if the avatar_url column is created
            await supabase
              .from('usuarios')
              .update({ avatar_url: base64 })
              .eq('id', user.id);
          } else {
            localStorage.setItem('avatar_fallback', base64);
          }
          showAlert("Sucesso", "Foto de perfil carregada com sucesso!", "success");
        } catch (err) {
          console.log("Salvo localmente com sucesso!", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Aviso", "Faça login para salvar suas alterações.", "info", () => navigate('/login'));
        return;
      }
      
      const dbDate = displayDateToDb(dob);

      // Save to Supabase Auth metadata
      await supabase.auth.updateUser({
        data: { data_nascimento: dbDate }
      });

      // Save to usuarios table
      const updatePayload: any = {
        nome: username,
        telefone: phone,
        avatar_url: avatarUrl
      };
      
      try {
        const { error } = await supabase
          .from('usuarios')
          .update({ ...updatePayload, data_nascimento: dbDate })
          .eq('id', user.id);
        if (error) throw error;
      } catch (dbErr) {
        // Fallback update without data_nascimento column
        const { error } = await supabase
          .from('usuarios')
          .update(updatePayload)
          .eq('id', user.id);
        if (error) throw error;
      }

      // Also persist locally in localStorage for instant offline consistency
      localStorage.setItem(`dob_${user.id}`, dbDate || '');

      showAlert("Sucesso", "Perfil atualizado com sucesso!", "success");
    } catch (err: any) {
      console.error(err);
      showAlert("Erro ao Salvar", `Erro ao salvar perfil: ${err.message || 'Verifique sua conexão.'}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      showAlert("Aviso", "As senhas não coincidem!", "error");
      return;
    }
    
    setSecLoading(true);
    try {
      const updates: any = {};
      if (newPassword) updates.password = newPassword;
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      showAlert("Sucesso", "Dados de segurança atualizados com sucesso!", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showAlert("Erro ao Atualizar", `Falha ao atualizar segurança: ${err.message}`, "error");
    } finally {
      setSecLoading(false);
    }
  };

  const handleToggleNotification = async (type: 'reminders' | 'promo') => {
    const updatedValue = !notifications[type];
    
    // 1. Update state immediately
    setNotifications(prev => ({
      ...prev,
      [type]: updatedValue
    }));

    // 2. Persist locally in localStorage immediately
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        localStorage.setItem(`notif_${type}_${userId}`, String(updatedValue));
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Update asynchronously in Supabase Auth user_metadata
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadataKey = type === 'reminders' ? 'notif_reminders' : 'notif_promo';
        // Asynchronous call (we don't await, keeping it truly asynchronous and fast!)
        supabase.auth.updateUser({
          data: {
            [metadataKey]: updatedValue
          }
        }).then(({ error }) => {
          if (error) {
            console.error(`Erro ao salvar no banco de dados (${type}):`, error.message);
          } else {
            console.log(`Preferência de notificação (${type}) salva com sucesso no banco de dados!`);
          }
        }).catch(err => {
          console.error("Erro assincrono no Supabase Auth:", err);
        });
      }
    } catch (err) {
      console.error("Erro ao iniciar atualização de notificações no Supabase:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear localStorage cache for this user
      localStorage.removeItem('agendei_booking_state');
      localStorage.removeItem('agendei_remember_me');
      
      showAlert("Desconectado", "Desconectado com sucesso!", "success", () => navigate('/login'));
    } catch (err: any) {
      showAlert("Erro ao Sair", `Erro ao deslogar: ${err.message}`, "error");
    }
  };

  const isLight = themeMode === 'light';

  return (
    <div className={`flex flex-col min-h-screen font-sans relative overflow-x-hidden pb-28 transition-colors duration-300 ${
      isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Background radial glowing ambient light */}
      {!isLight && (
        <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      )}
      
      <Header />

      {/* Screen Title */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 mb-6 relative z-10 mt-32"
      >
        <h1 className={`text-[28px] font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>Configurações</h1>
        <p className={`text-sm font-medium mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Gerencie seu perfil e preferência de visualização.</p>
      </motion.div>

      {/* Horizontal Tab Navigation System */}
      <div className="px-6 mb-6 relative z-10 flex space-x-2 overflow-x-auto scrollbar-none pb-2">
        <button 
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'perfil' 
              ? 'bg-[#fd9602] border-[#fd9602] text-zinc-950 shadow-md' 
              : `${isLight ? 'bg-white border-transparent shadow-sm text-zinc-500 hover:text-zinc-700' : 'bg-[#131313] border-transparent text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </button>
        <button 
          onClick={() => setActiveTab('notificacoes')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'notificacoes' 
              ? 'bg-[#fd9602] border-[#fd9602] text-zinc-950 shadow-md' 
              : `${isLight ? 'bg-white border-transparent shadow-sm text-zinc-500 hover:text-zinc-700' : 'bg-[#131313] border-transparent text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notificações</span>
        </button>
        <button 
          onClick={() => setActiveTab('seguranca')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'seguranca' 
              ? 'bg-[#fd9602] border-[#fd9602] text-zinc-950 shadow-md' 
              : `${isLight ? 'bg-white border-transparent shadow-sm text-zinc-500 hover:text-zinc-700' : 'bg-[#131313] border-transparent text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Segurança</span>
        </button>
        <button 
          onClick={() => setActiveTab('aparencia')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'aparencia' 
              ? 'bg-[#fd9602] border-[#fd9602] text-zinc-950 shadow-md' 
              : `${isLight ? 'bg-white border-transparent shadow-sm text-zinc-500 hover:text-zinc-700' : 'bg-[#131313] border-transparent text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Aparência</span>
        </button>
      </div>

      {/* Dynamic Content Container */}
      <div className="px-6 flex-1 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Carregando configurações...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">


            {activeTab === 'perfil' && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pt-2 pb-6"
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-850">
                  <User className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Informações de Perfil</h3>
                </div>

                {/* Circular Profile Avatar Upload Section */}
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <div className="relative group">
                    <div className={`w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-md bg-zinc-900 ${
                      isLight ? 'border-zinc-350 bg-white' : 'border-zinc-850 bg-zinc-950'
                    }`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-zinc-500" strokeWidth={1.5} />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-[#fd9602] text-zinc-955 rounded-full cursor-pointer hover:bg-[#e08500] transition-colors shadow-lg active:scale-95">
                      <Camera className="w-4 h-4" strokeWidth={2.5} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Clique na câmera para alterar foto</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ex: Wesley Souza"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 focus:border-[#fd9602] transition-all font-medium text-sm ${
                        isLight ? 'bg-white border-zinc-200/80 text-zinc-950 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>E-mail de Login</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-zinc-650" strokeWidth={2} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      placeholder="seu.email@exemplo.com"
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 cursor-not-allowed font-medium text-sm ${
                        isLight ? 'bg-zinc-150/70 border-zinc-200/50 text-zinc-400' : 'bg-zinc-950/15 border-zinc-900 text-zinc-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Celular / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Ex: (11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 focus:border-[#fd9602] transition-all font-medium text-sm ${
                        isLight ? 'bg-white border-zinc-200/80 text-zinc-950 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Data de Nascimento</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="dd/mm/aaaa"
                      value={dob}
                      onChange={(e) => setDob(formatDOB(e.target.value))}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 focus:border-[#fd9602] transition-all font-medium text-sm ${
                        isLight ? 'bg-white border-zinc-200/80 text-zinc-950 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80 text-white'
                      }`}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full mt-4 py-3.5 bg-[#fd9602] hover:bg-[#e08500] text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#fd9602]/10 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Gravando...' : 'Salvar Alterações'}</span>
                </button>
              </motion.div>
            )}



            {activeTab === 'notificacoes' && (
              <motion.div
                key="notificacoes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pt-2 pb-6"
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-850">
                  <Bell className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Avisos e Notificações</h3>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-zinc-200/80 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}>
                    <div>
                      <p className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>Lembretes de Horários</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Envia SMS/Email para você 24h antes do corte.</p>
                    </div>
                    <div 
                      onClick={() => handleToggleNotification('reminders')}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.reminders ? 'bg-[#fd9602]' : 'bg-zinc-850 border border-zinc-750'}`}
                    >
                      <div className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.reminders ? 'right-0.5 bg-zinc-950' : 'left-0.5 bg-zinc-500'}`}></div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-zinc-200/80 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}>
                    <div>
                      <p className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>Novidades e Promoções</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Notifica novos serviços e descontos da barbearia.</p>
                    </div>
                    <div 
                      onClick={() => handleToggleNotification('promo')}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.promo ? 'bg-[#fd9602]' : 'bg-zinc-850 border border-zinc-750'}`}
                    >
                      <div className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.promo ? 'right-0.5 bg-zinc-950' : 'left-0.5 bg-zinc-500'}`}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seguranca' && (
              <motion.div
                key="seguranca"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pt-2 pb-6"
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-850">
                  <Shield className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Alterar Senha</h3>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Nova Senha</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 focus:border-[#fd9602] transition-all font-medium text-sm ${
                        isLight ? 'bg-white border-zinc-200/80 text-zinc-950 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80 text-white'
                      }`}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-550 hover:text-[#fd9602] transition-colors"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Confirmar Nova Senha</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-xl py-3.5 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 focus:border-[#fd9602] transition-all font-medium text-sm ${
                      isLight ? 'bg-white border-zinc-200/80 text-zinc-950 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/80 text-white'
                    }`}
                  />
                </div>

                <button 
                  onClick={handleUpdateSecurity}
                  disabled={secLoading}
                  className={`w-full mt-4 py-3.5 border font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-98 shadow-sm ${
                    isLight 
                      ? 'bg-zinc-200 hover:bg-zinc-250 border-zinc-300 text-zinc-800' 
                      : 'bg-zinc-900 border-zinc-850 text-white hover:bg-zinc-800'
                  }`}
                >
                  {secLoading ? 'Atualizando...' : 'Atualizar Senha de Acesso'}
                </button>
              </motion.div>
            )}

            {activeTab === 'aparencia' && (
              <motion.div
                key="aparencia"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pt-2 pb-6"
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-850">
                  <Palette className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Aparência do Aplicativo</h3>
                </div>

                <div className="space-y-4">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Tema do Sistema</label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      onClick={() => setThemeMode('dark')} 
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                        themeMode === 'dark' 
                          ? 'border-[#fd9602] bg-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.15)]' 
                          : isLight 
                            ? 'border-zinc-200 bg-white/40 opacity-70 hover:opacity-100'
                            : 'border-zinc-850 bg-zinc-950/45 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-[#0c0c0e] rounded-lg border-0 flex gap-1 p-1">
                        <div className="w-2 h-full bg-zinc-900 rounded"></div>
                        <div className="flex-1 bg-zinc-900 rounded"></div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-350">Escuro</span>
                    </div>

                    <div 
                      onClick={() => setThemeMode('light')} 
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                        themeMode === 'light' 
                          ? 'border-[#fd9602] bg-white shadow-[0_0_15px_rgba(253,150,2,0.15)]' 
                          : isLight
                            ? 'border-zinc-200 bg-white/60 opacity-55 hover:opacity-80'
                            : 'border-zinc-850 bg-zinc-950/45 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-zinc-100 rounded-lg flex gap-1 p-1 border border-zinc-250">
                        <div className="w-2 h-full bg-zinc-200 rounded"></div>
                        <div className="flex-1 bg-zinc-200 rounded"></div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-500">Claro</span>
                    </div>

                    <div 
                      onClick={() => setThemeMode('system')} 
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                        themeMode === 'system' 
                          ? 'border-[#fd9602] bg-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.15)]' 
                          : isLight 
                            ? 'border-zinc-200 bg-white/40 opacity-70 hover:opacity-100'
                            : 'border-zinc-850 bg-zinc-950/45 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-gradient-to-r from-zinc-950 to-zinc-250 rounded-lg flex gap-1 p-1">
                        <div className="w-2 h-full bg-zinc-900 rounded"></div>
                        <div className="flex-1 bg-zinc-350 rounded"></div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-300">Sistema</span>
                    </div>
                  </div>

                  <div className="bg-[#fd9602]/10 border border-[#fd9602]/25 p-4 rounded-2xl flex items-start space-x-3.5 mt-2">
                    <Sparkles className="w-5 h-5 text-[#fd9602] flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-zinc-650 dark:text-zinc-300 text-xs font-semibold leading-relaxed">
                      Alternar temas modifica instantaneamente a paleta visual do cliente de acordo com as preferências do estabelecimento!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Sair da Conta Button */}
      <div className="px-6 mt-6 mb-12 relative z-10">
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      <TabBar activeTab="settings" />

      {/* Custom Alert Modal */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-sm rounded-[24px] p-6 border shadow-2xl ${
              isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                alertConfig.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : alertConfig.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-[#fd9602]/10 border-[#fd9602]/20 text-[#fd9602]'
              }`}>
                {alertConfig.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : alertConfig.type === 'error' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-base font-black uppercase tracking-wide ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                  {alertConfig.title}
                </h3>
                <p className={`text-xs font-semibold mt-2 leading-relaxed ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>
                  {alertConfig.message}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button 
                onClick={() => {
                  setAlertConfig(prev => ({ ...prev, isOpen: false }));
                  if (alertConfig.onClose) alertConfig.onClose();
                }}
                className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-97 cursor-pointer ${
                  alertConfig.type === 'success'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : alertConfig.type === 'error'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[#fd9602] hover:bg-[#e08500] text-zinc-950'
                }`}
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
