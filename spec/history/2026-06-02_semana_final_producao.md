# 📋 Spec — Semana Final de Produção: Agendei Platform
**Data:** 2026-06-02  
**Branch:** `feature/mobile-screens-and-api`  
**Status:** 🟡 Última semana de produção — Preparação para entrega

---

## ✅ Tarefas Concluídas Esta Sessão

- [x] `LoginScreen` — Reescrita completa: flat design (sem card), botão voltar, inputs modernos
- [x] `RegisterScreen` — Reescrita completa: flat design (sem card), botão voltar em ambas etapas, 2-step flow limpo
- [x] `SelectCategoryScreen` — Botão Voltar adicionado (Passo 1 de 4)
- [x] `SelectServiceScreen` — Botão Voltar adicionado (Passo 2 de 4)
- [x] `SelectDateScreen` — Botão Voltar adicionado (Passo 3 de 4)
- [x] `SelectTimeScreen` — Botão Voltar adicionado (Passo 4 de 4)
- [x] `SummaryScreen` — Ícones corrigidos: fundo branco no light mode, zinc-800 no dark
- [x] `SettingsScreen` — Placeholders padronizados: `Ex: Wesley Souza`, `Ex: (11) 99999-9999`
- [x] Build validado: `npm run build` ✅ exit code 0

## 🔲 Backlog (Semana Final)

- [ ] Deploy Vercel: `mobile` (PWA para iOS)
- [ ] Deploy Vercel: `dashboard` (Manager Web)
- [ ] Deploy Vercel: `saas` (SaaS Portal)
- [ ] APK Android: `mobile` (Agendei.)
- [ ] APK Android: `dashboard` (Agendei Gerente)
- [ ] Merge `feature/mobile-screens-and-api` → `main`
- [ ] Supabase: `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento VARCHAR(50);`

---

## 🏗️ Arquitetura da Plataforma

```
Agendei Platform
├── mobile/          → Vite + React + Capacitor (Cliente Android/PWA iOS)
├── dashboard/       → Next.js (Manager Web + Android via Capacitor)  
├── saas/            → Next.js (Portal SaaS multi-tenant)
├── backend/         → Spring Boot + PostgreSQL + MongoDB
└── landing/         → Landing page marketing
```

**Banco de dados:** Supabase (PostgreSQL gerenciado na nuvem)  
**Auth:** Supabase Auth (JWT)  
**Storage:** Cloudinary (avatares, imagens de serviços)  
**Push:** Firebase (notificações nativas)

---

## 🌐 Plano de Deploy Vercel

| App | Diretório | URL alvo | Notas |
|-----|-----------|----------|-------|
| Agendei. (Cliente) | `mobile/` | `app.agendei.com.br` | PWA para iOS |
| Agendei Gerente | `dashboard/` | `gerente.agendei.com.br` | PWA + web |
| SaaS Portal | `saas/` | `saas.agendei.com.br` | Multi-tenant |

---

## 📱 Plano APK Android

| App | Nome | Ícone | Package |
|-----|------|-------|---------|
| Cliente | `Agendei.` | Tesoura laranja fundo preto | `com.agendei.app` |
| Gerente | `Agendei Gerente` | Tesoura + coroa laranja | `com.agendei.gerente` |

**Processo:** Vite build → `npx cap sync` → Android Studio → APK/AAB

---

## 🎨 Design System

- **Primary:** `#fd9602` (amber/orange)
- **Dark BG:** `#09090b` (zinc-950)
- **Light BG:** `#fafafa` (zinc-50)
- **Inputs (dark):** `bg-zinc-900 border-zinc-800`
- **Inputs (light):** `bg-zinc-100 border-zinc-200`
- **Radius:** `rounded-2xl` (16px) para inputs, `rounded-3xl` (24px) para cards/modais
- **Font:** sistema (Inter via Tailwind)

---

## 🗄️ Schema Supabase (Produção)

Execute no SQL Editor do Supabase Dashboard:

```sql
-- Garantir coluna de data de nascimento
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS data_nascimento VARCHAR(50);

-- RLS: clientes veem apenas seus próprios agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "cliente_own_agendamentos" 
  ON public.agendamentos FOR ALL 
  USING (auth.uid() = cliente_id);
```
