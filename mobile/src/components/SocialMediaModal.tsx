import React from 'react'
import { motion } from 'framer-motion'
import { X, Link } from 'lucide-react'

interface SocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  establishmentData: {
    instagram_url: string
    facebook_url: string
    tiktok_url: string
  }
  onEstablishmentDataChange: (updater: (prev: any) => any) => void
  onSave: () => void
}

export const SocialMediaModal: React.FC<SocialMediaModalProps> = ({
  isOpen,
  onClose,
  establishmentData,
  onEstablishmentDataChange,
  onSave
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
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Link className="w-4 h-4 text-purple-500" /> Redes Sociais
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Link Instagram</label>
            <input 
              type="text" 
              placeholder="instagram.com/seu.salao"
              value={establishmentData.instagram_url || ''}
              onChange={e => onEstablishmentDataChange((prev: any) => ({ ...prev, instagram_url: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Link Facebook</label>
            <input 
              type="text" 
              placeholder="facebook.com/seu.salao"
              value={establishmentData.facebook_url || ''}
              onChange={e => onEstablishmentDataChange((prev: any) => ({ ...prev, facebook_url: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Link TikTok</label>
            <input 
              type="text" 
              placeholder="tiktok.com/@seu.salao"
              value={establishmentData.tiktok_url || ''}
              onChange={e => onEstablishmentDataChange((prev: any) => ({ ...prev, tiktok_url: e.target.value }))}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={onSave}
              className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm"
            >
              Salvar Links Sociais
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
