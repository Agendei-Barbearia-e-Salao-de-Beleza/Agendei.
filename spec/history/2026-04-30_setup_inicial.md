# History: 2026-04-30 - Inicialização do Projeto Agendei.

**Status:** Concluído ✅
**Autor:** Antigravity (AI Agent)

## 🎯 Objetivos
- Configurar a estrutura base do repositório.
- Definir as regras de Spec Driven Development (SDD).
- Documentar a stack tecnológica e arquitetura proposta.

## 📝 Tarefas
- [x] Criar estrutura de pastas (`mobile`, `backend`, `dashboard`, `spec/`).
- [x] Criar `.agent.rules.sdd.md` com diretrizes de gestão.
- [x] Criar `README.md` detalhado.
- [x] Inicializar o log de histórico (este arquivo).
- [x] Definir Modelagem de Banco de Dados (`spec/architecture/database_model.md`).
- [x] Definir Contratos de API (`spec/architecture/api_contracts.md`).
- [x] Inicializar Projeto Backend (Spring Boot 3 + Java 21).
- [x] Inicializar Projeto Dashboard (Next.js + TypeScript).
- [x] Inicializar Projeto Mobile (Android + Kotlin/Compose).
- [x] Criar Guia do Desenvolvedor para iniciantes (`spec/architecture/developer_guide.md`).
- [x] Criar Roadmap Estratégico ("O Norte") (`spec/architecture/roadmap.md`).
- [x] Definir Fluxo de Operação e Diagramas (`spec/design/app_flow.md`).
- [x] Configurar infraestrutura base com `docker-compose.yml` (PostgreSQL & MongoDB).
- [x] Atualizar diretrizes de desenvolvimento com foco educativo.

## 💡 Decisões de Arquitetura
1. **Clean Architecture**: Adotada para o backend para garantir isolamento das regras de negócio.
2. **PostgreSQL**: Definido como banco principal pela robustez e suporte ACID.
3. **Jetpack Compose**: Escolhido para o mobile para garantir a "elegância e beleza" solicitada.
4. **Next.js**: Escolhido para o dashboard pela facilidade de deploy e suporte a TypeScript.
5. **Foco Educativo**: Implementações iniciais serão comentadas de forma didática para auxiliar a equipe iniciante.
6. **Fluxo Estilo Booksy**: Redirecionamento inteligente baseado no gênero (Masculino -> Barbearia, Feminino -> Salão) com opção de migração manual.
7. **Reserva para Terceiros**: Suporte para pais agendarem para filhos, com notificação e aprovação via Dashboard.
8. **Engajamento Firebase**: Notificações automáticas de "Saudades" (30 dias) e gestão de atrasos.
9. **CRUD Pleno**: O sistema seguirá rigorosamente o padrão Create, Read, Update e Delete para todas as entidades principais (Usuários, Serviços, Estabelecimentos e Agendamentos).

## 🚀 Próximos Passos
1. Implementar Referência: Backend (Auth/User) - Domínio e Repositórios.
2. Implementar Referência: Dashboard (Página de Login e Layout Base).
3. Implementar Referência: Mobile (Setup de Temas e Tela de Login).
