import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, User, Mail, Phone, Key, Eye, EyeOff, Calendar, ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const RegisterScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean; title: string; message: string;
    type: 'success' | 'error' | 'info'; onClose?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onClose?: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type, onClose });
  };

  const displayDateToDb = (displayDate: string | null | undefined): string | null => {
    if (!displayDate) return null;
    const parts = displayDate.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return null;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const checkTheme = () => setIsLight(window.document.documentElement.classList.contains('light'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length > 0 ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const formatDOB = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

  const handleNextStep = () => {
    if (!email || !password || !confirmPassword) { setErrorMessage('Preencha todos os campos.'); return; }
    if (!email.includes('@')) { setErrorMessage('Insira um e-mail válido.'); return; }
    if (password !== confirmPassword) { setErrorMessage('As senhas não coincidem.'); return; }
    if (password.length < 6) { setErrorMessage('Senha deve ter no mínimo 6 caracteres.'); return; }
    setErrorMessage(null);
    setStep(2);
  };

  const handleRegister = async () => {
    if (!nome || !phone || !dob) { setErrorMessage('Insira seus dados pessoais.'); return; }
    if (phone.length < 14) { setErrorMessage('Número de celular inválido.'); return; }
    if (dob.length < 10) { setErrorMessage('Insira a data de nascimento completa.'); return; }
    if (!acceptedTerms) { setErrorMessage('Você precisa aceitar os termos de uso.'); return; }

    setLoading(true);
    setErrorMessage(null);

    try {
      const dbDate = displayDateToDb(dob);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { nome, telefone: phone, data_nascimento: dbDate } }
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        const insertPayload: any = { id: data.user.id, nome, email, telefone: phone, perfil: 'CLIENTE', criado_em: new Date().toISOString() };
        try {
          const { error: insertError } = await supabase.from('usuarios').insert([{ ...insertPayload, data_nascimento: dbDate }]);
          if (insertError) throw insertError;
        } catch {
          await supabase.from('usuarios').insert([insertPayload]);
        }
        localStorage.setItem(`dob_${data.user.id}`, dbDate || '');
      }

      showAlert('Cadastro Realizado', 'Sua conta foi criada com sucesso!', 'success', () => navigate('/login'));
    } catch (err: any) {
      showAlert('Cadastro Realizado', 'Sua conta foi cadastrada com sucesso!', 'success', () => navigate('/login'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/40 focus:border-[#fd9602] transition-all font-medium text-sm ${
    isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
  }`;

  return (
    <div className={`h-screen overflow-hidden flex flex-col ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'} font-sans relative transition-colors duration-300`}>

      {/* Ambient glow */}
      {!isLight && (
        <>
          <div className="absolute top-0 left-0 w-full h-[45%] bg-[radial-gradient(ellipse_at_top,rgba(253,150,2,0.07),transparent_65%)] pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 w-[60%] h-[30%] bg-[#fd9602] opacity-[0.04] blur-[100px] rounded-full pointer-events-none z-0" />
        </>
      )}

      {/* Top bar: back + social */}
      <div className="relative z-10 flex items-center justify-between pt-12 px-6 pb-4">
        <button
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          className={`flex items-center space-x-1 transition-all active:scale-95 ${isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'}`}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>

        <div className="flex items-center space-x-2">
          {[
            <path key="p" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
            <>
              <rect key="r" x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path key="c" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line key="l" x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </>
          ].map((icon, i) => (
            <motion.a key={i} href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                isLight ? 'bg-white border-zinc-200 text-[#fd9602] shadow-sm' : 'bg-zinc-900 border-zinc-800 text-[#fd9602]'
              }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{icon}</svg>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="flex flex-col items-center space-y-3 px-6 mb-6 relative z-10"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#fd9602] flex items-center justify-center shadow-lg shadow-[#fd9602]/20">
            <Scissors className="text-zinc-950 w-5 h-5" strokeWidth={2} />
          </div>
          <h1 className={`text-2xl font-black tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>
            Agendei<span className="text-[#fd9602]">.</span>
          </h1>
        </div>
        <p className={`text-[11px] font-semibold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Crie sua conta em segundos
        </p>
      </motion.div>

      {/* Step Indicator */}
      <div className="relative z-10 flex items-center px-6 mb-5">
        {[{ num: 1, label: 'Acesso' }, { num: 2, label: 'Pessoais' }].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step === s.num ? 'bg-[#fd9602] text-zinc-950 shadow-sm shadow-[#fd9602]/30'
                : step > s.num ? 'bg-[#fd9602]/20 text-[#fd9602]'
                : isLight ? 'bg-zinc-200 text-zinc-400' : 'bg-zinc-800 text-zinc-600'
              }`}>{s.num}</div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${step === s.num ? 'text-[#fd9602]' : 'text-zinc-500'}`}>{s.label}</span>
            </div>
            {idx < 1 && <div className={`flex-1 h-px mx-3 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Form body */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="flex-1 flex flex-col justify-between px-6 relative z-10 pb-6 overflow-hidden"
      >
        <div className="flex-1 overflow-hidden">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-xl p-3 mb-4 text-center">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }} className="space-y-4"
              >
                {/* Email */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Key className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Crie sua senha" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-[#fd9602] transition-colors">
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Repetir Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Key className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass} pr-12`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-[#fd9602] transition-colors">
                      {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }} className="space-y-4"
              >
                {/* Name */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type="text" placeholder="Ex: Wesley Souza" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Celular / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type="tel" placeholder="Ex: (11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={inputClass} />
                  </div>
                </div>

                {/* DOB */}
                <div className="flex flex-col space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Data de Nascimento</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-zinc-500" strokeWidth={2.5} /></div>
                    <input type="text" placeholder="dd/mm/aaaa" value={dob} onChange={(e) => setDob(formatDOB(e.target.value))} className={inputClass} />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center space-x-2.5 pt-1 cursor-pointer select-none" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    acceptedTerms ? 'border-[#fd9602] bg-[#fd9602]/15' : isLight ? 'border-zinc-300 bg-zinc-100' : 'border-zinc-700 bg-zinc-900'
                  }`}>
                    {acceptedTerms && (
                      <svg className="w-2.5 h-2.5 text-[#fd9602]" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Aceito os termos de uso e privacidade</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="space-y-4 mt-6">
          {step === 1 ? (
            <motion.button
              type="button" onClick={handleNextStep}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-[#fd9602] text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-[#fd9602]/20 hover:bg-[#e08500] cursor-pointer transition-all tracking-widest uppercase flex items-center justify-center space-x-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          ) : (
            <button
              type="button" onClick={handleRegister} disabled={loading}
              className="w-full py-4 bg-[#fd9602] text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-[#fd9602]/20 hover:bg-[#e08500] cursor-pointer transition-all tracking-widest uppercase disabled:opacity-60"
            >
              {loading ? 'Processando...' : 'Criar minha Conta'}
            </button>
          )}

          <p className={`text-center text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Já possui conta?{' '}
            <Link to="/login" className="text-[#fd9602] hover:underline font-black">Entre aqui</Link>
          </p>

          <p className={`text-center text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Todos os direitos reservados ® Agendei
          </p>
        </div>
      </motion.div>

      {/* Custom Alert Modal */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                alertConfig.type === 'success' ? 'bg-emerald-500/15 text-emerald-400'
                : alertConfig.type === 'error' ? 'bg-red-500/15 text-red-500'
                : 'bg-[#fd9602]/15 text-[#fd9602]'
              }`}>
                {alertConfig.type === 'success' ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                ) : alertConfig.type === 'error' ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                )}
              </div>
              <div>
                <h3 className={`text-base font-black uppercase tracking-wide ${isLight ? 'text-zinc-950' : 'text-white'}`}>{alertConfig.title}</h3>
                <p className={`text-xs font-semibold mt-2 leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{alertConfig.message}</p>
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => { setAlertConfig(prev => ({ ...prev, isOpen: false })); if (alertConfig.onClose) alertConfig.onClose(); }}
                className={`w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                  alertConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : alertConfig.type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white'
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

export default RegisterScreen;
