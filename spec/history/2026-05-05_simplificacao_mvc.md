# History: 2026-05-05 - Simplificação para MVC e Correção de Ambiente

**Status:** Concluído ✅
**Autor:** Antigravity (AI Agent)

## 🎯 Objetivos
- Migrar a arquitetura proposta de Clean Arch/DDD para **MVC**.
- Simplificar o guia do desenvolvedor para facilitar o onboarding da equipe.
- Atualizar o README e o Roadmap com a nova estratégia.
- **Corrigir ambiente de desenvolvimento (Docker e Node).**

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
- [x] Desenvolver tela inicial premium do Dashboard (Login/Landing) com Inter e Framer Motion.
- [x] Implementar sistema de alertas (Toasts) com Sonner.
- [x] Adicionar validação de formulários e estados de loading.
- [x] Criar página de Recuperação de Senha ("Esqueci minha senha").
- [x] **Resolver conflitos de porta Docker (27017 e 8080) com outros projetos.**
- [x] **Limpar bloqueios do npm e sincronizar monorepo.**
- [x] **Implementar arquitetura base para Firebase Cloud Messaging (FCM).**
- [x] **Criar serviço de notificações push e endpoint de teste.**
- [x] **Documentar guia de setup do Firebase Admin.**

## 💡 Decisões de Arquitetura
1. **MVC Simplificado**: Utilizaremos a estrutura `Controller -> Service -> Repository -> Model`. É um padrão mais conhecido e fácil de ensinar para quem está começando.
2. **KISS**: Decisão estratégica para garantir a entrega no prazo de 1 mês.
3. **Isolamento de Ambiente**: Recomendado desativar outros bancos de dados locais (Docker) antes de rodar o Agendei para evitar conflitos de porta.
4. **Segurança do Firebase**: As chaves privadas (service-account.json) não são versionadas. O sistema agora alerta amigavelmente se a chave estiver faltando em vez de travar o servidor.


## 🚀 Próximos Passos
1. Implementar o primeiro CRUD (Users/Auth) seguindo o padrão MVC.
2. Criar a estrutura de pacotes (folders) no projeto Java.

