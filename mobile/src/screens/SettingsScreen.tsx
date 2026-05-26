import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Phone, Eye, EyeOff, Mail, Calendar, Sparkles, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

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
  const [dob, setDob] = useState('14/05/1998');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
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

  // Sync theme with DOM
  useEffect(() => {
    localStorage.setItem('agendei_theme', themeMode);
    const root = window.document.documentElement;
    if (themeMode === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
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
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil do Supabase:', err);
        setUsername('Wesley Souza');
        setEmail('wesley.souza@gmail.com');
        setPhone('(11) 99999-7777');
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
          alert("Foto de perfil carregada com sucesso!");
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
        alert("Faça login para salvar suas alterações.");
        navigate('/login');
        return;
      }
      
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: username,
          telefone: phone,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Perfil atualizado em produção com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar perfil: ${err.message || 'Verifique sua conexão.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    
    setSecLoading(true);
    try {
      const updates: any = {};
      if (newPassword) updates.password = newPassword;
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      alert("Dados de segurança atualizados com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(`Falha ao atualizar segurança: ${err.message}`);
    } finally {
      setSecLoading(false);
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
        className="px-6 mb-6 relative z-10"
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
              ? 'bg-[#fd9602]/10 border-[#fd9602]/30 text-[#fd9602] shadow-lg shadow-[#fd9602]/5' 
              : `${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700' : 'bg-[#0c0c0e]/60 border-zinc-850/80 text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </button>
        <button 
          onClick={() => setActiveTab('notificacoes')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'notificacoes' 
              ? 'bg-[#fd9602]/10 border-[#fd9602]/30 text-[#fd9602] shadow-lg shadow-[#fd9602]/5' 
              : `${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700' : 'bg-[#0c0c0e]/60 border-zinc-850/80 text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notificações</span>
        </button>
        <button 
          onClick={() => setActiveTab('seguranca')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'seguranca' 
              ? 'bg-[#fd9602]/10 border-[#fd9602]/30 text-[#fd9602] shadow-lg shadow-[#fd9602]/5' 
              : `${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700' : 'bg-[#0c0c0e]/60 border-zinc-850/80 text-zinc-500 hover:text-zinc-300'}`
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Segurança</span>
        </button>
        <button 
          onClick={() => setActiveTab('aparencia')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'aparencia' 
              ? 'bg-[#fd9602]/10 border-[#fd9602]/30 text-[#fd9602] shadow-lg shadow-[#fd9602]/5' 
              : `${isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700' : 'bg-[#0c0c0e]/60 border-zinc-850/80 text-zinc-500 hover:text-zinc-300'}`
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
                className={`border rounded-[1.5rem] p-6 shadow-xl space-y-5 transition-colors ${
                  isLight ? 'bg-white border-zinc-250' : 'bg-[#0c0c0e]/60 backdrop-blur-xl border-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/10 dark:border-zinc-900/60">
                  <User className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Informações de Perfil</h3>
                </div>

                {/* Circular Profile Avatar Upload Section */}
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <div className="relative group">
                    <div className={`w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-md bg-zinc-900 ${
                      isLight ? 'border-zinc-300' : 'border-zinc-850'
                    }`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-zinc-500" strokeWidth={1.5} />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-[#fd9602] text-zinc-950 rounded-full cursor-pointer hover:bg-[#e08500] transition-colors shadow-lg active:scale-95">
                      <Camera className="w-4 h-4" strokeWidth={2.5} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Clique na câmera para alterar foto</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Wesley Souza"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all font-medium ${
                        isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-955' : 'bg-zinc-950/40 border-zinc-850 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">E-mail de Login</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-zinc-600" strokeWidth={2} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 cursor-not-allowed font-medium ${
                        isLight ? 'bg-zinc-100/50 border-zinc-200 text-zinc-400' : 'bg-zinc-950/15 border-zinc-900 text-zinc-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Celular / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="(11) 99999-7777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all font-medium ${
                        isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-955' : 'bg-zinc-950/40 border-zinc-850 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Data de Nascimento</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input 
                      type="text" 
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all font-medium ${
                        isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-955' : 'bg-zinc-950/40 border-zinc-850 text-white'
                      }`}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full mt-4 py-3.5 bg-[#fd9602] hover:bg-[#e08500] text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2"
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
                className={`border rounded-[1.5rem] p-6 shadow-xl space-y-6 transition-colors ${
                  isLight ? 'bg-white border-zinc-250' : 'bg-[#0c0c0e]/60 backdrop-blur-xl border-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/10 dark:border-zinc-900/60">
                  <Bell className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Avisos e Notificações</h3>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/50 border-zinc-850'
                  }`}>
                    <div>
                      <p className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>Lembretes de Horários</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Envia SMS/Email para você 24h antes do corte.</p>
                    </div>
                    <div 
                      onClick={() => setNotifications(prev => ({ ...prev, reminders: !prev.reminders }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.reminders ? 'bg-[#fd9602]' : 'bg-zinc-800 border border-zinc-700'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.reminders ? 'right-0.5 bg-zinc-950' : 'left-0.5 bg-zinc-500'}`}></div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/50 border-zinc-850'
                  }`}>
                    <div>
                      <p className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>Novidades e Promoções</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Notifica novos serviços e descontos da barbearia.</p>
                    </div>
                    <div 
                      onClick={() => setNotifications(prev => ({ ...prev, promo: !prev.promo }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.promo ? 'bg-[#fd9602]' : 'bg-zinc-800 border border-zinc-700'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.promo ? 'right-0.5 bg-zinc-950' : 'left-0.5 bg-zinc-500'}`}></div>
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
                className={`border rounded-[1.5rem] p-6 shadow-xl space-y-5 transition-colors ${
                  isLight ? 'bg-white border-zinc-250' : 'bg-[#0c0c0e]/60 backdrop-blur-xl border-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/10 dark:border-zinc-900/60">
                  <Shield className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Alterar Senha</h3>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Nova Senha</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full border rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all font-medium ${
                        isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-955' : 'bg-zinc-950/40 border-zinc-850 text-white'
                      }`}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-[#fd9602]"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Confirmar Nova Senha</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-xl py-3.5 pl-4 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all font-medium ${
                      isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-955' : 'bg-zinc-950/40 border-zinc-850 text-white'
                    }`}
                  />
                </div>

                <button 
                  onClick={handleUpdateSecurity}
                  disabled={secLoading}
                  className={`w-full mt-4 py-3.5 border font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 ${
                    isLight ? 'bg-zinc-200 hover:bg-zinc-300 border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-850 text-white hover:bg-zinc-800'
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
                className={`border rounded-[1.5rem] p-6 shadow-xl space-y-6 transition-colors ${
                  isLight ? 'bg-white border-zinc-250' : 'bg-[#0c0c0e]/60 backdrop-blur-xl border-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/10 dark:border-zinc-900/60">
                  <Palette className="w-5 h-5 text-[#fd9602]" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Aparência do Aplicativo</h3>
                </div>

                <div className="space-y-4">
                  <label className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Tema do Sistema</label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      onClick={() => setThemeMode('dark')} 
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                        themeMode === 'dark' 
                          ? 'border-[#fd9602] bg-zinc-950 shadow-[0_0_15px_rgba(253,150,2,0.15)]' 
                          : 'border-zinc-850 bg-zinc-950/45 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-[#0c0c0e] rounded-lg border border-zinc-850 flex gap-1 p-1">
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
                          : 'border-zinc-200 bg-white/60 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-zinc-100 rounded-lg flex gap-1 p-1 border border-zinc-200">
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
                          : 'border-zinc-850 bg-zinc-950/45 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full h-10 bg-gradient-to-r from-zinc-950 to-zinc-250 rounded-lg flex gap-1 p-1">
                        <div className="w-2 h-full bg-zinc-900 rounded"></div>
                        <div className="flex-1 bg-zinc-300 rounded"></div>
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

      <TabBar activeTab="settings" />
    </div>
  );
};

export default SettingsScreen;
