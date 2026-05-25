# Database Model: Agendei.

Este documento define a estrutura de dados inicial para o projeto Agendei. utilizando uma abordagem híbrida (PostgreSQL + MongoDB). **Todas as tabelas e colunas estão em Português.**

## 🐘 PostgreSQL (Core & Relational)

O PostgreSQL será utilizado para dados que exigem integridade referencial e transações ACID.

### Entidades Principais

#### 1. `usuarios`
- `id`: UUID (PK)
- `nome`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `senha_hash`: TEXT (Null if social login)
- `social_id`: VARCHAR(255) // ID do Google para login social
- `telefone`: VARCHAR(20)
- `genero`: ENUM ('MASCULINO', 'FEMININO', 'OUTRO')
- `perfil`: ENUM ('ADMIN', 'CLIENTE', 'BARBEIRO')
- `firebase_token`: TEXT
- `criado_em`: TIMESTAMP

#### 2. `estabelecimentos` (Salões/Barbearias)
- `id`: UUID (PK)
- `proprietario_id`: UUID (FK -> usuarios)
- `nome`: VARCHAR(255)
- `tipo`: ENUM ('BARBEARIA', 'SALAO', 'UNISSEX')
- `especialidades`: JSONB
- `endereco`: TEXT
- `telefone`: VARCHAR(20)
- `whatsapp`: VARCHAR(20)
- `avaliacao`: DECIMAL(2,1)
- `horario_funcionamento`: JSONB
- `criado_em`: TIMESTAMP

#### 3. `servicos`
- `id`: UUID (PK)
- `estabelecimento_id`: UUID (FK -> estabelecimentos)
- `nome`: VARCHAR(255)
- `descricao`: TEXT
- `preco`: DECIMAL(10,2)
- `preco_desconto`: DECIMAL(10,2)
- `duracao_minutos`: INTEGER

#### 4. `agendamentos`
- `id`: UUID (PK)
- `cliente_id`: UUID (FK -> usuarios)
- `estabelecimento_id`: UUID (FK -> estabelecimentos)
- `servicos`: JSONB // Lista de serviços selecionados (id, nome, preco)
- `preco_total`: DECIMAL(10,2)
- `data_hora`: TIMESTAMP
- `status`: ENUM ('SOLICITADO', 'APROVADO', 'CANCELADO', 'CONCLUIDO', 'ATRASADO')
- `para_convidado`: BOOLEAN
- `nome_convidado`: VARCHAR(255)
- `criado_em`: TIMESTAMP

#### 5. `pagamentos`
- `id`: UUID (PK)
- `agendamento_id`: UUID (FK -> agendamentos)
- `valor`: DECIMAL(10,2)
- `metodo`: ENUM ('DINHEIRO', 'CARTAO_LOCAL', 'PIX_LOCAL')
- `status`: ENUM ('PENDENTE', 'PAGO')
- `pago_em`: TIMESTAMP

#### 6. `indisponibilidades` (Pausas/Folgas)
- `id`: UUID (PK)
- `estabelecimento_id`: UUID (FK -> estabelecimentos)
- `data`: DATE
- `hora_inicio`: TIME (Opcional)
- `hora_fim`: TIME (Opcional)
- `motivo`: TEXT
- `criado_em`: TIMESTAMP

#### 7. `despesas`
- `id`: UUID (PK)
- `estabelecimento_id`: UUID (FK -> estabelecimentos)
- `descricao`: TEXT
- `valor`: DECIMAL(10,2)
- `categoria`: VARCHAR(50) (Ex: Aluguel, Suprimentos)
- `data`: DATE
- `criado_em`: TIMESTAMP

#### 8. `metas`
- `estabelecimento_id`: UUID (PK, FK -> estabelecimentos)
- `valor_meta`: DECIMAL(10,2)
- `atualizado_em`: TIMESTAMP

---

## 🍃 MongoDB (Logs & Dynamic Configs)

### Collections
1. `logs_notificacoes`: Histórico de e-mails e pushs.
2. `configuracoes_estabelecimento`: Temas, logos e campos customizados.
