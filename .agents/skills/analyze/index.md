# Skill: `/speckit.analyze`

**Objetivo:** Auditar a consistência entre a Especificação, Plano Técnico e Tasks.

**Ação do Agente (Claude Code):**
1. Avalie de forma cruzada se a lista gerada em `spec/4_tasks/` atende a todos os critérios definidos em `spec/2_requirements/` e `spec/3_plans/`.
2. Se houver dependências do ambiente (ex: verificar schemas de banco atuais, usar ferramentas externas como `inspect_database_schema`), faça isso agora antes de programar.
3. Garanta que nenhuma dependência ou setup fundamental foi esquecido nas tasks iniciais.
