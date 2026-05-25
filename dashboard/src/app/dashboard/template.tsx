"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3 
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
