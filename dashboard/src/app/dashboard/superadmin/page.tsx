"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, AlertOctagon, TrendingUp, Search, 
  MapPin, ShieldAlert, CheckCircle, Clock, ExternalLink, 
  Sparkles, Layers, ArrowUpRight, BarChart3, HelpCircle, 
  Filter, Play, Bug
} from "lucide-react";

// Mock Data representativo do ecossistema SaaS para o Dono do Software
const initialEstablishments = [
  {
    id: "1",
    nome: "Barbearia Imperial",
    proprietario: "Carlos Eduardo",
    email: "carlos@imperial.com",
    telefone: "(11) 98765-4321",
    cidade: "São Paulo",
    estado: "SP",
    plano: "PRO",
    valor: 149.90,
    status: "ACTIVE",
    usuariosAtivos: 14,
    nps: 9.4
  },
  {
    id: "2",
    nome: "Studio Premium & Co",
    proprietario: "Juliana Silva",
    email: "juliana@studiopremium.com",
    telefone: "(21) 99887-6655",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    plano: "ENTERPRISE",
    valor: 299.90,
    status: "ACTIVE",
    usuariosAtivos: 38,
    nps: 9.8
  },
  {
    id: "3",
    nome: "Corte & Navalha Club",
    proprietario: "Renato Souza",
    email: "renato@corteclub.com",
    telefone: "(31) 97766-5544",
    cidade: "Belo Horizonte",
    estado: "MG",
    plano: "FREE",
    valor: 0.00,
    status: "ACTIVE",
    usuariosAtivos: 2,
    nps: 8.2
  },
  {
    id: "4",
    nome: "Elegance Hair & Beauty",
    proprietario: "Patrícia Alves",
    email: "patricia@elegance.com",
    telefone: "(19) 98822-3344",
    cidade: "Campinas",
    estado: "SP",
    plano: "PRO",
    valor: 149.90,
    status: "PAST_DUE",
    usuariosAtivos: 8,
    nps: 7.9
  }
];

const mockBugs = [
  {
    id: "b1",
    plataforma: "mobile_manager",
    versao: "1.0.2",
    mensagem: "Cannot read properties of undefined (reading 'split')",
    stack: "TypeError: Cannot read properties of undefined (reading 'split')\n  at AppointmentModal.tsx:242:18\n  at react-dom.production.min.js:244:11",
    aparelho: "iPhone 14 Pro",
    so: "iOS 17.2",
    emailUser: "carlos@imperial.com",
    severidade: "HIGH",
    status: "OPEN",
    criadoEm: "Há 10 minutos"
  },
  {
    id: "b2",
    plataforma: "dashboard",
    versao: "1.2.0",
    mensagem: "Failed to fetch financial indicators: 500 Internal Server Error",
    stack: "Error: Failed to fetch financial indicators: 500 Internal Server Error\n  at finance/page.tsx:84:12\n  at async fetchInitialData (page.tsx:32:5)",
    aparelho: "Chrome / Windows 11",
    so: "Web OS",
    emailUser: "patricia@elegance.com",
    severidade: "CRITICAL",
    status: "INVESTIGATING",
    criadoEm: "Há 2 horas"
  }
];

const mockFeatureMetrics = [
  { name: "Registrar Entrada", acessos: 1420, satisfacao: "98%" },
  { name: "Registrar Despesa", acessos: 890, satisfacao: "94%" },
  { name: "Visualizar Relatórios", acessos: 1105, satisfacao: "99%" },
  { name: "Pausar Agenda", acessos: 320, satisfacao: "90%" }
];

export default function SuperAdminPage() {
  const [establishments] = useState(initialEstablishments);
  const [bugs, setBugs] = useState(mockBugs);
  const [activeTab, setActiveTab] = useState<"SAAS" | "TENANTS" | "BUGS" | "METRICS">("SAAS");
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTenants = establishments.filter(
    (t) => t.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
           t.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* SaaS Header Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#fd9602]/10 text-[#fd9602] uppercase tracking-widest border border-[#fd9602]/20">
            SaaS Control Center
          </span>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight mt-1">
            Agendei Control<span className="text-[#fd9602]">.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-sm">
            Monitoramento de parceiros, estabilidade do sistema e telemetria de uso.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-subtle dark:border-zinc-800">
          {(["SAAS", "TENANTS", "BUGS", "METRICS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab 
                  ? "bg-white dark:bg-zinc-800 text-[#fd9602] shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab === "SAAS" && "Overview"}
              {tab === "TENANTS" && "Parceiros"}
              {tab === "BUGS" && "Bugs & Erros"}
              {tab === "METRICS" && "Telemetria"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TABLE */}
        {activeTab === "SAAS" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[#fd9602]/20"><Building2 size={44} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total de Tenants</span>
                <h3 className="text-3xl font-black mt-2 text-zinc-900 dark:text-white">4</h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2">
                  <TrendingUp size={12} /> +1 cadastrado esta semana
                </span>
              </div>

              <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-emerald-500/20"><TrendingUp size={44} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MRR SaaS</span>
                <h3 className="text-3xl font-black mt-2 text-[#fd9602]">R$ 599,70</h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2">
                  <ArrowUpRight size={12} /> 100% de adimplência este mês
                </span>
              </div>

              <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-red-500/20"><AlertOctagon size={44} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bugs Ativos</span>
                <h3 className="text-3xl font-black mt-2 text-red-500">2</h3>
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-2">
                  <ShieldAlert size={12} /> 1 erro severo não investigado
                </span>
              </div>

              <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[#fd9602]/20"><Users size={44} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">NPS Geral</span>
                <h3 className="text-3xl font-black mt-2 text-zinc-900 dark:text-white">9.1</h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2">
                  <Sparkles size={12} /> Excelente satisfação do cliente
                </span>
              </div>
            </div>

            {/* Quick list of bug tracking and tenant metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Bugs Overview */}
              <div className="glass-card p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Bug className="text-red-500 w-5 h-5" /> Erros Críticos em Tempo Real
                  </h3>
                  <button onClick={() => setActiveTab("BUGS")} className="text-[10px] font-black uppercase tracking-widest text-[#fd9602] hover:underline cursor-pointer">Ver todos</button>
                </div>

                <div className="space-y-3">
                  {bugs.map((bug) => (
                    <div 
                      key={bug.id} 
                      onClick={() => { setSelectedBug(bug); setActiveTab("BUGS"); }}
                      className="p-4 bg-zinc-550/20 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-subtle dark:border-zinc-850 rounded-2xl flex items-start gap-4 cursor-pointer transition-all"
                    >
                      <div className={`p-2 rounded-xl border ${
                        bug.severidade === "CRITICAL" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}>
                        <ShieldAlert size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{bug.plataforma.toUpperCase()} v{bug.versao}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">{bug.mensagem}</h4>
                        <span className="text-[9px] text-zinc-500 block mt-1">Reportado por {bug.emailUser} • {bug.criadoEm}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Usage Overview */}
              <div className="glass-card p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <BarChart3 className="text-[#fd9602] w-5 h-5" /> Engajamento do Software
                  </h3>
                  <button onClick={() => setActiveTab("METRICS")} className="text-[10px] font-black uppercase tracking-widest text-[#fd9602] hover:underline cursor-pointer">Ver completo</button>
                </div>

                <div className="space-y-4">
                  {mockFeatureMetrics.map((f, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{f.name}</span>
                        <span className="font-black text-zinc-400">{f.acessos} cliques • <span className="text-emerald-500">{f.satisfacao} OK</span></span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#fd9602] to-amber-500 rounded-full" 
                          style={{ width: `${(f.acessos / 1500) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TENANTS MANAGEMENT */}
        {activeTab === "TENANTS" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Filters */}
            <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 border border-subtle dark:border-zinc-800 p-3 rounded-2xl max-w-md shadow-sm">
              <Search className="w-5 h-5 text-zinc-400 ml-1" />
              <input 
                type="text" 
                placeholder="Buscar parceiro por nome, proprietário ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-title dark:text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTenants.map((t) => (
                <div key={t.id} className="glass-card p-8 rounded-[2rem] border border-subtle dark:border-zinc-850 hover:border-[#fd9602]/30 transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          t.plano === "ENTERPRISE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          t.plano === "PRO" ? "bg-[#fd9602]/10 text-[#fd9602] border border-[#fd9602]/20" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}>
                          Plano {t.plano}
                        </span>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mt-2">{t.nome}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        t.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {t.status === "ACTIVE" ? "Ativo" : "Inadimplente"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-subtle dark:border-zinc-850/50">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Gestor Responsável</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{t.proprietario}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{t.email}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Localização</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5 flex items-center gap-1">
                          <MapPin size={11} className="text-zinc-500" /> {t.cidade} - {t.estado}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-subtle dark:border-zinc-850/50 mt-6 text-xs">
                    <div className="font-bold text-zinc-500">
                      Engajamento: <span className="text-[#fd9602] font-black">{t.usuariosAtivos} colaboradores</span>
                    </div>
                    <a 
                      href={`https://wa.me/${t.telefone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#fd9602] hover:underline"
                    >
                      Prestar Suporte <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* BUG TRACKER */}
        {activeTab === "BUGS" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <AlertOctagon className="text-red-500" /> Relatórios Recentes
              </h3>
              <div className="space-y-3">
                {bugs.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setSelectedBug(b)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedBug?.id === b.id 
                        ? "bg-[#fd9602]/10 border-[#fd9602]/40" 
                        : "bg-zinc-50/50 dark:bg-zinc-900/40 border-subtle dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">{b.severidade}</span>
                      <span className="text-[9px] text-zinc-500 font-semibold">{b.criadoEm}</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-2">{b.mensagem}</h4>
                    <span className="text-[10px] text-zinc-500 block mt-1">{b.plataforma} v{b.versao}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* View Details Console */}
            <div className="lg:col-span-2">
              {selectedBug ? (
                <div className="glass-card p-8 rounded-[2rem] space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Terminal Stack Trace</span>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">{selectedBug.mensagem}</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        selectedBug.status === "OPEN" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {selectedBug.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-subtle dark:border-zinc-850">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Aparelho</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{selectedBug.aparelho}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Sistema Operacional</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{selectedBug.so}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Versão do App</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">v{selectedBug.versao}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Usuário Afetado</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5 truncate">{selectedBug.emailUser}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Erro Capturado</span>
                    <pre className="p-5 bg-zinc-950 text-emerald-400 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto border border-white/5 max-h-56">
                      {selectedBug.stack}
                    </pre>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-subtle dark:border-zinc-850/50">
                    <button 
                      onClick={() => {
                        const updated = bugs.map(b => b.id === selectedBug.id ? { ...b, status: "RESOLVED" } : b).filter(b => b.status !== "RESOLVED");
                        setBugs(updated);
                        setSelectedBug(null);
                      }}
                      className="btn-primary h-11 text-xs"
                    >
                      Marcar como Resolvido
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-subtle dark:border-zinc-800 rounded-[2rem] text-zinc-500">
                  <ShieldAlert className="w-12 h-12 text-zinc-600 mb-3 animate-pulse" />
                  <p className="text-sm font-medium">Selecione um relatório de bug para investigar o stack trace.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ENGAGEMENT TELEMETRY */}
        {activeTab === "METRICS" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="glass-card p-8 rounded-[2rem] space-y-6">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">Telemetria de Funcionalidades</h3>
                <p className="text-xs text-zinc-500 mt-1">Uso cumulativo de funcionalidades chaves em todos os gerentes cadastrados.</p>
              </div>

              <div className="space-y-6 pt-4">
                {mockFeatureMetrics.map((m, i) => (
                  <div key={i} className="p-6 bg-zinc-50/50 dark:bg-zinc-900/20 border border-subtle dark:border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#fd9602]/10 text-[#fd9602] border border-[#fd9602]/20 flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white">{m.name}</h4>
                        <span className="text-[10px] text-[#fd9602] font-bold">Volume de Acessos: {m.acessos} interações</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Retenção e Satisfação</span>
                        <span className="text-sm font-black text-emerald-500 mt-0.5">{m.satisfacao} Excelente</span>
                      </div>
                      <div className="w-24 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-subtle dark:border-zinc-800 text-xs font-black text-zinc-650 dark:text-zinc-350">
                        Ativação OK
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
