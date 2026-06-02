# Mobile App - Refatoração Completa e Paridade com Manager
Data: 2026-05-28

## 1. Visão Geral
O aplicativo mobile do cliente apresenta múltiplas pendências de design, fluxo e integração de dados quando comparado ao aplicativo Manager. Esta especificação aborda a refatoração completa da interface e a correção dos fluxos de dados, garantindo paridade funcional e estética.

## 2. Requisitos e Diagnóstico
O usuário reportou 11 anomalias principais:
1. Temas claro/escuro intermitentes.
2. Ausência de funcionalidade de logout.
3. Agendamento utilizando modais nativos em vez de modais estilizados do app.
4. Falha no envio de dados de `valor` (`totalPrice`), bloqueando pagamentos no Manager.
5. Dashboard exibindo agendamentos antigos e histórico vazio.
6. Avaliações (stars) estáticas/mockadas.
7. Placeholders incorretos (ex: "Wesley") durante o estado de carregamento.
8. Header rolável (não fixo) e ausência de foto de perfil.
9. Módulo de notificações inacessível.
10. Estética dos botões desalinhada com a identidade visual premium.
11. Tabbar fora do padrão arquitetônico do projeto.

## 3. Plano de Execução e Tarefas (SDD Tasks)

- [x] **Tarefa 1: Paridade de UI/UX (Design System)**
  - Migrar botões, modais e Tabbar para utilizar os mesmos padrões encontrados em `mobile/src/components` (ex: pílulas perfeitas, cantos arredondados, contrastes reativos).
  - Fixar o header no topo das telas (`sticky` / `fixed`) e implementar a exibição dinâmica da foto de perfil do usuário.
  - Corrigir a injeção do tema (dark/light) garantindo que as classes do Tailwind (`dark:bg-zinc-950`, etc.) sejam aplicadas globalmente em todas as telas.

- [x] **Tarefa 2: Fluxo de Agendamento (Business Logic)**
  - Substituir os modais nativos do smartphone por componentes React fluidos (`framer-motion`) no momento da seleção de data/hora.
  - Atualizar o payload de submissão do agendamento para incluir o campo `totalPrice` baseado no serviço selecionado.

- [x] **Tarefa 3: Dashboard e Histórico (Data Integration)**
  - Refatorar a query da tela inicial para buscar o **próximo agendamento** válido e atual.
  - Corrigir a query do Histórico para buscar os agendamentos reais do usuário logado ordenados por data.
  - Remover mocks de carregamento (ex: "Wesley") e implementar Skeletons neutros e premium.

- [x] **Tarefa 4: Avaliações e Notificações**
  - Implementar o componente `ReviewsModal` (ou similar) para consumir as avaliações reais do banco de dados para o estabelecimento visualizado.
  - Habilitar o botão/rota de Notificações, conectando-o ao painel de alertas do sistema.

- [x] **Tarefa 5: Autenticação**
  - Implementar a função de `signOut` do Supabase no perfil/configurações, limpando a sessão e redirecionando para a `WelcomeScreen` ou `LoginScreen`.

## 4. Próximos Passos
As tarefas serão implementadas sistematicamente. Iniciaremos pela correção do estado global de Tema e do Header/Tabbar para estabelecer a base de design (Tarefa 1), seguida pela reestruturação do envio de Agendamentos (Tarefa 2) e finalizando com a integração de dados da Dashboard (Tarefa 3 e 4).
