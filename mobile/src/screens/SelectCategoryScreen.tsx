import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Layers, ArrowRight, Crown, ChevronLeft } from 'lucide-react';
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
        
        let loadedCats = data || [];
        if (loadedCats.length === 0) {
          loadedCats = [
            { id: '1', nome: 'Cabelo' },
            { id: '2', nome: 'Barba' },
            { id: '3', nome: 'Combos' },
            { id: '4', nome: 'Planos' }
          ];
        } else {
          // Check if Planos is already in the loaded categories (case-insensitive)
          const hasPlanos = loadedCats.some(c => c.nome.toLowerCase().includes('plano'));
          if (!hasPlanos) {
            loadedCats.push({ id: '4', nome: 'Planos' });
          }
        }
        setCategories(loadedCats);
      } catch (err) {
        console.error('Erro ao buscar categorias, usando padrão:', err);
        setCategories([
          { id: '1', nome: 'Cabelo' },
          { id: '2', nome: 'Barba' },
          { id: '3', nome: 'Combos' },
          { id: '4', nome: 'Planos' }
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
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8 text-[#fd9602]"
        >
          <path d="M12 16.5c-2.5-3-5.5-3-8.5-2-1 .3-1.5-.5-1.5-1 0-1 2-3.5 6-3 2.5.3 3.5 2 4 3 .5-1 1.5-2.7 4-3 4-.5 6 2 6 3 0 .5-.5 1.3-1.5 1-3-1-6-1-8.5 2z" />
        </svg>
      );
    } else if (normalized.includes('combo') || normalized.includes('pacote')) {
      return <Layers className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
    } else if (normalized.includes('plano') || normalized.includes('plan')) {
      return <Crown className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
    }
    return <Sparkles className="w-8 h-8 text-[#fd9602]" strokeWidth={1.5} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Removed radial glowing light for minimal SaaS aesthetics */}
      
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
                  whileHover={{ scale: 1.01 }}
                  className={`rounded-xl p-4 flex flex-col items-center justify-center shadow-xl border cursor-pointer text-center transition-all ${
                    isSelected 
                      ? 'bg-zinc-950 border-[#fd9602] shadow-[0_0_15px_rgba(253,150,2,0.1)]' 
                      : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-950/80 hover:border-zinc-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-3 transition-transform duration-300 ${isSelected ? 'bg-[#fd9602]/10 scale-105 border border-[#fd9602]/20' : 'bg-zinc-950 border border-zinc-900'}`}>
                    {getCategoryIcon(cat.nome)}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-[#fd9602]' : 'text-zinc-300'}`}>{cat.nome}</span>
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
            className="w-full max-w-[260px] py-3.5 bg-[#fd9602] text-zinc-950 font-black text-[11px] rounded-xl shadow-[0_0_15px_rgba(253,150,2,0.2)] hover:bg-[#e08500] transition-all cursor-pointer tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>Avançar</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-950" strokeWidth={3} />
          </motion.button>
        </motion.div>
      )}

      <TabBar activeTab="booking" />
    </div>
  );
};

export default SelectCategoryScreen;
