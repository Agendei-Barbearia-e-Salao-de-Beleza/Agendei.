-- SQL para Inicialização do Banco de Dados Agendei.
-- Alvo: PostgreSQL (Supabase)
-- Versão: Português

-- 1. Criação de Enums
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'CLIENTE', 'BARBEIRO');
CREATE TYPE genero_usuario AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');
CREATE TYPE tipo_estabelecimento AS ENUM ('BARBEARIA', 'SALAO', 'UNISSEX');
CREATE TYPE status_agendamento AS ENUM ('SOLICITADO', 'APROVADO', 'CANCELADO', 'CONCLUIDO', 'ATRASADO');
CREATE TYPE metodo_pagamento AS ENUM ('DINHEIRO', 'CARTAO_LOCAL', 'PIX_LOCAL');
CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO');

-- 2. Tabela de Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT,
    social_id VARCHAR(255),
    telefone VARCHAR(20),
    genero genero_usuario DEFAULT 'OUTRO',
    perfil perfil_usuario NOT NULL DEFAULT 'CLIENTE',
    firebase_token TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Estabelecimentos
CREATE TABLE estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proprietario_id UUID NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    tipo tipo_estabelecimento NOT NULL,
    especialidades JSONB,
    endereco TEXT,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    avaliacao DECIMAL(2,1) DEFAULT 0.0,
    horario_funcionamento JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Serviços
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID NOT NULL REFERENCES estabelecimentos(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    preco_desconto DECIMAL(10,2),
    duracao_minutos INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Agendamentos
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    estabelecimento_id UUID NOT NULL REFERENCES estabelecimentos(id),
    servicos JSONB NOT NULL,
    preco_total DECIMAL(10,2) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status status_agendamento DEFAULT 'SOLICITADO',
    para_convidado BOOLEAN DEFAULT FALSE,
    nome_convidado VARCHAR(255),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id),
    valor DECIMAL(10,2) NOT NULL,
    metodo metodo_pagamento NOT NULL,
    status status_pagamento DEFAULT 'PENDENTE',
    pago_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
