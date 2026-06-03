import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Tag, Eye, Link, Target, Clock, Star, Bell,
  CalendarCheck, ChevronRight, RefreshCw, Check, X,
  DollarSign, Users, Scissors, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

import { BusinessDetailsModal } from '../components/BusinessDetailsModal';
import { ServiceListModal } from '../components/ServiceListModal';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { CatalogPreviewModal } from '../components/CatalogPreviewModal';
import { GoalModal } from '../components/GoalModal';
import { PixPaymentModal } from '../components/PixPaymentModal';
import { ReviewsModal } from '../components/ReviewsModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { SocialMediaModal } from '../components/SocialMediaModal';
import { AgendaPausesModal } from '../components/AgendaPausesModal';
import { ManagerDetailsModal } from '../components/ManagerDetailsModal';
import { ImageAdjustmentModal } from '../components/ImageAdjustmentModal';
import { TabBar } from '../components/TabBar';

const EMPTY_SERVICE_FORM = { id: '', nome: '', preco: '', descricao: '', imagem_url: '', video_url: '' };

export const ManagerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');

  // Manager & Establishment data
  const [userName, setUserName] = useState('Gerente');
  const [managerAvatar, setManagerAvatar] = useState('');
  const [establishmentLogo, setEstablishmentLogo] = useState('');
  const [establishmentData, setEstablishmentData] = useState({
    nome: '', telefone: '', whatsapp_url: '', endereco: '',
    instagram_url: '', facebook_url: '', tiktok_url: ''
  });

  // Business data
  const [services, setServices] = useState<any[]>([]);
  const [pauses, setPauses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Stats
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  // Modal open states
  const [openBusiness, setOpenBusiness] = useState(false);
  const [openServiceList, setOpenServiceList] = useState(false);
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const [openCatalog, setOpenCatalog] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);
  const [openPix, setOpenPix] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSocial, setOpenSocial] = useState(false);
  const [openPauses, setOpenPauses] = useState(false);
  const [openManagerDetails, setOpenManagerDetails] = useState(false);
  const [serviceFormData, setServiceFormData] = useState(EMPTY_SERVICE_FORM);

  // Image adjustment
  const [imageToAdjust, setImageToAdjust] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'avatar' | 'banner'>('avatar');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const uid = session.user.id;
      setUserId(uid);

      const { data: profile } = await supabase
        .from('usuarios')
        .select('nome, avatar_url, cargo')
        .eq('id', uid)
        .single();

      if (!profile || profile.cargo !== 'GERENTE') {
        navigate('/dashboard');
        return;
      }

      setUserName(profile.nome || 'Gerente');
      if (profile.avatar_url) setManagerAvatar(profile.avatar_url);

      const { data: est } = await supabase
        .from('estabelecimentos')
        .select('*')
        .or(`proprietario_id.eq.${uid},proprietario_email.eq.${session.user.email}`)
        .maybeSingle();

      if (est) {
        setEstablishmentId(est.id);
        setEstablishmentLogo(est.logo_url || est.imagem_url || '');
        setEstablishmentData({
          nome: est.nome || '',
          telefone: est.telefone || '',
          whatsapp_url: est.whatsapp_url || est.whatsapp || '',
          endereco: est.endereco || '',
          instagram_url: est.instagram_url || '',
          facebook_url: est.facebook_url || '',
          tiktok_url: est.tiktok_url || ''
        });
        if (est.pix_key) setPixKey(est.pix_key);
        if (est.meta_mensal) setGoalInput(String(est.meta_mensal));

        const [svcRes, pauseRes, reviewRes, apptRes] = await Promise.allSettled([
          supabase.from('servicos').select('*').eq('estabelecimento_id', est.id).order('nome'),
          supabase.from('indisponibilidades').select('*').eq('estabelecimento_id', est.id).gte('data', new Date().toISOString().split('T')[0]),
          supabase.from('agendamentos').select(`id, cliente_id, nota, comentario, created_at, usuarios:cliente_id(nome)`).eq('estabelecimento_id', est.id).eq('status', 'CONCLUIDO').not('nota', 'is', null).order('created_at', { ascending: false }).limit(20),
          supabase.from('agendamentos').select(`id, data_hora, status, preco_total, servicos, usuarios:cliente_id(nome)`).eq('estabelecimento_id', est.id).in('status', ['SOLICITADO', 'PENDENTE']).order('data_hora', { ascending: true })
        ]);

        if (svcRes.status === 'fulfilled' && svcRes.value.data) setServices(svcRes.value.data);
        if (pauseRes.status === 'fulfilled' && pauseRes.value.data) setPauses(pauseRes.value.data);
        if (reviewRes.status === 'fulfilled' && reviewRes.value.data) {
          setReviews(reviewRes.value.data.map((r: any) => ({
            id: r.id,
            customer: (r.usuarios as any)?.nome || 'Cliente',
            rating: r.nota || 5,
            comment: r.comentario || '',
            date: new Date(r.created_at).toLocaleDateString('pt-BR')
          })));
        }
        if (apptRes.status === 'fulfilled' && apptRes.value.data) {
          setPendingAppointments(apptRes.value.data);
        }

        const today = new Date().toISOString().split('T')[0];
        const { data: todayAppts } = await supabase
          .from('agendamentos')
          .select('preco_total')
          .eq('estabelecimento_id', est.id)
          .gte('data_hora', `${today}T00:00:00`)
          .lte('data_hora', `${today}T23:59:59`)
          .eq('status', 'CONCLUIDO');

        if (todayAppts) {
          setTodayCount(todayAppts.length);
          setTodayRevenue(todayAppts.reduce((s: number, a: any) => s + (parseFloat(a.preco_total) || 0), 0));
        }
      }

      const stored = localStorage.getItem('agendei_notifications');
      if (stored) setNotifications(JSON.parse(stored));
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do estabelecimento.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveBusiness = async () => {
    if (!establishmentId) return;
    try {
      await supabase.from('estabelecimentos').update({
        nome: establishmentData.nome,
        telefone: establishmentData.telefone,
        whatsapp_url: establishmentData.whatsapp_url,
        endereco: establishmentData.endereco,
        logo_url: establishmentLogo
      }).eq('id', establishmentId);
      toast.success('Dados do negócio atualizados!');
      setOpenBusiness(false);
    } catch { toast.error('Erro ao salvar dados.'); }
  };

  const handleSaveSocial = async () => {
    if (!establishmentId) return;
    try {
      await supabase.from('estabelecimentos').update({
        instagram_url: establishmentData.instagram_url,
        facebook_url: establishmentData.facebook_url,
        tiktok_url: establishmentData.tiktok_url
      }).eq('id', establishmentId);
      toast.success('Redes sociais salvas!');
      setOpenSocial(false);
    } catch { toast.error('Erro ao salvar redes sociais.'); }
  };

  const handleSaveGoal = async () => {
    if (!establishmentId) return;
    try {
      await supabase.from('estabelecimentos').update({ meta_mensal: parseFloat(goalInput) }).eq('id', establishmentId);
      toast.success('Meta mensal definida!');
      setOpenGoal(false);
    } catch { toast.error('Erro ao salvar meta.'); }
  };

  const handleSaveManagerDetails = async () => {
    try {
      await supabase.from('usuarios').update({ nome: userName, avatar_url: managerAvatar }).eq('id', userId);
      localStorage.setItem(`avatar_${userId}`, managerAvatar);
      toast.success('Perfil atualizado!');
      setOpenManagerDetails(false);
    } catch { toast.error('Erro ao salvar perfil.'); }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
    try {
      const payload = {
        nome: serviceFormData.nome,
        preco: parseFloat(serviceFormData.preco.replace(',', '.')),
        descricao: serviceFormData.descricao,
        imagem_url: serviceFormData.imagem_url,
        video_url: serviceFormData.video_url,
        estabelecimento_id: establishmentId
      };
      if (serviceFormData.id) {
        await supabase.from('servicos').update(payload).eq('id', serviceFormData.id);
        toast.success('Serviço atualizado!');
      } else {
        await supabase.from('servicos').insert([payload]);
        toast.success('Serviço criado!');
      }
      setServiceFormData(EMPTY_SERVICE_FORM);
      setOpenServiceForm(false);
      loadData();
    } catch { toast.error('Erro ao salvar serviço.'); }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Excluir este serviço?')) return;
    await supabase.from('servicos').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success('Serviço removido.');
  };

  const handleDeletePause = async (id: string) => {
    await supabase.from('indisponibilidades').delete().eq('id', id);
    setPauses(prev => prev.filter(p => p.id !== id));
    toast.success('Bloqueio removido.');
  };

  const handleApproveAppointment = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'APROVADO' }).eq('id', id);
    setPendingAppointments(prev => prev.filter(a => a.id !== id));
    toast.success('Agendamento aprovado!');
  };

  const handleRejectAppointment = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'CANCELADO' }).eq('id', id);
    setPendingAppointments(prev => prev.filter(a => a.id !== id));
    toast.success('Agendamento recusado.');
  };

  const handleConfirmPixPayment = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'CONCLUIDO' }).eq('id', id);
    setOpenPix(false);
    setSelectedAppointment(null);
    loadData();
    toast.success('Pagamento confirmado!');
  };

  const handleSavePixKey = async (key: string) => {
    setPixKey(key);
    if (establishmentId) {
      await supabase.from('estabelecimentos').update({ pix_key: key }).eq('id', establishmentId);
    }
    toast.success('Chave Pix salva!');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setImageToAdjust(reader.result);
        setAdjustType(type);
        setZoom(1);
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageConfirm = () => {
    if (!imageToAdjust) return;
    if (adjustType === 'avatar') setManagerAvatar(imageToAdjust);
    else setEstablishmentLogo(imageToAdjust);
    setImageToAdjust(null);
  };

  const actions = [
    { icon: Briefcase, label: 'Dados do Negócio', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', onPress: () => setOpenBusiness(true) },
    { icon: Tag, label: 'Serviços', color: 'text-[#fd9602]', bg: 'bg-[#fd9602]/10 border-[#fd9602]/20', onPress: () => setOpenServiceList(true) },
    { icon: Eye, label: 'Catálogo', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', onPress: () => setOpenCatalog(true) },
    { icon: Link, label: 'Redes Sociais', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', onPress: () => setOpenSocial(true) },
    { icon: Target, label: 'Meta Mensal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', onPress: () => setOpenGoal(true) },
    { icon: Clock, label: 'Bloqueios', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', onPress: () => setOpenPauses(true) },
    { icon: Star, label: 'Avaliações', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', onPress: () => setOpenReviews(true) },
    { icon: Bell, label: 'Notificações', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', onPress: () => setOpenNotifications(true) },
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-sm font-semibold">Carregando painel...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-28">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fd9602] flex items-center justify-center shadow-lg shadow-[#fd9602]/20">
            <Scissors className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Agendei<span className="text-[#fd9602]">.</span></h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{establishmentData.nome || 'Painel Gerente'}</p>
          </div>
        </div>
        <button
          onClick={() => setOpenManagerDetails(true)}
          className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center font-black text-sm text-[#fd9602] hover:border-[#fd9602] transition-colors"
        >
          {managerAvatar ? <img src={managerAvatar} alt="Avatar" className="w-full h-full object-cover" /> : userName.slice(0, 2).toUpperCase()}
        </button>
      </div>

      <div className="mt-28 px-6 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-xl font-black text-white tracking-tight">Olá, {userName.split(' ')[0]}!</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Painel de Gerenciamento</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: 'Faturamento Hoje', value: `R$ ${todayRevenue.toFixed(0)}`, color: 'text-emerald-400' },
            { icon: CalendarCheck, label: 'Atendimentos', value: String(todayCount), color: 'text-[#fd9602]' },
            { icon: Users, label: 'Pendentes', value: String(pendingAppointments.length), color: pendingAppointments.length > 0 ? 'text-red-400' : 'text-zinc-500' }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider leading-tight">{s.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Agendamentos Pendentes ({pendingAppointments.length})</span>
            </div>
            <div className="space-y-2.5">
              {pendingAppointments.slice(0, 5).map(a => {
                const clientName = (a.usuarios as any)?.nome || 'Cliente';
                const svcName = a.servicos?.[0]?.nome || 'Serviço';
                const dataHora = a.data_hora ? new Date(a.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{clientName}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold truncate">{svcName} • {dataHora}</p>
                      <p className="text-[10px] font-black text-[#fd9602]">R$ {parseFloat(a.preco_total || '0').toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleApproveAppointment(a.id)}
                        className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button onClick={() => handleRejectAppointment(a.id)}
                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                        <X className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button onClick={() => { setSelectedAppointment({ ...a, totalPrice: parseFloat(a.preco_total || '0'), customer: clientName, services: a.servicos || [], date: dataHora, time: dataHora }); setOpenPix(true); }}
                        className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
                        <DollarSign className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Gerenciar Negócio</span>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} onClick={a.onPress}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 active:scale-98 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${a.bg}`}>
                      <Icon className={`w-4 h-4 ${a.color}`} />
                    </div>
                    <span className="text-xs font-black text-zinc-200">{a.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Refresh */}
        <button onClick={loadData}
          className="w-full py-3 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-xs font-bold">
          <RefreshCw className="w-4 h-4" /> Atualizar Dados
        </button>
      </div>

      <TabBar activeTab="home" />

      {/* All Modals */}
      <AnimatePresence>
        {openBusiness && (
          <BusinessDetailsModal isOpen={openBusiness} onClose={() => setOpenBusiness(false)}
            establishmentLogo={establishmentLogo} onEstablishmentLogoChange={setEstablishmentLogo}
            onImageSelect={handleImageSelect}
            establishmentData={establishmentData} onEstablishmentDataChange={setEstablishmentData}
            onSave={handleSaveBusiness} />
        )}
        {openServiceList && (
          <ServiceListModal isOpen={openServiceList} onClose={() => setOpenServiceList(false)}
            services={services}
            onNewClick={() => { setServiceFormData(EMPTY_SERVICE_FORM); setOpenServiceForm(true); }}
            onEditClick={(s) => { setServiceFormData({ id: s.id, nome: s.nome, preco: String(s.preco), descricao: s.descricao || '', imagem_url: s.imagem_url || '', video_url: s.video_url || '' }); setOpenServiceForm(true); }}
            onDeleteClick={handleDeleteService} />
        )}
        {openServiceForm && (
          <ServiceFormModal isOpen={openServiceForm} onClose={() => setOpenServiceForm(false)}
            serviceFormData={serviceFormData}
            onServiceFormDataChange={(updater) => setServiceFormData(updater)}
            onSubmit={handleServiceSubmit} />
        )}
        {openCatalog && (
          <CatalogPreviewModal isOpen={openCatalog} onClose={() => setOpenCatalog(false)} services={services} />
        )}
        {openGoal && (
          <GoalModal isOpen={openGoal} onClose={() => setOpenGoal(false)}
            goalInput={goalInput} onGoalInputChange={setGoalInput} onSave={handleSaveGoal} />
        )}
        {openPix && (
          <PixPaymentModal isOpen={openPix} onClose={() => { setOpenPix(false); setSelectedAppointment(null); }}
            appointment={selectedAppointment} pixKey={pixKey}
            pixKeyInput={pixKeyInput} onPixKeyInputChange={setPixKeyInput}
            onSavePixKey={handleSavePixKey} onChangePixKey={() => setPixKey('')}
            onConfirmPayment={handleConfirmPixPayment} />
        )}
        {openReviews && (
          <ReviewsModal isOpen={openReviews} onClose={() => setOpenReviews(false)} reviews={reviews} />
        )}
        {openNotifications && (
          <NotificationsModal isOpen={openNotifications} onClose={() => setOpenNotifications(false)} notifications={notifications} />
        )}
        {openSocial && (
          <SocialMediaModal isOpen={openSocial} onClose={() => setOpenSocial(false)}
            establishmentData={establishmentData} onEstablishmentDataChange={setEstablishmentData}
            onSave={handleSaveSocial} />
        )}
        {openPauses && (
          <AgendaPausesModal isOpen={openPauses} onClose={() => setOpenPauses(false)}
            pauses={pauses} onDeletePause={handleDeletePause} />
        )}
        {openManagerDetails && (
          <ManagerDetailsModal isOpen={openManagerDetails} onClose={() => setOpenManagerDetails(false)}
            userName={userName} onUserNameChange={setUserName}
            managerAvatar={managerAvatar} onManagerAvatarChange={setManagerAvatar}
            onImageSelect={handleImageSelect} onSave={handleSaveManagerDetails} />
        )}
        {imageToAdjust && (
          <ImageAdjustmentModal imageToAdjust={imageToAdjust} adjustType={adjustType}
            zoom={zoom} onZoomChange={setZoom}
            rotation={rotation} onRotationChange={setRotation}
            onClose={() => setImageToAdjust(null)} onConfirm={handleImageConfirm} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerScreen;
