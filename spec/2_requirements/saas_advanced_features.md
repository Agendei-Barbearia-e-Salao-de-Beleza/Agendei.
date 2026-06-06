# Requisitos Funcionais — SaaS Portal: Funcionalidades Avançadas

**Fase:** 2 — Especificação de Requisitos  
**Módulo:** `saas/` — Portal SuperAdmin  
**Data:** 2026-06-05  
**Autor:** Matheus Lucindo (via Jarvis Cognitive Engine)  
**Status:** RASCUNHO

> **Restrição de Fase:** Este documento descreve **o quê** o sistema deve fazer e **por quê** — não como. Nenhuma decisão de pilha tecnológica, esquema de banco de dados ou trecho de código deve constar aqui.

---

## Contexto e Motivação

O Portal SuperAdmin do Agendei. é a camada de controle central da plataforma SaaS multi-tenant. Atualmente, ele exibe KPIs básicos e uma lista de parceiros. O objetivo desta especificação é elevar o portal ao nível de uma ferramenta de engenharia de produção real, dando ao SuperAdmin visibilidade geoespacial, controle de releases, observabilidade de infraestrutura e rastreamento de bugs — tudo consumindo exclusivamente dados reais de produção.

---

## Feature 1 — Visualização Geoespacial dos Tenants

### Objetivo de Negócio
O SuperAdmin precisa enxergar a distribuição geográfica da plataforma em tempo real: onde estão os estabelecimentos ativos, onde estão concentrados os usuários e onde existem agendamentos ocorrendo. Isso permite decisões estratégicas de expansão, identificação de regiões com baixa adoção e detecção de clusters de alta demanda.

### Fluxo do Usuário
1. O SuperAdmin acessa a tab **OVERVIEW** do portal.
2. Uma visualização de mapa ocupa a seção central/principal da tela.
3. O mapa exibe marcadores ou pontos de calor representando cada estabelecimento (tenant) com coordenadas geográficas cadastradas.
4. Ao passar o cursor sobre um marcador, o SuperAdmin vê um resumo rápido: nome do estabelecimento, cidade, quantidade de agendamentos do mês e status (ativo/inativo).
5. Ao clicar em um marcador, o painel lateral é atualizado para exibir os detalhes completos daquele tenant.
6. O mapa suporta zoom e pan livres. Marcadores muito próximos se agrupam visualmente (cluster) para evitar poluição visual.
7. O mapa deve ter aparência **premium e tridimensional**, com profundidade visual que transmita sofisticação — diferente de um mapa de rua comum.

### Regras de Negócio
- Apenas estabelecimentos com coordenadas geográficas cadastradas são exibidos no mapa.
- O mapa deve refletir o estado atual do banco de dados de produção; não há cache manual — a atualização ocorre ao recarregar a página ou ao acionar o botão de refresh global.
- Estabelecimentos inativos podem aparecer com uma representação visual distinta (ex: marcador apagado ou translúcido), mas não devem ser ocultados.
- **Zero dados fictícios**: se nenhum estabelecimento tiver coordenadas, o mapa exibe uma mensagem de estado vazio, nunca pontos de exemplo.

---

## Feature 2 — Pipeline de CI/CD Visual

### Objetivo de Negócio
O SuperAdmin precisa ter visibilidade do ciclo de vida de desenvolvimento dos aplicativos (Cliente e Gerente) diretamente no portal. Isso elimina a necessidade de alternar para ferramentas externas de CI/CD para verificar o estado de um commit e permite correlacionar uma falha de produção com a versão exata que a introduziu.

### Fluxo do Usuário
1. O SuperAdmin acessa a tab **UPDATES** (ou uma nova sub-seção dedicada).
2. O painel exibe duas colunas (ou duas seções): uma para o **App Cliente** e outra para o **App Gerente**.
3. Cada coluna exibe uma fila cronológica dos commits mais recentes de cada repositório, do mais novo ao mais antigo.
4. Cada item da fila exibe: hash curto do commit, mensagem, autor, data/hora e um indicador de status (ex: Pendente, Em Build, Aprovado, Falhou).
5. O SuperAdmin pode clicar em um commit para expandir seus detalhes: lista de arquivos alterados, link para o repositório externo e histórico de status daquele commit.
6. Commits com status "Falhou" devem ter destaque visual imediato (ex: borda vermelha, ícone de alerta).

### Regras de Negócio
- Os dados de commits devem vir de um repositório de controle de versão real (produção), não de mocks.
- O pipeline deve separar claramente os commits do App Cliente dos commits do App Gerente — nunca misturá-los na mesma fila.
- O status de cada commit deve refletir o resultado real do processo de build/deploy, não um estado assumido.
- A lista deve exibir no mínimo os 10 commits mais recentes por aplicativo.
- Se a integração com o repositório estiver indisponível, o painel exibe um estado de erro explícito, não uma lista vazia silenciosa.

---

## Feature 3 — Emulador Integrado de Dispositivo (Device Preview)

### Objetivo de Negócio
O SuperAdmin precisa visualizar como o aplicativo se comporta em uma versão específica de commit, diretamente no portal, sem precisar instalar o APK ou configurar um ambiente local. Isso acelera a validação de releases e permite comparar o comportamento entre versões antes de promover um commit para produção.

### Fluxo do Usuário
1. Na fila de commits do **Pipeline de CI/CD Visual** (Feature 2), o SuperAdmin seleciona um commit específico.
2. Uma ação "Pré-visualizar" está disponível para aquele commit.
3. Ao acionar a pré-visualização, um painel ou modal se abre exibindo um wireframe de dispositivo móvel (contorno de smartphone — ex: iPhone ou Samsung Galaxy).
4. Dentro do wireframe, o aplicativo correspondente àquele commit é renderizado em modo de leitura.
5. O SuperAdmin pode interagir com o preview (scroll, toque simulado) para validar a interface.
6. O painel deixa claro qual aplicativo está sendo exibido: **App Cliente** ou **App Gerente** — nunca ambos misturados na mesma visualização.
7. O SuperAdmin pode alternar entre os dois simuladores (Cliente / Gerente) sem fechar o painel.

### Regras de Negócio
- O emulador deve isolar completamente o App Cliente do App Gerente — selecionar um commit do App Cliente nunca deve exibir a interface do App Gerente, e vice-versa.
- O wireframe do dispositivo é estático (apenas decorativo), mas o conteúdo renderizado deve refletir a versão real do commit selecionado.
- Se a versão do commit não estiver disponível para preview, o sistema exibe uma mensagem clara explicando o motivo (ex: "Build não concluído" ou "Versão não publicada").
- O preview não exige autenticação do usuário final — é uma visualização de inspeção interna do SuperAdmin.

---

## Feature 4 — Gestão de Releases

### Objetivo de Negócio
O SuperAdmin precisa de um mecanismo formal para promover um commit validado a uma versão oficial numerada da plataforma (ex: v1.0.0, v1.0.1, v2.0.0). Isso estabelece um controle de versão semântico sobre os aplicativos em produção, facilita a comunicação com a equipe sobre "o que está em produção" e cria um histórico auditável de releases.

### Fluxo do Usuário
1. Na fila do **Pipeline de CI/CD Visual**, o SuperAdmin identifica um commit com status "Aprovado".
2. Uma ação "Criar Release" está disponível para commits aprovados.
3. Ao acionar "Criar Release", um modal é exibido solicitando:
   - Número da versão (ex: v1.2.0) — sugerido automaticamente pelo sistema com base no último release.
   - Notas de versão (changelog em texto livre).
   - Confirmação do aplicativo alvo (Cliente ou Gerente).
4. Ao confirmar, o sistema registra o release e o exibe na lista de versões oficiais.
5. A tab **UPDATES** (ou sub-seção de Releases) exibe um histórico de todos os releases oficiais, do mais recente ao mais antigo, com: número de versão, data, commit associado, aplicativo e notas.
6. O SuperAdmin pode consultar os detalhes de qualquer release passado a qualquer momento.

### Regras de Negócio
- Apenas commits com status "Aprovado" no pipeline podem ser promovidos a releases.
- O número de versão deve seguir o padrão semântico (MAJOR.MINOR.PATCH). O sistema sugere o próximo número, mas o SuperAdmin pode sobrescrever.
- Cada release é imutável após criado: não é possível editar o commit associado ou o número de versão. Apenas as notas de versão podem ser atualizadas.
- Um mesmo commit não pode ser associado a dois releases com números distintos.
- O histórico de releases deve ser persistido em produção — não em memória local ou mock.

---

## Feature 5 — Observabilidade de Produção (APM)

### Objetivo de Negócio
O SuperAdmin precisa de uma visão consolidada da saúde da infraestrutura de produção da plataforma: o backend está respondendo? O banco de dados está operacional? As notificações push estão sendo entregues? Sem essa visibilidade, problemas de produção são detectados apenas quando usuários reclamam.

### Fluxo do Usuário
1. O SuperAdmin acessa a tab **OVERVIEW** (ou uma nova tab **INFRA**).
2. Um conjunto de painéis (cards de métricas) exibe o estado atual dos serviços:
   - **Backend API**: status (Online/Offline/Degradado), tempo médio de resposta, total de requisições nas últimas 24h.
   - **Banco de Dados**: status da conexão, latência média de queries, total de operações nas últimas 24h.
   - **Push Notifications (Firebase)**: total de notificações enviadas, taxa de entrega (%), falhas nas últimas 24h.
3. Cada painel tem um indicador visual de status (verde = saudável, amarelo = degradado, vermelho = falha).
4. O SuperAdmin pode clicar em um painel para ver um gráfico temporal das métricas daquele serviço (ex: últimas 24h, 7 dias).
5. Se um serviço apresentar degradação, um alerta visual proeminente aparece no topo da página.

### Regras de Negócio
- Todos os dados de métricas devem vir de fontes de produção reais — não devem ser simulados ou estimados.
- O status dos serviços deve ser atualizado automaticamente a cada intervalo definido (polling ou streaming), sem necessidade de o SuperAdmin recarregar a página manualmente.
- Se uma métrica não estiver disponível (ex: serviço de APM não configurado), o painel exibe "Dados indisponíveis" com uma explicação — nunca um valor zero falso.
- Alertas de degradação devem persistir na tela até que o serviço se recupere, mesmo que o SuperAdmin navegue entre tabs.

---

## Feature 6 — Rastreamento de Bugs (Bug Tracking)

### Objetivo de Negócio
O SuperAdmin precisa capturar, visualizar e gerenciar bugs reportados pelos aplicativos em produção (App Cliente e App Gerente) em um único painel centralizado. Atualmente, erros de produção são invisíveis ao SuperAdmin até que um usuário relate manualmente o problema.

### Fluxo do Usuário
1. O SuperAdmin acessa a tab **BUGS** do portal.
2. A tela exibe a lista de todos os bugs capturados, com: título do erro, descrição, aplicativo de origem (Cliente ou Gerente), data/hora, usuário afetado e status atual (Aberto, Em análise, Resolvido).
3. O SuperAdmin pode filtrar bugs por: aplicativo de origem, status, data e severidade.
4. Ao clicar em um bug, um painel de detalhes exibe: stack trace completo, contexto do dispositivo do usuário, versão do app, e histórico de atualizações de status.
5. O SuperAdmin pode atualizar o status de um bug (ex: marcar como "Em análise" ou "Resolvido") e adicionar uma nota interna.
6. Uma visão alternativa em formato **Kanban** organiza os bugs em colunas por status (Aberto | Em análise | Resolvido), permitindo arrastar e soltar para mudar o status.
7. Bugs de alta severidade (ex: crashes que afetam múltiplos usuários) devem ter destaque visual prioritário na lista.

### Regras de Negócio
- Os bugs exibidos devem vir exclusivamente de relatórios de erro reais enviados pelos aplicativos em produção — nunca de dados fictícios inseridos manualmente para demonstração.
- O aplicativo de origem de cada bug deve ser identificado automaticamente pelo sistema, não requer input manual do SuperAdmin.
- A contagem de bugs abertos deve ser visível no ícone/badge da tab BUGS para que o SuperAdmin saiba se há pendências sem precisar entrar na tab.
- Bugs marcados como "Resolvido" não devem desaparecer da lista — devem permanecer no histórico com status atualizado.
- O filtro padrão ao abrir a tab exibe apenas bugs com status "Aberto" ou "Em análise".

---

## Feature 7 — Restrição Arquitetural: Zero Dados Fictícios

### Objetivo de Negócio
A confiabilidade e credibilidade do Portal SuperAdmin dependem de que todos os dados exibidos sejam reais. Dashboards com dados fictícios ou de exemplo distorcem a percepção do estado real da plataforma e podem levar o SuperAdmin a tomar decisões incorretas.

### Regra Central
**Nenhuma tela, painel, card, gráfico, tabela ou mapa do Portal SuperAdmin pode exibir dados fictícios, de exemplo, gerados aleatoriamente ou inseridos manualmente para fins de demonstração.**

### Fluxo do Usuário e Estados Válidos
1. Quando uma funcionalidade depende de dados que ainda não existem em produção (ex: nenhum estabelecimento cadastrado com coordenadas geográficas), o sistema exibe um **estado vazio** claro e honesto:
   - Um ícone representativo da funcionalidade.
   - Uma mensagem explicativa em linguagem natural (ex: "Nenhum estabelecimento com localização cadastrada ainda.").
   - Opcionalmente, uma chamada para ação indicando o que precisa ser feito para popular aquele dado.
2. Quando uma integração externa está indisponível (ex: API de commits do repositório fora do ar), o sistema exibe um **estado de erro** explícito — nunca fallback para mocks.
3. O carregamento de dados deve ter um indicador de progresso visível (ex: skeleton loader ou spinner) enquanto a requisição está em andamento.

### Regras de Negócio
- É proibido hardcodar qualquer valor numérico, nome, endereço ou dado de negócio como constante no código de apresentação do portal.
- É proibido o uso de geradores de dados falsos (ex: Faker.js, arrays de objetos de exemplo) em qualquer ambiente que não seja exclusivamente de testes automatizados (nunca em produção).
- Qualquer dado exibido no portal deve ter rastreabilidade até uma fonte de verdade de produção (banco de dados, API externa autenticada ou serviço de métricas real).

---

## Feature 8 — UX/UI: Design Premium Dark & Interações Fluidas

### Objetivo de Negócio
O Portal SuperAdmin deve transmitir excelência técnica e sofisticação visual. Um SuperAdmin que usa esta ferramenta diariamente precisa de uma interface que seja agradável, que reduza a fadiga cognitiva e que comunique status e dados de forma clara e hierárquica. O design deve ser reconhecível como premium imediatamente, sem depender de complexidade desnecessária.

### Princípios Visuais Obrigatórios

#### Esquema de Cores
- **Fundo base**: extremamente escuro, quase preto — transmite profissionalismo e faz os dados se destacarem.
- **Acento único**: a cor primária da marca (#fd9602, amber/laranja) é o único acento de cor permitido para elementos de ação, highlights e indicadores positivos.
- **Hierarquia de superfícies**: três níveis distintos de escuridão para criar profundidade (fundo da página, superfície do card, superfície elevada do modal).
- **Cores de status**: vermelho para falhas/erros, amarelo/âmbar para alertas/degradado, verde para saudável/aprovado — paleta restrita, nunca aleatória.

#### Tipografia
- Fontes com peso extremo (black/900) para headings e KPIs — transmitem autoridade e legibilidade.
- Textos de suporte em peso regular, tamanho reduzido — hierarquia clara sem poluição visual.
- Números de KPI devem ter tipografia diferenciada (tamanho generoso, peso máximo) para leitura imediata.

#### Micro-interações e Animações
- **Transições de entrada**: elementos devem surgir com animações suaves (fade + slide sutil) ao carregar — nunca aparecer instantaneamente sem transição.
- **Hover states**: todo elemento interativo deve ter uma resposta visual ao hover (brilho sutil, escurecimento, borda iluminada) — nunca elementos clicáveis sem feedback.
- **Loading states**: skeletons animados (shimmer) durante o carregamento de dados — nunca spinners centralizados bloqueantes.
- **Feedback de ação**: ao clicar em botões de ação (ex: "Criar Release", "Marcar como Resolvido"), uma animação de confirmação breve deve ser exibida antes do resultado final.
- **Gráficos e charts**: devem ter animação de entrada (ex: barras crescendo, linhas sendo desenhadas) ao serem exibidos pela primeira vez em cada sessão.

#### Layout e Composição
- Sidebar de navegação fixa com ícones e labels claros para cada seção principal.
- Área de conteúdo principal com padding generoso — nunca informações coladas nas bordas.
- Cards de KPI com sombra profunda e bordas sutis — separação visual clara do fundo.
- Modais com fundo semi-transparente e blur do conteúdo por trás — foco total no conteúdo do modal.
- Responsividade: o portal deve funcionar em telas de laptop (1280px+) e monitores wide (1440px+). Não é necessário suporte a mobile.

### Regras de Negócio de UX
- Nenhuma ação destrutiva (ex: excluir um bug, reverter um release) pode ser executada com um único clique — sempre requer confirmação explícita.
- Toda tela deve ter um indicador claro de quando os dados foram atualizados pela última vez (ex: "Atualizado há 2 minutos").
- O SuperAdmin deve poder chegar a qualquer funcionalidade em no máximo 2 cliques a partir da tela principal.
- Mensagens de erro devem ser em linguagem natural e acionável (ex: "Não foi possível carregar os commits. Verifique a conexão com o repositório.") — nunca mensagens técnicas cruas expostas ao SuperAdmin.

---

## Resumo de Dependências entre Features

| Feature | Depende de |
|---------|-----------|
| Visualização Geoespacial | Estabelecimentos com coordenadas no banco de produção |
| Pipeline CI/CD Visual | Integração com repositório de controle de versão real |
| Device Preview | Commits disponíveis no Pipeline CI/CD Visual |
| Gestão de Releases | Commits com status "Aprovado" no Pipeline CI/CD Visual |
| Observabilidade APM | Integração com serviços de métricas de produção |
| Bug Tracking | Aplicativos enviando erros para o banco de produção |
| Zero Dados Fictícios | Todas as features acima devem respeitá-la |
| UX/UI Premium | Aplicada transversalmente em todas as features |

---

## Critérios de Aceitação Gerais

- [ ] Nenhuma tela exibe dados fixos ou fabricados em ambiente de produção.
- [ ] Todos os estados vazios têm mensagem clara e ícone representativo.
- [ ] Todos os estados de erro têm mensagem em linguagem natural.
- [ ] Todas as ações destrutivas exigem confirmação explícita.
- [ ] Todos os elementos interativos têm hover state definido.
- [ ] O Portal carrega e exibe dados reais em menos de 5 segundos em conexão padrão.
- [ ] O App Cliente e o App Gerente são completamente isolados em todas as features que os referenciam.
