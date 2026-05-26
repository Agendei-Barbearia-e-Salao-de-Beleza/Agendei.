import React from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-zinc-950 overflow-hidden font-sans">
      
      {/* Background Image with Premium Dark Overlay and Glowing Radial Gradients */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1080&auto=format&fit=crop")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/70 to-zinc-950"></div>
      <div className="absolute top-0 right-0 w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.18),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute left-[-20%] bottom-[-10%] w-[60%] h-[50%] bg-[#fd9602] opacity-[0.08] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Bar - Social Icons */}
      <div className="relative z-10 w-full flex justify-end p-6 space-x-2">
        <motion.a 
          href="#"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[#fd9602] hover:bg-zinc-800 transition-colors"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.347-.272.273-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </motion.a>
        <motion.a 
          href="#"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[#fd9602] hover:bg-zinc-800 transition-colors"
        >
          {/* Instagram SVG Icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </motion.a>
      </div>

      {/* Main Content - Logo and Text */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 w-full"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center mb-16 mt-8"
        >
          <div className="w-20 h-20 bg-[#fd9602] flex items-center justify-center rounded-3xl shadow-xl shadow-[#fd9602]/25 mb-4 relative group cursor-pointer">
            <Scissors className="w-10 h-10 text-zinc-950" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-white mt-2 uppercase">
            Agendei
          </h1>
        </motion.div>

        <div className="text-left space-y-3 w-full self-start max-w-sm ml-2">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-3xl font-black text-white leading-snug uppercase tracking-tight"
          >
            Agende agora<br/>mesmo seu horário
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-zinc-400 text-base pr-4"
          >
            Os melhores estabelecimentos e profissionais da beleza na palma da sua mão.
          </motion.p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="w-full px-8 pb-6 mt-auto z-10"
      >
        <button 
          onClick={() => navigate('/explore')}
          className="w-full py-4 rounded-2xl bg-[#fd9602] text-zinc-950 font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(253,150,2,0.4)] hover:bg-[#e08500] hover:shadow-[0_0_30px_rgba(253,150,2,0.65)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          Explorar Estabelecimentos
        </button>
        
        <div className="text-center mt-6">
          <span className="text-[10px] text-zinc-600">
            Todos os direitos reservados ® Agendei
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
