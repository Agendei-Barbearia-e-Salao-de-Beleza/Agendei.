# 2026-06-05 — SaaS Portal: Premium UX Re-Design + Bot de Respeito

## Escopo
Re-design cirúrgico do Portal SuperAdmin (`saas/`) elevando a UX/UI para padrão premium de classe mundial, com motor de alertas proativo (Bot de Respeito) e correção do mapeamento do schema real do Supabase.

---

## Arquivos Criados

### `saas/src/components/NotificationDrawer.tsx` ✅
- Drawer lateral com AnimatePresence (slide da direita, spring 380/38)
- Duas seções com tabs animadas: **Alertas** + **Chat Bot**
- `BotAlert` interface exportada com tipos: `info | warning | danger | success`
- Badge de não-lidos em vermelho na tab Alertas
- Botão "Marcar todas como lidas"
- Dismiss individual de alertas (motion.div com exit animation)
- Chat interativo migrado do drawer GSAP legado
- Backdrop com `backdrop-blur-[2px]` — fecha ao clicar fora
- Strip de gradiente no topo do drawer como detalhe visual
- Dark/Light mode completo

---

## Arquivos Modificados

### `saas/src/app/dashboard/page.tsx`

#### Remoções
- `chatDrawerRef`, `isChatOpen` state e GSAP chat drawer effect (era frágil — falhava com ref nulo)
- DOM do chat drawer antigo (`div ref={chatDrawerRef}`)
- Floating Bot FAB (substituído pela bell com badge)
- Popover de notificações estático (dados fictícios hardcoded)
- Imports não-utilizados: `ShieldAlert, CheckCircle, Bot, Send, GitBranch, X, User`

#### Adições
- `isDrawerOpen` state → controla o drawer unificado
- `botAlerts: BotAlert[]` state → array de alertas injetados pelo monitor
- `injectBotAlert()` helper — deduplica por título, adiciona timestamp/id/read:false
- `hasInjectedAlertsRef` → garante que o monitor injeta alertas apenas na primeira carga
- **Bot de Respeito** (useEffect que dispara após `loading=false`):
  - Bugs `CRITICAL` → alerta `danger` com plataforma + mensagem truncada
  - ≥5 bugs sem resolução → alerta `warning`
  - Parceiros sem lat/lng → alerta `info` com instrução SQL
  - Carga bem-sucedida → alerta `success` com contagem de dados
- `loadData()` corrigido para o schema real do Supabase:
  - `estabelecimentos` com join: `proprietario:usuarios!proprietario_id(nome, email, telefone)`
  - `usuarios`: usa `perfil` (não `cargo`/`role`) e `criado_em` (não `created_at`)
  - `system_bugs`: tratado silenciosamente se tabela ainda não existir
  - Fallback de `plano`/`valor_plano` neutro (colunas não existem no schema atual)
  - `injectBotAlert("danger")` no catch da falha de carga
- Bell no header com badge numérico de alertas não-lidos (substitui dot fixo)
- `<NotificationDrawer>` com todas as props wire

#### Re-design OVERVIEW (glassmorphism premium)

**KPI Cards** (4 cards):
- `motion.div` com `initial/animate` stagger (delay 0, 80, 160, 240ms)
- `whileHover={{ y: -2 }}` para lift sutil
- Glassmorphism: `bg-zinc-900/60 backdrop-blur-sm ring-1`
- Radial gradient BG por acento de cor (`bg-gradient-to-br from-X/20 to-X/5`)
- Top accent line: `bg-gradient-to-r from-transparent via-white/10 to-transparent`
- Emoji contextual por KPI (🏢 💰 📅 🐛/✅)
- Badge de subtítulo com pill rounded-full

**Chart Card (Atividade dos Servidores)**:
- Glassmorphism + `ring-1 ring-zinc-800/30` + radial amber glow BG
- Barras como `motion.div` com `scaleY: 0 → 1` staggered (origin-bottom)
- Hover label animado com `motion.span` fade-in
- Sombra `shadow-[#fd9602]/20` nas barras para profundidade

**Salões Parceiros card**:
- Glassmorphism + radial amber glow BG sutil
- Cada row com `motion.div` slide-in-x staggered
- Botão Play com `whileHover/whileTap` scale
- "Ver Todos →" com `whileHover={{ x: 2 }}`
- Empty state com ícone dentro de container rounded-2xl

**Gradient CTAs (verde / roxo)**:
- Adicionado `radial-gradient` inner overlay para profundidade
- Botão com `whileHover/whileTap` scale
- Roxo migrado de `from-purple-500` para `from-violet-500 via-purple-600 to-indigo-600` (mais premium)
- Texto branco no card roxo (antes era `text-zinc-950` sobre roxo — baixo contraste)

---

## Correções de Schema (SQL)

O schema real de produção não possui:
- `plano_tipo`, `valor_plano`, `mensalidade`, `status_assinatura` em `estabelecimentos`
- `proprietario_nome` em `estabelecimentos` (é `proprietario_id` → FK para `usuarios`)
- `cargo`/`role` em `usuarios` (é `perfil` — enum `perfil_usuario`)
- `created_at` em `usuarios` (é `criado_em`)

Migrations pendentes (ainda necessárias):
```sql
ALTER TABLE estabelecimentos
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plano_tipo TEXT DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS valor_plano NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS pipeline_commits (...);
CREATE TABLE IF NOT EXISTS releases (...);
CREATE TABLE IF NOT EXISTS system_bugs (...);
ALTER TABLE system_bugs ADD COLUMN IF NOT EXISTS resolution_note TEXT, resolved_by TEXT, resolved_at TIMESTAMPTZ;
```

---

## Resultado Build
- `tsc --noEmit` → 0 erros
- `npm run build` → ✓ Compiled successfully
- Bundle `/dashboard`: 121 kB (246 kB First Load JS)
