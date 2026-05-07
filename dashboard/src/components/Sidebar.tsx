"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Scissors,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  { icon: Calendar, label: "Agenda", href: "/dashboard/appointments" },
  { icon: Sparkles, label: "Serviços", href: "/dashboard/services" },
  { icon: Users, label: "Clientes", href: "/dashboard/customers" },
  { icon: BarChart3, label: "Financeiro", href: "/dashboard/finance" },
  { icon: Bell, label: "Notificações", href: "/dashboard/notifications" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const [estabInfo, setEstabInfo] = useState({ nome: 'Carregando...', logo_url: '' });

  useEffect(() => {
    const fetchEstabInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('estabelecimentos').select('nome, logo_url').eq('proprietario_id', user.id).single();
        if (error) console.error("Sidebar Fetch Error:", error.message, error.hint, error.details);
        if (data) {
          setEstabInfo(data);
        }
      }
    };
    
    fetchEstabInfo();
    window.addEventListener('profileUpdated', fetchEstabInfo);
    return () => window.removeEventListener('profileUpdated', fetchEstabInfo);
  }, []);
  return (
    <aside className="force-dark w-64 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-subtle transition-all duration-500 ease-in-out bg-zinc-950/70 backdrop-blur-xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: '#fd9602' }} className="p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Scissors className="text-zinc-950 w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            Agendei<span style={{ color: '#fd9602' }}>.</span>
          </h1>
        </div>

      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-[#fd9602]/10 text-[#fd9602]"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
              )}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "scale-110" : "text-zinc-500 group-hover:scale-110"
                )} style={isActive ? { color: '#fd9602' } : {}} />
                <span className="font-semibold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && (
                <ChevronRight style={{ color: '#fd9602' }} className="w-4 h-4 relative z-10 animate-in fade-in slide-in-from-left-2 duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-100/10 dark:border-zinc-900/50">
        <div className="flex items-center gap-3 p-3 mb-4 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-100/10 dark:border-zinc-900/50 hover:border-[#fd9602]/30 transition-all duration-300">
          {estabInfo.logo_url ? (
            <img src={estabInfo.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-950 font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]" style={{ background: 'linear-gradient(135deg, #fd9602, #fbbf24)' }}>
              {estabInfo.nome !== 'Carregando...' ? estabInfo.nome.substring(0, 2).toUpperCase() : 'ML'}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate">{estabInfo.nome}</span>
            <span className="text-[9px] text-zinc-500 truncate uppercase tracking-widest font-bold">Admin / Demo</span>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-300 group">
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm tracking-tight">Sair do Painel</span>
        </button>
      </div>
    </aside>
  );
}
