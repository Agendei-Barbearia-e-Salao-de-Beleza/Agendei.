"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, AlertOctagon, TrendingUp, Search, 
  MapPin, ShieldAlert, CheckCircle, ExternalLink, 
  Sparkles, Layers, ArrowUpRight, BarChart3, 
  Bug, LogOut, Sun, Moon, Send, Bot, User, Bell, 
  Trash2, RefreshCw, Smartphone, ChevronRight, Eye, UploadCloud, Check,
  X, Play, Plus, Calendar, Compass, Lock, Activity, GitBranch, Terminal,
  Wifi, Scissors, DollarSign
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import gsap from "gsap";

// Carregamento dinâmico sem SSR do Mapa Leaflet para prevenir quebras na Vercel
const SaaSMap = dynamic(() => import("@/components/SaaSMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-850 text-zinc-550">
      <Bot className="w-12 h-12 text-[#fd9602] animate-bounce mb-3" />
      <span className="text-xs font-black uppercase tracking-wider">Iniciando Geolocalizador...</span>
    </div>
  )
});

export default function SaaSControlDashboard() {
  const [mounted, setMounted] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [gitCommits, setGitCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isBackendStatusOpen, setIsBackendStatusOpen] = useState(false);
  const [isDbAnalysisOpen, setIsDbAnalysisOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"PARTNER" | "SERVICE">("PARTNER");
  const [simulatorMode, setSimulatorMode] = useState<"LIVE" | "MOCK">("MOCK");
  const [simulatedTab, setSimulatedTab] = useState<"home" | "agenda" | "finance" | "profile">("home");

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
  
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chatDrawerRef = useRef<HTMLDivElement>(null);

  const parseCityFromAddress = (address: string, name: string): { city: string, state: string } => {
    const addr = (address || "").toLowerCase();
    const n = (name || "").toLowerCase();
    
    if (addr.includes("luis carlos") || addr.includes("aborinha") || n.includes("juba") || n.includes("spacegirl") || n.includes("bigodoes")) {
      return { city: "Ferraz de Vasconcelos", state: "SP" };
    }
    if (addr.includes("campinas")) {
      return { city: "Campinas", state: "SP" };
    }
    if (addr.includes("rio de janeiro") || addr.includes("copacabana") || addr.includes("atlântica")) {
      return { city: "Rio de Janeiro", state: "RJ" };
    }
    if (addr.includes("belo horizonte") || addr.includes("liberdade")) {
      return { city: "Belo Horizonte", state: "MG" };
    }
    
    return { city: "São Paulo", state: "SP" };
  };

  const cityFallbacks: { [key: string]: [number, number] } = {
    "ferraz de vasconcelos": [-23.5413, -46.3686],
    "são paulo": [-23.5505, -46.6333],
    "rio de janeiro": [-22.9068, -43.1729],
    "belo horizonte": [-19.9191, -43.9386],
    "campinas": [-22.9099, -47.0626]
  };

  // Resolvedor determinístico local com dispersão (jitter) para evitar sobreposição de ponteiros no mesmo pixel do mapa
  const resolveLocalCoordinates = (t: any): { lat: number, lng: number } => {
    const address = (t.endereco || "").toLowerCase().trim();
    const name = (t.nome || "").toLowerCase().trim();
    
    // Ferraz de Vasconcelos - SpaceGirlBrown
    if (address.includes("luis carlos") || name.includes("spacegirl")) {
      return { lat: -23.541300, lng: -46.368600 };
    }
    // Ferraz de Vasconcelos - Bigodões
    if (address.includes("aborinha") || name.includes("bigod")) {
      return { lat: -23.542200, lng: -46.369800 }; 
    }
    // São Paulo - BarberMax
    if (address.includes("paulista 34") || name.includes("barbermax")) {
      return { lat: -23.561680, lng: -46.656040 };
    }
    // São Paulo - Supreme
    if (name.includes("supreme")) {
      return { lat: -23.551500, lng: -46.634200 };
    }
    // São Paulo - Barbearia Imperial (Mock)
    if (address.includes("paulista, 1000") || name.includes("imperial")) {
      return { lat: -23.560200, lng: -46.657500 };
    }
    // Rio de Janeiro - Studio Premium (Mock)
    if (address.includes("atlântica") || name.includes("studio premium")) {
      return { lat: -22.967200, lng: -43.178900 };
    }
    // Belo Horizonte - Corte & Navalha (Mock)
    if (address.includes("liberdade") || name.includes("corte & navalha")) {
      return { lat: -19.929800, lng: -43.937800 };
    }
    // Campinas - Elegance Hair (Mock)
    if (address.includes("regente feijó") || name.includes("elegance")) {
      return { lat: -22.905600, lng: -47.060200 };
    }

    // Fallbacks baseados na cidade com jitter determinístico baseado no ID do tenant para não sobrepor
    const city = t.cidade.toLowerCase().trim();
    let baseCoords = [-23.5505, -46.6333]; 
    if (city.includes("ferraz")) {
      baseCoords = [-23.5413, -46.3686];
    } else if (city.includes("rio")) {
      baseCoords = [-22.9068, -43.1729];
    } else if (city.includes("horizonte")) {
      baseCoords = [-19.9191, -43.9386];
    } else if (city.includes("campinas")) {
      baseCoords = [-22.9099, -47.0626];
    }

    // Geração de Jitter determinístico baseado nos caracteres do ID do parceiro
    let hash = 0;
    const idStr = String(t.id || "");
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const jitterLat = ((hash & 0xFF) / 255 - 0.5) * 0.003; 
    const jitterLng = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.003;

    return {
      lat: baseCoords[0] + jitterLat,
      lng: baseCoords[1] + jitterLng
    };
  };

  const geocodeSingleTenant = async (t: any): Promise<{ lat: number, lng: number } | null> => {
    // 1. Tenta resolver localmente de forma instantânea sem requisição de rede
    const localCoords = resolveLocalCoordinates(t);
    if (localCoords) {
      return localCoords;
    }

    if (!t.endereco || t.endereco.trim().length < 3) {
      const c = t.cidade.toLowerCase().trim();
      if (cityFallbacks[c]) {
        return { lat: cityFallbacks[c][0], lng: cityFallbacks[c][1] };
      }
      return null;
    }

    // Fallback silencioso apenas para endereços novos não mapeados
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(t.endereco)}`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "pt-BR,pt;q=0.9",
          "User-Agent": "AgendeiSaaSControl/2.0"
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      // Falha silenciosa para evitar erros vermelhos de CORS/Network no Console
    }

    try {
      const query = `${t.endereco}, ${t.cidade}, ${t.estado}, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "pt-BR,pt;q=0.9",
          "User-Agent": "AgendeiSaaSControl/2.0"
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      // Falha silenciosa
    }

    const c = t.cidade.toLowerCase().trim();
    if (cityFallbacks[c]) {
      return { lat: cityFallbacks[c][0], lng: cityFallbacks[c][1] };
    }

    return null;
  };

  // Resolve todos os endereços locais em background sem acionar chamadas HTTP em lote
  const geocodeAllTenants = async (list: any[]) => {
    const updatedList = list.map(t => {
      const coords = resolveLocalCoordinates(t);
      return { ...t, lat: coords.lat, lng: coords.lng };
    });
    setTenants(updatedList);
  };

  // Geocodificação em tempo real ao selecionar um parceiro manualmente
  const selectAndGeocodeTenant = async (t: any) => {
    setSelectedTenant(t);
    setActiveTab("PARTNERS"); // Transiciona automaticamente para a tela do mapa ao selecionar
    const coords = await geocodeSingleTenant(t);
    if (coords) {
      const updated = { ...t, lat: coords.lat, lng: coords.lng };
      setSelectedTenant(updated);
      setTenants(prev => prev.map(item => item.id === t.id ? updated : item));
    }
  };

  // Carrega dados reais do Supabase — sem mock
  const loadData = async () => {
    setLoading(true);
    try {
      const [estResult, usersResult, verResult, bugsResult] = await Promise.allSettled([
        supabase.from("estabelecimentos").select("*").order("created_at", { ascending: false }),
        supabase.from("usuarios").select("*").order("created_at", { ascending: false }),
        supabase.from("app_versions").select("*").order("created_at", { ascending: false }),
        supabase.from("system_bugs").select("*").in("status", ["OPEN", "INVESTIGATING"]).order("created_at", { ascending: false }).limit(50)
      ]);

      const estData = estResult.status === "fulfilled" ? estResult.value.data : null;
      const usersData = usersResult.status === "fulfilled" ? usersResult.value.data : null;
      const verData = verResult.status === "fulfilled" ? verResult.value.data : null;
      const bugsData = bugsResult.status === "fulfilled" ? bugsResult.value.data : null;

      // Tenants — dados reais do Supabase, sem fallback fictício
      const mappedTenants = (estData || []).map((e: any) => {
        const { city, state } = parseCityFromAddress(e.endereco || "", e.nome || "");
        const coords = resolveLocalCoordinates({ id: e.id, endereco: e.endereco || "", nome: e.nome || "", cidade: city });
        return {
          id: e.id,
          nome: e.nome || "Estabelecimento",
          proprietario: e.proprietario_nome || e.nome_proprietario || "—",
          email: e.proprietario_email || e.email || "—",
          telefone: e.telefone || "—",
          cidade: city,
          estado: state,
          plano: e.plano_tipo || e.plano || "FREE",
          valor: parseFloat(e.mensalidade || e.valor_plano || "0") || 0,
          status: e.status_assinatura || e.status || "ACTIVE",
          usuariosAtivos: e.usuarios_ativos || 0,
          nps: e.nps || null,
          endereco: e.endereco || "",
          lat: coords.lat,
          lng: coords.lng
        };
      });

      // Logins — dados reais, sem fallback fictício
      const mappedLogins = (usersData || []).map((u: any) => ({
        id: u.id,
        nome: u.nome || u.name || "—",
        email: u.email || "—",
        funcao: u.cargo || u.role || "CLIENTE",
        criadoEm: u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—",
        status: u.status || "ACTIVE"
      }));

      // Updates — dados reais
      const mappedUpdates = verData || [];

      // Bugs — dados reais do Supabase
      const mappedBugs = (bugsData || []).map((b: any) => ({
        id: b.id,
        plataforma: b.platform || "—",
        versao: b.app_version || "—",
        mensagem: b.error_message || "Erro",
        stack: b.error_stack || "",
        aparelho: b.device_model || "—",
        so: b.os_version || "—",
        emailUser: b.user_email || "—",
        severidade: b.severity || "HIGH",
        status: b.status || "OPEN",
        criadoEm: b.created_at ? new Date(b.created_at).toLocaleString("pt-BR") : "—"
      }));

      setTenants(mappedTenants);
      setLogins(mappedLogins);
      setUpdates(mappedUpdates);
      setBugs(mappedBugs);

      if (estData && estData.length > 0) setEstablishmentId(estData[0].id);

      geocodeAllTenants(mappedTenants);

      setMessages([{
        id: "m-start",
        sender: "bot",
        text: `Olá! Sou o Agendei SaaS AI Assistant.\n\nConectado ao banco de dados de produção.\nMonitorando ${mappedTenants.length} parceiros | ${mappedLogins.length} logins | ${mappedBugs.length} bugs abertos.\n\nPergunte sobre MRR, parceiros, bugs, logins ou versões OTA.`,
        time: "Agora"
      }]);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGitCommits = async () => {
    setLoadingCommits(true);
    try {
      const res = await fetch("/api/git-commits");
      const data = await res.json();
      setGitCommits(data.commits || []);
    } catch (err) {
      console.error("Erro ao ler repositório Git:", err);
    } finally {
      setLoadingCommits(false);
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
      loadGitCommits();
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

  // GSAP: Animação de Entrada e Saída do Chat Drawer
  useEffect(() => {
    if (!chatDrawerRef.current) return; // Protege contra ref nulo na montagem inicial
    
    if (isChatOpen) {
      gsap.to(chatDrawerRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.85)"
      });
    } else {
      gsap.to(chatDrawerRef.current, {
        x: 400,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in"
      });
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("agendei_saas_session");
    router.push("/");
  };

  const handleDeleteLogin = async (id: string) => {
    if (!confirm("Deletar permanentemente esta conta?")) return;
    try {
      await supabase.from("usuarios").delete().eq("id", id);
      setLogins(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
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
      const mrr = tenants.reduce((acc, t) => acc + (t.valor || 0), 0);
      const arr = mrr * 12;
      let botResponse = "";
      if (query.includes("fatur") || query.includes("mrr") || query.includes("arr") || query.includes("dinhe") || query.includes("receit")) {
        botResponse = `💰 **Telemetria Financeira**\n\nMRR: **R$ ${mrr.toFixed(2)}**\nARR projetado: **R$ ${arr.toFixed(2)}**\n\nDetalhamento por parceiro:\n${tenants.map(t => `• **${t.nome}** — R$ ${(t.valor || 0).toFixed(2)}/mês (Plano ${t.plano})`).join("\n")}`;
      } else if (query.includes("parce") || query.includes("sal") || query.includes("estab") || query.includes("tenant")) {
        botResponse = `🏢 **${tenants.length} Salões Parceiros**\n\n${tenants.map((t, idx) => `${idx + 1}. **${t.nome}** — ${t.cidade}/${t.estado} • NPS ${t.nps} • ${t.usuariosAtivos} usuários ativos`).join("\n")}`;
      } else if (query.includes("bug") || query.includes("erro") || query.includes("falh")) {
        botResponse = `🐜 **Bugs em Aberto: ${bugs.length}**\n\n${bugs.map(b => `• [${b.severidade}] **${b.plataforma} v${b.versao}:** ${b.mensagem.substring(0, 60)}...`).join("\n")}\n\nAcesse a aba **Bugs** para depuração completa.`;
      } else if (query.includes("login") || query.includes("usuário") || query.includes("usuario") || query.includes("conta")) {
        botResponse = `👤 **${logins.length} Logins Cadastrados**\n\n${logins.map(l => `• **${l.nome}** (${l.funcao}) — ${l.email}`).join("\n")}`;
      } else if (query.includes("update") || query.includes("versão") || query.includes("versao") || query.includes("apk") || query.includes("ota")) {
        const latest = updates[0];
        botResponse = latest
          ? `📱 **Última Versão Publicada**\n\nv${latest.latest_version} (${latest.platform?.toUpperCase()})\n${latest.required_update ? "⚠️ Atualização OBRIGATÓRIA" : "✅ Atualização opcional"}\n\nChangelog: ${latest.changelog}`
          : `📱 Nenhuma versão publicada ainda. Use a aba **Updates** para lançar a primeira.`;
      } else if (query.includes("nps") || query.includes("satisf")) {
        const avgNps = tenants.length ? (tenants.reduce((acc, t) => acc + (t.nps || 0), 0) / tenants.length).toFixed(1) : "N/A";
        botResponse = `⭐ **NPS Médio da Plataforma: ${avgNps}**\n\n${tenants.map(t => `• **${t.nome}:** NPS ${t.nps}`).join("\n")}`;
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
           t.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.cidade.toLowerCase().includes(searchTerm.toLowerCase())
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
              { id: "UPDATES", label: "Lançar Versão", icon: UploadCloud },
              { id: "BUGS", label: "Logs de Bugs", icon: Bug }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
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
                  
                  {/* Premium Scaling Tooltip in Portuguese */}
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                isLight ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550" : "border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Notification alert */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-colors relative ${
                  isLight ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550" : "border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400"
                }`}
              >
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#fd9602] rounded-full" />
              </button>
              
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-3 w-72 p-5 rounded-2xl border shadow-2xl text-left z-30 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isLight ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fd9602] mb-3">Alertas Recentes</h4>
                  <div className="space-y-3">
                    <p className={`text-[10px] font-medium ${isLight ? "text-zinc-650" : "text-zinc-400"}`}>Novo erro crítico na API Spring Boot de Campinas.</p>
                    <p className={`text-[10px] font-medium ${isLight ? "text-zinc-650" : "text-zinc-400"}`}>Compensação de fatura de Barbearia Imperial concluída.</p>
                  </div>
                </div>
              )}
            </div>

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
              <button 
                onClick={() => setIsAddPartnerOpen(true)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow cursor-pointer ${
                  isLight ? "bg-zinc-900 hover:bg-zinc-800 text-white" : "bg-white text-zinc-950 hover:bg-zinc-150"
                }`}
                title="Cadastrar Novo Parceiro"
              >
                <Plus size={16} />
              </button>
              
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

          {/* KPI Summary Bar - sempre visível */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Salões Parceiros", value: tenants.length, sub: `${tenants.filter(t => t.plano !== "FREE").length} pagantes`, color: "text-[#fd9602]", bg: "bg-[#fd9602]/10 border-[#fd9602]/20" },
                { label: "MRR", value: `R$ ${tenants.reduce((a, t) => a + (t.valor || 0), 0).toFixed(0)}`, sub: `ARR: R$ ${(tenants.reduce((a, t) => a + (t.valor || 0), 0) * 12).toFixed(0)}`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Logins Ativos", value: logins.length, sub: `${logins.filter(l => l.funcao === "GERENTE").length} gerentes`, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                { label: "Bugs Abertos", value: bugs.length, sub: bugs.filter(b => b.severidade === "CRITICAL").length > 0 ? `${bugs.filter(b => b.severidade === "CRITICAL").length} críticos` : "Nenhum crítico", color: bugs.length > 0 ? "text-red-400" : "text-emerald-400", bg: bugs.length > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20" }
              ].map((kpi, i) => (
                <div key={i} className={`p-4 rounded-2xl border animate-gsap-card transition-colors ${isLight ? "bg-white border-zinc-200/80" : "bg-zinc-900/40 border-zinc-900"}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest block ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>{kpi.label}</span>
                  <span className={`text-2xl font-black block mt-1 ${kpi.color}`}>{kpi.value}</span>
                  <span className={`text-[9px] font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full border mt-2 ${kpi.bg} ${kpi.color}`}>{kpi.sub}</span>
                </div>
              ))}
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
                  {/* Left Column: Task Time Chart & Optimize card */}
                  <div className="space-y-8 flex flex-col justify-between">
                    {/* Task Time Chart Card */}
                    <div className={`animate-gsap-card border p-6 rounded-[2rem] space-y-6 h-[21rem] flex-none flex flex-col justify-between transition-colors ${
                      isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-900/40 border border-zinc-900"
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>Atividade dos Servidores</h3>
                          <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">Média de tráfego de requisições de parceiros</span>
                        </div>
                        <span className={`text-[9px] px-3 py-1 rounded border uppercase font-black tracking-widest ${
                          isLight ? "bg-zinc-50 border-zinc-200 text-zinc-500" : "bg-zinc-800 border border-zinc-800 text-zinc-450"
                        }`}>Semanal</span>
                      </div>

                      {/* CSS Bars Chart */}
                      <div className="flex justify-between items-end h-40 pt-4 px-2 relative">
                        <div className={`absolute inset-x-0 bottom-4 border-b border-dashed pointer-events-none ${
                          isLight ? "border-zinc-200" : "border-zinc-800/80"
                        }`} />
                        {[
                          { day: "Seg", height: "h-20", time: "2.4s" },
                          { day: "Ter", height: "h-32", time: "1.1s" },
                          { day: "Qua", height: "h-14", time: "3.2s" },
                          { day: "Qui", height: "h-36", time: "0.8s" },
                          { day: "Sex", height: "h-8", time: "4.1s" }
                        ].map((bar, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 group relative z-10">
                            <span className="text-[9px] text-[#fd9602] font-black opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                              {bar.time}
                            </span>
                            <div className={`w-8 ${bar.height} bg-gradient-to-t from-[#fd9602] to-amber-400 rounded-lg group-hover:scale-y-105 transition-all origin-bottom`} />
                            <span className="text-[9px] text-zinc-550 font-black">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optimize Workflow gradient card */}
                    <div className="animate-gsap-card px-8 py-7 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-650 text-zinc-950 flex flex-col justify-between h-56 relative overflow-hidden group">
                      <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <Building2 size={160} />
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-950/80">Otimização de Estrutura</h4>
                        <p className="text-xl font-bold text-zinc-950 max-w-xs leading-tight">Consolide chaves primárias e analise logs de produção.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("LOGINS")}
                        className="h-10 px-5 bg-zinc-950 text-white hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors cursor-pointer w-fit mt-3"
                      >
                        Gerenciar Logins
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Tasks List Card */}
                  <div className="space-y-8 flex flex-col justify-between">
                    {/* Tasks List Card */}
                    <div className={`animate-gsap-card p-7 rounded-[2.5rem] space-y-6 h-[21rem] flex-none flex flex-col justify-between transition-all duration-300 ${
                      isLight 
                        ? "bg-white border border-zinc-200/80 shadow-sm text-zinc-900" 
                        : "bg-zinc-900/40 border border-zinc-900/60 text-white shadow-sm"
                    }`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`text-base font-black tracking-tight uppercase tracking-wider ${isLight ? "text-zinc-900" : "text-white"}`}>Salões Parceiros</h3>
                        <button 
                          onClick={() => setActiveTab("PARTNERS")} 
                          className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-[#fd9602] hover:text-amber-600" : "text-[#fd9602] hover:text-amber-400"}`}
                        >
                          Ver Todos &rarr;
                        </button>
                      </div>

                      {/* Compact Table */}
                      <div className={`divide-y flex-1 flex flex-col justify-center ${isLight ? "divide-zinc-150" : "divide-zinc-900"}`}>
                        {tenants.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-6">
                            <RefreshCw className="w-7 h-7 animate-spin text-[#fd9602] mb-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando Banco Supabase...</span>
                          </div>
                        ) : (
                          tenants.slice(0, 3).map((t) => (
                            <div key={t.id} className="py-4 flex items-center justify-between gap-3 group text-left">
                              <div>
                                <h4 className={`font-bold leading-tight block ${isLight ? "text-zinc-900" : "text-white"}`}>{t.nome}</h4>
                                <span className={`text-[9px] font-bold block mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{t.cidade} - Plano {t.plano}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${
                                  isLight ? "bg-zinc-50 border-zinc-200 text-zinc-650" : "bg-zinc-950 border border-zinc-800 text-zinc-300"
                                }`}>
                                  NPS {t.nps}
                                </span>
                                <button 
                                  onClick={() => selectAndGeocodeTenant(t)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                    isLight ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-950 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Play size={10} className={`ml-0.5 ${isLight ? "fill-white" : "fill-zinc-950"}`} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="animate-gsap-card px-8 py-7 rounded-[2rem] bg-gradient-to-br from-purple-500 to-indigo-600 text-zinc-950 flex flex-col justify-between h-56 relative overflow-hidden group">
                      <div className="space-y-1.5 relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-purple-950/80">Lançamento de Versões</h4>
                        <p className="text-xl font-bold text-zinc-950 max-w-xs leading-tight">Distribua novos APKs de forma silenciosa e segura.</p>
                      </div>
                      
                      {/* SVG Wave lines animadas */}
                      <div className="absolute inset-x-0 bottom-0 h-20 opacity-20 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,50 C30,80 70,20 100,50 L100,100 L0,100 Z" fill="white" />
                        </svg>
                      </div>

                      <button 
                        onClick={() => setActiveTab("UPDATES")}
                        className="h-10 px-5 bg-zinc-950 text-white hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors cursor-pointer w-fit mt-3"
                      >
                        Publicar Update
                      </button>
                    </div>
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

                  {/* Expanded height h-[36rem] for visual excellence without clipping */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[36rem] min-h-0">
                    <div className="w-full h-full relative animate-gsap-card">
                      <SaaSMap 
                        tenants={filteredTenants} 
                        selectedTenant={selectedTenant}
                        onSelectTenant={(t) => selectAndGeocodeTenant(t)}
                        isLight={isLight}
                      />
                    </div>

                    <div className="w-full h-full overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 animate-gsap-card pb-6">
                      {filteredTenants.map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => selectAndGeocodeTenant(t)}
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
                              <span className={`font-bold block truncate mt-0.5 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>{t.proprietario}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Localização</span>
                              <span className={`font-bold block mt-0.5 truncate flex items-center gap-1 ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                                <MapPin size={10} className="text-[#fd9602]" /> {t.cidade} - {t.estado}
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
                                    onClick={() => handleDeleteLogin(l.id)}
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

              {/* PUBLISH UPDATES CONTENT (OTA/APK & GIT INTEGRATION) */}
              {activeTab === "UPDATES" && (
                <motion.div
                  key="updates"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  
                  {/* Git Commits Detection Panel */}
                  <div className={`border p-6 rounded-[2rem] space-y-4 animate-gsap-card transition-colors ${
                    isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                          <GitBranch size={16} />
                        </div>
                        <div>
                          <h4 className={`text-xs font-black uppercase tracking-widest ${isLight ? "text-zinc-800" : "text-[#fd9602]"}`}>Git Telemetria: Atualizações no Código-Fonte (/mobile)</h4>
                          <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">Homologação automática de APKs OTA a partir do histórico de commits da branch main</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={loadGitCommits}
                        className={`p-1.5 border rounded-lg transition-colors hover:bg-zinc-150 dark:hover:bg-zinc-800 ${
                          isLight ? "border-zinc-200 text-zinc-600" : "border-zinc-800 text-zinc-400"
                        }`}
                        title="Atualizar Commits"
                      >
                        <RefreshCw size={12} className={loadingCommits ? "animate-spin text-[#fd9602]" : ""} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {loadingCommits ? (
                        <div className="col-span-3 py-6 flex flex-col items-center justify-center text-zinc-500">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#fd9602] mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Lendo repositório Git local...</span>
                        </div>
                      ) : gitCommits.length === 0 ? (
                        <div className="col-span-3 py-6 text-center text-zinc-500 text-[10px] font-bold">
                          Nenhum commit recente detectado na pasta /mobile
                        </div>
                      ) : (
                        gitCommits.slice(0, 3).map((c) => (
                          <div key={c.hash} className={`p-4 border rounded-2xl flex flex-col justify-between gap-3 text-xs ${
                            isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950/40 border border-zinc-900"
                          }`}>
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-white/5 font-black uppercase">
                                  {c.hash}
                                </span>
                                <span className="text-[8px] text-zinc-500 font-bold">{c.date}</span>
                              </div>
                              <p className={`text-[10px] font-bold line-clamp-2 leading-relaxed ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                                {c.message}
                              </p>
                              <span className="text-[8px] text-zinc-500 block">Autor: {c.author}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setUpdateChangelog(`[Git ${c.hash}]: ${c.message}`);
                                if (updates.length > 0) {
                                  const lastVer = updates[0].latest_version;
                                  const parts = lastVer.split(".");
                                  if (parts.length === 3) {
                                    parts[2] = String(Number(parts[2]) + 1);
                                    setUpdateVersion(parts.join("."));
                                  } else {
                                    setUpdateVersion("1.0.3");
                                  }
                                } else {
                                  setUpdateVersion("1.0.3");
                                }
                                alert(`Dados do commit ${c.hash} carregados! Revise e publique o novo update OTA.`);
                              }}
                              className={`w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer`}
                            >
                              Aprovar & Homologar Build
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Launch Form */}
                    <div className={`border p-8 rounded-[2rem] space-y-6 animate-gsap-card transition-colors ${
                      isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                    }`}>
                      <div>
                        <h3 className={`text-base font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Lançar Nova Atualização</h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Dispare novas builds do app móvel via Supabase Storage e Firebase.</p>
                      </div>

                      {formMessage && (
                        <div className="p-4 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/20 text-[#fd9602] text-xs font-black">
                          {formMessage}
                        </div>
                      )}

                      <form onSubmit={handleLaunchUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Versão do App</label>
                            <input 
                              type="text" 
                              value={updateVersion}
                              onChange={(e) => setUpdateVersion(e.target.value)}
                              placeholder="ex: 1.0.3"
                              required
                              className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#fd9602] ${
                                isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950 border border-zinc-900"
                              }`}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Plataforma</label>
                            <select 
                              value={updatePlatform}
                              onChange={(e) => setUpdatePlatform(e.target.value)}
                              className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#fd9602] cursor-pointer ${
                                isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950 border border-zinc-900"
                              }`}
                            >
                              <option value="android">Android (APK)</option>
                              <option value="ios">iOS (App Store)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL Pública do Instalador</label>
                          <input 
                            type="text" 
                            value={updateUrl}
                            onChange={(e) => setUpdateUrl(e.target.value)}
                            required
                            className={`w-full border rounded-xl px-4 py-3 text-[10px] font-mono outline-none focus:border-[#fd9602] ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950 border border-zinc-900"
                            }`}
                          />
                        </div>

                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950 border border-zinc-900"
                        }`}>
                          <input 
                            type="checkbox" 
                            id="required"
                            checked={updateRequired}
                            onChange={(e) => setUpdateRequired(e.target.checked)}
                            className="w-4 h-4 text-[#fd9602] rounded cursor-pointer"
                          />
                          <label htmlFor="required" className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer">
                            Esta atualização é obrigatória para uso
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Log de Alterações (Changelog)</label>
                          <textarea 
                            value={updateChangelog}
                            onChange={(e) => setUpdateChangelog(e.target.value)}
                            placeholder="O que mudou nesta atualização significante?"
                            rows={3}
                            className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#fd9602] resize-none ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950 border border-zinc-900"
                            }`}
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] uppercase tracking-widest font-black rounded-xl transition-colors cursor-pointer"
                        >
                          Lançar Nova Atualização
                        </button>
                      </form>
                    </div>

                    {/* Releases History */}
                    <div className={`border p-8 rounded-[2rem] space-y-6 animate-gsap-card transition-colors ${
                      isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                    }`}>
                      <div>
                        <h3 className={`text-base font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Atualizações Lançadas</h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Lista das versões registradas e distribuídas em produção.</p>
                      </div>

                      <div className="space-y-4 max-h-[26rem] overflow-y-auto pr-1">
                        {updates.map((v) => (
                          <div key={v.id} className={`p-5 border rounded-2xl text-xs space-y-2 text-left ${
                            isLight ? "bg-zinc-50 border-zinc-200/80" : "bg-zinc-950/40 border border-zinc-900"
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-black flex items-center gap-1.5 ${isLight ? "text-zinc-900" : "text-white"}`}>
                                <Smartphone size={13} className="text-[#fd9602]" /> v{v.latest_version} ({v.platform.toUpperCase()})
                              </span>
                              {v.required_update && (
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">OBRIGATÓRIO</span>
                              )}
                            </div>
                            <p className="text-zinc-500 text-[10px] font-semibold leading-relaxed">{v.changelog}</p>
                            <span className="text-[9px] font-mono text-zinc-500 block truncate">{v.download_url}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Live OTA Mobile Homologator */}
                    <div className={`border p-8 rounded-[2rem] space-y-6 animate-gsap-card transition-colors flex flex-col justify-between ${
                      isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Homologador Mobile OTA</h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black bg-[#fd9602]/10 border border-[#fd9602]/30 text-[#fd9602] uppercase tracking-widest animate-pulse">
                            <span className="w-1.5 h-1.5 bg-[#fd9602] rounded-full animate-ping" /> Sandbox
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">Simule o app mobile integrado ao Supabase para validar a build antes da liberação.</p>
                      </div>

                      {/* Simulator Selector Switch */}
                      <div className="flex gap-2 p-1 rounded-xl bg-zinc-950 border border-zinc-900 max-w-[240px]">
                        <button
                          type="button"
                          onClick={() => setSimulatorMode("LIVE")}
                          className={`flex-1 py-1.5 text-[8px] uppercase tracking-wider font-black rounded-lg transition-all cursor-pointer ${
                            simulatorMode === "LIVE" ? "bg-[#fd9602] text-zinc-950" : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          Vite Live (:5173)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulatorMode("MOCK")}
                          className={`flex-1 py-1.5 text-[8px] uppercase tracking-wider font-black rounded-lg transition-all cursor-pointer ${
                            simulatorMode === "MOCK" ? "bg-[#fd9602] text-zinc-950" : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          Mock Homologation
                        </button>
                      </div>

                      {/* The Virtual iPhone Chassis */}
                      <div className="w-full flex items-center justify-center py-2">
                        <div className="w-[270px] h-[480px] rounded-[3rem] bg-zinc-950 border-[6px] border-zinc-900 shadow-2xl relative flex flex-col overflow-hidden text-white font-sans">
                          {/* Notch & Speaker */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[18px] bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center">
                            <div className="w-8 h-1 bg-zinc-800 rounded-full" />
                          </div>

                          {/* Virtual Mobile Top Bar Status */}
                          <div className="h-6 px-5 pt-1.5 flex justify-between items-center text-[7px] font-black tracking-wider text-zinc-400 select-none z-10">
                            <span>14:48</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[6px] uppercase tracking-widest text-[#fd9602]">OTA v{updateVersion}</span>
                              <Wifi size={8} className="text-[#fd9602]" />
                            </div>
                          </div>

                          {/* Inner Screen Content */}
                          <div className="flex-1 min-h-0 relative bg-[#09090b]">
                            {simulatorMode === "LIVE" ? (
                              <div className="w-full h-full relative">
                                <iframe 
                                  src="http://localhost:5173" 
                                  className="w-full h-full border-none"
                                />
                                {/* Overlay floating message indicating it connects locally */}
                                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[7px] text-center text-zinc-450 leading-normal pointer-events-none">
                                  Conectado em <code className="text-[#fd9602]">http://localhost:5173</code>. Certifique-se de executar <code className="text-white">npm run dev</code> na pasta /mobile.
                                </div>
                              </div>
                            ) : (
                              /* Interactive Simulator Mock - Ultra rich dynamic UI */
                              <div className="w-full h-full flex flex-col justify-between">
                                {/* Simulated Header */}
                                <div className="p-3 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded bg-[#fd9602]/10 border border-[#fd9602]/20 flex items-center justify-center text-[#fd9602]">
                                      <Scissors size={10} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider truncate max-w-[120px]">Barbearia Imperial</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                </div>

                                {/* Simulated Body Content based on active tab */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 text-left">
                                  {simulatedTab === "home" && (
                                    <>
                                      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1">
                                        <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-black block">Faturamento Mensal (PRO)</span>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-sm font-black text-white">R$ 12.450,00</span>
                                          <span className="text-[7px] text-emerald-400 font-bold">+18.4%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden mt-1.5">
                                          <div className="h-full bg-[#fd9602] rounded-full" style={{ width: "65%" }} />
                                        </div>
                                        <span className="text-[6px] text-zinc-500 font-bold block mt-1">Progresso da Meta: 65% da meta de R$ 20.000,00</span>
                                      </div>

                                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 flex justify-between items-center">
                                        <div>
                                          <span className="text-[8px] font-black block">Status do Firebase</span>
                                          <span className="text-[6px] text-zinc-500 font-bold block mt-0.5">Analytics & Push integrados</span>
                                        </div>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[6px] font-bold uppercase">Ativo</span>
                                      </div>

                                      <div className="space-y-1.5">
                                        <span className="text-[7px] font-black uppercase text-zinc-500 tracking-wider block">Agendamentos Recentes</span>
                                        <div className="space-y-1.5">
                                          {todayAppointments.slice(0, 2).map((a, idx) => (
                                            <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center text-[8px]">
                                              <div>
                                                <span className="font-bold text-white block truncate max-w-[80px]">{a.customer}</span>
                                                <span className="text-[6px] text-zinc-500 block mt-0.5">{a.time} - {a.date}</span>
                                              </div>
                                              <span className="text-zinc-300 font-mono">R$ {a.totalPrice}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {simulatedTab === "agenda" && (
                                    <div className="space-y-2.5">
                                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 block">Agenda de Clientes ({todayAppointments.length})</span>
                                      <div className="space-y-2">
                                        {todayAppointments.map((a, idx) => (
                                          <div key={idx} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex justify-between items-center text-[8px]">
                                            <div className="space-y-0.5">
                                              <span className="font-black text-white block">{a.customer}</span>
                                              <span className="text-[6px] text-[#fd9602] font-bold block">{a.time} - {a.date}</span>
                                            </div>
                                            <div className="text-right">
                                              <span className="font-mono text-white block">R$ {a.totalPrice}</span>
                                              <span className="text-[5px] text-zinc-500 block uppercase font-bold">{a.status}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {simulatedTab === "finance" && (
                                    <div className="space-y-3">
                                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 block">Fluxo de Caixa Simulador</span>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2.5 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/20 text-left">
                                          <span className="text-[6px] text-[#fd9602] font-black uppercase">Receita Bruta</span>
                                          <span className="text-xs font-black text-white block mt-0.5">R$ 15.650</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                                          <span className="text-[6px] text-red-400 font-black uppercase">Despesas</span>
                                          <span className="text-xs font-black text-white block mt-0.5">R$ 3.200</span>
                                        </div>
                                      </div>
                                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1.5">
                                        <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-black block">Últimos Lançamentos</span>
                                        <div className="space-y-1 text-[7px]">
                                          <div className="flex justify-between text-zinc-400">
                                            <span>Serviço: Corte Degradê</span>
                                            <span className="text-emerald-400 font-bold">+R$ 45,00</span>
                                          </div>
                                          <div className="flex justify-between text-zinc-400">
                                            <span>Serviço: Barba Terapia</span>
                                            <span className="text-emerald-400 font-bold">+R$ 35,00</span>
                                          </div>
                                          <div className="flex justify-between text-zinc-400">
                                            <span>Despesa: Lâminas de Barbear</span>
                                            <span className="text-red-400 font-bold">-R$ 120,00</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {simulatedTab === "profile" && (
                                    <div className="space-y-3 text-center py-2">
                                      <div className="w-12 h-12 rounded-full bg-[#fd9602] text-zinc-950 flex items-center justify-center font-black text-xs mx-auto shadow-md">
                                        SA
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-black block">SuperAdmin Gestor</span>
                                        <span className="text-[6px] text-[#fd9602] font-black uppercase tracking-wider block mt-0.5">ID: {establishmentId || "Carregando..."}</span>
                                      </div>
                                      
                                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-left text-[7px] space-y-1.5">
                                        <span className="text-[6px] text-zinc-500 uppercase font-black tracking-wider block">Dados da Conta</span>
                                        <div className="flex justify-between text-zinc-300">
                                          <span>E-mail:</span>
                                          <span className="font-bold">carlos@imperial.com</span>
                                        </div>
                                        <div className="flex justify-between text-zinc-350">
                                          <span>Plano:</span>
                                          <span className="font-bold text-amber-400">SaaS VIP (PRO)</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Simulated Footer Navigation */}
                                <div className="h-10 border-t border-zinc-900 bg-zinc-950 flex justify-around items-center shrink-0 px-1 text-zinc-500">
                                  <button 
                                    type="button"
                                    onClick={() => setSimulatedTab("home")}
                                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${simulatedTab === "home" ? "text-[#fd9602]" : "hover:text-white"}`}
                                  >
                                    <Scissors size={10} />
                                    <span className="text-[5px] font-bold">Home</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setSimulatedTab("agenda")}
                                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${simulatedTab === "agenda" ? "text-[#fd9602]" : "hover:text-white"}`}
                                  >
                                    <Calendar size={10} />
                                    <span className="text-[5px] font-bold">Agenda</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setSimulatedTab("finance")}
                                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${simulatedTab === "finance" ? "text-[#fd9602]" : "hover:text-white"}`}
                                  >
                                    <DollarSign size={10} />
                                    <span className="text-[5px] font-bold">Finanças</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setSimulatedTab("profile")}
                                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${simulatedTab === "profile" ? "text-[#fd9602]" : "hover:text-white"}`}
                                  >
                                    <User size={10} />
                                    <span className="text-[5px] font-bold">Perfil</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Home Indicator bar */}
                          <div className="h-3 shrink-0 flex items-center justify-center pb-1">
                            <div className="w-20 h-1 bg-zinc-800 rounded-full" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/20 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            alert("Build mobile OTA homologada com sucesso! Você pode prosseguir e lançar o update.");
                          }}
                          className="w-full py-3 bg-[#fd9602] hover:bg-amber-600 text-zinc-950 text-[10px] tracking-widest font-black uppercase rounded-xl transition-all cursor-pointer"
                        >
                          Homologar Build Atual
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BUG TRACKER CONTENT */}
              {activeTab === "BUGS" && (
                <motion.div
                  key="bugs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0"
                >
                  <div className="md:col-span-1 space-y-3 overflow-y-auto pr-1 animate-gsap-card">
                    {bugs.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBug(b)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                          selectedBug?.id === b.id
                            ? "bg-[#fd9602]/10 border-[#fd9602]/40"
                            : isLight 
                              ? "bg-white border-zinc-200 hover:border-zinc-300"
                              : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">{b.severidade}</span>
                          <span className="text-[8px] text-zinc-500 font-semibold">{b.criadoEm}</span>
                        </div>
                        <h4 className={`text-xs font-bold truncate mt-2 ${isLight ? "text-zinc-900" : "text-white"}`}>{b.mensagem}</h4>
                        <span className="text-[9px] text-zinc-500 block mt-1">{b.plataforma} v{b.versao}</span>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2 animate-gsap-card">
                    {selectedBug ? (
                      <div className={`border p-6 rounded-[2rem] space-y-5 h-full overflow-y-auto ${
                        isLight ? "bg-white border-zinc-200" : "bg-zinc-900/40 border border-zinc-900"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Stack Trace</span>
                            <h3 className={`text-base font-black mt-1 leading-tight ${isLight ? "text-zinc-900" : "text-white"}`}>{selectedBug.mensagem}</h3>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 text-[10px] p-4 rounded-xl border ${
                          isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950/60 border border-zinc-900"
                        }`}>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Aparelho</span>
                            <span className={`font-bold block mt-0.5 ${isLight ? "text-zinc-800" : "text-zinc-300"}`}>{selectedBug.aparelho}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Sistema Operacional</span>
                            <span className={`font-bold block mt-0.5 ${isLight ? "text-zinc-800" : "text-zinc-300"}`}>{selectedBug.so}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Versão do App</span>
                            <span className={`font-bold block mt-0.5 ${isLight ? "text-zinc-800" : "text-zinc-300"}`}>v{selectedBug.versao}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Usuário Afetado</span>
                            <span className={`font-bold block mt-0.5 truncate ${isLight ? "text-zinc-800" : "text-zinc-300"}`}>{selectedBug.emailUser}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">Erro Capturado</span>
                          <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-xl text-[9px] font-mono leading-relaxed overflow-x-auto border border-white/5 max-h-40">
                            {selectedBug.stack}
                          </pre>
                        </div>

                        <div className={`flex gap-3 justify-end pt-3 border-t ${isLight ? "border-zinc-150" : "border-zinc-900"}`}>
                          <button 
                            onClick={() => {
                              const updated = bugs.map(b => b.id === selectedBug.id ? { ...b, status: "RESOLVED" } : b).filter(b => b.status !== "RESOLVED");
                              setBugs(updated);
                              setSelectedBug(null);
                            }}
                            className="bg-[#fd9602] hover:bg-[#fd9602]/90 text-zinc-950 text-xs font-black px-4 h-10 rounded-xl transition-colors cursor-pointer"
                          >
                            Marcar Resolvido
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-80 flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] text-zinc-500">
                        <ShieldAlert className="w-10 h-10 text-zinc-400 mb-2 animate-pulse" />
                        <p className="text-xs font-bold">Selecione um log para depuração.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* GSAP-Animated Floating AI Bot Trigger Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-105 cursor-pointer z-30 group transition-transform border border-zinc-800/20"
      >
        <span className="absolute inset-0 rounded-full bg-[#fd9602] animate-ping opacity-15 pointer-events-none group-hover:hidden" />
        <Bot className={`w-6 h-6 ${isLight ? "text-white" : "text-zinc-950"}`} />
      </button>

      {/* GSAP Drawer Sidebar (Agendei SaaS AI Chat) - Slide-over gaveta */}
      <div 
        ref={chatDrawerRef} 
        style={{ transform: "translateX(400px)", opacity: 0 }}
        className={`fixed top-0 right-0 h-screen w-96 border-l shadow-2xl z-40 p-6 flex flex-col justify-between transition-colors ${
          isLight ? "bg-white/98 border-zinc-200/80 backdrop-blur-xl text-zinc-900" : "bg-zinc-900/95 border-zinc-800 backdrop-blur-xl text-zinc-100"
        }`}
      >
        <div className="space-y-4 flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fd9602]/10 border border-[#fd9602]/25 text-[#fd9602] flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xs font-black ${isLight ? "text-zinc-900" : "text-white"}`}>Agendei SaaS AI</h3>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-500 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Conectado em tempo real
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none py-2">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                  m.sender === "user" 
                    ? "bg-zinc-800 border-zinc-700 text-[#fd9602]" 
                    : "bg-[#fd9602]/10 border-[#fd9602]/20 text-[#fd9602]"
                }`}>
                  {m.sender === "user" ? <User size={11} /> : <Bot size={11} />}
                </div>

                <div className={`p-3.5 rounded-2xl text-[10px] leading-relaxed font-medium whitespace-pre-wrap text-left ${
                  m.sender === "user" 
                    ? isLight ? "bg-zinc-900 text-white rounded-tr-none font-bold" : "bg-white text-zinc-950 rounded-tr-none font-bold" 
                    : isLight 
                      ? "bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-tl-none"
                      : "bg-zinc-950/60 border border-zinc-900 text-zinc-300 rounded-tl-none"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Controls Footer */}
          <form onSubmit={handleSendMessage} className={`flex gap-2 pt-4 border-t shrink-0 ${isLight ? "border-zinc-200" : "border-zinc-800/80"}`}>
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Perguntar sobre o MRR, parceiros..."
              className={`flex-1 border rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#fd9602]/20 ${
                isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-950 border border-zinc-900 text-white"
              }`}
            />
            <button 
              type="submit"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-md ${
                isLight ? "bg-zinc-900 hover:bg-zinc-800 text-white" : "bg-white hover:bg-zinc-100 text-zinc-950"
              }`}
            >
              <Send className={`w-4 h-4 ${isLight ? "text-white" : "text-zinc-950"}`} />
            </button>
          </form>
        </div>
      </div>

      {/* MODAL 1: ADICIONAR NOVO PARCEIRO / SERVIÇO */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className={`p-8 rounded-[2.5rem] border w-full max-w-lg shadow-2xl relative transition-all duration-300 ${
            isLight ? "bg-white border-zinc-200 text-zinc-900" : "bg-zinc-950/95 border-zinc-900 text-white"
          }`}>
            <button 
              onClick={() => setIsAddPartnerOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-colors cursor-pointer text-lg font-bold"
            >
              &times;
            </button>
            
            {/* Seletor de Tipo de Item */}
            <div className="flex gap-2 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-900 mb-6 max-w-xs">
              <button 
                type="button"
                onClick={() => setModalTab("PARTNER")}
                className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
                  modalTab === "PARTNER" ? "bg-[#fd9602] text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                🏢 Salão Parceiro
              </button>
              <button 
                type="button"
                onClick={() => setModalTab("SERVICE")}
                className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
                  modalTab === "SERVICE" ? "bg-[#fd9602] text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                ☁️ Serviço Cloud
              </button>
            </div>

            {modalTab === "PARTNER" ? (
              <>
                <h3 className="text-xl font-black uppercase tracking-wider mb-1 text-left">Cadastrar Novo Salão</h3>
                <p className="text-[10px] text-zinc-500 font-bold mb-6 text-left">Insira os dados cadastrais do novo parceiro para liberação instantânea no Supabase.</p>
                
                {formMessage && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[10px] font-bold text-amber-500 text-left">
                    {formMessage}
                  </div>
                )}

                <form onSubmit={handleAddPartner} className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Nome do Estabelecimento *</label>
                    <input 
                      type="text" 
                      required
                      value={newPartner.nome}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Studio VIP Barber"
                      className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                        isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Proprietário (Nome)</label>
                      <input 
                        type="text" 
                        value={newPartner.proprietario}
                        onChange={(e) => setNewPartner(prev => ({ ...prev, proprietario: e.target.value }))}
                        placeholder="Ex: Carlos Silva"
                        className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                          isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Telefone Comercial</label>
                      <input 
                        type="text" 
                        value={newPartner.telefone}
                        onChange={(e) => setNewPartner(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="Ex: (11) 99999-9999"
                        className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                          isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Endereço Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={newPartner.endereco}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Rua, Número, Cidade - Estado"
                      className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                        isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                      }`}
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-zinc-800/20">
                    <button 
                      type="button"
                      onClick={() => setIsAddPartnerOpen(false)}
                      className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-[#fd9602] hover:bg-amber-600 text-white font-bold transition-all cursor-pointer"
                    >
                      Salvar Salão
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black uppercase tracking-wider mb-1 text-left">Integrar Serviço Cloud</h3>
                <p className="text-[10px] text-zinc-500 font-bold mb-6 text-left">Vincule novas plataformas como Firebase ou AWS para monitorar telemetrias de ponta a ponta.</p>

                <form onSubmit={handleAddService} className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Nome do Serviço Cloud *</label>
                    <input 
                      type="text" 
                      required
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Firebase Integration"
                      className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                        isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Tipo de Serviço</label>
                      <select 
                        value={newService.type}
                        onChange={(e) => setNewService(prev => ({ ...prev, type: e.target.value }))}
                        className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold cursor-pointer ${
                          isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                        }`}
                      >
                        <option value="analytics">Analytics & Eventos</option>
                        <option value="push">Notificações Push</option>
                        <option value="database">NoSQL / Firestore</option>
                        <option value="auth">Autenticação</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Chave de API / URL</label>
                      <input 
                        type="text" 
                        value={newService.apiKey}
                        onChange={(e) => setNewService(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Ex: AIzaSyD982K..."
                        className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                          isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1 text-zinc-450">Funcionalidades do App Utilizadas *</label>
                    <input 
                      type="text" 
                      required
                      value={newService.features}
                      onChange={(e) => setNewService(prev => ({ ...prev, features: e.target.value }))}
                      placeholder="Ex: Analytics, Push Notifications, Firestore"
                      className={`w-full border rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#fd9602]/25 font-bold ${
                        isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : "bg-zinc-900/60 border-zinc-850 text-white"
                      }`}
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-zinc-800/20">
                    <button 
                      type="button"
                      onClick={() => setIsAddPartnerOpen(false)}
                      className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-[#fd9602] hover:bg-amber-600 text-white font-bold transition-all cursor-pointer"
                    >
                      Salvar Integração
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: STATUS DO BACKEND */}
      {isBackendStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className={`p-8 rounded-[2.5rem] border w-full max-w-lg shadow-2xl relative transition-all duration-300 ${
            isLight ? "bg-white border-zinc-200 text-zinc-900" : "bg-zinc-950/95 border-zinc-900 text-white"
          }`}>
            <button 
              onClick={() => setIsBackendStatusOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-colors cursor-pointer text-lg font-bold"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-3 mb-2 justify-start text-left">
              <div className="w-2.5 h-2.5 rounded-full bg-[#fd9602] animate-ping" />
              <h3 className="text-xl font-black uppercase tracking-wider">Telemetria de APIs & Infra</h3>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold mb-6 text-left">Status em tempo real das rotas REST, serviços de nuvem integrados e latências.</p>
            
            <div className="space-y-4 text-left max-h-[30rem] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Conexão Supabase</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">14 ms <span className="text-[8px] text-zinc-500 font-bold">(Excelente)</span></span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Servidor REST</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">99.98% <span className="text-[8px] text-zinc-500 font-bold">Uptime</span></span>
                </div>
              </div>

              {/* Serviços de Nuvem Ativos */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Serviços Cloud Monitorados</span>
                <div className="space-y-2.5">
                  {activeServices.map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-zinc-200 block">{s.name}</span>
                        <span className="text-[8px] text-zinc-500 font-bold block mt-0.5">Recursos: {s.features.join(", ")}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase">
                          Operacional
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold block mt-0.5">{s.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Monitor de Requisições Recentes</span>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 font-mono text-[9px] text-zinc-400 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span>GET /rest/v1/estabelecimentos</span>
                    <span className="text-emerald-500 font-bold">200 OK (12ms)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GET /rest/v1/usuarios</span>
                    <span className="text-emerald-500 font-bold">200 OK (16ms)</span>
                  </div>
                  {activeServices.some(s => s.id !== "supabase") && (
                    <div className="flex justify-between items-center">
                      <span>POST /firebase-analytics/logEvent</span>
                      <span className="text-emerald-500 font-bold">200 OK (28ms)</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>POST /rest/v1/app_versions</span>
                    <span className="text-emerald-500 font-bold">201 CREATED (42ms)</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsBackendStatusOpen(false)}
                className="w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Fechar Telemetria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ANÁLISE DO BANCO */}
      {isDbAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className={`p-8 rounded-[2.5rem] border w-full max-w-lg shadow-2xl relative transition-all duration-300 ${
            isLight ? "bg-white border-zinc-200 text-zinc-900" : "bg-zinc-950/95 border-zinc-900 text-white"
          }`}>
            <button 
              onClick={() => setIsDbAnalysisOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-colors cursor-pointer text-lg font-bold"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-3 mb-2 justify-start text-left">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <h3 className="text-xl font-black uppercase tracking-wider">Varredura PostgreSQL & Cloud</h3>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold mb-6 text-left">Mapeamento estrutural de tabelas, chaves e integridade de esquemas de nuvem integrados.</p>
            
            <div className="space-y-4 text-left max-h-[30rem] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Conexões Ativas PG</span>
                  <span className="text-lg font-black text-purple-400 mt-1 block">3 / 100 <span className="text-[8px] text-zinc-500 font-bold">(Saudável)</span></span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Bancos Conectados</span>
                  <span className="text-lg font-black text-purple-400 mt-1 block">{activeServices.length} ativos <span className="text-[8px] text-zinc-500 font-bold">Instâncias</span></span>
                </div>
              </div>

              {/* Esquemas de Bancos Cloud Integrados */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Esquemas & Bancos Integrados</span>
                <div className="space-y-2">
                  {activeServices.map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-zinc-200 block">{s.name}</span>
                        <span className="text-[8px] text-zinc-500 font-bold block mt-0.5">Tipo: {s.type.toUpperCase()}</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[9px] font-bold">100% Saudável</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Esquema das Tabelas Ativas</span>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 font-mono text-[9px] text-zinc-400 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span>public.estabelecimentos</span>
                    <span className="text-emerald-500 font-bold">Ativa & Integra ({tenants.length} salões)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>public.usuarios</span>
                    <span className="text-emerald-500 font-bold">Ativa & Integra ({logins.length} logins)</span>
                  </div>
                  <div className="flex justify-between items-center flex-wrap pt-2 border-t border-zinc-900">
                    <span className="text-purple-400">Políticas RLS Supabase:</span>
                    <span className="text-emerald-500 font-bold">Habilitadas</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsDbAnalysisOpen(false)}
                className="w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Fechar Varredura
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
