# Skill: `/speckit.implement`

**Objetivo:** Executar e programar a funcionalidade com base nas tarefas validadas (Fase 5 do SDD).

**Ação do Agente (Claude Code):**
1. **Regra Crítica:** Leia IMEDIATAMENTE o arquivo de tarefas atual em `spec/4_tasks/`.
2. Foque EXCLUSIVAMENTE na primeira tarefa não marcada (`[ ]`).
3. Realize as edições de código necessárias nos microsserviços apropriados (frontend, backend, etc.).
4. Após o código estar pronto e sem erros visíveis, marque a caixa com `[x]` no arquivo de tarefas.
5. Atualize o log de execução diária em `spec/history/YYYY-MM-DD.md` descrevendo a entrega.
