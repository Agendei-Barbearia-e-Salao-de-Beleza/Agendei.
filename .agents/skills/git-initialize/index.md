# Skill: `/speckit.git-initialize`

**Objetivo:** Inicializar o projeto com padrões de versionamento corretos do SDD.

**Ação do Agente (Claude Code):**
1. Verifique se existe um repositório git ativo (`git status`). Se não, rode `git init`.
2. Garanta que o `.gitignore` adequado para a stack principal está criado e inclui arquivos sensíveis (`.env`, `node_modules`, pastas de build).
3. Faça o commit inicial de fundação da arquitetura se o repositório estiver vazio.
