import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import net from "net";
import { Client } from "pg";

// 1. Inicializa o Servidor MCP do Agendei
const server = new Server(
  {
    name: "agendei-helper-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Declara as Ferramentas disponíveis para a IA
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "diagnose_agendei_ports",
        description: "Testa o status (ativo/inativo) de todas as portas locais do projeto Agendei.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "inspect_database_schema",
        description: "Conecta ao PostgreSQL local e extrai informações das tabelas para a IA.",
        inputSchema: {
          type: "object",
          properties: {
            tableName: {
              type: "string",
              description: "Nome opcional de uma tabela específica para detalhar colunas.",
            },
          },
        },
      },
    ],
  };
});

// Helper para checar se uma porta está em uso (ativa)
const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once("error", () => resolve(true)) // Porta em uso!
      .once("listening", () => {
        tester.once("close", () => resolve(false)).close(); // Porta livre/inativa.
      })
      .listen(port, "127.0.0.1");
  });
};

// 3. Processa a execução das ferramentas chamadas pela IA
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Caso 1: Checagem de Portas
    if (name === "diagnose_agendei_ports") {
      const services = [
        { name: "PostgreSQL (BD)", port: 5432 },
        { name: "MongoDB (Logs)", port: 27017 },
        { name: "Spring Boot API", port: 8080 },
        { name: "Dashboard Web", port: 3000 },
        { name: "Mobile App Dev", port: 5173 },
      ];

      const results = [];
      for (const service of services) {
        const isActive = await checkPort(service.port);
        results.push(`${service.name} (Porta ${service.port}): ${isActive ? "🟢 ATIVO" : "🔴 INATIVO"}`);
      }

      return {
        content: [
          {
            type: "text",
            text: `=== DIAGNÓSTICO DE PORTAS DO AGENDEI ===\n\n${results.join("\n")}`,
          },
        ],
      };
    }

    // Caso 2: Inspeção de Esquema de Banco
    if (name === "inspect_database_schema") {
      const tableName = args?.tableName as string;
      const client = new Client({
        connectionString: "postgres://postgres:postgres@localhost:5432/agendei_db",
      });

      await client.connect();

      let query = `
        SELECT table_name, column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
      `;
      if (tableName) {
        query += ` AND table_name = '${tableName}'`;
      }
      query += " ORDER BY table_name, ordinal_position;";

      const res = await client.query(query);
      await client.end();

      if (res.rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: tableName 
                ? `Nenhuma tabela encontrada com o nome: ${tableName}` 
                : "Nenhuma tabela pública encontrada no PostgreSQL local.",
            },
          ],
        };
      }

      const formatted = res.rows.map(
        (r) => `Tabela: ${r.table_name} | Coluna: ${r.column_name} | Tipo: ${r.data_type} | Nulo: ${r.is_nullable}`
      );

      return {
        content: [
          {
            type: "text",
            text: `=== ESQUEMA DO BANCO DE DADOS (POSTGRESQL) ===\n\n${formatted.join("\n")}`,
          },
        ],
      };
    }

    throw new Error(`Ferramenta desconhecida: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Erro na execução da ferramenta: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 4. Executa o servidor usando a entrada/saída padrão (stdio)
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Agendei MCP Helper rodando via STDIO!");
