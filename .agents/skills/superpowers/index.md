# Skill: `/speckit.superpowers`

**Objetivo:** Ativar o modo de autonomia máxima, combinando múltiplas ferramentas e execução de scripts complexos em cadeia.

**Ação do Agente (Claude Code):**
1. **Autonomia de Terminal:** Você está autorizado a encadear comandos bash complexos (ex: instalar pacotes, rodar migrações e fazer build na mesma execução) para atingir o objetivo, minimizando as interrupções ao usuário.
2. **Uso do `.specify`:** Escaneie proativamente as pastas `.specify/scripts/` e `.specify/workflows/` do repositório em busca de rotinas que possam acelerar a task atual.
3. **Visão de Raio-X:** Antes de dar qualquer resposta de erro, utilize ferramentas de busca avançada (`grep`, `find`) no workspace para garantir que o arquivo/variável não existe em outra camada do projeto.
4. **Auto-Correção:** Se um comando falhar durante a implementação, você deve tentar consertá-lo autonomamente (lendo o erro do stderr) pelo menos 2 vezes antes de pedir socorro ao usuário.
5. **Silêncio Operacional:** Seja extremamente conciso nas mensagens. Relate apenas "O que foi feito", omitindo explicações longas, a menos que o usuário solicite.

## Plugins Oficiais Requeridos

Para que esta skill funcione com potência máxima, certifique-se de instalar o plugin oficial do Claude Code:

```bash
claude plugin install superpowers@claude-plugins-official
```
