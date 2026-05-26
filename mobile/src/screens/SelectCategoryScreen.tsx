import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Smile, Layers, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const SelectCategoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync to sessionStorage
  useEffect(() => {
    if (location.state) {
      sessionStorage.setItem('agendei_booking_state', JSON.stringify(location.state));
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categorias').select('*');
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Erro ao buscar categorias, usando padrão:', err);
        setCategories([
          { id: '1', nome: 'Cabelo' },
          { id: '2', nome: 'Barba' },
          { id: '3', nome: 'Combos' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('cabelo') || normalized.includes('hair')) {
      return <Scissors className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
    } else if (normalized.includes('barba') || normalized.includes('beard') || normalized.includes('barber')) {
      return <Smile className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
    } else if (normalized.includes('combo') || normalized.includes('pacote')) {
      return <Layers className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
    }
    return <Sparkles className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Header Logo & Subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-2 mb-8 relative z-10"
      >
        <span className="text-[10px] font-black text-[#fd9602] uppercase tracking-widest bg-[#fd9602]/10 border border-[#fd9602]/20 px-3 py-1 rounded-full">Passo 1 de 4</span>
        <h2 className="text-zinc-100 text-[24px] font-black text-center tracking-tight px-8">
          O que deseja fazer hoje?
        </h2>
        <p className="text-zinc-500 text-xs font-semibold text-center">Selecione uma das especialidades abaixo.</p>
      </motion.div>

      {/* Category Buttons Grid */}
      <div className="flex-1 px-6 relative z-10 max-w-md mx-auto w-full mb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#fd9602] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-sm font-semibold">Carregando categorias...</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.nome;
              return (
                <motion.div
                  key={idx}
                  onClick={() => setSelectedCategory(cat.nome)}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-[1.5rem] p-5 flex flex-col items-center justify-center shadow-xl border cursor-pointer text-center transition-all ${
                    isSelected 
                      ? 'bg-[#fd9602]/10 border-[#fd9602] shadow-[0_0_25px_rgba(253,150,2,0.25)]' 
                      : 'bg-[#0c0c0e]/60 border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700/80'
                  }`}
                >
                  <div className={`p-3.5 rounded-2xl mb-4 transition-transform duration-300 ${isSelected ? 'bg-[#fd9602]/20 scale-110 shadow-lg shadow-[#fd9602]/10' : 'bg-zinc-950/60'}`}>
                    {getCategoryIcon(cat.nome)}
                  </div>
                  <span className="text-zinc-200 text-sm font-black uppercase tracking-wider">{cat.nome}</span>
                  <p className="text-zinc-500 text-[10px] font-semibold mt-1">Especialidades profissionais</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-zinc-650 font-semibold text-sm">Nenhuma categoria cadastrada.</span>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6 relative z-10"
        >
          <motion.button
            onClick={() => {
              const currentState = location.state || JSON.parse(sessionStorage.getItem('agendei_booking_state') || '{}');
              const nextState = { ...currentState, category: selectedCategory };
              sessionStorage.setItem('agendei_booking_state', JSON.stringify(nextState));
              navigate('/select-service', { state: nextState });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-[260px] py-4 bg-[#fd9602] text-zinc-950 font-black text-[15px] rounded-2xl shadow-[0_0_20px_rgba(253,150,2,0.4)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Avançar para Serviços</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SelectCategoryScreen;
