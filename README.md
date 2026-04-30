# Agendei. 🪒💇‍♂️

**Agendei.** é uma plataforma completa de agendamento e gestão para barbearias e salões de beleza, desenvolvida como projeto acadêmico com foco em elegância, performance e arquitetura moderna.

## 🚀 Tecnologias

### Frontend Mobile
- **Linguagem:** Kotlin
- **UI Framework:** Jetpack Compose (Material Design 3)
- **Arquitetura:** MVVM

### Backend
- **Linguagem:** Java 21+
- **Framework:** Spring Boot 3.x
- **Arquitetura:** Clean Architecture (Domain-Driven Design principles)
- **Segurança:** Spring Security + JWT
- **Documentação:** Swagger/OpenAPI

### Dashboard Web
- **Linguagem:** TypeScript
- **Framework:** Next.js / React
- **Gráficos:** Chart.js ou Recharts
- **Hospedagem:** Vercel

### Infraestrutura & Banco de Dados
- **Relacional:** PostgreSQL ([Supabase](https://supabase.com))
- **NoSQL:** MongoDB ([Atlas](https://mongodb.com/atlas))
- **Push Notifications:** [Firebase](https://firebase.google.com)
- **Hospedagem API:** [Render](https://render.com) ou [Koyeb](https://koyeb.com)
- **Hospedagem Dashboard:** [Vercel](https://vercel.com)
- **Imagens:** [Cloudinary](https://cloudinary.com)

## 📁 Estrutura do Projeto

```text
Agendei/
├── mobile/             # Aplicativo Android nativo (Kotlin)
├── backend/            # API RESTful (Java/Spring Boot)
├── dashboard/          # Painel administrativo web (TypeScript/Next.js)
├── spec/               # Spec Driven Development (SDD)
│   ├── design/         # Protótipos e especificações de UI
│   ├── history/        # Histórico de tarefas e decisões
│   └── architecture/   # Definições técnicas e diagramas
├── .agent.rules.sdd.md # Regras de gestão do projeto
└── README.md           # Visão geral
```

## 🛠 Metodologia de Desenvolvimento

Utilizamos **Spec Driven Development (SDD)**. Toda alteração deve ser precedida por uma especificação e documentada no histórico do projeto em `spec/history/`.

---

*Desenvolvido para fins acadêmicos - Grupo UMC*