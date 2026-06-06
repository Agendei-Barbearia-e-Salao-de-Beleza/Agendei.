# Master Task: SaaS Control Center Redesign & Observability

Você (Claude) assumirá o papel de 'Senior UX Engineer' e 'Backend Specialist' para aplicar um redesign cirúrgico no painel do SaaS (`saas/src/app/dashboard/page.tsx` e componentes relacionados) e implementar a inteligência do Bot Autônomo.

## 1. UI/UX e Comportamento
- **Design System Premium:** Aplique um estilo ultra-moderno (glassmorphism sutil, bordas arredondadas, fundos dark/light com gradientes radiais). O objetivo é ser elegante e minimalista.
- **Animações Fluidas:** Adicione interações muito suaves nos cards e botões utilizando `framer-motion` ou `gsap`.
- **Drawer de Notificações:** Refatore o atual ícone de sino (notificações) no Header. Em vez de um popover minúsculo, o sino deve disparar a abertura de um **Drawer Lateral** fluido (deslizando da direita para a esquerda). Esse Drawer será a central oficial do "Bot de Respeito".

## 2. Restauração do Banco de Dados (Supabase SSR)
- **Não quebre o backend:** O app puxava dados reais no passado (ex: commit `e1262cc`). O seu refactor **DEVE** garantir que o dashboard continue fazendo o fetch real (`loadData()`) das tabelas do Supabase e injetando as informações nos novos cards.
- **Stack & Credenciais:** Use os padrões do App Router com `@supabase/ssr` (`createBrowserClient` ou `createServerClient`).
  - `NEXT_PUBLIC_SUPABASE_URL=https://vpalasmdcxnhpsbwmsqq.supabase.co`
  - As tabelas usadas são: `estabelecimentos`, `usuarios`, `agendamentos`, `system_bugs` e `app_versions`. Em hipótese alguma use mocks nessas áreas de negócio.

## 3. O Bot de Respeito (Avisos Autônomos de Observabilidade)
- O sistema já possui um verificador no arquivo `saas/src/app/api/apm/route.ts` e um componente `ApmDashboard.tsx`.
- O Bot de Respeito (presente no novo Drawer de Notificações) não deve apenas responder perguntas chatas; ele deve **escutar o APM ativamente** e alertar se as coisas caírem.
- **PROIBIDO usar Toasts ou "Alerts" feios de navegador.** Se o serviço ficar Degradado ou Offline, desenhe **Componentes de Alerta Customizados** e bonitos que aparecem sozinhos na tela ou no Drawer.
- **Exemplo de como renderizar as falhas:**
  - 🔴 **Supabase DB:** [Offline] - "Error: supabaseKey is required" (0ms)
  - 🟠 **Backend API:** [Degradado] - "HTTP 404" (902ms)
  - 🟠 **Firebase FCM:** [Degradado] - "Variáveis de ambiente Firebase não configuradas"
- Faça esses cards de observabilidade pulsarem com uma badge de **"Atenção"**, mostrando o horário da verificação.

## 4. Integração Push (Firebase OTA)
- As chaves de Admin (Private Key e Email) já estão no `.env.local`. Prepare a estrutura de disparo para quando a feature de OTA Update (atualizações de app pelo SaaS) for solicitada, integrando-a com os painéis ou modais criados.

**Missão:** Execute o código. Seja cirúrgico, reescreva o `page.tsx` mantendo os estados funcionais, insira o Drawer e transforme os antigos dados mockados no fetch fiel e limpo do Supabase.
