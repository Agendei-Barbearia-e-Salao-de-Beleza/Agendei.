# 🛠️ Especificação de Arquitetura: Agendei MCP Server

O **Model Context Protocol (MCP)** é um padrão aberto que permite a assistentes de IA (como o Cursor, Roo Code ou VS Code Cline) interagir de forma nativa e estruturada com ferramentas locais, APIs e bancos de dados.

Criar um **MCP Server Dedicado** para o **Agendei.** permitirá que qualquer IA parceira diagnostique a saúde do sistema local, inspecione esquemas de banco de dados, automatize builds nativos de Capacitor e até mesmo gere código TypeScript a partir das entidades Java do Spring Boot!

---

## 🏗️ Estrutura do Servidor MCP

O servidor MCP será construído em **Node.js (TypeScript)** utilizando o SDK oficial da Anthropic (`@modelcontextprotocol/sdk`). Ele rodará localmente em segundo plano como uma ferramenta de linha de comando (`stdio`) integrada à IDE.

### Fluxo de Comunicação
```
┌──────────────┐         Protocolo stdio        ┌────────────────────┐
│   IDE (AI)   │ <────────────────────────────> │ Agendei MCP Server │
└──────────────┘                                └─────────┬──────────┘
                                                          │
          ┌───────────────────────┬───────────────────────┼──────────────────────┐
          ▼                       ▼                       ▼                      ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  Port Diagnostic  │   │  PostgreSQL 5432  │   │   Spring Boot     │   │ Capacitor Mobile  │
│  (Local Ports)    │   │  (Schema Reader)  │   │   (Java Entity)   │   │ (Android Builder) │
└───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

## 🌟 Funcionalidades e Ferramentas Expostas (Tools)

O MCP Server do Agendei exportará as seguintes **ferramentas prontas para execução da IA**:

### 1. `diagnose_agendei_ports`
* **Descrição:** Testa se todas as portas locais de infraestrutura e serviços estão abertas e ativas.
* **Retorno:**
  * `5432` (PostgreSQL) -> Ativo / Inativo
  * `27017` (MongoDB) -> Ativo / Inativo
  * `8080` (Spring Boot API) -> Ativo / Inativo
  * `3000` (Dashboard Next.js) -> Ativo / Inativo
  * `5173` (Mobile Vite) -> Ativo / Inativo
* **Utilidade:** Evita erros de conexões de banco e APIs antes de rodar qualquer fluxo.

### 2. `inspect_database_schema`
* **Descrição:** Conecta diretamente ao banco relacional local `postgres://postgres:postgres@localhost:5432/agendei_db` para extrair a DDL e estrutura exata de tabelas de forma interativa.
* **Argumentos:** `table_name` (opcional).
* **Utilidade:** Dá à IA visão em tempo real de colunas e constraints (tabelas `agendamentos`, `pagamentos`, `servicos`) para evitar queries ou inserts errados no código.

### 3. `generate_ts_from_java_entity`
* **Descrição:** Varre a pasta `backend/src/main/java/com/agendei/entities` e converte automaticamente as classes de entidade Java em interfaces TypeScript para o Mobile/Dashboard.
* **Argumentos:** `entity_name` (ex: `Agendamento.java`).
* **Utilidade:** Garante tipagem estrita de DTOs e sincronia de dados em tempo recorde.

### 4. `trigger_mobile_native_sync`
* **Descrição:** Dispara e monitora a compilação do front-end móvel e sincronização com a pasta Android nativa (`npm run build && npx cap sync android`) direto pela ponte MCP.
* **Utilidade:** Garante compilação nativa estável e segura sem necessidade de intervenção manual do desenvolvedor.

---

## 🛠️ Guia de Implementação e Configuração na IDE

### Passo 1: Inicializar o Servidor MCP na raiz do projeto
1. Criar a pasta `mcp-server` na raiz:
   ```bash
   mkdir mcp-server
   cd mcp-server
   npm init -y
   npm install @modelcontextprotocol/sdk dotenv pg
   npm install --save-dev typescript @types/node @types/pg tsx
   npx tsc --init
   ```

2. Criar a configuração de build ou usar `tsx` para rodar diretamente do arquivo TypeScript.

### Passo 2: Configurar na IDE (Exemplo: Cursor)
Para plugar o servidor no Cursor e permitir que a IA utilize as ferramentas criadas:
1. Abra o **Cursor** e vá em **Settings (Ctrl+, / Cmd+,)**.
2. Vá na seção **Features** > **MCP**.
3. Clique em **+ Add New MCP Server**.
4. Configure os campos:
   * **Name:** `Agendei Helper`
   * **Type:** `command`
   * **Command:** `npx -y tsx /home/bcr/Projetos/Atividades/UMC/Agendei./mcp-server/src/index.ts`

---

## 🎯 Benefícios para o Projeto
* **Zero Adivinhação de Banco:** A IA sempre consultará o esquema físico antes de sugerir migrações ou consultas.
* **Automação Completa:** Diagnósticos de portas quebradas ou builds de Capacitor falhando serão pegos em 1 segundo.
* **Consistência de API:** Front-end e Backend estarão sempre com tipos sincronizados de forma automática.
