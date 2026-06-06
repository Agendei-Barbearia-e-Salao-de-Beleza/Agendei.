# Skill: `/speckit.git-feature [nome_da_feature]`

**Objetivo:** Criar e isolar uma branch de desenvolvimento para a nova especificação.

**Ação do Agente (Claude Code):**
1. Valide em qual branch você está com `git branch`. Se não estiver na branch principal (`main`/`master`), faça checkout.
2. Crie a nova branch utilizando o prefixo apropriado (ex: `feat/`, `fix/`, `hotfix/`, `chore/`) baseado no nome da feature recebida.
3. Confirme que a branch foi criada com sucesso. Isso garante que as próximas Fases aconteçam de forma segura.
