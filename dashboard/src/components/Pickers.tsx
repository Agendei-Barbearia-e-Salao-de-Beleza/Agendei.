"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
  label?: string;
}

export function CustomDatePicker({ date, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedDate = date ? new Date(date + 'T00:00:00') : new Date();

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if the click wasn't inside the portal content
        const portalContent = document.getElementById('picker-portal-content');
        if (portalContent && portalContent.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl p-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className="text-zinc-500 group-hover:text-[#fd9602] transition-colors" />
          <span>{format(selectedDate, "dd/MM/yyyy")}</span>
        </div>
        <ChevronDown size={16} className={cn("text-zinc-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="picker-portal-content"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: coords.top + 8,
                left: coords.left + coords.width - 320, // Align right with button
                zIndex: 9999
              }}
              className="p-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[320px]"
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    onChange(format(d, "yyyy-MM-dd"));
                    setIsOpen(false);
                  }
                }}
                locale={ptBR}
                className="rdp-custom m-0"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

interface TimePickerProps {
  time: string;
  onChange: (time: string) => void;
}

export function CustomTimePicker({ time, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const hours = Array.from({ length: 15 }, (_, i) => (i + 8).toString().padStart(2, '0'));
  const minutes = ["00", "15", "30", "45"];

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalContent = document.getElementById('time-portal-content');
        if (portalContent && portalContent.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-subtle dark:border-zinc-700 rounded-2xl p-4 text-title dark:text-white outline-none focus:ring-2 focus:ring-[#fd9602]/20 font-bold flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-zinc-500 group-hover:text-[#fd9602] transition-colors" />
          <span>{time}</span>
        </div>
        <ChevronDown size={16} className={cn("text-zinc-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="time-portal-content"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: coords.top + 8,
                left: coords.left + coords.width - 300,
                zIndex: 9999
              }}
              className="p-6 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[300px]"
            >
              <div className="space-y-4">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Selecionar Horário</div>
                <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {hours.map(h => (
                    <React.Fragment key={h}>
                      {minutes.map(m => {
                        const t = `${h}:${m}`;
                        const isSelected = time === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              onChange(t);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold transition-all",
                              isSelected 
                                ? "bg-[#fd9602] text-zinc-950 shadow-lg shadow-[#fd9602]/20" 
                                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
