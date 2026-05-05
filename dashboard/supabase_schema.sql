ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins podem ver clientes" ON public.usuarios FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.proprietario_id = auth.uid()) 
  AND perfil = 'CLIENTE'
);

CREATE POLICY "Admins gerenciam próprio estabelecimento" ON public.estabelecimentos FOR ALL USING (proprietario_id = auth.uid());
CREATE POLICY "Todos podem ver estabelecimentos" ON public.estabelecimentos FOR SELECT USING (true);

CREATE POLICY "Admins gerenciam serviços" ON public.servicos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);
CREATE POLICY "Todos podem ver serviços" ON public.servicos FOR SELECT USING (true);

CREATE POLICY "Admins gerenciam agendamentos" ON public.agendamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.estabelecimentos e WHERE e.id = estabelecimento_id AND e.proprietario_id = auth.uid())
);
CREATE POLICY "Clientes veem próprios agendamentos" ON public.agendamentos FOR SELECT USING (cliente_id = auth.uid());

CREATE POLICY "Admins gerenciam pagamentos" ON public.pagamentos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a 
    JOIN public.estabelecimentos e ON a.estabelecimento_id = e.id 
    WHERE a.id = agendamento_id AND e.proprietario_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.handle_novo_usuario()
RETURNS TRIGGER AS $$
DECLARE
  v_estabelecimento_id UUID := gen_random_uuid();
  v_cliente1_id UUID := gen_random_uuid();
  v_cliente2_id UUID := gen_random_uuid();
  v_servico1_id UUID := gen_random_uuid();
  v_servico2_id UUID := gen_random_uuid();
  v_agendamento1_id UUID := gen_random_uuid();
  v_agendamento2_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário Administrador'),
    NEW.email,
    'ADMIN'::perfil_usuario
  );

  INSERT INTO public.estabelecimentos (id, proprietario_id, nome, tipo)
  VALUES (
    v_estabelecimento_id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_estabelecimento', 'Meu Estabelecimento'),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'BARBEARIA')::tipo_estabelecimento
  );

  INSERT INTO public.usuarios (id, nome, email, telefone, perfil)
  VALUES 
    (v_cliente1_id, 'Carlos Alberto', 'carlos.mock@agendei.com', '(11) 98765-4321', 'CLIENTE'::perfil_usuario),
    (v_cliente2_id, 'Juliana Silva', 'juliana.mock@agendei.com', '(11) 91234-5678', 'CLIENTE'::perfil_usuario);

  INSERT INTO public.servicos (id, estabelecimento_id, nome, descricao, preco, duracao_minutos)
  VALUES 
    (v_servico1_id, v_estabelecimento_id, 'Corte Degradê', 'Corte moderno com máquina e tesoura', 45.00, 30),
    (v_servico2_id, v_estabelecimento_id, 'Barba Terapia', 'Aparar, alinhar e toalha quente', 35.00, 25);

  INSERT INTO public.agendamentos (id, cliente_id, estabelecimento_id, servicos, preco_total, data_hora, status)
  VALUES 
    (
      v_agendamento1_id, 
      v_cliente1_id, 
      v_estabelecimento_id, 
      jsonb_build_array(jsonb_build_object('id', v_servico1_id, 'nome', 'Corte Degradê', 'preco', 45.00)), 
      45.00, 
      CURRENT_TIMESTAMP, 
      'CONCLUIDO'::status_agendamento
    ),
    (
      v_agendamento2_id, 
      v_cliente2_id, 
      v_estabelecimento_id, 
      jsonb_build_array(jsonb_build_object('id', v_servico2_id, 'nome', 'Barba Terapia', 'preco', 35.00)), 
      35.00, 
      CURRENT_TIMESTAMP + INTERVAL '1 day', 
      'APROVADO'::status_agendamento
    );

  INSERT INTO public.pagamentos (agendamento_id, valor, metodo, status, pago_em)
  VALUES 
    (v_agendamento1_id, 45.00, 'PIX_LOCAL'::metodo_pagamento, 'PAGO'::status_pagamento, CURRENT_TIMESTAMP),
    (v_agendamento2_id, 35.00, 'CARTAO_LOCAL'::metodo_pagamento, 'PENDENTE'::status_pagamento, NULL);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_novo_usuario();
