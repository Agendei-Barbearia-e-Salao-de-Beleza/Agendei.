# Skill: `/speckit.tasks`

**Objetivo:** Decompor o plano técnico em uma lista ordenada de tarefas granulares (Fase 4 do SDD).

**Ação do Agente (Claude Code):**
1. Leia o plano de arquitetura em `spec/3_plans/`.
2. Gere um checklist acionável em `spec/4_tasks/[nome_da_feature]_tasks.md`.
3. Utilize caixas de marcação (`- [ ]`) no início de cada tarefa.
4. Cada tarefa deve ser pequena, atômica, independente e fácil de testar. Por exemplo: "Criar a tabela de Usuários", "Criar o Controller de Login".
