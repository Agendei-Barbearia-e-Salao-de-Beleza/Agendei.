import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Sparkles, Eye, Check, X, Camera, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SelectServiceScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingServiceDetail, setViewingServiceDetail] = useState<any | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
        const estId = currentState?.establishmentId;
        const category = currentState?.category;
        
        let query = supabase.from('servicos').select('*');
        if (estId) {
          query = query.eq('estabelecimento_id', estId);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        const filterByCategory = (list: any[], cat: string) => {
          const lowerCat = cat.toLowerCase();
          return list.filter(s => {
            const nameMatch = s.nome ? s.nome.toLowerCase().includes(lowerCat) : false;
            const catMatch = s.categoria ? s.categoria.toLowerCase().includes(lowerCat) : false;
            
            let keywordMatch = false;
            const serviceName = (s.nome || '').toLowerCase();
            if (lowerCat.includes('cabelo')) {
              keywordMatch = serviceName.includes('corte') || serviceName.includes('selagem') || serviceName.includes('penteado');
            } else if (lowerCat.includes('barba')) {
              keywordMatch = serviceName.includes('barba');
            } else if (lowerCat.includes('combo')) {
              keywordMatch = serviceName.includes('combo') || serviceName.includes('pacote');
            }
            return nameMatch || catMatch || keywordMatch;
          });
        };
        
        if (data && data.length > 0) {
          const filteredData = category ? filterByCategory(data, category) : data;
          const displayData = filteredData.length > 0 ? filteredData : data;

          setServices(displayData.map(s => ({
            id: s.id,
            title: s.nome || 'Serviço',
            time: s.duracao_minutos ? `${s.duracao_minutos} min` : '30 min',
            price: s.preco ? `R$ ${Number(s.preco).toFixed(2).replace('.', ',')}` : 'R$ 35,00',
            rawPrice: s.preco,
            description: s.descricao || 'Sem descrição cadastrada.',
            image_url: s.imagem_url || ''
          })));
        } else {
          throw new Error("Sem serviços cadastrados no Supabase");
        }
      } catch (err) {
        console.log("Fallback para mock services", err);
        const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
        const category = currentState?.category;
        
        const mockList = [
          { 
            id: '1', 
            title: 'Corte Degradê', 
            time: '30 min', 
            price: 'R$ 40,00', 
            rawPrice: 40.00,
            description: 'O clássico corte degradê feito na máquina e tesoura, com finalização premium, pomada modeladora e alinhamento milimétrico.',
            image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300&h=300'
          },
          { 
            id: '2', 
            title: 'Barba Terapia', 
            time: '25 min', 
            price: 'R$ 30,00', 
            rawPrice: 30.00,
            description: 'Modelagem completa da barba com toalha quente, óleos essenciais, massagem facial e navalha higienizada para um acabamento perfeito.',
            image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300&h=300'
          },
          { 
            id: '3', 
            title: 'Combo Cabelo + Barba', 
            time: '50 min', 
            price: 'R$ 65,00', 
            rawPrice: 65.00,
            description: 'O combo ideal! Corte de cabelo moderno mais barba terapia completa. Economize tempo e dinheiro cuidando do seu visual por inteiro.',
            image_url: 'https://images.unsplash.com/photo-1599351431247-f5094087e882?auto=format&fit=crop&q=80&w=300&h=300'
          },
          { 
            id: '4', 
            title: 'Sobrancelha Navalha', 
            time: '15 min', 
            price: 'R$ 15,00', 
            rawPrice: 15.00,
            description: 'Design e alinhamento de sobrancelha feito com precisão cirúrgica na navalha, limpando o excesso e realçando o olhar.',
            image_url: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=300&h=300'
          },
          { 
            id: '5', 
            title: 'Selagem Térmica', 
            time: '60 min', 
            price: 'R$ 80,00', 
            rawPrice: 80.00,
            description: 'Tratamento de redução de volume e alinhamento dos fios com queratina e aminoácidos, proporcionando brilho extremo e controle de frizz.',
            image_url: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?auto=format&fit=crop&q=80&w=300&h=300'
          },
          { 
            id: '6', 
            title: 'Penteado Clássico', 
            time: '20 min', 
            price: 'R$ 25,00', 
            rawPrice: 25.00,
            description: 'Finalização impecável para eventos especiais. Lavagem, escovação e aplicação de fixadores importados para manter o penteado perfeito.',
            image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300&h=300'
          }
        ];

        if (category) {
          const lowerCat = category.toLowerCase();
          const filteredMocks = mockList.filter(s => {
            const name = s.title.toLowerCase();
            if (lowerCat.includes('cabelo')) {
              return name.includes('corte') || name.includes('selagem') || name.includes('penteado');
            } else if (lowerCat.includes('barba')) {
              return name.includes('barba');
            } else if (lowerCat.includes('combo')) {
              return name.includes('combo') || name.includes('pacote');
            }
            return true;
          });
          setServices(filteredMocks.length > 0 ? filteredMocks : mockList);
        } else {
          setServices(mockList);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [location.state]);

  const handleOpenDetail = (service: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewingServiceDetail(service);
    setActiveImageIdx(0);
  };

  const getServiceThumb = (service: any) => {
    if (!service) return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=150&h=150';
    if (service.image_url) {
      const imgs = service.image_url.split('||').filter(Boolean);
      if (imgs.length > 0) return imgs[0];
    }
    // Fallbacks
    const title = (service.title || '').toLowerCase();
    if (title.includes('corte') || title.includes('cabelo')) {
      return 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=150&h=150';
    } else if (title.includes('barba')) {
      return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150&h=150';
    } else if (title.includes('combo')) {
      return 'https://images.unsplash.com/photo-1599351431247-f5094087e882?auto=format&fit=crop&q=80&w=150&h=150';
    }
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=150&h=150';
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28 transition-colors duration-300">
      <Header />

      {/* Back Button */}
      <div className="relative z-10 px-6 mt-28 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">Voltar</span>
        </button>
      </div>

      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-8 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full">Passo 2 de 4</span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8 dark:text-white">
          Escolha o Serviço Ideal
        </h2>
        {location.state?.category && (
          <p className="text-zinc-500 text-xs font-semibold text-center flex items-center justify-center gap-1">
            Filtrado por: <span className="text-[#fd9602] font-black">{location.state.category}</span>
          </p>
        )}
      </motion.div>

      {/* Service List */}
      <div className="flex-1 px-6 relative z-10 max-w-md mx-auto w-full mb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Carregando serviços...</span>
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-4 animate-pulse-subtle">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              const thumbUrl = getServiceThumb(service);
              return (
                <motion.div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  whileHover={{ scale: 1.005 }}
                  className={`rounded-2xl p-3.5 flex space-x-4 shadow-md border cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-zinc-950 border-[#fd9602] shadow-[0_4px_25px_rgba(253,150,2,0.12)]' 
                      : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-950/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Service Image Block */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-950 border border-zinc-800 relative shadow-inner">
                    <img 
                      src={thumbUrl} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>

                  {/* Service Info details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-100 text-xs font-black truncate uppercase tracking-wide leading-tight dark:text-white">
                          {service.title}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#fd9602] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-zinc-950" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-550 text-[10px] line-clamp-2 mt-1 leading-normal font-medium">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/20">
                      <div className="flex items-center space-x-1.5 text-zinc-500">
                        <Clock className="w-3 h-3" strokeWidth={2.5} />
                        <span className="text-[9px] uppercase tracking-widest font-black">{service.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleOpenDetail(service, e)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-[#fd9602]/15 text-zinc-400 hover:text-[#fd9602] transition-colors flex items-center gap-1 text-[8px] font-black uppercase tracking-widest border border-transparent hover:border-[#fd9602]/20"
                        >
                          <Eye className="w-3 h-3" /> Info
                        </button>
                        <span className="text-[#fd9602] font-black text-[11px] tracking-wider font-mono">
                          {service.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
              <Sparkles className="w-6 h-6 text-zinc-650" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-semibold">Nenhum serviço disponível.</p>
              <p className="text-zinc-600 text-xs mt-1">Este estabelecimento não possui serviços vinculados a esta categoria.</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6 relative z-10"
        >
          <motion.button
            onClick={() => {
              const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
              const nextState = { ...currentState, service: selectedService };
              sessionStorage.setItem('agendei_booking_state', JSON.stringify(nextState));
              navigate('/select-date', { state: nextState });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-[260px] py-3.5 bg-[#fd9602] text-zinc-950 font-black text-[11px] rounded-xl shadow-[0_0_15px_rgba(253,150,2,0.2)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Escolher Data</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />

      {/* Premium Detail Overlay Modal */}
      <AnimatePresence>
        {viewingServiceDetail && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 bg-black/70 backdrop-blur-md">
            {/* Modal Closer Background */}
            <div className="absolute inset-0" onClick={() => setViewingServiceDetail(null)} />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-zinc-900 rounded-t-[30px] border-t border-zinc-800/80 shadow-2xl p-6 relative z-10 max-h-[85vh] overflow-y-auto pb-10"
            >
              {/* Header drag line */}
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-4" />
              
              <button 
                onClick={() => setViewingServiceDetail(null)}
                className="absolute top-4 right-4 p-2 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                {/* Images Slider Block */}
                <div className="w-full h-56 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative">
                  {viewingServiceDetail.image_url ? (
                    (() => {
                      const imgs = viewingServiceDetail.image_url.split('||').filter(Boolean);
                      const currentImg = imgs[activeImageIdx] || imgs[0];
                      return (
                        <>
                          <img 
                            src={currentImg} 
                            alt={viewingServiceDetail.title} 
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                          {imgs.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-20">
                              {imgs.map((_: any, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveImageIdx(idx)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    activeImageIdx === idx ? 'bg-[#fd9602] w-5' : 'bg-white/40'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <Camera className="w-10 h-10 text-zinc-700" />
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Sem fotos adicionais</span>
                    </div>
                  )}
                </div>

                {/* Service Details info */}
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                    {viewingServiceDetail.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-[#fd9602]" strokeWidth={2.5} />
                      <span className="text-xs font-bold">{viewingServiceDetail.time} de duração</span>
                    </div>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[#fd9602] font-mono text-base font-black">
                      {viewingServiceDetail.price}
                    </span>
                  </div>
                </div>

                {/* Description Text */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sobre o Serviço</span>
                  <p className="text-zinc-400 text-xs font-semibold leading-relaxed bg-zinc-950/10 p-4 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {viewingServiceDetail.description}
                  </p>
                </div>

                {/* Select button directly from Modal */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setViewingServiceDetail(null)}
                    className="flex-1 py-3.5 bg-zinc-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedService(viewingServiceDetail);
                      setViewingServiceDetail(null);
                    }}
                    className="flex-1 py-3.5 bg-[#fd9602] text-zinc-950 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#e08500] transition-colors shadow-lg shadow-[#fd9602]/20 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                    Selecionar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectServiceScreen;
