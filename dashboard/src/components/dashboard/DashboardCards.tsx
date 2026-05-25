import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/Tooltip";

interface StatItem {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
  trend: string;
  href: string;
}

interface DashboardCardsProps {
  stats: StatItem[];
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Tooltip key={stat.label} text={`Ir para ${stat.label}`}>
          <Link href={stat.href} className="block">
            <motion.div 
              whileHover={{ y: -6, borderColor: "rgba(245, 158, 11, 0.4)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="glass-card p-6 rounded-2xl w-full cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Tooltip text="Comparação com mês anterior">
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter cursor-help transition-colors ${
                      stat.trend.startsWith('-') || stat.trend === '0%'
                        ? stat.trend === '0%' 
                          ? 'text-zinc-500 bg-zinc-500/10' 
                          : 'text-red-500 bg-red-500/10'
                        : 'text-emerald-500 bg-emerald-500/10'
                    }`}
                  >
                    {stat.trend}
                  </motion.span>
                </Tooltip>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-title dark:text-white tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          </Link>
        </Tooltip>
      ))}
    </div>
  );
}
