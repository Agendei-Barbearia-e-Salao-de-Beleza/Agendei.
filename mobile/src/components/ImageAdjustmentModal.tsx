import React from 'react'
import { motion } from 'framer-motion'
import { X, Camera } from 'lucide-react'

interface ImageAdjustmentModalProps {
  imageToAdjust: string | null
  adjustType: 'avatar' | 'banner'
  zoom: number
  onZoomChange: (val: number) => void
  rotation: number
  onRotationChange: (val: number) => void
  onClose: () => void
  onConfirm: () => void
}

export const ImageAdjustmentModal: React.FC<ImageAdjustmentModalProps> = ({
  imageToAdjust,
  adjustType,
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
  onClose,
  onConfirm
}) => {
  if (!imageToAdjust) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#fd9602]" /> Ajustar Imagem
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Frame preview (Circle for profile, Rectangle for Banner) */}
        <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-white/5 p-4 rounded-3xl">
          <div 
            className={`overflow-hidden border-2 border-dashed border-white/20 bg-zinc-950 flex items-center justify-center relative ${
              adjustType === 'avatar' 
                ? 'w-[200px] h-[200px] rounded-full' 
                : 'w-[280px] h-[140px] rounded-2xl'
            }`}
          >
            <img 
              src={imageToAdjust} 
              alt="Adjustment Preview" 
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`, 
                transition: 'transform 0.05s ease-out' 
              }}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">
            Visualização da foto {adjustType === 'avatar' ? 'de Perfil' : 'do Estabelecimento'}
          </p>
        </div>

        {/* Slider Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 font-bold">Zoom (Escala): {zoom.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.05"
              value={zoom}
              onChange={e => onZoomChange(parseFloat(e.target.value))}
              className="w-full accent-[#fd9602]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 font-bold">Girar (Rotação): {rotation}°</span>
            </div>
            <input 
              type="range" 
              min="-180" 
              max="180" 
              step="1"
              value={rotation}
              onChange={e => onRotationChange(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-400 font-bold py-3.5 rounded-2xl text-xs active:scale-95 transition-transform"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3.5 rounded-2xl text-xs active:scale-95 transition-transform shadow-lg shadow-emerald-500/10"
          >
            Confirmar e Aplicar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
