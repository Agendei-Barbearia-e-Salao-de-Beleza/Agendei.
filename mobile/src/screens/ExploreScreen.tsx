import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Phone, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const { data, error } = await supabase
          .from('estabelecimentos')
          .select('*')
          .order('nome', { ascending: true });
          
        if (error) throw error;
        setEstablishments(data || []);
      } catch (err) {
        console.error('Erro ao buscar estabelecimentos:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstablishments();
  }, []);

  const filtered = establishments.filter(est => 
    est.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (est.endereco && est.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden pb-28">
      {/* Background radial glowing ambient light */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.15),transparent_65%)] pointer-events-none z-0" />
      
      <Header />

      {/* Title & Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 pb-4 relative z-10"
      >
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Escolha um Estabelecimento</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input 
            type="text" 
            placeholder="Pesquise por nome ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/60 text-white border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-500 font-medium"
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
              onClick={() => navigate('/select-category', { state: { establishmentId: est.id, establishment: est } })}
              whileHover={{ scale: 1.01 }}
              className="bg-[#0c0c0e]/60 backdrop-blur-xl rounded-[1.5rem] p-5 shadow-xl border border-zinc-800/80 cursor-pointer hover:bg-zinc-900/20 active:scale-98 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={est.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150&h=150'} 
                    alt={est.nome} 
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150&h=150';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#fd9602] tracking-wider uppercase bg-[#fd9602]/10 px-2 py-0.5 rounded border border-[#fd9602]/25">
                      {est.tipo || 'BARBEARIA'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#fd9602] text-[#fd9602]" />
                      <span className="text-xs font-black text-white">{est.avaliacao ? Number(est.avaliacao).toFixed(1) : '5.0'}</span>
                    </div>
                  </div>
                  <h3 className="text-zinc-100 text-lg font-bold mt-1.5 truncate">
                    {est.nome}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-2 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-650" />
                    <span className="text-xs font-medium truncate">{est.endereco || 'São Paulo - SP'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-zinc-500">
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-650" />
                  <span className="text-xs font-semibold">{est.telefone || '(11) 99999-9999'}</span>
                </div>
                <span className="text-xs font-black text-[#fd9602] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                  Ver Serviços &rarr;
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
