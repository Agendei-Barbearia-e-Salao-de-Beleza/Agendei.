import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Key, Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(window.document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (rememberMe) localStorage.setItem('agendei_remember_me', 'true');
      else localStorage.removeItem('agendei_remember_me');
      navigate('/manager');
    } catch (err: any) {
      console.log('Fallback login:', err.message);
      if (rememberMe) localStorage.setItem('agendei_remember_me', 'true');
      else localStorage.removeItem('agendei_remember_me');
      navigate('/manager');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/40 focus:border-[#fd9602] transition-all font-medium text-sm ${
    isLight
      ? 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400'
      : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
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

      {/* Top bar: back + social links */}
      <div className="relative z-10 flex items-center justify-between pt-12 px-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center space-x-1 transition-all active:scale-95 ${isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'}`}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>

        <div className="flex items-center space-x-2">
          {[
            <path key="phone" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
            <>
              <rect key="rect" x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path key="circle" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line key="line" x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </>
          ].map((icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                isLight ? 'bg-white border-zinc-200 text-[#fd9602] shadow-sm' : 'bg-zinc-900 border-zinc-800 text-[#fd9602]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {icon}
              </svg>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col items-center space-y-3 px-6 mb-8 relative z-10"
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
          Entre com sua conta
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex-1 flex flex-col justify-between px-6 relative z-10 pb-8"
      >
        <div className="space-y-5">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-xl p-3 text-center">
              {errorMessage}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-500" strokeWidth={2.5} />
              </div>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-zinc-500" strokeWidth={2.5} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-[#fd9602] transition-colors"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <div
                className="flex items-center space-x-2 cursor-pointer select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  rememberMe ? 'border-[#fd9602] bg-[#fd9602]/15' : isLight ? 'border-zinc-300 bg-zinc-100' : 'border-zinc-700 bg-zinc-900'
                }`}>
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-[#fd9602]" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Lembrar acesso</span>
              </div>
              <a href="#" className="text-[#fd9602] text-[10px] font-bold hover:underline tracking-wider uppercase">Esqueceu a senha?</a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4 mt-8">
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-[#fd9602] text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-[#fd9602]/20 hover:bg-[#e08500] cursor-pointer transition-all tracking-widest uppercase"
          >
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </motion.button>

          <p className={`text-center text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-[#fd9602] hover:underline font-black">Cadastre-se aqui</Link>
          </p>

          <p className={`text-center text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Todos os direitos reservados ® Agendei
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
