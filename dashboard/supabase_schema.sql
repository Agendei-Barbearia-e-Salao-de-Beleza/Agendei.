-- Esquema Completo Agendei (Produção) - sincronizado com o banco real

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE public.perfil_usuario AS ENUM ('CLIENTE', 'ADMIN');
    CREATE TYPE public.genero_usuario AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');
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
    nome CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING NOT NULL UNIQUE,
    senha_hash TEXT,
    social_id CHARACTER VARYING,
    telefone CHARACTER VARYING,
    genero public.genero_usuario DEFAULT 'OUTRO',
    perfil public.perfil_usuario NOT NULL DEFAULT 'CLIENTE',
    firebase_token TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS public.estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proprietario_id UUID NOT NULL REFERENCES public.usuarios(id),
    nome CHARACTER VARYING NOT NULL,
    tipo public.tipo_estabelecimento NOT NULL,
    especialidades JSONB,
    endereco TEXT,
    telefone CHARACTER VARYING,
    whatsapp CHARACTER VARYING,
    avaliacao NUMERIC DEFAULT 0.0,
    horario_funcionamento JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    instagram_url TEXT,
    facebook_url TEXT,
    whatsapp_url TEXT,
    tiktok_url TEXT,
    notificacao_lembretes BOOLEAN DEFAULT true,
    notificacao_financeiro BOOLEAN DEFAULT false,
    logo_url TEXT
);

CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
    nome CHARACTER VARYING NOT NULL,
    descricao TEXT,
    preco NUMERIC NOT NULL,
    preco_desconto NUMERIC,
    duracao_minutos INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    categoria CHARACTER VARYING,
    tipo CHARACTER VARYING DEFAULT 'SERVICE'
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.usuarios(id),
    estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
    servicos JSONB NOT NULL,
    preco_total NUMERIC NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.status_agendamento DEFAULT 'SOLICITADO',
    para_convidado BOOLEAN DEFAULT false,
    nome_convidado CHARACTER VARYING,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id),
    valor NUMERIC NOT NULL,
    metodo public.metodo_pagamento NOT NULL,
    status public.status_pagamento DEFAULT 'PENDENTE',
    pago_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.indisponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id),
    data DATE NOT NULL,
    hora_inicio TIME WITHOUT TIME ZONE,
    hora_fim TIME WITHOUT TIME ZONE,
    motivo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.clientes_estabelecimentos (
    cliente_id UUID NOT NULL REFERENCES public.usuarios(id),
    estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clientes_estabelecimentos_pkey PRIMARY KEY (cliente_id, estabelecimento_id)
);

CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id),
    descricao TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    data DATE DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    categoria CHARACTER VARYING
);

CREATE TABLE IF NOT EXISTS public.metas (
    estabelecimento_id UUID PRIMARY KEY REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    valor_meta DECIMAL(10,2) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.receitas_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria TEXT DEFAULT 'Outros',
    data DATE DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
ALTER TABLE public.receitas_extras ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Ver próprio perfil" ON public.usuarios;
CREATE POLICY "Ver próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Atualizar próprio perfil" ON public.usuarios;
CREATE POLICY "Atualizar próprio perfil" ON public.usuarios FOR UPDATE USING (id = auth.uid());

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
) WITH CHECK (
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

DROP POLICY IF EXISTS "Admins gerenciam suas receitas extras" ON public.receitas_extras;
CREATE POLICY "Admins gerenciam suas receitas extras" ON public.receitas_extras FOR ALL USING (
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

  INSERT INTO public.estabelecimentos (id, proprietario_id, nome, tipo, endereco)
  VALUES (v_est_id, NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_estabelecimento', 'Meu Estabelecimento'), 
    COALESCE((NEW.raw_user_meta_data->>'tipo')::public.tipo_estabelecimento, 'BARBEARIA'),
    NEW.raw_user_meta_data->>'endereco'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_novo_usuario();

-- Gatilho de Agendamento Concluído para Gerar Pagamento Automaticamente (Faturamento)
CREATE OR REPLACE FUNCTION public.handle_agendamento_concluido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONCLUIDO' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status <> 'CONCLUIDO') THEN
    -- Garante que o registro de pagamento existe para contabilizar faturamento
    IF NOT EXISTS (SELECT 1 FROM public.pagamentos WHERE agendamento_id = NEW.id) THEN
      INSERT INTO public.pagamentos (agendamento_id, valor, metodo, status, pago_em)
      VALUES (NEW.id, NEW.preco_total, 'DINHEIRO_LOCAL', 'PAGO', CURRENT_TIMESTAMP);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_agendamento_concluido ON public.agendamentos;
CREATE TRIGGER on_agendamento_concluido
  AFTER INSERT OR UPDATE OF status ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_agendamento_concluido();

