@AGENTS.md
@.agent.rules.sdd.md

# Agendei. — Guia Completo para Agentes

## Visão Geral do Projeto

**Agendei.** é uma plataforma SaaS completa de agendamentos para barbearias, salões de beleza e centros unissex. Projeto acadêmico (UMC) com prazo de entrega **02/06/2026**.

Metodologia: **Spec-Driven Development (SDD)** — toda funcionalidade requer spec prévia em `spec/` e log em `spec/history/`.

---

## Arquitetura da Plataforma

```
Agendei./
├── mobile/       → Vite + React + Capacitor   (Cliente Android APK + PWA iOS)
├── dashboard/    → Next.js 16 + React 19       (Gerente Web + APK Android via Capacitor)
├── saas/         → Next.js 14 + React 18       (Portal SuperAdmin multi-tenant)
├── backend/      → Java 21 + Spring Boot 4     (API REST)
├── landing/      → HTML estático               (Marketing)
└── mcp-server/   → Node.js + TypeScript        (Ferramenta de desenvolvimento MCP)
```

### Banco de Dados
- **PostgreSQL via Supabase** (`vpalasmdcxnhpsbwmsqq.supabase.co`) — produção principal
- **MongoDB Atlas** M0 — logs e configurações
- **Auth**: Supabase Auth (JWT tokens)
- **Storage imagens**: Cloudinary (`dgr8zhgvn`)
- **Push notifications**: Firebase Cloud Messaging (FCM)

### Deploy
| App | Diretório | URL alvo | Vercel Region |
|-----|-----------|----------|---------------|
| Cliente (PWA) | `mobile/` | `app.agendei.com.br` | gru1 |
| Gerente (Web) | `dashboard/` | `gerente.agendei.com.br` | gru1 |
| SaaS Portal | `saas/` | `saas.agendei.com.br` | gru1 |

Backend hospedado em Render/Koyeb (free tier, cold start ~30s esperado).

---

## Design System

### Cores
```
Primary (brand):  #fd9602   (amber/laranja — único acento de cor)
Dark BG:          #09090b   zinc-950
Light BG:         #fafafa   zinc-50
SaaS Dark BG:     #050506   (mais escuro ainda)
```

### Tokens por Modo
```
Modo Dark:
  - Inputs:    bg-zinc-900 border-zinc-800 text-white
  - Modais:    bg-zinc-950/95 border-zinc-900
  - Superfície: bg-zinc-900/80 border-zinc-800/80

Modo Light:
  - Inputs:    bg-zinc-100 border-zinc-200 text-zinc-900
  - Modais:    bg-white border-zinc-200
  - Superfície: bg-white/80 border-zinc-200/60
```

### Raios de Borda
```
rounded-xl   → botões secundários, tags
rounded-2xl  → inputs (16px)
rounded-3xl  → cards, painéis
rounded-[2rem] → modais médios
rounded-[2.5rem] → modais grandes
```

### Tipografia
- **Font**: Plus Jakarta Sans (saas), Inter sistema (mobile/dashboard)
- **Labels**: `text-[10px] font-black uppercase tracking-wider`
- **Headings**: `font-black tracking-tight`
- **Body**: `text-sm` ou `text-xs font-bold`
- Nunca usar glassmorphism nas telas de auth — design **flat**

### Componentes UI (Regras Obrigatórias)
1. **Nenhum card flutuante nas telas de login/registro** — flat design, fundo direto
2. **Botão Voltar** obrigatório em TODOS os steps de fluxo (agendamento, registro, etc.)
3. **Cor primária `#fd9602`** como único acento — nunca usar outras cores de destaque
4. **Animações**: Framer Motion (`initial/animate/transition`) — sem CSS puro para transições de tela
5. **Ícones**: Lucide React exclusivamente
6. **Estados hover**: sempre `hover:bg-*` ou `hover:border-*` — nunca sem hover state em elementos clicáveis
7. **Focus**: `focus:ring-2 focus:ring-[#fd9602]/25` em todos os inputs
8. **Placeholder**: português, formato `Ex: Valor esperado`
9. **Dark/Light mode**: SEMPRE suportar ambos — usar `dark:` prefix do Tailwind

### Padrão de Botão Principal
```tsx
className="w-full py-4 rounded-2xl bg-[#fd9602] hover:bg-amber-600 text-zinc-950 font-black text-sm uppercase tracking-wider transition-all"
```

### Padrão de Input
```tsx
className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#fd9602]/25"
```

---

## Backend (Java + Spring Boot)

### Padrão MVC Obrigatório
```
model/      → Entidades JPA (tabelas do banco)
repository/ → Interfaces JpaRepository
service/    → Regras de negócio
controller/ → Endpoints REST (prefixo /api/v1/)
dto/        → Request/Response bodies
config/     → Beans de configuração
```

### Regras de Código Java
- Java 21, Spring Boot 4.0.6
- Usar **Lombok** (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`)
- Anotações JPA: `@Entity`, `@Table`, `@Column` em todos os campos
- Endpoints REST: sempre `@RestController` + `@RequestMapping("/api/v1/...")`
- CORS configurado para aceitar `localhost:*` + domínios Vercel do projeto
- Comentários `// EXPLICAÇÃO:` em partes complexas (projeto educativo — equipe aprendendo)
- Javadoc em todos os métodos públicos de service

### Endpoints Base (já especificados em spec/architecture/api_contracts.md)
- Auth: `/api/v1/auth/**`
- Usuários: `/api/v1/users/**`
- Estabelecimentos: `/api/v1/establishments/**`
- Serviços: `/api/v1/services/**`
- Agendamentos: `/api/v1/appointments/**`
- Notificações: `/api/v1/notifications/**`

---

## Frontend (React / Next.js)

### Regras Gerais
- TypeScript estrito em todos os projetos
- **Sem `any` desnecessário** — tipar corretamente
- `"use client"` apenas quando necessário (hooks, eventos)
- Estados de loading e erro sempre visíveis ao usuário
- Supabase client: sempre via `@/lib/supabase` — nunca instanciar direto no componente

### Dashboard (Next.js 16 + TailwindCSS v4)
- App Router (`src/app/`)
- Server Components por padrão, Client Components apenas com interatividade
- Auth: Supabase Auth + middleware de proteção de rotas
- Superadmin: rota `/dashboard/superadmin/` com verificação de `role = 'SUPER_ADMIN'`

### SaaS Portal (Next.js 14 + TailwindCSS v3)
- Credenciais SuperAdmin: verificar via localStorage `agendei_saas_session`
- Dados de tenants vêm do Supabase (tabela `estabelecimentos`)
- Mapa de tenants: Leaflet (carregamento dinâmico sem SSR — `dynamic(() => import(...), { ssr: false })`)
- Simulador mobile no painel: preview estático dos agendamentos
- Tabs: OVERVIEW | PARTNERS | LOGINS | UPDATES | BUGS

### Mobile (Vite + React + Capacitor)
- Capacitor App ID: `agendei.app` | App Name: `Agendei Manager`
- Build: `npm run build` → `npx cap sync android` → Android Studio APK
- Para iOS/PWA: deploy no Vercel (`app.agendei.com.br`) + configurar como PWA
- Navegação: React Router DOM — sem framework de router nativo
- Screens: `src/screens/` | Components: `src/components/`

---

## Variáveis de Ambiente

Todas as apps usam o prefixo `NEXT_PUBLIC_` ou variáveis no `.env.local`:

```bash
# Supabase (todas as apps)
NEXT_PUBLIC_SUPABASE_URL=https://vpalasmdcxnhpsbwmsqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable_key>

# Firebase (dashboard + mobile)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project_id>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app_id>

# Cloudinary (dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dgr8zhgvn
```

Para fazer pull das vars do Vercel: `vercel env pull .env.local` (dentro de cada subdiretório).

---

## Supabase Schema (Produção)

Tabelas principais (PostgreSQL):
- `usuarios` — clientes e gerentes
- `estabelecimentos` — barbearias/salões (= tenants)
- `servicos` — catálogo de serviços
- `agendamentos` — bookings (status: PENDENTE → CONFIRMADO/CANCELADO)
- `pagamentos` — registros financeiros
- `indisponibilidades` — pausas da agenda
- `despesas` — despesas do estabelecimento
- `metas` — metas financeiras
- `system_bugs` — erros enviados pelos apps (superadmin)
- `feature_usage_metrics` — analytics de uso (superadmin)
- `app_versions` — versões para OTA updates

RLS habilitado: clientes veem apenas seus próprios agendamentos. SuperAdmin sem RLS.

---

## Workflow SDD Obrigatório (Spec Kit 5 Fases)

Você é um Engenheiro de Software Sênior operando sob a metodologia SDD. **NUNCA** comece a programar antes de validar as 5 fases do ciclo de vida da funcionalidade.

1. 💡 **Fase 1: Ideação (`spec/1_ideation/`)**: Entenda o problema. **Ação:** Leia/crie um doc refinando a ideia. Sem código ainda.
2. 📄 **Fase 2: Especificação (`spec/2_requirements/`)**: **Ação:** Escreva as regras de negócio, fluxos e casos de uso.
3. 🗺️ **Fase 3: Planejamento (`spec/3_plans/`)**: **Ação:** Crie o plano técnico (arquitetura, endpoints, schemas).
4. 📋 **Fase 4: Quebra em Tasks (`spec/4_tasks/`)**: **Ação:** Crie uma checklist granular em Markdown com `[ ]`.
5. 🛠️ **Fase 5: Execução / Implementação**:
   - **REGRA DE OURO:** Antes de modificar código, você **DEVE** ler o arquivo atual em `spec/4_tasks/`.
   - Após cada passo concluído, marque com um `[x]`.
   - Atualize `spec/history/YYYY-MM-DD.md` com um log do dia.

Sempre consulte as skills em `.agents/skills/` ou aguarde o usuário guiar as fases (ex: `/speckit.tasks`).

---

## MCP Server (Ferramenta de Dev)

O projeto tem um servidor MCP em `mcp-server/` com ferramentas para:
- Diagnóstico de portas
- Inspeção do schema PostgreSQL/Supabase
- Geração Java → TypeScript
- Trigger de builds Capacitor

Para usar: `npm run start` dentro de `mcp-server/` e configurar no Claude Code.

---

## Pontas Soltas Conhecidas (Backlog)

- [ ] Deploy Vercel: `mobile/`, `dashboard/`, `saas/`
- [ ] APK Android assinado: mobile (cliente) + dashboard (gerente)
- [ ] Backend: implementar endpoints CRUD completos (apenas status + notifications existem)
- [ ] Supabase: `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento VARCHAR(50);`
- [ ] Supabase: criar tabelas `system_bugs`, `feature_usage_metrics`, `app_versions`
- [ ] Firebase: colocar `service-account.json` em `backend/src/main/resources/`
- [ ] Merge `feature/mobile-screens-and-api` → `main`
