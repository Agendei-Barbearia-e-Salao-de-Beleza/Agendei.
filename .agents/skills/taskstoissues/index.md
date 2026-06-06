# Skill: `/speckit.taskstoissues`

**Objetivo:** Sincronizar o planejamento offline com a gestão de projetos online (GitHub/GitLab).

**Ação do Agente (Claude Code):**
1. Leia o arquivo Markdown de tarefas atual em `spec/4_tasks/`.
2. Se a CLI do GitHub (gh) estiver instalada, crie automaticamente issues (`gh issue create`) para cada caixa de seleção `[ ]` pendente.
3. Adicione labels corretos baseados na constituição do projeto (ex: `enhancement`, `backend`, `frontend`).
4. Se a CLI não estiver disponível, formate a lista em Markdown puro para o usuário colar manualmente no GitHub Projects ou Trello.
