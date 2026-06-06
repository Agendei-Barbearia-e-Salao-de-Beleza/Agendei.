# Skill: `/speckit.plan [stack_e_arquitetura...]`

**Objetivo:** Formular o plano de implementação técnica e arquitetura (Fase 3 do SDD).

**Ação do Agente (Claude Code):**
1. Leia a especificação aprovada na pasta `spec/2_requirements/`.
2. Escreva o plano de desenvolvimento em `spec/3_plans/[nome_da_feature]_arch.md`.
3. Detalhe as escolhas de arquitetura, endpoints de API (contratos), estruturas de dados/banco (SQL/Supabase) e os componentes de front-end necessários.
4. Mantenha a consistência com a arquitetura descrita na constituição (`.agent.rules.sdd.md`).
