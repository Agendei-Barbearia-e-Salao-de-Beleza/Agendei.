"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';
import { getCroppedImg } from '@/lib/imageUtils';

interface ImageCropModalProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

export function ImageCropModal({ image, isOpen, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: any) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-900 w-full max-w-xl rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Ajustar Imagem</h3>
                <p className="text-zinc-500 text-sm">Arraste e dê zoom para enquadrar sua logo.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Cropper Area */}
            <div className="relative h-[400px] w-full bg-black">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteInternal}
                onZoomChange={onZoomChange}
              />
            </div>

            {/* Controls */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <ZoomOut size={18} className="text-zinc-500" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#fd9602] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <ZoomIn size={18} className="text-zinc-500" />
              </div>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all text-sm font-medium"
                >
                  <RotateCw size={16} />
                  Girar 90°
                </button>

                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="px-6 py-2.5 text-zinc-400 hover:text-white font-medium transition-colors">
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#fd9602] text-zinc-950 font-bold rounded-xl hover:bg-[#fd9602]/90 transition-all shadow-lg shadow-[#fd9602]/20"
                  >
                    <Check size={18} />
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
