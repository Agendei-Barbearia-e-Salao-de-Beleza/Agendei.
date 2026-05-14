"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, User, Mail, Lock, Store, ChevronRight, ArrowLeft, 
  MapPin, Camera, Check, Upload, Loader2, Eye, EyeOff, 
  ShieldCheck, Sparkles, Phone 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ImageCropModal } from "@/components/modals/ImageCropModal";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    establishment: "",
    type: "BARBEARIA",
    address: ""
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'logo' | 'avatar'>('logo');
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Sua Conta", description: "Dados de acesso", icon: <User className="w-5 h-5" /> },
    { number: 2, title: "Seu Negócio", description: "Dados do local", icon: <Store className="w-5 h-5" /> },
    { number: 3, title: "Perfil", description: "Personalização", icon: <Sparkles className="w-5 h-5" /> }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        return toast.error("Preencha todos os campos da conta.");
      }
      if (formData.password.length < 6) {
        return toast.error("A senha deve ter pelo menos 6 caracteres.");
      }
    }
    if (currentStep === 2) {
      if (!formData.establishment || !formData.address) {
        return toast.error("Preencha os dados do estabelecimento.");
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setUploadType(type);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const url = URL.createObjectURL(croppedBlob);
    if (uploadType === 'avatar') {
      setAvatar(url);
      setAvatarBlob(croppedBlob);
    } else {
      setLogo(url);
      setLogoBlob(croppedBlob);
    }
    setIsCropModalOpen(false);
    setTempImage(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, phone, establishment, type, address } = formData;
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name,
            nome_estabelecimento: establishment,
            tipo: type,
            endereco: address,
            telefone: phone
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao obter dados do usuário.");

      const userId = authData.user.id;
      let avatarUrl = "";
      let logoUrl = "";

      if (avatarBlob) {
        const fileName = `avatars/${userId}-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, avatarBlob, { contentType: 'image/webp' });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      if (logoBlob) {
        const fileName = `logos/${userId}-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoBlob, { contentType: 'image/webp' });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
          logoUrl = publicUrl;
        }
      }

      await supabase.from('usuarios').update({ avatar_url: avatarUrl || null, telefone: phone }).eq('id', userId);
      await supabase.from('estabelecimentos').update({ logo_url: logoUrl || null, endereco: address, telefone_comercial: phone }).eq('proprietario_id', userId);

      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro ao tentar criar a conta.");
      setLoading(false);
    }
  };

  // Classe de input que usa as variáveis do tema do projeto
  const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700";
  const inputWithToggleClass = "w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#fd9602]/50 transition-all placeholder:text-zinc-700";

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Blobs decorativos */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fd9602]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] opacity-20 rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: "var(--border)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-[32px] overflow-hidden shadow-2xl min-h-[640px]"
        style={{ 
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)"
        }}
      >
        {/* 
          Sidebar do Cadastro — NÃO usa force-dark, para seguir o tema do projeto.
          O globals.css controla o fundo via `aside { background-color: var(--sidebar) }`.
          No modo escuro: --sidebar = rgba(9,9,11,0.8) → preto.
          No modo claro:  --sidebar = #09090b → também preto (por escolha do design).
          
          Para o cadastro queremos seguir o --card (branco no light, zinc-900 no dark),
          então usamos uma div com style, não um <aside>.
        -->
        */}
        <div
          className="w-full md:w-72 p-10 flex flex-col justify-between shrink-0"
          style={{
            backgroundColor: "var(--card)",
            borderRight: "1px solid var(--border)"
          }}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-[#fd9602] p-2 rounded-xl shadow-[0_0_20px_rgba(253,150,2,0.3)]">
                <Scissors className="text-zinc-950 w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tighter" style={{ color: "var(--foreground)" }}>
                Agendei<span className="text-[#fd9602]">.</span>
              </h1>
            </div>

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.number} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shrink-0"
                    style={
                      currentStep >= s.number
                        ? { backgroundColor: "#fd9602", borderColor: "#fd9602", color: "#09090b" }
                        : { backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }
                    }
                  >
                    {currentStep > s.number ? <Check className="w-4 h-4" /> : s.icon}
                  </div>
                  <div>
                    <h4
                      className="text-sm font-bold transition-colors"
                      style={{ color: currentStep >= s.number ? "var(--foreground)" : "var(--muted)" }}
                    >
                      {s.title}
                    </h4>
                    <p
                      className="text-[10px] uppercase tracking-widest font-bold mt-0.5"
                      style={{ color: currentStep >= s.number ? "#fd9602" : "var(--border)" }}
                    >
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div
            className="mt-16 p-5 rounded-3xl space-y-3"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
          >
            <ShieldCheck className="text-[#fd9602] w-5 h-5" />
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: "var(--muted)" }}>
              Seus dados estão protegidos por criptografia de ponta a ponta.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <main
          className="flex-1 p-8 md:p-14 relative flex flex-col justify-center"
          style={{ backgroundColor: "var(--card)" }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="max-w-md mx-auto w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>
                    Crie sua conta
                  </h2>
                  <p style={{ color: "var(--muted)" }} className="text-sm">
                    Preencha seus dados para começar a usar o Agendei.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Seu nome" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className={inputClass} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={inputWithToggleClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors"
                        style={{ color: "var(--muted)" }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <button onClick={nextStep} className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-2 group">
                    Próximo passo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full" style={{ borderTop: "1px solid var(--border)" }} />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="px-3 font-bold" style={{ backgroundColor: "var(--card)", color: "var(--muted)" }}>
                        Ou cadastre com
                      </span>
                    </div>
                  </div>

                  <GoogleAuthButton label="Cadastrar com Google" />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="max-w-md mx-auto w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>Seu Negócio</h2>
                  <p style={{ color: "var(--muted)" }} className="text-sm">Dados do seu estabelecimento.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Nome do Estabelecimento</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input type="text" name="establishment" value={formData.establishment} onChange={handleInputChange} placeholder="Ex: Barbearia Premium" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Categoria</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['BARBEARIA', 'SALAO', 'UNISSEX'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, type: t }))}
                          className="py-3 rounded-2xl border transition-all text-[10px] font-bold tracking-widest"
                          style={
                            formData.type === t
                              ? { backgroundColor: "#fd9602", borderColor: "#fd9602", color: "#09090b" }
                              : { backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Endereço</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Cidade, Bairro, Rua e Número" className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-5 rounded-2xl font-bold flex items-center justify-center transition-all"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextStep} className="flex-[3] btn-primary py-5 rounded-2xl flex items-center justify-center gap-2 group">
                    Tudo certo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="max-w-md mx-auto w-full"
              >
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>Finalizar</h2>
                  <p style={{ color: "var(--muted)" }} className="text-sm">Escolha sua foto e a logo do negócio.</p>
                </div>

                <div className="flex justify-around items-center py-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-inner group"
                        style={{ backgroundColor: "var(--background)", border: "2px solid var(--border)" }}
                      >
                        {avatar
                          ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                          : <User size={32} style={{ color: "var(--border)" }} />
                        }
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                      <label className="absolute -bottom-1 -right-1 p-3 bg-[#fd9602] rounded-2xl text-zinc-950 cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Upload size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'avatar')} />
                      </label>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Sua Foto</span>
                  </div>

                  {/* Logo */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner group"
                        style={{ backgroundColor: "var(--background)", border: "2px solid var(--border)" }}
                      >
                        {logo
                          ? <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                          : <Store size={32} style={{ color: "var(--border)" }} />
                        }
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={24} className="text-white" />
                        </div>
                      </div>
                      <label className="absolute -bottom-1 -right-1 p-3 bg-[#fd9602] rounded-2xl text-zinc-950 cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'logo')} />
                      </label>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Logo</span>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={prevStep}
                    disabled={loading}
                    className="flex-1 py-5 rounded-2xl font-bold flex items-center justify-center transition-all"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-[3] btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Já tem uma conta?{" "}
              <a href="/" className="text-[#fd9602] hover:underline font-bold ml-1">
                Fazer Login
              </a>
            </p>
          </div>
        </main>
      </motion.div>

      <footer className="mt-8 z-10 text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "var(--muted)" }}>
        Agendei. Platform &copy; 2026 — Gestão Inteligente
      </footer>

      {tempImage && (
        <ImageCropModal
          image={tempImage}
          isOpen={isCropModalOpen}
          onClose={() => { setIsCropModalOpen(false); setTempImage(null); }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
