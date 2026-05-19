import React from 'react'
import { motion } from 'framer-motion'
import { X, User, Camera } from 'lucide-react'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
]

interface ManagerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  onUserNameChange: (val: string) => void
  managerAvatar: string
  onManagerAvatarChange: (val: string) => void
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => void
  onSave: () => void
}

export const ManagerDetailsModal: React.FC<ManagerDetailsModalProps> = ({
  isOpen,
  onClose,
  userName,
  onUserNameChange,
  managerAvatar,
  onManagerAvatarChange,
  onImageSelect,
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
            <User className="w-4 h-4 text-[#fd9602]" /> Detalhes do Gerente
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Preset Avatars Selector */}
          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Foto do Gerente (Avatar)</label>
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex items-center gap-4">
                {managerAvatar ? (
                  <img src={managerAvatar} alt="Avatar Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#fd9602] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#fd9602]/10 border-2 border-dashed border-[#fd9602]/30 flex items-center justify-center text-[#fd9602] shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Link da imagem..."
                    value={managerAvatar || ''}
                    onChange={e => onManagerAvatarChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#fd9602]"
                  />
                </div>
              </div>
              
              <label className="bg-zinc-950 hover:bg-zinc-800 border border-white/5 rounded-2xl py-3 px-4 text-center text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-sm">
                <Camera className="w-4 h-4 text-[#fd9602]" /> Importar Foto da Galeria
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => onImageSelect(e, 'avatar')}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-6 gap-2 pt-1">
              {PRESET_AVATARS.map((url, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => onManagerAvatarChange(url)}
                  className={`rounded-full overflow-hidden h-9 w-9 border-2 mx-auto ${managerAvatar === url ? 'border-[#fd9602] scale-105' : 'border-transparent'}`}
                >
                  <img src={url} alt={`Avatar Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Nome do Gerente</label>
            <input 
              type="text" 
              value={userName}
              onChange={e => onUserNameChange(e.target.value)}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#fd9602]"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={onSave}
              className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
