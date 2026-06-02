import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Phone, Building2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import gsap from 'gsap';

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // GSAP Carousel States & Refs
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const { data, error } = await supabase
          .from('estabelecimentos')
          .select('*')
          .order('nome', { ascending: true });
          
        if (error) throw error;
        
        // Add fallback image and category to each establishment
        const mapped = (data || []).map((est, index) => {
          // Unsplash premium aesthetic photos for barbershops
          const images = [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600&h=400',
            'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600&h=400',
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600&h=400',
            'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=600&h=400'
          ];
          return {
            ...est,
            bg_image: images[index % images.length],
            tipo: est.tipo || (index % 2 === 0 ? 'BARBEARIA' : 'SALÃO DE BELEZA')
          };
        });

        setEstablishments(mapped);
      } catch (err) {
        console.error('Erro ao buscar estabelecimentos:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstablishments();
  }, []);

  // GSAP Animation effect for horizontal active/inactive sliding
  useEffect(() => {
    if (establishments.length === 0 || !carouselTrackRef.current) return;

    // Calculate translation distance
    // Card width is 270px + 16px (gap-4) = 286px.
    // We adjust centered offset for natural centering on mobile screens.
    const cardWidth = 270;
    const gap = 16;
    const offset = activeCarouselIdx * (cardWidth + gap);

    // Slide track to show active card
    gsap.to(carouselTrackRef.current, {
      x: -offset,
      duration: 0.65,
      ease: "power2.out"
    });

    // Scale up and make active card fully bright, translucent fade for others
    cardsRef.current.forEach((card, idx) => {
      if (!card) return;
      const isActive = idx === activeCarouselIdx;
      gsap.to(card, {
        scale: isActive ? 1.02 : 0.93,
        opacity: isActive ? 1.0 : 0.45,
        filter: isActive ? "blur(0px)" : "blur(0.5px)",
        boxShadow: isActive ? "0 15px 35px -10px rgba(253, 150, 2, 0.25)" : "0 4px 10px -5px rgba(0,0,0,0.3)",
        borderColor: isActive ? "#fd9602" : "transparent",
        duration: 0.6,
        ease: "power2.out"
      });
    });
  }, [activeCarouselIdx, establishments]);

  // Navigate to Category Selection
  const handleSelectEstablishment = (est: any) => {
    navigate('/select-category', { state: { establishmentId: est.id, establishment: est } });
  };

  // Swipe and Drag gesture handlers for natural side-to-side scrolling on mobile/desktop
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const minSwipeDistance = 55;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const distance = dragStart - e.clientX;
    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
    setDragStart(null);
  };

  const handleNextSlide = () => {
    if (establishments.length === 0) return;
    setActiveCarouselIdx((prev) => (prev + 1) % establishments.length);
  };

  const handlePrevSlide = () => {
    if (establishments.length === 0) return;
    setActiveCarouselIdx((prev) => (prev - 1 + establishments.length) % establishments.length);
  };

  const filtered = establishments.filter(est => 
    est.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (est.endereco && est.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28 transition-colors duration-300">
      <Header />

      {/* GSAP HERO CAROUSEL SECTION */}
      {!loading && establishments.length > 0 && (
        <div className="mt-28 mb-4 relative z-10">
          <div className="px-6 mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#fd9602] animate-pulse" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest">
                Parceiros em Destaque
              </h2>
            </div>
            
            {/* Carousel navigation chevrons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevSlide}
                className="w-7 h-7 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextSlide}
                className="w-7 h-7 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Track Container */}
          <div 
            className="w-full overflow-hidden px-6 py-2"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
          >
            <div 
              ref={carouselTrackRef}
              className="flex space-x-4 cursor-grab active:cursor-grabbing"
              style={{ width: 'max-content' }}
            >
              {establishments.map((est, idx) => {
                const rating = est.avaliacao ? Number(est.avaliacao).toFixed(1) : '4.9';
                return (
                  <div
                    key={est.id}
                    ref={(el) => { cardsRef.current[idx] = el; }}
                    onClick={() => handleSelectEstablishment(est)}
                    className="w-[270px] h-[190px] rounded-3xl overflow-hidden relative border border-transparent flex-shrink-0 cursor-pointer select-none group bg-zinc-900 shadow-xl"
                  >
                    {/* Background establishment photo with overlay gradient */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={est.bg_image} 
                        alt={est.nome} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10" />
                    </div>

                    {/* Card Content */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                      {/* Top Row Badge & rating */}
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-zinc-950 bg-white/90 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {est.tipo}
                        </span>
                        
                        <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                          <Star className="w-3 h-3 fill-[#fd9602] text-[#fd9602]" />
                          <span className="text-[10px] font-black text-white keep-white">{rating}</span>
                        </div>
                      </div>

                      {/* Bottom details */}
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-white keep-white text-base font-black truncate drop-shadow-md">
                            {est.nome}
                          </h3>
                          <div className="flex items-center space-x-1.5 mt-1 text-zinc-300 keep-light">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-[#fd9602]" />
                            <span className="text-[10px] font-bold truncate drop-shadow-sm text-zinc-300 keep-light">{est.endereco || 'São Paulo - SP'}</span>
                          </div>
                        </div>
                        
                        {/* Interactive schedule trigger */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <span className="text-[9px] font-bold text-zinc-400 keep-light">Ver serviços disponíveis</span>
                          <span className="text-[9px] font-black text-zinc-950 bg-[#fd9602] px-3 py-1 rounded-lg uppercase tracking-widest shadow-md shadow-[#fd9602]/20 hover:bg-[#e08500] transition-colors">
                            Agendar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-1.5 mt-3">
            {establishments.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCarouselIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeCarouselIdx === idx ? 'bg-[#fd9602] w-5' : 'bg-zinc-800 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Title & Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={`px-6 pb-4 relative z-10 ${loading ? 'mt-28' : 'mt-4'}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 bg-[#fd9602] rounded-full"></span>
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {loading ? 'Buscando estabelecimentos...' : 'Encontrar Todos os Parceiros'}
          </h2>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input 
            type="text" 
            placeholder="Pesquise por nome ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-500 font-bold text-xs"
          />
        </div>
      </motion.div>

      {/* Establishments List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 space-y-4 relative z-10 mt-2 flex-1 animate-pulse-subtle"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Buscando estabelecimentos...</span>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((est) => (
            <motion.div
              key={est.id}
              onClick={() => handleSelectEstablishment(est)}
              whileHover={{ scale: 1.005 }}
              className="bg-[#131313] rounded-[24px] p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-transparent hover:border-zinc-850 cursor-pointer hover:bg-[#18181b] transition-all flex flex-col justify-between"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0 flex items-center justify-center p-0.5">
                  <img 
                    src={est.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150&h=150'} 
                    alt={est.nome} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150&h=150';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-[#fd9602] tracking-widest uppercase bg-[#fd9602]/10 px-1.5 py-0.5 rounded border border-[#fd9602]/20">
                      {est.tipo}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-[#fd9602] text-[#fd9602]" />
                      <span className="text-[10px] font-black text-white">{est.avaliacao ? Number(est.avaliacao).toFixed(1) : '5.0'}</span>
                    </div>
                  </div>
                  <h3 className="text-zinc-100 text-sm font-bold mt-1.5 truncate">
                    {est.nome}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1.5 text-zinc-500">
                    <MapPin className="w-3 h-3 flex-shrink-0 text-zinc-650" />
                    <span className="text-[10px] font-bold truncate tracking-wide">{est.endereco || 'São Paulo - SP'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center justify-between text-zinc-500">
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3 h-3 text-zinc-600" />
                  <span className="text-[9px] font-black tracking-wider uppercase">{est.telefone || '(11) 99999-9999'}</span>
                </div>
                <span className="text-[9px] font-black text-white tracking-widest uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded border border-transparent hover:border-zinc-700">
                  Serviços <span className="text-[#fd9602]">&rarr;</span>
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
              <Building2 className="w-6 h-6 text-zinc-650" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-semibold">Nenhum estabelecimento encontrado.</p>
              <p className="text-zinc-600 text-xs mt-1">Tente pesquisar por outro termo ou limpe a pesquisa.</p>
            </div>
          </div>
        )}
      </motion.div>

      <TabBar activeTab="booking" />
    </div>
  );
};

export default ExploreScreen;
