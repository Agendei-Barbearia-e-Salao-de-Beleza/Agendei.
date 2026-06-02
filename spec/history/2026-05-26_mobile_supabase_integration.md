# Mobile App - Supabase Integration & UI Alignment
Data: 2026-05-26

## 1. Overview
Migrar o aplicativo mobile do cliente para consumir dados reais do banco de produção (Supabase) no lugar de dados mockados, além de alinhar o design de interface (UI/UX) com o padrão do SaaS (manager app).

## 2. Tarefas de Implementação

- [ ] **Tarefa 1: DashboardScreen (Dados Reais)**
  - Configurar e validar `mobile/src/lib/supabase.ts`.
  - Modificar `DashboardScreen.tsx` para buscar os próximos e últimos agendamentos do usuário usando o cliente do Supabase.

- [ ] **Tarefa 2: Fluxo de Serviços (SelectCategory / SelectService)**
  - Buscar categorias e serviços reais no Supabase em vez dos mocks.
  - Atualizar UI para se assemelhar aos cards premium do SaaS.

- [ ] **Tarefa 3: Fluxo de Agendamento (Datas e Horários)**
  - Atualizar `SelectDateScreen.tsx` e `SelectTimeScreen.tsx` para consumir horários disponíveis reais baseados nas tabelas de agendamento/expediente.

- [ ] **Tarefa 4: Alinhamento Visual / UI**
  - Verificar as cores primárias no projeto SaaS (`globals.css` / Tailwind) e aplicar no projeto mobile (ex: padronizar o laranja premium `#F59E0B` ou a cor correta do Manager).
  - Garantir que fontes, bordas e glassmorphism estejam harmônicos com o manager app.

## 3. Análise de Esquema (Database)
- Precisamos inspecionar as tabelas: `services`, `categories`, `appointments` e `users`/`profiles`.
