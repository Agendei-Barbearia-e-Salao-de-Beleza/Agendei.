import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isLightMode = window.document.documentElement.classList.contains('light');
      setIsLight(isLightMode);
    };
    checkTheme();
    
    // Observe class attribute changes on <html> to update dynamic styling instantly
    const observer = new MutationObserver(checkTheme);
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-screen ${isLight ? 'bg-zinc-50' : 'bg-zinc-950'} overflow-hidden font-sans transition-colors duration-300`}>
      
      {/* Background Image with Premium Dark Overlay and Glowing Radial Gradients (Hides completely on light mode for clean minimalist aesthetic) */}
      {!isLight && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1080&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-zinc-950/75 to-zinc-950" />
        </>
      )}
      
      {/* Ambient Glowing Orbs for Premium feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_60%)] pointer-events-none z-0" />
      <div className={`absolute left-[-20%] bottom-[-10%] w-[60%] h-[50%] bg-[#fd9602] ${isLight ? 'opacity-[0.03]' : 'opacity-[0.08]'} blur-[120px] rounded-full pointer-events-none z-0`} />

      {/* Main Content - Elevated Logo and Welcome Copy */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 w-full mt-20"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-18 h-18 bg-[#fd9602] flex items-center justify-center rounded-2xl shadow-xl shadow-[#fd9602]/20 mb-4 cursor-pointer">
            <Scissors className="w-9 h-9 text-zinc-950" strokeWidth={2} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'} mt-1`}>
            Agendei<span style={{ color: '#fd9602' }}>.</span>
          </h1>
        </motion.div>
 
        <div className="text-left space-y-4 w-full self-start max-w-sm ml-1 mt-4">
          <motion.h2 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`text-3xl font-black ${isLight ? 'text-zinc-950' : 'text-white'} leading-tight uppercase tracking-tight`}
          >
            Agende agora<br/>mesmo seu horário
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`text-sm leading-relaxed pr-6 ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}
          >
            Os melhores estabelecimentos e profissionais da beleza na palma da sua mão.
          </motion.p>
        </div>
      </motion.div>

      {/* CTA Button & Repositioned, Highly Elegant Footer Social Links */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="w-full px-8 pb-10 mt-auto z-10 flex flex-col items-center"
      >
        <button 
          onClick={() => navigate('/explore')}
          className="w-full py-4 rounded-xl bg-[#fd9602] text-zinc-950 font-black text-[12px] uppercase tracking-widest shadow-[0_4px_20px_rgba(253,150,2,0.25)] hover:bg-[#e08500] hover:shadow-[0_4px_25px_rgba(253,150,2,0.4)] transition-all duration-300 cursor-pointer"
        >
          Explorar Estabelecimentos
        </button>
        
        {/* Sleek, Elegant Social Icons Bar */}
        <div className="flex items-center justify-center space-x-3.5 mt-8 mb-6">
          <motion.a 
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isLight 
                ? 'bg-white border-zinc-200 text-[#fd9602] shadow-sm hover:border-[#fd9602]/40 hover:bg-[#fd9602]/5' 
                : 'bg-zinc-900/40 border-zinc-800/80 text-[#fd9602] hover:border-[#fd9602] hover:bg-[#fd9602]/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </motion.a>
          <motion.a 
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isLight 
                ? 'bg-white border-zinc-200 text-[#fd9602] shadow-sm hover:border-[#fd9602]/40 hover:bg-[#fd9602]/5' 
                : 'bg-zinc-900/40 border-zinc-800/80 text-[#fd9602] hover:border-[#fd9602] hover:bg-[#fd9602]/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </motion.a>
        </div>

        <div className="text-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-550'}`}>
            Todos os direitos reservados ® Agendei
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
