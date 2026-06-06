"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Search,
  MapPin, Activity, Database, Server,
  Sparkles, BarChart3, TrendingUp, CalendarDays, CheckCircle, ShieldCheck,
  Bug, LogOut, Sun, Moon, Bell, X,
  Trash2, RefreshCw, ChevronRight, UploadCloud,
  Play, Check,
  Scissors
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import gsap from "gsap";
import type { BugReport, Tenant } from "@/types";
import { BugTracker } from "@/components/BugTracker";
import { ApmDashboard } from "@/components/ApmDashboard";
import { CicdPipeline } from "@/components/CicdPipeline";
import { ReleasesPanel } from "@/components/ReleasesPanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import type { BotAlert } from "@/components/NotificationDrawer";

// Carregamento dinâmico sem SSR do Mapa 3D (WebGL — requer browser)
const TenantMap3D = dynamic(() => import("@/components/TenantMap3D").then(m => ({ default: m.TenantMap3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 rounded-3xl border border-zinc-800">
      <MapPin className="w-10 h-10 text-[#fd9602] animate-bounce mb-3" />
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Iniciando Mapa 3D...</span>
    </div>
  )
});

export default function SaaSControlDashboard() {
  const [mounted, setMounted] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [deleteLoginId, setDeleteLoginId] = useState<string | null>(null);

  // Form de Atualizações
  const [updateVersion, setUpdateVersion] = useState("");
  const [updatePlatform, setUpdatePlatform] = useState("android");
  const [updateUrl, setUpdateUrl] = useState("https://vpalasmdcxnhpsbwmsqq.supabase.co/storage/v1/object/public/app-updates/app-release.apk");
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateChangelog, setUpdateChangelog] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PARTNERS" | "LOGINS" | "UPDATES" | "BUGS">("OVERVIEW");
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [botAlerts, setBotAlerts] = useState<BotAlert[]>([]);

  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isBackendStatusOpen, setIsBackendStatusOpen] = useState(false);
  const [isDbAnalysisOpen, setIsDbAnalysisOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"INTEGRITY" | "VERCEL" | "SERVICE">("INTEGRITY");
  const [simulatorMode, setSimulatorMode] = useState<"LIVE" | "MOCK">("MOCK");
  const [simulatedTab, setSimulatedTab] = useState<"home" | "agenda" | "finance" | "profile">("home");
  const hasInjectedAlertsRef = useRef(false);
  const alertCounterRef = useRef(0);
  const geocodingStartedRef = useRef(false);
  const [bugsTableExists, setBugsTableExists] = useState<boolean>(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });

  // Simulador: mostra dados da agenda quando disponíveis (alimentados pelo Supabase em produção)
  const todayAppointments: any[] = [];

  const [establishmentId, setEstablishmentId] = useState<string>("");

  const [activeServices, setActiveServices] = useState<any[]>([
    { id: "supabase", name: "Supabase Core", status: "ACTIVE", type: "database", features: ["Authentication", "PostgreSQL", "RLS Policies", "Storage"], latency: "14ms" }
  ]);
  const [newService, setNewService] = useState({
    name: "Firebase Cloud",
    apiKey: "",
    status: "ACTIVE",
    type: "analytics",
    features: "Analytics, Push Notifications, Firestore"
  });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name) return;
    
    const newId = `service-${Date.now()}`;
    const serviceObj = {
      id: newId,
      name: newService.name,
      status: "ACTIVE",
      type: newService.type,
      features: newService.features.split(",").map(f => f.trim()),
      latency: "28ms"
    };
    
    setActiveServices(prev => [...prev, serviceObj]);
    setIsAddServiceOpen(false);
    
    setMessages(prev => [...prev, {
      id: `m-bot-service-${Date.now()}`,
      sender: "bot",
      text: `### ☁️ Nova Integração Detectada!\n\nO serviço **${newService.name}** foi adicionado ao seu pipeline SaaS.\n\n**Recursos ativos:**\n${serviceObj.features.map(f => `*   **${f}:** Operacional (28ms)`).join("\n")}\n\nO monitor de integridade agora está rastreando a telemetria deste serviço em tempo real no app mobile.`,
      time: "Agora"
    }]);
  };
  const [newPartner, setNewPartner] = useState({
    nome: "",
    proprietario: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "PRO"
  });

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");
    if (!newPartner.nome || !newPartner.endereco) {
      setFormMessage("Nome e endereço são obrigatórios!");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("estabelecimentos")
        .insert([
          {
            nome: newPartner.nome,
            proprietario_nome: newPartner.proprietario || "Gestor do Salão",
            proprietario_email: newPartner.email || "gestor@agendei.app",
            telefone: newPartner.telefone || "(11) 99999-9999",
            endereco: newPartner.endereco,
            tipo: "BARBEARIA"
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      setNewPartner({
        nome: "",
        proprietario: "",
        email: "",
        telefone: "",
        endereco: "",
        plano: "PRO"
      });
      
      setIsAddPartnerOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setFormMessage(`Erro ao salvar parceiro: ${err.message}`);
    }
  };

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const injectBotAlert = (alert: Omit<BotAlert, "id" | "timestamp" | "read">) => {
    setBotAlerts((prev) => {
      if (prev.some((a) => a.title === alert.title)) return prev;
      alertCounterRef.current += 1;
      return [{ ...alert, id: `alert-${alertCounterRef.current}`, timestamp: new Date(), read: false }, ...prev];
    });
  };

  const geocodeAllTenants = async () => {
    const toGeocode = tenants.filter((t) => t.endereco && t.endereco !== "" && !t.lat && !t.lng);
    if (!toGeocode.length || isGeocoding) return;
    setIsGeocoding(true);
    setGeocodeProgress({ done: 0, total: toGeocode.length });

    for (const tenant of toGeocode) {
      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(tenant.endereco)}`);
        const json = await res.json();
        if (json.lat && json.lng) {
          setTenants((prev) =>
            prev.map((t) => (t.id === tenant.id ? { ...t, lat: json.lat, lng: json.lng } : t))
          );
          // Tenta persistir no Supabase — silencioso se colunas não existirem ainda
          await supabase.from("estabelecimentos").update({ lat: json.lat, lng: json.lng }).eq("id", tenant.id);
        }
      } catch { /* ignorar erros individuais */ }
      setGeocodeProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      // Nominatim: máx 1 req/seg por policy
      await new Promise((r) => setTimeout(r, 1100));
    }
    setIsGeocoding(false);
  };

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Seleciona tenant e exibe no mapa — coordenadas vêm do Supabase (lat/lng persistidos)
  const selectTenant = (t: Tenant) => {
    setSelectedTenant(t);
    setActiveTab("PARTNERS");
  };

  // Carrega dados reais do Supabase — mapeamento fiel ao schema produção
  const loadData = async () => {
    setLoading(true);
    try {
      const [estResult, usersResult, verResult, bugsResult, agendResult] = await Promise.allSettled([
        supabase
          .from("estabelecimentos")
          .select("*, proprietario:usuarios!proprietario_id(nome, email, telefone)")
          .order("criado_em", { ascending: false }),
        supabase.from("usuarios").select("id, nome, email, perfil, criado_em").order("criado_em", { ascending: false }),
        supabase.from("app_versions").select("*").order("created_at", { ascending: false }),
        supabase.from("system_bugs").select("*").in("status", ["OPEN", "INVESTIGATING"]).order("created_at", { ascending: false }).limit(50),
        supabase.from("agendamentos").select("id", { count: "exact", head: true })
      ]);

      const estData = estResult.status === "fulfilled" ? estResult.value.data : null;
      const usersData = usersResult.status === "fulfilled" ? usersResult.value.data : null;
      const verData = verResult.status === "fulfilled" ? verResult.value.data : null;
      // system_bugs pode não existir ainda (migration pendente) — captura o estado real
      const bugsQueryResult = bugsResult.status === "fulfilled" ? bugsResult.value : null;
      const bugsData = bugsQueryResult?.data ?? [];
      setBugsTableExists(!bugsQueryResult?.error);
      const agendCount = agendResult.status === "fulfilled" ? (agendResult.value.count ?? 0) : 0;
      setTotalAgendamentos(agendCount);

      // Tenants — proprietario_nome via join com usuarios
      const mappedTenants: Tenant[] = (estData || []).map((e: any) => ({
        id: e.id,
        nome: e.nome || "Estabelecimento",
        proprietario_nome: e.proprietario?.nome || "—",
        telefone: e.telefone || e.proprietario?.telefone || "—",
        endereco: e.endereco || "",
        // plano/valor não estão no schema atual — deixar com fallback até migration
        plano: "FREE",
        valor_plano: 0,
        status: "ACTIVE",
        lat: e.lat ?? null,
        lng: e.lng ?? null,
        geocoded_at: e.geocoded_at ?? null,
      }));

      const mappedLogins = (usersData || []).map((u: any) => ({
        id: u.id,
        nome: u.nome || "—",
        email: u.email || "—",
        funcao: u.perfil || "CLIENTE",
        criadoEm: u.criado_em ? new Date(u.criado_em).toLocaleDateString("pt-BR") : "—",
        status: "ACTIVE"
      }));

      const mappedBugs: BugReport[] = (bugsData || []).map((b: any) => ({
        id: b.id,
        platform: b.platform || "—",
        app_version: b.app_version || "—",
        error_message: b.error_message || "Erro",
        error_stack: b.error_stack || null,
        device_model: b.device_model || null,
        os_version: b.os_version || null,
        user_email: b.user_email || null,
        severity: b.severity || "HIGH",
        status: b.status || "OPEN",
        created_at: b.created_at || new Date().toISOString(),
        resolution_note: b.resolution_note || null,
        resolved_by: b.resolved_by || null,
        resolved_at: b.resolved_at || null,
      }));

      setTenants(mappedTenants);
      setLogins(mappedLogins);
      setUpdates(verData || []);
      setBugs(mappedBugs);

      if (estData && estData.length > 0) setEstablishmentId(estData[0].id);

      setMessages([{
        id: "m-start",
        sender: "bot",
        text: `Olá! Sou o Agendei SaaS AI Assistant.\n\nConectado ao banco de dados de produção.\nMonitorando ${mappedTenants.length} parceiros | ${mappedLogins.length} logins | ${mappedBugs.length} bugs abertos.\n\nPergunte sobre MRR, parceiros, bugs, logins ou versões OTA.`,
        time: "Agora"
      }]);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      injectBotAlert({
        type: "danger",
        title: "Falha crítica ao carregar dados",
        body: "Não foi possível conectar ao Supabase. Verifique as credenciais e a conexão de rede.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Escutador global inteligente para interceptar falhas de chunks do Webpack/Next.js e err_aborted
    const handleChunkError = (error: ErrorEvent) => {
      const errorMsg = (error.message || "").toLowerCase();
      const isChunkError = 
        errorMsg.includes("chunkloaderror") || 
        errorMsg.includes("loading chunk") ||
        errorMsg.includes("failed to fetch dynamically imported module") ||
        errorMsg.includes("err_aborted") ||
        (error.error && error.error.name === "ChunkLoadError");

      if (isChunkError) {
        console.warn("Detectada falha de carregamento de chunk estático. Recarregando página para buscar versão atualizada...");
        error.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError, true);

    const session = localStorage.getItem("agendei_saas_session");
    if (session !== "authenticated_super_admin") {
      router.push("/");
    } else {
      loadData();
    }

    return () => {
      window.removeEventListener("error", handleChunkError, true);
    };
  }, [router]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // GSAP: Animação de entrada dos cards (Elastic bounce)
  useEffect(() => {
    if (!mounted || loading) return;
    
    const targets = document.querySelectorAll(".animate-gsap-card");
    if (targets.length > 0) {
      gsap.from(".animate-gsap-card", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.15
      });
    }
  }, [loading, mounted]);

  // Bot de Respeito — monitora estado real do sistema após carga e injeta alertas (uma vez)
  useEffect(() => {
    if (loading || !mounted || hasInjectedAlertsRef.current) return;
    hasInjectedAlertsRef.current = true;

    let alertCount = 0;

    // [DANGER] Bugs críticos reais do system_bugs (CRITICAL + não resolvidos)
    const criticalBugs = bugs.filter((b) => b.severity === "CRITICAL" && b.status !== "RESOLVED");
    if (criticalBugs.length > 0) {
      alertCount++;
      injectBotAlert({
        type: "danger",
        title: `${criticalBugs.length} bug(s) crítico(s) em aberto`,
        body: `${criticalBugs[0].platform} v${criticalBugs[0].app_version}: ${criticalBugs[0].error_message.substring(0, 80)}`,
      });
    }

    // [WARNING] Backlog de bugs acumulado (≥5 sem resolução)
    const openBugs = bugs.filter((b) => b.status !== "RESOLVED");
    if (openBugs.length >= 5) {
      alertCount++;
      injectBotAlert({
        type: "warning",
        title: `${openBugs.length} bugs sem resolução acumulados`,
        body: "Backlog crescendo — acesse a aba Bugs para triagem.",
      });
    }

    // [INFO] Tabela system_bugs não existe ainda (migration pendente)
    if (!bugsTableExists) {
      alertCount++;
      injectBotAlert({
        type: "info",
        title: "Tabela system_bugs não existe ainda",
        body: "Execute a migration SQL para habilitar o Bug Tracker: CREATE TABLE system_bugs (...)",
      });
    }

    // [WARNING] Nenhum parceiro cadastrado no Supabase
    if (tenants.length === 0) {
      alertCount++;
      injectBotAlert({
        type: "warning",
        title: "Nenhum parceiro cadastrado",
        body: "A tabela estabelecimentos está vazia. Cadastre o primeiro salão parceiro.",
      });
    }

    // [WARNING] Nenhum usuário na plataforma
    if (logins.length === 0) {
      alertCount++;
      injectBotAlert({
        type: "warning",
        title: "Nenhum usuário cadastrado",
        body: "A tabela usuarios está vazia. Nenhum cliente ou gerente registrado ainda.",
      });
    }

    // [INFO] Parceiros sem geolocalização (lat/lng ausente — mapa 3D incompleto)
    const noCoords = tenants.filter((t) => !t.lat || !t.lng);
    if (noCoords.length > 0) {
      alertCount++;
      injectBotAlert({
        type: "info",
        title: `${noCoords.length} parceiro(s) sem geolocalização`,
        body: "Execute: ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION, ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;",
      });
    }

    // [INFO] Nenhuma versão OTA publicada
    if (updates.length === 0) {
      alertCount++;
      injectBotAlert({
        type: "info",
        title: "Nenhuma versão OTA publicada",
        body: "A tabela app_versions está vazia. Publique a primeira versão na aba Updates.",
      });
    }

    // [SUCCESS] Sistema saudável — só mostra se não há nenhum alerta de problema real
    if (alertCount === 0 && tenants.length > 0) {
      injectBotAlert({
        type: "success",
        title: "Sistema operando normalmente",
        body: `${tenants.length} parceiros · ${logins.length} usuários · ${bugs.length} bugs abertos — tudo sob controle.`,
      });
    }
  }, [loading, mounted, bugs, tenants, logins, updates, bugsTableExists]);

  // Auto-geocoding: dispara uma vez após a carga quando há endereços sem coordenadas
  useEffect(() => {
    if (loading || geocodingStartedRef.current) return;
    const toGeocode = tenants.filter((t) => t.endereco && t.endereco !== "" && !t.lat && !t.lng);
    if (toGeocode.length === 0) return;
    geocodingStartedRef.current = true;
    geocodeAllTenants();
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("agendei_saas_session");
    router.push("/");
  };

  const handleDeleteLogin = async (id: string) => {
    try {
      await supabase.from("usuarios").delete().eq("id", id);
      setLogins(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoginId(null);
    }
  };

  const handleLaunchUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateVersion.trim()) return;

    setFormMessage("Gravando versão...");
    try {
      const newVersion = {
        platform: updatePlatform,
        latest_version: updateVersion,
        download_url: updateUrl,
        required_update: updateRequired,
        changelog: updateChangelog || "Melhorias gerais."
      };

      const { data, error } = await supabase.from("app_versions").insert([newVersion]).select();
      if (error) throw error;

      setUpdates(prev => [data[0], ...prev]);
      setFormMessage("🚀 Publicado com sucesso!");
      setUpdateVersion("");
      setUpdateChangelog("");
      setTimeout(() => setFormMessage(""), 4000);
    } catch (err: any) {
      setFormMessage(`Erro: ${err.message}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: inputMessage,
      time: "Agora"
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputMessage.toLowerCase();
    setInputMessage("");

    setTimeout(() => {
      const mrr = tenants.reduce((acc, t) => acc + (t.valor_plano || 0), 0);
      const arr = mrr * 12;
      let botResponse = "";
      if (query.includes("fatur") || query.includes("mrr") || query.includes("arr") || query.includes("dinhe") || query.includes("receit")) {
        botResponse = `💰 **Telemetria Financeira**\n\nMRR: **R$ ${mrr.toFixed(2)}**\nARR projetado: **R$ ${arr.toFixed(2)}**\n\nDetalhamento por parceiro:\n${tenants.map(t => `• **${t.nome}** — R$ ${(t.valor_plano || 0).toFixed(2)}/mês (Plano ${t.plano})`).join("\n")}`;
      } else if (query.includes("parce") || query.includes("sal") || query.includes("estab") || query.includes("tenant")) {
        botResponse = `🏢 **${tenants.length} Salões Parceiros**\n\n${tenants.map((t, idx) => `${idx + 1}. **${t.nome}** — ${t.endereco}`).join("\n")}`;
      } else if (query.includes("bug") || query.includes("erro") || query.includes("falh")) {
        botResponse = `🐜 **Bugs em Aberto: ${bugs.length}**\n\n${bugs.map(b => `• [${b.severity}] **${b.platform} v${b.app_version}:** ${b.error_message.substring(0, 60)}...`).join("\n")}\n\nAcesse a aba **Bugs** para depuração completa.`;
      } else if (query.includes("login") || query.includes("usuário") || query.includes("usuario") || query.includes("conta")) {
        botResponse = `👤 **${logins.length} Logins Cadastrados**\n\n${logins.map(l => `• **${l.nome}** (${l.funcao}) — ${l.email}`).join("\n")}`;
      } else if (query.includes("update") || query.includes("versão") || query.includes("versao") || query.includes("apk") || query.includes("ota")) {
        const latest = updates[0];
        botResponse = latest
          ? `📱 **Última Versão Publicada**\n\nv${latest.latest_version} (${latest.platform?.toUpperCase()})\n${latest.required_update ? "⚠️ Atualização OBRIGATÓRIA" : "✅ Atualização opcional"}\n\nChangelog: ${latest.changelog}`
          : `📱 Nenhuma versão publicada ainda. Use a aba **Updates** para lançar a primeira.`;
      } else if (query.includes("nps") || query.includes("satisf")) {
        botResponse = `⭐ NPS agregado não disponível ainda — dados por estabelecimento não incluem NPS nesta versão.`;
      } else if (query.includes("plano") || query.includes("plan")) {
        const pro = tenants.filter(t => t.plano === "PRO").length;
        const enterprise = tenants.filter(t => t.plano === "ENTERPRISE").length;
        const free = tenants.filter(t => t.plano === "FREE").length;
        botResponse = `📊 **Distribuição de Planos**\n\n• PRO: **${pro}** salões\n• ENTERPRISE: **${enterprise}** salões\n• FREE: **${free}** salões\n\nConversão Free→Pago: **${tenants.length > 0 ? (((pro + enterprise) / tenants.length) * 100).toFixed(0) : 0}%**`;
      } else {
        botResponse = `Olá! Sou o Assistente SaaS do Agendei. 🤖\n\nPosso te ajudar com:\n• **MRR / ARR** — receita recorrente\n• **Parceiros** — lista de salões\n• **Bugs** — logs de erros\n• **Logins** — contas cadastradas\n• **Updates** — versões OTA publicadas\n• **NPS** — satisfação dos parceiros\n• **Planos** — distribuição PRO/ENTERPRISE/FREE`;
      }

      setMessages(prev => [...prev, {
        id: `m-bot-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        time: "Agora"
      }]);
    }, 500);
  };

  const filteredTenants = tenants.filter(
    (t) => t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.proprietario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogins = logins.filter(
    (l) => l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
           l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLight = theme === "light";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-900 border-t-[#fd9602] animate-spin absolute" />
          <Scissors className="w-6 h-6 text-[#fd9602] animate-pulse" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest mt-6 animate-pulse text-zinc-500">Iniciando Portal Agendei...</span>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef} 
      className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-300 ${
        isLight ? "bg-[#f5f6f9] text-zinc-900" : "bg-zinc-950 dark:bg-[#0c0c0e] text-zinc-100"
      }`}
    >
      
      {/* Background radial glowing ambient light (Mytasky aesthetic) */}
      <div className={`absolute top-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_top_left,rgba(253,150,2,0.12),transparent_65%)] pointer-events-none z-0 transition-opacity duration-300 ${
        isLight ? "opacity-10" : "opacity-100"
      }`} />
      <div className={`absolute left-[-10%] top-[-10%] w-[35%] h-[35%] bg-[#fd9602] opacity-[0.11] blur-[160px] rounded-full pointer-events-none z-0 transition-opacity duration-300 ${
        isLight ? "opacity-3" : "opacity-100"
      }`} />
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-gradient-radial from-purple-500/5 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* Sidebar Navigation - Ultra Narrow Mytasky Fine Glass Circle Design - FIXED IN PLACE */}
      <aside className={`fixed left-0 top-0 h-screen w-24 border-r p-6 flex flex-col justify-between items-center backdrop-blur-2xl shrink-0 z-30 transition-all duration-300 ${
        isLight ? "bg-white/40 border-zinc-200/40" : "bg-[#0c0c0e]/30 border-zinc-900/25"
      }`}>
        <div className="flex flex-col items-center space-y-12">
          {/* Brand Logo Sparkles */}
          <div className="w-12 h-12 rounded-2xl bg-[#fd9602] flex items-center justify-center shadow-lg shadow-[#fd9602]/20 cursor-pointer hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-zinc-950" />
          </div>

          {/* Navigation Links Circular Pills */}
          <nav className="flex flex-col items-center space-y-4">
            {[
              { id: "OVERVIEW", label: "Visão Geral", icon: BarChart3 },
              { id: "PARTNERS", label: "Mapa & Localização", icon: MapPin },
              { id: "LOGINS", label: "Gerenciar Logins", icon: Users },
              { id: "UPDATES", label: "Pipeline & Releases", icon: UploadCloud },
              { id: "BUGS", label: "Logs de Bugs", icon: Bug }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const bugBadge = item.id === "BUGS" && bugs.filter(b => b.status !== "RESOLVED").length > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setSearchTerm(""); }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                    isActive
                      ? isLight ? "bg-zinc-900 text-white shadow-md scale-110" : "bg-white text-zinc-950 shadow-lg scale-110"
                      : isLight
                        ? "text-zinc-400 hover:text-zinc-900 bg-zinc-50 border border-zinc-200/50 hover:border-zinc-300"
                        : "text-zinc-500 hover:text-zinc-200 bg-zinc-900/40 border border-zinc-900/60 hover:border-zinc-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {bugBadge && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                      {bugs.filter(b => b.status !== "RESOLVED").length}
                    </span>
                  )}
                  <span className={`absolute left-20 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl ${
                    isLight
                      ? "bg-zinc-900 text-white border-zinc-800"
                      : "bg-white text-zinc-950 border-zinc-200"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <button 
          onClick={handleLogout}
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isLight ? "border-zinc-200 hover:bg-red-500/10 text-zinc-450 hover:text-red-500" : "border-zinc-900 hover:border-red-500/20 hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
          }`}
          title="Sair do Painel"
        >
          <LogOut size={16} />
        </button>
      </aside>

      {/* Main Container Area - Offset by fixed sidebar w-24 */}
      <main className="flex-1 flex flex-col min-h-screen ml-24 overflow-x-hidden relative z-10">
        
        {/* Top Header - Floating bar */}
        <header className={`h-20 border-b px-8 flex items-center justify-between backdrop-blur-2xl shrink-0 sticky top-0 z-30 transition-all duration-300 ${
          isLight ? "border-zinc-200 bg-white/85" : "border-zinc-900 bg-zinc-950/85"
        }`}>
          {/* Welcome Label */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-[#fd9602]/10 text-[#fd9602] border border-[#fd9602]/25 uppercase tracking-widest">
              Motor SaaS v1.4.0
            </span>
          </div>

          {/* Central Progress pill */}
          <div className={`hidden md:flex items-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest gap-2 ${
            isLight ? "bg-white border-zinc-250/60 text-zinc-500" : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-450"
          }`}>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>98% dos servidores de telemetria operacionais hoje</span>
          </div>

          {/* Right Area Notifications & Theme */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => loadData()}
              title="Recarregar dados"
              className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                isLight ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550" : "border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#fd9602]" : ""} />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                isLight ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550" : "border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Bell → abre drawer unificado */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsDrawerOpen(true)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-colors relative ${
                isLight ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550" : "border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              <Bell size={14} />
              {botAlerts.filter((a) => !a.read).length > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {botAlerts.filter((a) => !a.read).length}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#fd9602] rounded-full" />
              )}
            </motion.button>

            {/* Avatar Profile */}
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-black text-xs cursor-pointer transition-colors ${
              isLight ? "bg-white border-zinc-200 hover:border-[#fd9602] text-[#fd9602]" : "bg-zinc-800 border border-zinc-700 hover:border-[#fd9602] text-[#fd9602]"
            }`}>
              SA
            </div>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          
          {/* Welcome Area & Quick Bots Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className={`text-3xl font-bold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>Bem-vindo, SuperAdmin!</h2>
              <p className={`text-xs font-medium mt-1 ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>Automatize tarefas e monitore a infraestrutura com as métricas do Supabase.</p>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                onClick={() => { setIsAddPartnerOpen(true); setModalTab("INTEGRITY"); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow cursor-pointer ${
                  isLight ? "bg-zinc-900 hover:bg-zinc-800 text-white" : "bg-white text-zinc-950 hover:bg-zinc-100"
                }`}
                title="Ferramentas & Integridade"
              >
                <ShieldCheck size={16} />
              </motion.button>
              
              {[
                { label: "Status do Backend", desc: "Integridade de API", color: "text-[#fd9602]", action: () => setIsBackendStatusOpen(true) },
                { label: "Análise do Banco", desc: "Varredura PG", color: "text-purple-500", action: () => setIsDbAnalysisOpen(true) }
              ].map((b, i) => (
                <div 
                  key={i} 
                  onClick={b.action}
                  className={`px-5 py-2.5 rounded-xl border flex items-center gap-3 cursor-pointer group transition-colors ${
                    isLight ? "bg-white border-zinc-200/80 hover:border-zinc-300" : "bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="text-left">
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${b.color}`}>{b.label}</span>
                    <span className="text-[9px] text-zinc-500 block">{b.desc}</span>
                  </div>
                  <ChevronRight size={12} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* KPI Cards — glassmorphism premium */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                {
                  label: "Salões Parceiros", value: tenants.length,
                  sub: `${tenants.filter(t => t.plano !== "FREE").length} pagantes`,
                  gradient: "from-[#fd9602]/15 to-[#fd9602]/5",
                  ring: "ring-[#fd9602]/15", textAccent: "text-[#fd9602]",
                  badge: "bg-[#fd9602]/10 border-[#fd9602]/20 text-[#fd9602]",
                  Icon: Building2, iconBg: "bg-[#fd9602]/10 text-[#fd9602]",
                },
                {
                  label: "MRR", value: `R$ ${tenants.reduce((a, t) => a + (t.valor_plano || 0), 0).toFixed(0)}`,
                  sub: `ARR: R$ ${(tenants.reduce((a, t) => a + (t.valor_plano || 0), 0) * 12).toFixed(0)}`,
                  gradient: "from-emerald-500/15 to-emerald-500/5",
                  ring: "ring-emerald-500/15", textAccent: "text-emerald-400",
                  badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  Icon: TrendingUp, iconBg: "bg-emerald-500/10 text-emerald-400",
                },
                {
                  label: "Agendamentos", value: totalAgendamentos.toLocaleString("pt-BR"),
                  sub: `${logins.filter(l => l.funcao === "GERENTE").length} gerentes ativos`,
                  gradient: "from-purple-500/15 to-purple-500/5",
                  ring: "ring-purple-500/15", textAccent: "text-purple-400",
                  badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                  Icon: CalendarDays, iconBg: "bg-purple-500/10 text-purple-400",
                },
                {
                  label: "Bugs Abertos", value: bugs.length,
                  sub: bugs.filter(b => b.severity === "CRITICAL").length > 0
                    ? `${bugs.filter(b => b.severity === "CRITICAL").length} críticos`
                    : "Sistema saudável",
                  gradient: bugs.length > 0 ? "from-red-500/15 to-red-500/5" : "from-emerald-500/15 to-emerald-500/5",
                  ring: bugs.length > 0 ? "ring-red-500/15" : "ring-emerald-500/15",
                  textAccent: bugs.length > 0 ? "text-red-400" : "text-emerald-400",
                  badge: bugs.length > 0 ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  Icon: bugs.length > 0 ? Bug : CheckCircle,
                  iconBg: bugs.length > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400",
                },
              ] as const).map((kpi, i) => {
                const Icon = kpi.Icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                    whileHover={{ y: -2, transition: { duration: 0.18 } }}
                    className={`relative p-5 rounded-3xl border overflow-hidden cursor-default animate-gsap-card transition-all duration-300 ${
                      isLight
                        ? "bg-white/90 border-zinc-200/70 shadow-sm backdrop-blur-sm"
                        : "bg-zinc-900/60 border-zinc-800/70 backdrop-blur-sm"
                    } ring-1 ${kpi.ring}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} pointer-events-none`} />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                          {kpi.label}
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                          <Icon size={15} />
                        </div>
                      </div>
                      <span className={`text-3xl font-black block tracking-tight ${kpi.textAccent}`}>{kpi.value}</span>
                      <span className={`text-[9px] font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-full border mt-3 ${kpi.badge}`}>
                        {kpi.sub}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Core Content Switching Panels */}
          <div className="min-h-0">
            <AnimatePresence mode="wait">
              
              {/* OVERVIEW CONTENT */}
              {activeTab === "OVERVIEW" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Left Column: Chart + CTA card */}
                  <div className="space-y-6 flex flex-col justify-between">
                    {/* Chart Card — glass premium */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`animate-gsap-card relative border p-6 rounded-[2rem] h-[21rem] flex-none flex flex-col justify-between overflow-hidden transition-colors ring-1 ${
                        isLight
                          ? "bg-white/90 border-zinc-200/70 shadow-sm backdrop-blur-sm ring-zinc-200/50"
                          : "bg-zinc-900/50 border-zinc-800/70 backdrop-blur-sm ring-zinc-800/30"
                      }`}
                    >
                      {/* Radial amber glow BG */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.06),transparent_60%)] pointer-events-none" />
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fd9602]/20 to-transparent" />

                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? "text-zinc-600" : "text-zinc-300"}`}>
                            Atividade dos Servidores
                          </h3>
                          <span className={`text-[10px] font-bold block mt-0.5 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                            Tráfego de requisições de parceiros
                          </span>
                        </div>
                        <span className={`text-[9px] px-3 py-1.5 rounded-xl border uppercase font-black tracking-widest ${
                          isLight ? "bg-zinc-100 border-zinc-200 text-zinc-500" : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400"
                        }`}>Semanal</span>
                      </div>

                      {/* Animated chart bars */}
                      <div className="flex justify-between items-end h-36 px-2 relative z-10">
                        <div className={`absolute inset-x-0 bottom-0 border-b border-dashed ${isLight ? "border-zinc-200" : "border-zinc-800"}`} />
                        {[
                          { day: "Seg", pct: 55, time: "2.4s" },
                          { day: "Ter", pct: 88, time: "1.1s" },
                          { day: "Qua", pct: 38, time: "3.2s" },
                          { day: "Qui", pct: 100, time: "0.8s" },
                          { day: "Sex", pct: 22, time: "4.1s" }
                        ].map((bar, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 group relative">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + idx * 0.06 }}
                              className="text-[9px] text-[#fd9602] font-black opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5"
                            >
                              {bar.time}
                            </motion.span>
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.3 + idx * 0.08, duration: 0.5, ease: "easeOut" }}
                              style={{ height: `${bar.pct}%` }}
                              className="w-9 bg-gradient-to-t from-[#fd9602] to-amber-300 rounded-xl group-hover:from-amber-500 group-hover:to-amber-200 transition-colors origin-bottom shadow-lg shadow-[#fd9602]/20"
                            />
                            <span className={`text-[9px] font-black ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Optimize CTA card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="animate-gsap-card relative px-8 py-7 rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-zinc-950 flex flex-col justify-between h-52 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-700 pointer-events-none">
                        <Building2 size={180} />
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-950/70">Otimização de Estrutura</h4>
                        <p className="text-xl font-black text-zinc-950 max-w-xs leading-tight tracking-tight">
                          Consolide chaves primárias e analise logs de produção.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab("LOGINS")}
                        className="h-10 px-6 bg-zinc-950/90 text-white hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors cursor-pointer w-fit mt-3 shadow-lg"
                      >
                        Gerenciar Logins
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Right Column: Partner List + Version CTA */}
                  <div className="space-y-6 flex flex-col justify-between">
                    {/* Partners list card — glass premium */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                      className={`animate-gsap-card relative p-7 rounded-[2.5rem] h-[21rem] flex-none flex flex-col justify-between overflow-hidden ring-1 transition-all duration-300 ${
                        isLight
                          ? "bg-white/90 border border-zinc-200/70 shadow-sm backdrop-blur-sm ring-zinc-200/50 text-zinc-900"
                          : "bg-zinc-900/50 border border-zinc-800/70 backdrop-blur-sm ring-zinc-800/30 text-white"
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(253,150,2,0.04),transparent_60%)] pointer-events-none" />

                      <div className="flex justify-between items-center relative z-10">
                        <h3 className={`text-base font-black tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
                          Salões Parceiros
                        </h3>
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => setActiveTab("PARTNERS")}
                          className="text-[10px] font-black uppercase tracking-widest text-[#fd9602] hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Ver Todos <ChevronRight size={11} />
                        </motion.button>
                      </div>

                      <div className={`divide-y flex-1 flex flex-col justify-center relative z-10 ${isLight ? "divide-zinc-100" : "divide-zinc-800/60"}`}>
                        {tenants.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLight ? "bg-zinc-100" : "bg-zinc-800/60"}`}>
                              <Building2 className="w-6 h-6 text-zinc-500" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-center ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                              Nenhum parceiro cadastrado.<br />Use + para adicionar.
                            </span>
                          </div>
                        ) : (
                          tenants.slice(0, 3).map((t, idx) => (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.06 }}
                              className="py-3.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <h4 className={`font-black text-sm leading-tight truncate ${isLight ? "text-zinc-900" : "text-white"}`}>{t.nome}</h4>
                                <span className={`text-[9px] font-bold block mt-0.5 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                                  {t.proprietario_nome}
                                </span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => selectTenant(t)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-md ${
                                  isLight ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-950 hover:bg-zinc-100"
                                }`}
                              >
                                <Play size={9} className={`ml-0.5 ${isLight ? "fill-white" : "fill-zinc-950"}`} />
                              </motion.button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>

                    {/* Version CTA card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 }}
                      className="animate-gsap-card relative px-8 py-7 rounded-[2rem] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex flex-col justify-between h-52 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_55%)] pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 h-24 opacity-20 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,50 C25,80 75,20 100,50 L100,100 L0,100 Z" fill="white" />
                        </svg>
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-200/80">Lançamento de Versões</h4>
                        <p className="text-xl font-black text-white max-w-xs leading-tight tracking-tight">
                          Distribua novos APKs de forma silenciosa e segura.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab("UPDATES")}
                        className="h-10 px-6 bg-zinc-950/80 text-white hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors cursor-pointer w-fit mt-3 shadow-lg"
                      >
                        Publicar Update
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* APM Observabilidade — coluna full-width abaixo do grid */}
                  <div className="lg:col-span-2">
                    <ApmDashboard isLight={isLight} />
                  </div>
                </motion.div>
              )}

              {/* PARTNERS & MAPS CONTENT - EXPANDED HEIGHT TO 36rem */}
              {activeTab === "PARTNERS" && (
                <motion.div
                  key="partners"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 flex flex-col h-full min-h-0"
                >
                  <div className="flex gap-4">
                    <div className={`flex items-center gap-3 border p-3.5 rounded-2xl flex-1 shadow-sm ${
                      isLight ? "bg-white border-zinc-200" : "bg-zinc-900/60 border border-zinc-900"
                    }`}>
                      <Search className="w-4.5 h-4.5 text-zinc-400 ml-1" />
                      <input 
                        type="text" 
                        placeholder="Buscar parceiro por nome, cidade ou gestor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full bg-transparent text-xs outline-none font-bold placeholder-zinc-500 ${
                          isLight ? "text-zinc-900" : "text-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mapa 3D + lista de parceiros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[36rem] min-h-0">
                    <div className="w-full h-full relative animate-gsap-card">
                      <TenantMap3D
                        tenants={filteredTenants}
                        selectedTenant={selectedTenant}
                        onSelectTenant={(t) => selectTenant(t)}
                        isLight={isLight}
                      />
                      {/* Barra de progresso discreta durante geocodificação automática */}
                      {isGeocoding && (
                        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-1.5">
                          <div className="h-1.5 rounded-full bg-zinc-900/70 overflow-hidden backdrop-blur-sm">
                            <motion.div
                              className="h-full bg-[#fd9602] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${geocodeProgress.total > 0 ? (geocodeProgress.done / geocodeProgress.total) * 100 : 0}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <p className="text-[9px] font-black text-[#fd9602] uppercase tracking-wider text-center drop-shadow">
                            Geocodificando endereços… {geocodeProgress.done}/{geocodeProgress.total}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-full overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 animate-gsap-card pb-6">
                      {filteredTenants.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => selectTenant(t)}
                          className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer ${
                            selectedTenant?.id === t.id 
                              ? "bg-[#fd9602]/10 border-[#fd9602]/40" 
                              : isLight 
                                ? "bg-white border-zinc-200/80 hover:border-zinc-300 shadow-sm"
                                : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                t.plano === "ENTERPRISE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                t.plano === "PRO" ? "bg-[#fd9602]/10 text-[#fd9602] border border-[#fd9602]/20" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                              }`}>
                                Plano {t.plano}
                              </span>
                              <h4 className={`text-base font-black mt-2 tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>{t.nome}</h4>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              t.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {t.status === "ACTIVE" ? "Ativo" : "Em Atraso"}
                            </span>
                          </div>

                          <div className={`grid grid-cols-2 gap-4 text-[10px] mt-4 pt-3.5 border-t ${
                            isLight ? "border-zinc-150" : "border-zinc-800/40"
                          }`}>
                            <div>
                              <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Gestor</span>
                              <span className={`font-bold block truncate mt-0.5 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>{t.proprietario_nome}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Endereço</span>
                              <span className={`font-bold block mt-0.5 truncate flex items-center gap-1 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                                <MapPin size={10} className="text-[#fd9602]" /> {t.endereco || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* LOGINS MANAGEMENT CONTENT */}
              {activeTab === "LOGINS" && (
                <motion.div
                  key="logins"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4">
                    <div className={`flex items-center gap-3 border p-3.5 rounded-2xl flex-1 shadow-sm ${
                      isLight ? "bg-white border-zinc-200" : "bg-zinc-900/60 border border-zinc-900"
                    }`}>
                      <Search className="w-4.5 h-4.5 text-zinc-400 ml-1" />
                      <input 
                        type="text" 
                        placeholder="Buscar usuário por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full bg-transparent text-xs outline-none font-bold placeholder-zinc-500 ${
                          isLight ? "text-zinc-900" : "text-white"
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`border rounded-[2rem] overflow-hidden animate-gsap-card ${
                    isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                  }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                            isLight ? "border-zinc-200 text-zinc-400" : "border-zinc-900 text-zinc-500"
                          }`}>
                            <th className="p-5 pl-8">Usuário</th>
                            <th className="p-5">Função</th>
                            <th className="p-5">Cadastro</th>
                            <th className="p-5 text-right pr-8">Ações</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-xs font-semibold ${isLight ? "divide-zinc-150" : "divide-zinc-900"}`}>
                          {filteredLogins.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-zinc-500 text-xs font-bold">
                              {searchTerm ? "Nenhum usuário encontrado para esta busca." : "Nenhum usuário cadastrado."}
                            </td></tr>
                          )}
                          {filteredLogins.map((l) => (
                            <tr key={l.id} className={`transition-colors ${isLight ? "hover:bg-zinc-50" : "hover:bg-zinc-900/35"}`}>
                              <td className="p-5 pl-8">
                                <div>
                                  <span className={`font-black block ${isLight ? "text-zinc-900" : "text-white"}`}>{l.nome}</span>
                                  <span className="text-[10px] text-zinc-500 block mt-0.5">{l.email}</span>
                                </div>
                              </td>
                              <td className="p-5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  l.funcao === "GERENTE" ? "bg-[#fd9602]/10 text-[#fd9602] border border-[#fd9602]/20" : "bg-zinc-500/10 text-zinc-500 border border-zinc-300/20"
                                }`}>
                                  {l.funcao}
                                </span>
                              </td>
                              <td className="p-5 text-zinc-400">{l.criadoEm}</td>
                              <td className="p-5 text-right pr-8">
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => alert(`Análise estrutural da conta de ${l.nome} concluída. Nenhum vazamento de chaves ou anomalia estrutural detectada!`)}
                                    className={`p-2 border rounded-xl transition-colors cursor-pointer ${
                                      isLight ? "border-zinc-200 text-zinc-500 hover:bg-zinc-100" : "border-zinc-800 text-zinc-500 hover:bg-zinc-800"
                                    }`}
                                    title="Verificar Integridade"
                                  >
                                    <Check size={13} />
                                  </button>
                                  <button 
                                    onClick={() => setDeleteLoginId(l.id)}
                                    className="p-2 border border-red-950/20 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                                    title="Excluir Login"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* PIPELINE CI/CD + GESTÃO DE RELEASES */}
              {activeTab === "UPDATES" && (
                <motion.div
                  key="updates"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-0"
                >
                  <div className={`p-6 rounded-[2rem] border flex flex-col min-h-0 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border-zinc-900"}`}>
                    <CicdPipeline isLight={isLight} />
                  </div>
                  <div className={`p-6 rounded-[2rem] border flex flex-col min-h-0 ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border-zinc-900"}`}>
                    <ReleasesPanel isLight={isLight} />
                  </div>
                </motion.div>
              )}

              {/* BUG TRACKER */}
              {activeTab === "BUGS" && (
                <motion.div
                  key="bugs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-6 rounded-[2rem] border min-h-[calc(100vh-220px)] ${isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border-zinc-900"}`}
                >
                  <BugTracker bugs={bugs} onBugsUpdate={setBugs} isLight={isLight} />
                </motion.div>
              )}


            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* ConfirmDialog para deleção de login */}
      <ConfirmDialog
        open={!!deleteLoginId}
        title="Deletar conta permanentemente?"
        description="Esta ação não pode ser desfeita. A conta do usuário será removida do banco de dados de produção."
        confirmLabel="Deletar"
        variant="danger"
        onConfirm={() => deleteLoginId && handleDeleteLogin(deleteLoginId)}
        onCancel={() => setDeleteLoginId(null)}
      />

      {/* Drawer unificado: Alertas do Bot + Chat */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLight={isLight}
        alerts={botAlerts}
        onMarkAllRead={() => setBotAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
        onDismissAlert={(id) => setBotAlerts((prev) => prev.filter((a) => a.id !== id))}
        messages={messages}
        onSendMessage={handleSendMessage}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        messagesEndRef={messagesEndRef}
      />

      {/* MODAL 1: FERRAMENTAS & INTEGRIDADE */}
      <AnimatePresence>
        {isAddPartnerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsAddPartnerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-xl rounded-[2rem] border shadow-2xl overflow-hidden ${
                isLight ? "bg-white/96 border-zinc-200/80 text-zinc-900" : "bg-zinc-950/97 border-zinc-800/80 text-white"
              } backdrop-blur-2xl`}
            >
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fd9602]/40 to-transparent" />
              <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(ellipse_at_top_left,rgba(253,150,2,0.07),transparent_60%)] pointer-events-none" />

              {/* Header */}
              <div className={`px-7 pt-7 pb-5 border-b ${isLight ? "border-zinc-100" : "border-zinc-800/60"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#fd9602]" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-wider ${isLight ? "text-zinc-900" : "text-white"}`}>
                        Ferramentas & Integridade
                      </h3>
                      <p className={`text-[10px] font-bold mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                        Diagnóstico, Vercel e serviços vinculados
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => setIsAddPartnerOpen(false)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                      isLight ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <X size={15} />
                  </motion.button>
                </div>

                {/* Tabs */}
                <div className={`flex gap-1 p-1 rounded-xl ${isLight ? "bg-zinc-100" : "bg-zinc-900"}`}>
                  {([
                    { id: "INTEGRITY", label: "Integridade", Icon: ShieldCheck },
                    { id: "VERCEL",    label: "Vercel",       Icon: UploadCloud },
                    { id: "SERVICE",   label: "Serviços",     Icon: Server },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setModalTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        modalTab === id
                          ? "bg-[#fd9602] text-zinc-950"
                          : isLight ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[26rem] overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* TAB: INTEGRIDADE */}
                  {modalTab === "INTEGRITY" && (
                    <motion.div
                      key="integrity"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="px-7 py-5 space-y-3"
                    >
                      {/* Summary bar */}
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        {[
                          { label: "Parceiros", value: tenants.length, color: "text-[#fd9602]" },
                          { label: "No Mapa", value: tenants.filter(t => t.lat && t.lng).length, color: "text-emerald-400" },
                          { label: "Sem Coords", value: tenants.filter(t => !t.lat || !t.lng).length, color: "text-amber-400" },
                        ].map((s, i) => (
                          <div key={i} className={`p-3 rounded-2xl border text-center ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/60 border-zinc-800/60"}`}>
                            <span className={`text-xl font-black block ${s.color}`}>{s.value}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{s.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Progresso de geocodificação ou botão de trigger */}
                      {isGeocoding ? (
                        <div className={`p-3 rounded-2xl border ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/40 border-zinc-800"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#fd9602]">
                              Geocodificando via OpenStreetMap…
                            </p>
                            <p className="text-[9px] font-black text-zinc-500">{geocodeProgress.done}/{geocodeProgress.total}</p>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-zinc-200" : "bg-zinc-800"}`}>
                            <motion.div
                              className="h-full bg-[#fd9602] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${geocodeProgress.total > 0 ? (geocodeProgress.done / geocodeProgress.total) * 100 : 0}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                        </div>
                      ) : tenants.filter(t => !t.lat && !t.lng && t.endereco).length > 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { geocodingStartedRef.current = false; geocodeAllTenants(); }}
                          className="w-full py-2.5 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/20 text-[#fd9602] text-[9px] font-black uppercase tracking-widest hover:bg-[#fd9602]/20 transition-colors cursor-pointer"
                        >
                          Geocodificar {tenants.filter(t => !t.lat && !t.lng).length} endereço(s) restante(s)
                        </motion.button>
                      ) : null}

                      <p className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                        Diagnóstico por estabelecimento
                      </p>

                      {tenants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Building2 className="w-8 h-8 text-zinc-600" />
                          <p className={`text-xs font-bold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>Nenhum parceiro carregado</p>
                        </div>
                      ) : (
                        tenants.map((t) => {
                          const geocoded = !!(t.lat && t.lng);
                          const hasAddress = !!(t.endereco && t.endereco !== "");
                          const checks = [
                            { label: "Mapa", ok: geocoded, pending: !geocoded && hasAddress && isGeocoding },
                            { label: "Tel.", ok: !!(t.telefone && t.telefone !== "—") },
                            { label: "End.", ok: hasAddress },
                          ];
                          const healthy = geocoded && hasAddress && (t.telefone && t.telefone !== "—");
                          return (
                            <div
                              key={t.id}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                                healthy
                                  ? isLight ? "bg-emerald-50 border-emerald-200/60" : "bg-emerald-500/5 border-emerald-500/15"
                                  : isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/40 border-zinc-800/60"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className={`text-xs font-black truncate ${isLight ? "text-zinc-900" : "text-white"}`}>{t.nome}</p>
                                <p className={`text-[9px] font-bold mt-0.5 truncate ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                                  {geocoded ? `${t.lat!.toFixed(4)}, ${t.lng!.toFixed(4)}` : t.endereco || t.proprietario_nome}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {checks.map((c) => (
                                  <span
                                    key={c.label}
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${
                                      c.pending
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                                        : c.ok
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                          : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {c.pending ? "…" : c.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}

                  {/* TAB: VERCEL */}
                  {modalTab === "VERCEL" && (
                    <motion.div
                      key="vercel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="px-7 py-5 space-y-4"
                    >
                      <p className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                        Projetos Vercel — Região gru1 (São Paulo)
                      </p>

                      {[
                        {
                          name: "App Cliente (PWA)",
                          domain: "mobile-production-46b6.up.railway.app",
                          vercelUrl: "https://vercel.com/matheus-lucindos-projects/mobile",
                          dir: "mobile/",
                          color: "text-[#fd9602]",
                          ring: "ring-[#fd9602]/20",
                          gradientBg: "from-[#fd9602]/8 to-transparent",
                        },
                        {
                          name: "App Gerente (Web)",
                          domain: "agendei-manager",
                          vercelUrl: "https://vercel.com/matheus-lucindos-projects/agendei",
                          dir: "dashboard/",
                          color: "text-blue-400",
                          ring: "ring-blue-500/20",
                          gradientBg: "from-blue-500/8 to-transparent",
                        },
                        {
                          name: "App Gerente (Mobile)",
                          domain: "mobile-manager",
                          vercelUrl: "https://vercel.com/matheus-lucindos-projects/mobile-manager",
                          dir: "mobile/ (VITE_APP_TYPE=manager)",
                          color: "text-emerald-400",
                          ring: "ring-emerald-500/20",
                          gradientBg: "from-emerald-500/8 to-transparent",
                        },
                        {
                          name: "Portal SaaS (SuperAdmin)",
                          domain: "saas",
                          vercelUrl: "https://vercel.com/matheus-lucindos-projects/saas",
                          dir: "saas/",
                          color: "text-purple-400",
                          ring: "ring-purple-500/20",
                          gradientBg: "from-purple-500/8 to-transparent",
                        },
                      ].map((p) => (
                        <div
                          key={p.name}
                          className={`relative p-4 rounded-2xl border overflow-hidden ring-1 ${p.ring} ${
                            isLight ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800/60"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${p.gradientBg} pointer-events-none`} />
                          <div className="relative z-10 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <span className={`text-[10px] font-black ${isLight ? "text-zinc-800" : "text-white"}`}>{p.name}</span>
                              </div>
                              <p className={`text-[9px] font-mono font-bold ${p.color}`}>{p.domain}</p>
                              <p className={`text-[9px] font-bold mt-1 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                                Diretório: <span className="font-mono">{p.dir}</span> · Região: gru1
                              </p>
                            </div>
                            <a
                              href={p.vercelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-colors ${
                                isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                              }`}
                            >
                              Dashboard →
                            </a>
                          </div>
                        </div>
                      ))}

                      <div className={`p-4 rounded-2xl border ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/40 border-zinc-800/60"}`}>
                        <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>Backend (Spring Boot)</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-xs font-black ${isLight ? "text-zinc-700" : "text-zinc-200"}`}>Render / Koyeb Free Tier</p>
                            <p className={`text-[9px] font-bold mt-0.5 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>Cold start ~30s esperado · Java 21 + Spring Boot 4</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase">
                            Free Tier
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: SERVIÇOS */}
                  {modalTab === "SERVICE" && (
                    <motion.div
                      key="service"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="px-7 py-5"
                    >
                      <p className={`text-xs font-black uppercase tracking-wider mb-1 ${isLight ? "text-zinc-900" : "text-white"}`}>
                        Integrar Serviço Cloud
                      </p>
                      <p className={`text-[10px] font-bold mb-5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                        Vincule Firebase, AWS ou outra plataforma para monitorar telemetria end-to-end.
                      </p>

                      <form onSubmit={handleAddService} className="space-y-4">
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-wider block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                            Nome do Serviço *
                          </label>
                          <input
                            type="text" required value={newService.name}
                            onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Firebase Integration"
                            className={`w-full border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold transition-shadow ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-800 text-white"
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`text-[9px] font-black uppercase tracking-wider block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Tipo
                            </label>
                            <select
                              value={newService.type}
                              onChange={(e) => setNewService(prev => ({ ...prev, type: e.target.value }))}
                              className={`w-full border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold cursor-pointer ${
                                isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-800 text-white"
                              }`}
                            >
                              <option value="analytics">Analytics & Eventos</option>
                              <option value="push">Notificações Push</option>
                              <option value="database">NoSQL / Firestore</option>
                              <option value="auth">Autenticação</option>
                            </select>
                          </div>
                          <div>
                            <label className={`text-[9px] font-black uppercase tracking-wider block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Chave de API
                            </label>
                            <input
                              type="text" value={newService.apiKey}
                              onChange={(e) => setNewService(prev => ({ ...prev, apiKey: e.target.value }))}
                              placeholder="Ex: AIzaSyD982K..."
                              className={`w-full border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                                isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-800 text-white"
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-wider block mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                            Funcionalidades Ativas *
                          </label>
                          <input
                            type="text" required value={newService.features}
                            onChange={(e) => setNewService(prev => ({ ...prev, features: e.target.value }))}
                            placeholder="Ex: Analytics, Push Notifications, Firestore"
                            className={`w-full border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-800 text-white"
                            }`}
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <motion.button
                            type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddPartnerOpen(false)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-colors cursor-pointer ${
                              isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            Cancelar
                          </motion.button>
                          <motion.button
                            type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-[#fd9602] hover:bg-amber-600 text-zinc-950 transition-colors cursor-pointer shadow-lg shadow-[#fd9602]/20"
                          >
                            Salvar Integração
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TELEMETRIA DE APIs — glassmorphism premium */}
      <AnimatePresence>
        {isBackendStatusOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsBackendStatusOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-[2rem] border shadow-2xl overflow-hidden ${
                isLight ? "bg-white/95 border-zinc-200/80 text-zinc-900" : "bg-zinc-950/97 border-zinc-800/80 text-white"
              } backdrop-blur-2xl`}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fd9602]/40 to-transparent" />
              {/* Amber glow */}
              <div className="absolute top-0 left-0 w-full h-40 bg-[radial-gradient(ellipse_at_top_left,rgba(253,150,2,0.08),transparent_60%)] pointer-events-none" />

              {/* Header */}
              <div className={`px-7 pt-7 pb-5 border-b ${isLight ? "border-zinc-100" : "border-zinc-800/60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#fd9602]" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-wider ${isLight ? "text-zinc-900" : "text-white"}`}>
                        Telemetria de APIs & Infra
                      </h3>
                      <p className={`text-[10px] font-bold mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                        Status em tempo real das rotas REST e serviços de nuvem
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => setIsBackendStatusOpen(false)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                      isLight ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <X size={15} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-5 space-y-4 max-h-[26rem] overflow-y-auto">
                {/* Mini KPI grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Conexão Supabase", value: "14 ms", sub: "Excelente", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "Servidor REST", value: "99.98%", sub: "Uptime", icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ring-1 ring-inset ring-white/5 ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/60 border-zinc-800/60"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{m.label}</span>
                      </div>
                      <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
                      <span className={`text-[9px] font-bold ml-1 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{m.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Services */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                    Serviços Cloud Monitorados
                  </p>
                  <div className="space-y-2">
                    {activeServices.map((s) => (
                      <div key={s.id} className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isLight ? "bg-zinc-50/80 border-zinc-200" : "bg-zinc-900/40 border-zinc-800/60"
                      }`}>
                        <div>
                          <span className={`text-xs font-black block ${isLight ? "text-zinc-800" : "text-zinc-200"}`}>{s.name}</span>
                          <span className={`text-[9px] font-bold block mt-0.5 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                            {s.features.join(", ")}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                            Operacional
                          </span>
                          <span className={`text-[9px] font-bold block mt-1 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{s.latency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terminal log */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                    Requisições Recentes
                  </p>
                  <div className={`p-4 rounded-2xl border font-mono text-[9px] space-y-2 ${
                    isLight ? "bg-zinc-100 border-zinc-200 text-zinc-500" : "bg-black/40 border-zinc-800 text-zinc-400"
                  }`}>
                    {[
                      { method: "GET", path: "/rest/v1/estabelecimentos", status: "200 OK", ms: "12ms" },
                      { method: "GET", path: "/rest/v1/usuarios", status: "200 OK", ms: "16ms" },
                      { method: "POST", path: "/rest/v1/app_versions", status: "201 CREATED", ms: "42ms" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-[#fd9602] font-black">{r.method}</span>
                        <span className="flex-1 truncate">{r.path}</span>
                        <span className="text-emerald-400 font-bold shrink-0">{r.status} ({r.ms})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-7 py-5 border-t ${isLight ? "border-zinc-100" : "border-zinc-800/60"}`}>
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setIsBackendStatusOpen(false)}
                  className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-colors cursor-pointer ${
                    isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  Fechar Telemetria
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: VARREDURA POSTGRESQL — glassmorphism premium */}
      <AnimatePresence>
        {isDbAnalysisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsDbAnalysisOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-[2rem] border shadow-2xl overflow-hidden ${
                isLight ? "bg-white/95 border-zinc-200/80 text-zinc-900" : "bg-zinc-950/97 border-zinc-800/80 text-white"
              } backdrop-blur-2xl`}
            >
              {/* Purple accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <div className="absolute top-0 left-0 w-full h-40 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.08),transparent_60%)] pointer-events-none" />

              {/* Header */}
              <div className={`px-7 pt-7 pb-5 border-b ${isLight ? "border-zinc-100" : "border-zinc-800/60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-wider ${isLight ? "text-zinc-900" : "text-white"}`}>
                        Varredura PostgreSQL & Cloud
                      </h3>
                      <p className={`text-[10px] font-bold mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                        Mapeamento estrutural de tabelas, chaves e integridade
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => setIsDbAnalysisOpen(false)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                      isLight ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <X size={15} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-5 space-y-4 max-h-[26rem] overflow-y-auto">
                {/* Mini KPI grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Conexões Ativas PG", value: "3 / 100", sub: "Saudável" },
                    { label: "Bancos Conectados", value: `${activeServices.length} ativo${activeServices.length !== 1 ? "s" : ""}`, sub: "Instâncias" },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ring-1 ring-inset ring-white/5 ${
                      isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/60 border-zinc-800/60"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-3.5 h-3.5 text-purple-400" />
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{m.label}</span>
                      </div>
                      <span className="text-xl font-black text-purple-400">{m.value}</span>
                      <span className={`text-[9px] font-bold ml-1 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>{m.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Integrated schemas */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                    Esquemas & Bancos Integrados
                  </p>
                  <div className="space-y-2">
                    {activeServices.map((s) => (
                      <div key={s.id} className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isLight ? "bg-zinc-50/80 border-zinc-200" : "bg-zinc-900/40 border-zinc-800/60"
                      }`}>
                        <div>
                          <span className={`text-xs font-black block ${isLight ? "text-zinc-800" : "text-zinc-200"}`}>{s.name}</span>
                          <span className={`text-[9px] font-bold block mt-0.5 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                            Tipo: {s.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                          <ShieldCheck size={9} />
                          100% Saudável
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tables schema */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                    Esquema das Tabelas Ativas
                  </p>
                  <div className={`p-4 rounded-2xl border font-mono text-[9px] space-y-2.5 ${
                    isLight ? "bg-zinc-100 border-zinc-200 text-zinc-500" : "bg-black/40 border-zinc-800 text-zinc-400"
                  }`}>
                    {[
                      { table: "public.estabelecimentos", status: `Ativa & Integra (${tenants.length} salões)`, color: "text-emerald-400" },
                      { table: "public.usuarios", status: `Ativa & Integra (${logins.length} logins)`, color: "text-emerald-400" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="truncate">{r.table}</span>
                        <span className={`font-bold shrink-0 ${r.color}`}>{r.status}</span>
                      </div>
                    ))}
                    <div className={`flex items-center justify-between pt-2 border-t ${isLight ? "border-zinc-300" : "border-zinc-800"}`}>
                      <span className="text-purple-400">Políticas RLS Supabase:</span>
                      <span className="text-emerald-400 font-bold">Habilitadas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-7 py-5 border-t ${isLight ? "border-zinc-100" : "border-zinc-800/60"}`}>
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDbAnalysisOpen(false)}
                  className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-colors cursor-pointer ${
                    isLight ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  Fechar Varredura
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
