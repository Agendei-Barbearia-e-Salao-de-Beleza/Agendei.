import React from 'react'
import { motion } from 'framer-motion'
import { X, Tag } from 'lucide-react'

interface Service {
  id: string
  nome: string
  preco: number
  descricao?: string
  imagem_url?: string
  video_url?: string
}

interface CatalogPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  services: Service[]
}

export const CatalogPreviewModal: React.FC<CatalogPreviewModalProps> = ({
  isOpen,
  onClose,
  services
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[80vh] flex flex-col"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#fd9602]" /> Catálogo do Estabelecimento
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {services.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              Nenhum serviço cadastrado no catálogo.
            </div>
          ) : (
            services.map(s => (
              <div 
                key={s.id}
                className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden"
              >
                {s.imagem_url && (
                  <div className="h-32 w-full relative overflow-hidden">
                    <img 
                      src={s.imagem_url} 
                      alt={s.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-100">{s.nome}</h4>
                    <span className="text-xs font-black text-[#fd9602]">R$ {s.preco.toFixed(2)}</span>
                  </div>
                  
                  {s.descricao && (
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.descricao}</p>
                  )}
                  
                  {s.video_url && (
                    <a 
                      href={s.video_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#fd9602] hover:underline"
                    >
                      ▶ Ver Vídeo Demonstrativo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
