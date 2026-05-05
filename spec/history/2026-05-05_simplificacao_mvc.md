# History: 2026-05-05 - Simplificação para MVC

**Status:** Concluído ✅
**Autor:** Antigravity (AI Agent)

## 🎯 Objetivos
- Migrar a arquitetura proposta de Clean Arch/DDD para **MVC**.
- Simplificar o guia do desenvolvedor para facilitar o onboarding da equipe.
- Atualizar o README e o Roadmap com a nova estratégia.

## 📝 Tarefas
- [x] Atualizar `README.md` (Remoção de Clean Arch).
- [x] Atualizar `spec/architecture/developer_guide.md` (Foco em MVC).
- [x] Notificar o Líder Técnico sobre a mudança.
- [x] Gerar script SQL de inicialização (`backend/src/main/resources/db/init.sql`).
- [x] Configurar `application.properties` para conexão com Supabase.
- [x] Otimizar Pool de Conexões (HikariCP) para planos gratuitos.
- [x] Criar `StatusController` para monitoramento e keep-alive.
- [x] Configurar suporte a Cloudinary no Backend para gestão de imagens.
- [x] Criar `vercel.json` para otimização do Dashboard.

## 💡 Decisões de Arquitetura
1. **MVC Simplificado**: Utilizaremos a estrutura `Controller -> Service -> Repository -> Model`. É um padrão mais conhecido e fácil de ensinar para quem está começando.
2. **KISS**: Decisão estratégica para garantir a entrega no prazo de 1 mês.

## 🚀 Próximos Passos
1. Implementar o primeiro CRUD (Users/Auth) seguindo o padrão MVC.
2. Criar a estrutura de pacotes (folders) no projeto Java.
