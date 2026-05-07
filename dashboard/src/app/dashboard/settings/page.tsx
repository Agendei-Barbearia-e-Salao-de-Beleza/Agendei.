"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Palette, Smartphone, Save, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const { theme, setTheme } = useTheme();

  // Estados de Perfil
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    proprietario_id: "",
    nome: "",
    telefone_comercial: "",
    endereco: "",
    logo_url: "",
    avatar_url: "",
    instagram_url: "",
    facebook_url: "",
    whatsapp_url: "",
    tiktok_url: "",
    notificacao_lembretes: true,
    notificacao_financeiro: false
  });

  // Estados de Segurança
  const [secLoading, setSecLoading] = useState(false);
  const [secEmail, setSecEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de Segurança - MFA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaEnrolling, setMfaEnrolling] = useState(false);

  // Fetch inicial
  React.useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setSecEmail(user.email || "");

      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('proprietario_id', user.id)
        .single();
        
      const { data: userData } = await supabase
        .from('usuarios')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (estData) {
        setProfile({
          id: estData.id,
          proprietario_id: user.id,
          nome: estData.nome || "",
          telefone_comercial: estData.telefone_comercial || "",
          endereco: estData.endereco || "",
          logo_url: estData.logo_url || "",
          avatar_url: userData?.avatar_url || "",
          instagram_url: estData.instagram_url || "",
          facebook_url: estData.facebook_url || "",
          whatsapp_url: estData.whatsapp_url || "",
          tiktok_url: estData.tiktok_url || "",
          notificacao_lembretes: estData.notificacao_lembretes ?? true,
          notificacao_financeiro: estData.notificacao_financeiro ?? false
        });
      }

      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaData) {
        setMfaEnabled(mfaData.nextLevel === 'aal2' || mfaData.currentLevel === 'aal2');
      }

      setLoadingProfile(false);
    }
    loadData();
  }, []);

  const handleToggleNotification = async (field: 'notificacao_lembretes' | 'notificacao_financeiro') => {
    if (!profile.id) return;
    const newValue = !profile[field];
    
    // Optimistic update
    setProfile(prev => ({ ...prev, [field]: newValue }));
    
    try {
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ [field]: newValue })
        .eq('id', profile.id);
        
      if (error) throw error;
      toast.success(newValue ? "Notificação ativada!" : "Notificação desativada!");
    } catch (error) {
      // Revert on failure
      setProfile(prev => ({ ...prev, [field]: !newValue }));
      toast.error("Erro ao atualizar notificação.");
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (profile.id) {
        await supabase.from('estabelecimentos').update({
          nome: profile.nome,
          telefone_comercial: profile.telefone_comercial,
          endereco: profile.endereco,
          logo_url: profile.logo_url,
          instagram_url: profile.instagram_url,
          facebook_url: profile.facebook_url,
          whatsapp_url: profile.whatsapp_url,
          tiktok_url: profile.tiktok_url
        }).eq('id', profile.id);
      }
      if (profile.proprietario_id) {
        await supabase.from('usuarios').update({
          avatar_url: profile.avatar_url
        }).eq('id', profile.proprietario_id);
      }
      toast.success("Perfil salvo com sucesso!");
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    
    setSecLoading(true);
    try {
      const updates: any = {};
      if (secEmail) updates.email = secEmail;
      if (newPassword) updates.password = newPassword;
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      toast.success("Segurança atualizada com sucesso! Se mudou o e-mail, verifique sua caixa de entrada.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar segurança.");
    } finally {
      setSecLoading(false);
    }
  };

  const handleEnrollMfa = async () => {
    setMfaEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setMfaFactorId(data.id);
      setMfaQrCode(data.totp.qr_code);
    } catch (err) {
      toast.error("Erro ao iniciar 2FA. O e-mail precisa estar verificado.");
    } finally {
      setMfaEnrolling(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaCode || mfaCode.length !== 6) return toast.error("O código deve ter 6 dígitos.");
    setMfaEnrolling(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.data.id, code: mfaCode });
      if (verify.error) throw verify.error;
      toast.success("Autenticação em 2 Fatores ativada com sucesso!");
      setMfaEnabled(true);
      setMfaQrCode("");
      setMfaFactorId("");
      setMfaCode("");
    } catch (err) {
      toast.error("Código incorreto. Tente novamente.");
    } finally {
      setMfaEnrolling(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white light:text-zinc-950">Configurações</h2>
        <p className="text-zinc-500">Personalize o Agendei. para o seu estabelecimento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
            <SettingsTab icon={<User />} label="Perfil" id="perfil" active={activeTab === "perfil"} onClick={setActiveTab} />
            <SettingsTab icon={<Smartphone />} label="App Mobile" id="mobile" active={activeTab === "mobile"} onClick={setActiveTab} />
            <SettingsTab icon={<Bell />} label="Notificações" id="notificacoes" active={activeTab === "notificacoes"} onClick={setActiveTab} />
            <SettingsTab icon={<Shield />} label="Segurança" id="seguranca" active={activeTab === "seguranca"} onClick={setActiveTab} />
            <SettingsTab icon={<Palette />} label="Aparência" id="aparencia" active={activeTab === "aparencia"} onClick={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 bg-card border border-subtle p-8 rounded-3xl h-fit shadow-sm transition-all">
            <AnimatePresence mode="wait">
                {activeTab === "perfil" && (
                    <motion.div 
                        key="perfil"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {loadingProfile ? (
                            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#fd9602]" /></div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white light:text-zinc-950">Informações Gerais</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Logo do Estabelecimento (URL)</label>
                                            <input value={profile.logo_url} onChange={e => setProfile({...profile, logo_url: e.target.value})} type="text" placeholder="https://..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Avatar do Proprietário (URL)</label>
                                            <input value={profile.avatar_url} onChange={e => setProfile({...profile, avatar_url: e.target.value})} type="text" placeholder="https://..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Nome do Estabelecimento</label>
                                            <input value={profile.nome} onChange={e => setProfile({...profile, nome: e.target.value})} type="text" placeholder="Nome do Local" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Telefone Comercial</label>
                                            <input value={profile.telefone_comercial} onChange={e => setProfile({...profile, telefone_comercial: e.target.value})} type="text" placeholder="(11) 99999-8888" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Endereço Completo</label>
                                        <input value={profile.endereco} onChange={e => setProfile({...profile, endereco: e.target.value})} type="text" placeholder="Rua das Belezas, 123" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-zinc-800 light:border-zinc-200">
                                    <h3 className="text-xl font-bold text-white light:text-zinc-950">Redes Sociais</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Instagram (URL)</label>
                                            <input value={profile.instagram_url} onChange={e => setProfile({...profile, instagram_url: e.target.value})} type="text" placeholder="https://instagram.com/..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Facebook (URL)</label>
                                            <input value={profile.facebook_url} onChange={e => setProfile({...profile, facebook_url: e.target.value})} type="text" placeholder="https://facebook.com/..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">WhatsApp (Link/Número)</label>
                                            <input value={profile.whatsapp_url} onChange={e => setProfile({...profile, whatsapp_url: e.target.value})} type="text" placeholder="https://wa.me/..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">TikTok (URL)</label>
                                            <input value={profile.tiktok_url} onChange={e => setProfile({...profile, tiktok_url: e.target.value})} type="text" placeholder="https://tiktok.com/@..." className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="bg-[#fd9602] text-zinc-950 font-bold px-8 py-3 rounded-xl hover:bg-[#fd9602]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#fd9602]/10 active:scale-95 disabled:opacity-50"
                                >
                                    {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                    {savingProfile ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === "mobile" && (
                    <motion.div 
                        key="mobile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">App Mobile</h3>
                        <p className="text-zinc-500 text-sm">Leve o Agendei. no seu bolso e gerencie tudo de onde estiver.</p>
                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200 gap-4 text-center">
                            <Smartphone size={48} className="text-[#fd9602]" />
                            <div className="space-y-1">
                                <p className="font-bold text-white light:text-zinc-950">Disponível em breve nas lojas</p>
                                <p className="text-xs text-zinc-500">Estamos finalizando os últimos detalhes das versões iOS e Android.</p>
                            </div>
                            <button className="mt-2 bg-[#fd9602]/10 text-[#fd9602] font-bold px-6 py-2 rounded-xl border border-[#fd9602]/20 text-sm cursor-not-allowed opacity-50 transition-all">
                                Baixar App
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === "notificacoes" && (
                    <motion.div 
                        key="notificacoes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Notificações</h3>
                        <p className="text-zinc-500 text-sm">Controle como você e seus clientes são avisados.</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm">Lembretes de Agendamento</p>
                                    <p className="text-xs text-zinc-500">Envia SMS/Email para o cliente 24h antes.</p>
                                </div>
                                <div onClick={() => handleToggleNotification('notificacao_lembretes')} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${profile.notificacao_lembretes ? 'bg-[#fd9602]' : 'bg-zinc-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${profile.notificacao_lembretes ? 'right-0.5' : 'left-0.5'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm">Alertas Financeiros</p>
                                    <p className="text-xs text-zinc-500">Avisos de metas atingidas e fechamento de caixa.</p>
                                </div>
                                <div onClick={() => handleToggleNotification('notificacao_financeiro')} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${profile.notificacao_financeiro ? 'bg-[#fd9602]' : 'bg-zinc-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${profile.notificacao_financeiro ? 'right-0.5' : 'left-0.5'}`}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "seguranca" && (
                    <motion.div 
                        key="seguranca"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Segurança</h3>
                        <p className="text-zinc-500 text-sm">Proteja sua conta e atualize seus dados de acesso.</p>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">E-mail de Login</label>
                                <input value={secEmail} onChange={e => setSecEmail(e.target.value)} type="email" placeholder="seu@email.com" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Nova Senha</label>
                                    <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Confirmar Nova Senha</label>
                                    <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-4 py-3 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all" />
                                </div>
                            </div>
                            <button 
                                onClick={handleUpdateSecurity}
                                disabled={secLoading}
                                className="bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-zinc-700 transition-all text-sm mt-2 disabled:opacity-50 flex items-center gap-2"
                            >
                                {secLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {secLoading ? "Atualizando..." : "Atualizar Acesso"}
                            </button>
                        </div>

                        <div className="pt-6 border-t border-zinc-800 light:border-zinc-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-900 light:bg-zinc-100 rounded-2xl border border-zinc-800 light:border-zinc-200 gap-4">
                                <div>
                                    <p className="font-bold text-white light:text-zinc-950 text-sm flex items-center gap-2">Autenticação em 2 Fatores <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full">Recomendado</span></p>
                                    <p className="text-xs text-zinc-500 mt-1">Adicione uma camada extra de segurança à sua conta.</p>
                                </div>
                                
                                {mfaEnabled ? (
                                    <button disabled className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl transition-all cursor-default">Ativado</button>
                                ) : mfaQrCode ? (
                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <QRCodeSVG value={mfaQrCode} size={120} />
                                        </div>
                                        <div className="flex w-full max-w-[200px] gap-2">
                                            <input 
                                                type="text" 
                                                maxLength={6}
                                                placeholder="000000" 
                                                value={mfaCode}
                                                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full text-center tracking-widest bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-xl px-2 py-2 text-zinc-100 light:text-zinc-950 focus:ring-2 focus:ring-[#fd9602]/50 outline-none transition-all"
                                            />
                                            <button 
                                                onClick={handleVerifyMfa}
                                                disabled={mfaEnrolling || mfaCode.length !== 6}
                                                className="bg-[#fd9602] text-zinc-950 font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                                            >
                                                {mfaEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validar"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleEnrollMfa}
                                        disabled={mfaEnrolling}
                                        className="text-[#fd9602] font-bold text-sm bg-[#fd9602]/10 px-4 py-2 rounded-xl hover:bg-[#fd9602]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {mfaEnrolling && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Ativar 2FA
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "aparencia" && (
                    <motion.div 
                        key="aparencia"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white light:text-zinc-950">Aparência</h3>
                        <p className="text-zinc-500 text-sm">Personalize a cara do seu dashboard.</p>
                        
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">Tema do Sistema</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div onClick={() => setTheme('dark')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-pointer ${theme === 'dark' ? 'border-[#fd9602] bg-[#09090b]' : 'border-[#27272a] bg-[#09090b] opacity-50'}`}>
                                    <div className="w-full h-12 bg-[#18181b] rounded-lg flex gap-2 p-2">
                                        <div className="w-3 h-full bg-[#27272a] rounded"></div>
                                        <div className="flex-1 bg-[#27272a] rounded"></div>
                                    </div>
                                    <span className="text-xs font-bold text-[#ffffff]">Escuro</span>
                                </div>
                                <div onClick={() => setTheme('light')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-pointer ${theme === 'light' ? 'border-[#fd9602] bg-[#ffffff]' : 'border-[#e4e4e7] bg-[#ffffff] opacity-50'}`}>
                                    <div className="w-full h-12 bg-[#f4f4f5] rounded-lg flex gap-2 p-2">
                                        <div className="w-3 h-full bg-[#e4e4e7] rounded"></div>
                                        <div className="flex-1 bg-[#e4e4e7] rounded"></div>
                                    </div>
                                    <span className="text-xs font-bold text-[#09090b]">Claro</span>
                                </div>
                                <div onClick={() => setTheme('system')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-pointer ${theme === 'system' ? 'border-[#fd9602] bg-gradient-to-r from-[#09090b] to-[#ffffff]' : 'border-[#71717a] bg-gradient-to-r from-[#09090b] to-[#ffffff] opacity-50'}`}>
                                     <div className="w-full h-12 flex rounded-lg overflow-hidden border border-[#52525b]/20">
                                        <div className="flex-1 bg-[#09090b] p-2"><div className="w-full h-full bg-[#27272a] rounded"></div></div>
                                        <div className="flex-1 bg-[#f4f4f5] p-2"><div className="w-full h-full bg-[#e4e4e7] rounded"></div></div>
                                    </div>
                                    <span className="text-xs font-bold text-[#71717a]">Sistema</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, id, active, onClick }: any) {
    return (
        <button 
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 ${
                active 
                    ? "bg-[#fd9602]/10 text-[#fd9602] shadow-sm border border-[#fd9602]/20" 
                    : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 border border-transparent"
            }`}
        >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
            <span className="font-bold text-sm">{label}</span>
        </button>
    );
}
