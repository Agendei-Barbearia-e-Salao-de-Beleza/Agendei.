import React from 'react'
import { motion } from 'framer-motion'
import { X, Tag } from 'lucide-react'

interface ServiceFormData {
  id: string
  nome: string
  preco: string
  descricao: string
  imagem_url: string
  video_url: string
}

interface ServiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  serviceFormData: ServiceFormData
  onServiceFormDataChange: (updater: (prev: ServiceFormData) => ServiceFormData) => void
  onSubmit: (e: React.FormEvent) => void
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  serviceFormData,
  onServiceFormDataChange,
  onSubmit
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#fd9602]" /> 
            {serviceFormData.id ? 'Ajustar Serviço' : 'Novo Serviço'}
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1.5">Nome do Serviço</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Corte Degradê, Barboterapia..."
              value={serviceFormData.nome}
              onChange={e => onServiceFormDataChange(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1.5">Valor Unitário (R$)</label>
            <input 
              type="text" 
              required
              placeholder="0,00"
              value={serviceFormData.preco}
              onChange={e => onServiceFormDataChange(prev => ({ ...prev, preco: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1.5">Descrição do Serviço</label>
            <textarea 
              placeholder="Descreva o que está incluído no serviço..."
              value={serviceFormData.descricao}
              onChange={e => onServiceFormDataChange(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] text-zinc-200 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1.5">URL da Imagem Demonstrativa</label>
            <input 
              type="text" 
              placeholder="https://exemplo.com/imagem.jpg"
              value={serviceFormData.imagem_url}
              onChange={e => onServiceFormDataChange(prev => ({ ...prev, imagem_url: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1.5">URL do Vídeo Demonstrativo (YouTube/MP4)</label>
            <input 
              type="text" 
              placeholder="https://exemplo.com/video.mp4"
              value={serviceFormData.video_url}
              onChange={e => onServiceFormDataChange(prev => ({ ...prev, video_url: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] text-zinc-200"
            />
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6 shadow-lg shadow-[#fd9602]/10"
          >
            Salvar Serviço
          </button>
        </form>
      </motion.div>
    </div>
  )
}
