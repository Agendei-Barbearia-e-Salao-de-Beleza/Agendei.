import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Tag, Search, Plus, Trash2 } from 'lucide-react'

interface Service {
  id: string
  nome: string
  preco: number
  descricao?: string
  imagem_url?: string
  video_url?: string
}

interface ServiceListModalProps {
  isOpen: boolean
  onClose: () => void
  services: Service[]
  onNewClick: () => void
  onEditClick: (service: Service) => void
  onDeleteClick: (id: string) => void
}

export const ServiceListModal: React.FC<ServiceListModalProps> = ({
  isOpen,
  onClose,
  services,
  onNewClick,
  onEditClick,
  onDeleteClick
}) => {
  const [serviceSearch, setServiceSearch] = useState('')

  const filteredServices = useMemo(() => {
    return services.filter(s => 
      s.nome.toLowerCase().includes(serviceSearch.toLowerCase())
    )
  }, [services, serviceSearch])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[85vh] flex flex-col"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#fd9602]" /> Tabela de Serviços
          </h3>
          <button 
            onClick={onNewClick}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-950" /> Novo
          </button>
        </div>

        {/* Search box inside modal */}
        <div className="relative mb-4 shrink-0">
          <input 
            type="text"
            placeholder="Pesquisar serviço..."
            value={serviceSearch}
            onChange={e => setServiceSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#fd9602] text-zinc-200"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
        </div>

        {/* Services List Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-4">
          {filteredServices.length === 0 ? (
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-2xl text-center text-zinc-500 text-xs">
              Nenhum serviço cadastrado
            </div>
          ) : (
            filteredServices.map(s => (
              <div 
                key={s.id}
                className="bg-zinc-950 border border-white/5 p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-[#fd9602]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{s.nome}</h4>
                    <span className="text-[11px] font-extrabold text-[#fd9602]">R$ {s.preco.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => onEditClick(s)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onDeleteClick(s.id)}
                    className="p-1.5 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-650 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
