# 🧭 O Norte do Agendei.: Guia de Início de Produção

Este guia define a ordem lógica de desenvolvimento para garantir que ninguém fique parado e que as partes se encaixem perfeitamente.

---

## 🏗️ Fase 1: A Fundação (Infraestrutura)
**Por onde começar?** `Docker Compose`.
Antes de codar o Java ou o Kotlin, precisamos do banco de dados rodando.
- **Ação**: Criar um arquivo `docker-compose.yml` na raiz.
- **Objetivo**: Subir o PostgreSQL e o MongoDB com um único comando.
- **Por que?** Isso garante que todos os devs tenham exatamente o mesmo banco de dados.

## 🧠 Fase 2: O Coração (Backend Auth)
**Quem faz?** Devs focados em Java.
O backend é a "fonte da verdade". Sem ele, o Mobile e o Dashboard não têm dados para exibir.
- **Ação**: Implementar o fluxo de **Usuário e Login (JWT)**.
- **Objetivo**: Ter um endpoint que devolva um Token.
- **Por que?** Todas as telas futuras (Mobile e Web) precisarão de um login para funcionar.

## 🎨 Fase 3: As Frentes (Mobile & Dashboard)
**Quem faz?** Devs focados em Kotlin e TypeScript.
Agora o time se divide em duas frentes paralelas:

### Frente A: Mobile (Kotlin)
- **Ação**: Criar a tela de Login e integrar com a API de Auth.
- **Foco**: Aprender Jetpack Compose e como fazer requisições HTTP (Retrofit).

### Frente B: Dashboard (TypeScript)
- **Ação**: Criar a casca do painel administrativo e a tela de login.
- **Foco**: Aprender Tailwind CSS e como salvar o token no navegador.

## 📅 Fase 4: O Negócio (Agendamentos)
**Quando chegamos aqui?** Quando o login estiver funcionando em todo lugar.
Esta é a parte mais complexa e importante:
- **Backend**: Lógica de conflito de horários (não deixar dois clientes marcarem no mesmo minuto).
- **Mobile**: Calendário para o cliente escolher o serviço.
- **Dashboard**: Agenda para o barbeiro ver o dia dele.

---

## 🚩 Resumo da Estratégia "Norte"
1.  **Semana 1**: Todos focados em entender o Banco de Dados e a API de Auth.
2.  **Semana 2**: Divisão. Metade no Mobile, metade no Dashboard, integrando o que foi feito na Semana 1.
3.  **Semana 3**: Início da lógica de Agendamento (Core Business).

> [!TIP]
> **Dica do Agente**: Não tentem fazer o Dashboard e o Mobile ao mesmo tempo se o Backend não tiver entregado os dados primeiro. Sigam o contrato da API!
