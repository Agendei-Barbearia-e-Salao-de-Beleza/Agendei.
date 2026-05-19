import React from 'react'
import { motion } from 'framer-motion'
import { X, Briefcase, Image } from 'lucide-react'
import { toast } from 'sonner'

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605497746444-ac9da58d7bfc?w=600&auto=format&fit=crop&q=80'
]

interface BusinessDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  establishmentLogo: string
  onEstablishmentLogoChange: (val: string) => void
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => void
  establishmentData: {
    nome: string
    telefone: string
    whatsapp_url: string
    endereco: string
  }
  onEstablishmentDataChange: (updater: (prev: any) => any) => void
  onSave: () => void
}

// Phone Masking helper inside component to keep it independent
const formatBrazilianPhone = (value: string) => {
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 10) {
    return clean
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return clean
    .substring(0, 11)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  isOpen,
  onClose,
  establishmentLogo,
  onEstablishmentLogoChange,
  onImageSelect,
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
        className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[85vh] flex flex-col"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" /> Detalhes do Negócio
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
          {/* Preset Banner Selector */}
          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Foto de Capa do Salão</label>
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex items-center gap-4">
                {establishmentLogo ? (
                  <img src={establishmentLogo} alt="Logo Preview" className="w-20 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-20 h-12 rounded-xl bg-zinc-950 border border-dashed border-white/10 flex items-center justify-center text-zinc-650 shrink-0">
                    <Image className="w-4 h-4 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Link do banner..."
                    value={establishmentLogo || ''}
                    onChange={e => onEstablishmentLogoChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="bg-zinc-950 hover:bg-zinc-800 border border-white/5 rounded-2xl py-3 px-4 text-center text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-sm">
                <Image className="w-4 h-4 text-blue-500" /> Importar Banner da Galeria
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => onImageSelect(e, 'banner')}
                />
              </label>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {PRESET_LOGOS.map((url, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => onEstablishmentLogoChange(url)}
                  className={`rounded-xl overflow-hidden h-9 w-full border-2 ${establishmentLogo === url ? 'border-blue-500 scale-105' : 'border-transparent'}`}
                >
                  <img src={url} alt={`Logo Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: All ordered vertically (one below the other) */}
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Nome Comercial</label>
              <input 
                type="text" 
                value={establishmentData.nome}
                onChange={e => onEstablishmentDataChange((prev: any) => ({ ...prev, nome: e.target.value }))}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Telefone Comercial</label>
              <input 
                type="text" 
                placeholder="(11) 99999-9999"
                value={establishmentData.telefone}
                onChange={e => {
                  const masked = formatBrazilianPhone(e.target.value)
                  onEstablishmentDataChange((prev: any) => ({ ...prev, telefone: masked }))
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#fd9602]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">WhatsApp Comercial</label>
              <input 
                type="text" 
                placeholder="(11) 99999-9999"
                value={establishmentData.whatsapp_url}
                onChange={e => {
                  const masked = formatBrazilianPhone(e.target.value)
                  onEstablishmentDataChange((prev: any) => ({ ...prev, whatsapp_url: masked }))
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#fd9602]"
              />
            </div>

            {/* CEP Field */}
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">CEP</label>
              <input 
                type="text" 
                maxLength={9}
                placeholder="00000-000"
                onChange={async (e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length === 8) {
                    try {
                      const res = await fetch(`https://viacep.com.br/ws/${val}/json/`)
                      const data = await res.json()
                      if (!data.erro) {
                        const fullAddr = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
                        onEstablishmentDataChange((prev: any) => ({ ...prev, endereco: fullAddr }))
                        toast.success('Endereço auto-completado!')
                      } else {
                        toast.error('CEP não encontrado.')
                      }
                    } catch (err) {
                      toast.error('Erro ao buscar CEP.')
                    }
                  }
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#fd9602]"
              />
            </div>

            {/* Endereco Comercial - Placed strictly under CEP */}
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Endereço Comercial</label>
              <input 
                type="text" 
                value={establishmentData.endereco}
                onChange={e => onEstablishmentDataChange((prev: any) => ({ ...prev, endereco: e.target.value }))}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#fd9602]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={onSave}
              className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm"
            >
              Salvar Dados do Negócio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
