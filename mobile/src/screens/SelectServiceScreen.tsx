import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
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
            
            // Map Cabelo to "Corte", "Selagem", "Penteado"; Barba to "Barba"; Combos to "Combo"
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
          // Filter dynamically by category if present safely
          const filteredData = category ? filterByCategory(data, category) : data;
          const displayData = filteredData.length > 0 ? filteredData : data;

          setServices(displayData.map(s => ({
            id: s.id,
            title: s.nome || 'Serviço',
            time: s.duracao_minutos ? `${s.duracao_minutos} min` : '30 min',
            price: s.preco ? `R$ ${Number(s.preco).toFixed(2).replace('.', ',')}` : 'R$ 35,00',
            rawPrice: s.preco
          })));
        } else {
          throw new Error("Sem serviços cadastrados no Supabase");
        }
      } catch (err) {
        console.log("Fallback para mock services", err);
        const category = location.state?.category;
        
        const mockList = [
          { id: '1', title: 'Corte Degradê', time: '30 min', price: 'R$ 40,00', rawPrice: 40.00 },
          { id: '2', title: 'Barba Terapia', time: '25 min', price: 'R$ 30,00', rawPrice: 30.00 },
          { id: '3', title: 'Combo Cabelo + Barba', time: '50 min', price: 'R$ 65,00', rawPrice: 65.00 },
          { id: '4', title: 'Sobrancelha Navalha', time: '15 min', price: 'R$ 15,00', rawPrice: 15.00 },
          { id: '5', title: 'Selagem Térmica', time: '60 min', price: 'R$ 80,00', rawPrice: 80.00 },
          { id: '6', title: 'Penteado Clássico', time: '20 min', price: 'R$ 25,00', rawPrice: 25.00 }
        ];

        // Intelligently filter mock services if category is selected
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-8 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full">Passo 2 de 4</span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8">
          Escolha o Serviço Ideal
        </h2>
        {location.state?.category && (
          <p className="text-zinc-500 text-xs font-semibold text-center flex items-center justify-center gap-1">
            Filtrado por: <span className="text-[#fd9602] font-black">{location.state.category}</span>
          </p>
        )}
      </motion.div>

      {/* Service Grid */}
      <div className="flex-1 px-6 relative z-10 max-w-md mx-auto w-full mb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Carregando serviços...</span>
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 animate-pulse-subtle">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <motion.div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-[1.5rem] p-4.5 flex flex-col justify-between h-[140px] shadow-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#fd9602]/10 border-[#fd9602] shadow-[0_0_20px_rgba(253,150,2,0.25)]' 
                      : 'bg-[#0c0c0e]/60 border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700/85'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-zinc-100 text-sm font-black leading-tight line-clamp-2 uppercase tracking-wide">
                      {service.title}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2 mt-auto">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-550" strokeWidth={2.5} />
                      <span className="text-zinc-500 text-[11px] font-bold">{service.time}</span>
                    </div>
                    <span className="text-[#fd9602] font-black text-sm tracking-wider">
                      {service.price}
                    </span>
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
            className="w-full max-w-[260px] py-4 bg-[#fd9602] text-zinc-950 font-black text-[15px] rounded-2xl shadow-[0_0_20px_rgba(253,150,2,0.4)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Escolher Data</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SelectServiceScreen;
