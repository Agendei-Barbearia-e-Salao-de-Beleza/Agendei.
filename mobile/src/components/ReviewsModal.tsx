import React from 'react'
import { motion } from 'framer-motion'
import { X, Star } from 'lucide-react'

interface Review {
  id: string
  customer: string
  rating: number
  comment: string
  date: string
  media?: string
}

interface ReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  reviews: Review[]
  theme?: 'light' | 'dark'
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  reviews,
  theme = 'dark'
}) => {
  if (!isOpen) return null

  // Calculate average rating dynamically
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 38, stiffness: 380 }}
        className="w-full max-w-md border-t ios-sheet p-6 relative z-10 h-[80vh] flex flex-col transition-colors bg-zinc-900 border-white/10 text-white"
      >
        {/* Drag Indicator */}
        <div 
          className={`w-12 h-1.5 rounded-full mx-auto mb-5 shrink-0 cursor-pointer transition-colors ${
            theme === 'light' ? 'bg-zinc-300 hover:bg-zinc-400' : 'bg-zinc-700/60 hover:bg-zinc-600'
          }`} 
          onClick={onClose} 
        />
        
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-base font-black flex items-center gap-2 text-white">
            <Star className="w-4 h-4 text-[#fd9602] fill-[#fd9602]/20" /> Avaliações & Feedback
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full border transition-all text-zinc-500 hover:text-zinc-300 bg-zinc-950 border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="border p-4 rounded-2xl flex items-center justify-between shrink-0 transition-colors bg-zinc-900/50 border-white/5">
            <div>
              <span className="text-3xl font-black text-white">{averageRating}</span>
              <span className="text-xs text-zinc-400 block mt-0.5">Média de {reviews.length} avaliações</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-4.5 h-4.5 text-[#fd9602] fill-[#fd9602]" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">Nenhuma avaliação registrada ainda.</p>
            ) : (
              reviews.map(r => (
                <div 
                  key={r.id}
                  className="border p-4 rounded-2xl space-y-2.5 transition-colors bg-zinc-900/30 border-white/5 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold block text-zinc-200">{r.customer}</span>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${
                            star <= r.rating 
                              ? 'text-[#fd9602] fill-[#fd9602]' 
                              : theme === 'light' ? 'text-zinc-300' : 'text-zinc-700'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-zinc-300">{r.comment}</p>
                  
                  {r.media && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border mt-2 border-white/5">
                      <img 
                        src={r.media} 
                        alt="Media anexo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
