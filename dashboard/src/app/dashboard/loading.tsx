"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-[#fd9602]/10 border-t-[#fd9602]"
          />
          
          {/* Inner Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-[#fd9602] p-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              <Scissors className="text-zinc-950 w-8 h-8" />
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white tracking-tighter"
          >
            Agendei<span className="text-[#fd9602]">.</span>
          </motion.h2>
          <div className="w-40 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-[#fd9602]"
            />
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Carregando Experiência</p>
        </div>
      </div>
    </div>
  );
}
