# Skill: `/speckit.git-remote`

**Objetivo:** Sincronizar e assegurar a integridade do código no servidor remoto.

**Ação do Agente (Claude Code):**
1. Verifique remotos configurados usando `git remote -v`.
2. Faça um `git pull origin [branch_atual]` para evitar conflitos antes de empurrar o código.
3. Se o working tree estiver limpo, faça um `git push origin [branch_atual]` para salvar as implementações no servidor.
