# Skill: `/speckit.specify [requisitos...]`

**Objetivo:** Criar a especificação de requisitos funcionais da funcionalidade (Fase 2 do SDD).

**Ação do Agente (Claude Code):**
1. Leia o comando do usuário e os requisitos informados. Se houver algo na pasta `spec/1_ideation/`, leia primeiro.
2. Escreva uma especificação estrita e sem ambiguidades em `spec/2_requirements/[nome_da_feature].md`.
3. Detalhe o fluxo do usuário e os objetivos de negócio ("O quê" e o "Porquê").
4. **Restrição:** NÃO defina a pilha de tecnologia, esquemas de banco de dados ou código nesta fase. Foque estritamente no comportamento funcional.
