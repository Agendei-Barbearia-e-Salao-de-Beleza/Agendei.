"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Calendar, 
    Users, 
    BarChart3, 
    Bell,
    Settings, 
    LogOut, 
    Scissors,
    ChevronRight,
    Sun,
    Moon,
    Sparkles
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-subtle transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-1.5 rounded-lg shadow-lg shadow-amber-500/20">
            <Scissors className="text-zinc-950 w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-title tracking-tighter">
            Agendei<span className="text-amber-500">.</span>
          </h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 light:bg-zinc-200 light:hover:bg-zinc-300 light:text-zinc-600 transition-all active:scale-90 shadow-sm"
          title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-amber-500/10 text-amber-500 shadow-sm" 
                  : "text-zinc-500 hover:text-title hover:bg-zinc-900/50 light:hover:bg-zinc-200"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-amber-500" : "text-zinc-500 group-hover:text-amber-500/70")} />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-subtle">
        <div className="flex items-center gap-3 p-2 mb-4 bg-zinc-900/30 light:bg-zinc-200/50 rounded-xl border border-subtle">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-lg">
            ML
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-title truncate text-white light:text-zinc-950">Matheus Lucindo</span>
            <span className="text-[10px] text-zinc-500 truncate uppercase tracking-widest font-bold">Admin / Demo</span>
          </div>
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group">
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold text-sm">Sair do Painel</span>
        </button>
      </div>
    </aside>
  );
}
