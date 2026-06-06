# Skill: `/speckit.git-commit`

**Objetivo:** Realizar commits granulares seguindo a especificação técnica e as tarefas.

**Ação do Agente (Claude Code):**
1. Antes de commitar, valide as mudanças com `git status` e `git diff`.
2. O commit deve seguir a convenção de **Conventional Commits** (ex: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
3. A mensagem do commit deve ser concisa e estar ligada diretamente à task marcada em `spec/4_tasks/` ou ao log do dia em `spec/history/`.
4. Faça o `git add` apenas dos arquivos que pertencem estritamente à tarefa em andamento (Atomicidade).
