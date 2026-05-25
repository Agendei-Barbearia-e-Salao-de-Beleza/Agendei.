# Plano de Implementação: Melhorias Estéticas, Tradução Integral e Integração Git para Atualizações OTA

Este plano estabelece a orquestração de novas melhorias funcionais e visuais de altíssima fidelidade solicitadas para o portal administrativo do **Agendei SaaS Control**, de acordo com as diretrizes do Spec Kit e SDD.

---

## 🎯 Escopo da Sprint

1. **Sidebar Fixa com Tooltips Premium:**
   * Garantir que a barra lateral de navegação seja fixada de forma absoluta na tela.
   * Desenvolver tooltips flutuantes de alto contraste em português (`Visão Geral`, `Mapa & Salões`, `Gerenciar Logins`, `Lançar Versão`, `Logs de Bugs`) que aparecem com transições de escala suaves e glows no hover de cada botão circular.

2. **Tradução de Todo o Painel para Português:**
   * Varredura sistemática do front-end para converter qualquer string ou legenda em inglês para o português brasileiro nativo.

3. **Refinamento e Expansão Vertical da Tela de Localização (`PARTNERS`):**
   * Ampliar a altura da área do mapa Leaflet e da lista de parceiros adjacente de `h-[28rem]` para um generoso `h-[38rem]` para evitar qualquer tipo de corte de layout ou scroll reduzido.
   * Embelezar a lista à direita com espaçamentos confortáveis, tipografia robusta e tags perfeitamente legíveis.

4. **Detecção e Lançamento de Builds Inteligente Baseado em Commits do Git (mobile/):**
   * Integrar a tela `UPDATES` com o endpoint de API do Next.js `/api/git-commits`.
   * Renderizar os commits do Git que afetaram a pasta `mobile/`, detalhando o histórico do que foi desenvolvido pelo time no aplicativo do gerente.
   * Adicionar o botão de ação rápida "Gerar Build a partir deste Commit" para preencher instantaneamente o formulário de versão e changelog para o administrador do SaaS, tornando o processo de homologação OTA eficiente e livre de digitação manual.

---

## 🛠️ Arquitetura e Roteiro de Tarefas

- [x] **Criar Endpoint `/api/git-commits`:** Rota criada para rastrear commits do Git local na pasta `/mobile` com fallbacks automáticos de produção.
- [ ] **Ajustar Estilo da Sidebar & Tooltips no `page.tsx`:** Ajustar posicionamento fixo, transições dinâmicas de hover e tooltips em português.
- [ ] **Traduzir Textos Globais no `page.tsx`:** Mapear e converter strings para português.
- [ ] **Otimizar Tela de Localização (`PARTNERS`):** Aumentar altura da seção para `h-[38rem]` e aprimorar visual dos cards de Salões Parceiros.
- [ ] **Integrar Seção de Commits do Git na Tela de `UPDATES`:** Exibir os commits e implementar a função de auto-preenchimento e homologação de APKs OTA.
- [ ] **Executar Testes de Compilação:** Validar com `npm run build`.

---

## 🧪 Matriz de Validação
O dashboard deve compilar sem lints e warnings pendentes e exibir todas as informações de forma simétrica nos modos claro e escuro.
