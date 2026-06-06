# Skill: `/speckit.git-validate`

**Objetivo:** Auditar o status de versionamento antes de transitar entre as Fases do SDD.

**Ação do Agente (Claude Code):**
1. Execute `git status` e verifique alterações não rastreadas ou unstaged.
2. Garanta que não existam conflitos de merge abertos ou código quebrado.
3. Esta validação deve ser feita rigidamente sempre que passar da Fase 4 (Tasks) para Fase 5 (Implement).
