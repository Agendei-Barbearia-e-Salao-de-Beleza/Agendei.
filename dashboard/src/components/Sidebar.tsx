"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  DollarSign, 
  Settings, 
  Bell, 
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Agenda", href: "/dashboard/appointments" },
  { icon: Scissors, label: "Serviços", href: "/dashboard/services" },
  { icon: Users, label: "Clientes", href: "/dashboard/customers" },
  { icon: DollarSign, label: "Financeiro", href: "/dashboard/finance" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible only on lg+) */}
      <aside className="hidden lg:flex w-72 flex-col bg-card border-r border-subtle h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Scissors className="text-zinc-950 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-title italic">Agendei.</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                  pathname === item.href 
                    ? "bg-accent text-zinc-950 shadow-lg shadow-accent/10" 
                    : "text-zinc-500 hover:bg-zinc-500/5 hover:text-title"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  pathname === item.href ? "text-zinc-950" : "text-zinc-500 group-hover:text-accent"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-500/5 hover:text-title transition-all"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
              pathname === "/dashboard/settings" ? "bg-zinc-500/10 text-title" : "text-zinc-500 hover:bg-zinc-500/5 hover:text-title"
            )}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
          
          <div className="pt-4 border-t border-subtle">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center font-bold text-zinc-500">
                ML
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-title truncate">Matheus Lucindo</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Dono</p>
              </div>
              <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (Visible only on sm/md) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-subtle px-6 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === item.href ? "text-accent" : "text-zinc-500"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            pathname === "/dashboard/settings" ? "text-accent" : "text-zinc-500"
          )}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Ajustes</span>
        </Link>
      </nav>
    </>
  );
}
