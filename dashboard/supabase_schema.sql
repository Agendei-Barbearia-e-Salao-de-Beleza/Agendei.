-- Esquema Completo Agendei (Produção) - v2 com Metas e Despesas

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE public.perfil_usuario AS ENUM ('CLIENTE', 'ADMIN');
    CREATE TYPE public.tipo_estabelecimento AS ENUM ('BARBEARIA', 'SALÃO', 'ESTÉTICA', 'OUTROS');
    CREATE TYPE public.status_agendamento AS ENUM ('SOLICITADO', 'APROVADO', 'CONCLUIDO', 'CANCELADO');
    CREATE TYPE public.status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');
    CREATE TYPE public.metodo_pagamento AS ENUM ('PIX_LOCAL', 'CARTAO_LOCAL', 'DINHEIRO_LOCAL', 'ONLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabelas
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    avatar_url TEXT,
    perfil public.perfil_usuario NOT NULL DEFAULT 'CLIENTE',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proprietario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo public.tipo_estabelecimento NOT NULL DEFAULT 'BARBEARIA',
    logo_url TEXT,
    endereco TEXT,
    telefone_comercial VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    categoria VARCHAR(50),
    tipo VARCHAR(20) DEFAULT 'SERVICE',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    servicos JSONB NOT NULL,
    preco_total DECIMAL(10,2) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.status_agendamento DEFAULT 'SOLICITADO',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    metodo public.metodo_pagamento NOT NULL,
    status public.status_pagamento DEFAULT 'PENDENTE',
    pago_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.indisponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    motivo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.clientes_estabelecimentos (
    cliente_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cliente_id, estabelecimento_id)
);

CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.metas (
    estabelecimento_id UUID PRIMARY KEY REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    valor_meta DECIMAL(10,2) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Ver próprio perfil" ON public.usuarios;
CREATE POLICY "Ver próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins veem seus clientes" ON public.usuarios;
CREATE POLICY "Admins veem seus clientes" ON public.usuarios FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.clientes_estabelecimentos ce JOIN public.estabelecimentos e ON ce.estabelecimento_id = e.id WHERE ce.cliente_id = usuarios.id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam clientes" ON public.usuarios;
CREATE POLICY "Admins gerenciam clientes" ON public.usuarios FOR ALL USING (
    perfil = 'CLIENTE'
);

DROP POLICY IF EXISTS "Admins gerenciam próprio estabelecimento" ON public.estabelecimentos;
CREATE POLICY "Admins gerenciam próprio estabelecimento" ON public.estabelecimentos FOR ALL USING (proprietario_id = auth.uid());

DROP POLICY IF EXISTS "Admins gerenciam serviços" ON public.servicos;
CREATE POLICY "Admins gerenciam serviços" ON public.servicos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam agendamentos" ON public.agendamentos;
CREATE POLICY "Admins gerenciam agendamentos" ON public.agendamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam pagamentos" ON public.pagamentos;
CREATE POLICY "Admins gerenciam pagamentos" ON public.pagamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.agendamentos a JOIN public.estabelecimentos e ON a.estabelecimento_id = e.id WHERE a.id = agendamento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam indisponibilidades" ON public.indisponibilidades;
CREATE POLICY "Admins gerenciam indisponibilidades" ON public.indisponibilidades FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam vínculos de clientes" ON public.clientes_estabelecimentos;
CREATE POLICY "Admins gerenciam vínculos de clientes" ON public.clientes_estabelecimentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam suas despesas" ON public.despesas;
CREATE POLICY "Admins gerenciam suas despesas" ON public.despesas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins gerenciam suas metas" ON public.metas;
CREATE POLICY "Admins gerenciam suas metas" ON public.metas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);

-- Gatilho de Novo Usuário (Limpo para Produção)
CREATE OR REPLACE FUNCTION public.handle_novo_usuario()
RETURNS TRIGGER AS $$
DECLARE
  v_est_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Administrador'), NEW.email, 'ADMIN')
  ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id;

  INSERT INTO public.estabelecimentos (id, proprietario_id, nome, tipo)
  VALUES (v_est_id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_estabelecimento', 'Meu Estabelecimento'), COALESCE((NEW.raw_user_meta_data->>'tipo')::public.tipo_estabelecimento, 'BARBEARIA'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_novo_usuario();
