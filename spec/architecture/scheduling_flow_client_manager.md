# 📅 Spec: Fluxo de Agendamento Colaborativo — Cliente ↔ Gerente

**Data:** 2026-05-25
**Status:** Draft — aguardando validação do time

---

## 🎯 Objetivo de Negócio

Permitir que o **usuário cliente** expresse sua preferência de horário de atendimento de forma simples e guiada, enquanto o **gerente/barbeiro** retém o controle total sobre a confirmação do slot real, evitando conflitos de agenda e garantindo a experiência premium do estabelecimento.

---

## 👥 Atores e Responsabilidades

| Ator | Papel | Capacidade |
|---|---|---|
| **Cliente** | Solicita atendimento | Escolhe serviço + janela de horário preferida |
| **Gerente** | Confirma ou redistribui | Vê a fila de solicitações, encaixa ou sugere alternativa |
| **Sistema** | Orquestra estados | Notifica ambos, atualiza disponibilidade em tempo real |

---

## 🔄 Fluxo Completo — Estados do Agendamento

```
CLIENTE              SISTEMA               GERENTE
  │                     │                     │
  ├──[Escolhe Serviço]──►│                     │
  ├──[Seleciona Janela]──►│                     │
  │   (ex: manhã, tarde) │                     │
  │                     ├──[Cria Agendamento]──►│
  │                     │   status: PENDING    │
  │                     │                     ├──[Vê fila de Solicitações]
  │                     │                     ├──[Analisa disponibilidade]
  │                     │                     │
  │          ┌──────────┴────────────────────┤
  │          │ CONFIRMA (encaixa no horário)  │
  │          ├──[status: CONFIRMED]───────────►│
  │◄─[Push: Agendamento Confirmado!]──────────│
  │          │                               │
  │          │ SUGERE ALTERNATIVA             │
  │          ├──[status: RESCHEDULE_PROPOSAL]─►│
  │◄─[Push: Nova sugestão de horário]─────────│
  │          │                               │
  ├──[Cliente ACEITA ou RECUSA proposta]───────►│
```

---

## 📱 App do Cliente — UX de Agendamento

### Passo 2: Janela de Preferência (NÃO horário exato)

```
🗓️ Quando você prefere ser atendido?

  [Hoje]      [Amanhã]    [Outra data]
  
  Período preferido:
  [ ] Manhã    (08:00 – 12:00)
  [ ] Tarde    (12:00 – 18:00)
  [ ] Noite    (18:00 – 21:00)
  
  ⚠️ O gerente confirmará o horário exato disponível.
```

> **Racional de UX:** Dar uma janela flexível maximiza o encaixe, reduz rejeições e melhora a retenção. O cliente sabe que o gerente tem palavra final.

---

## 🏪 App Manager — Gestão da Fila

```
📥 Nova Solicitação — PENDENTE
┌─────────────────────────────────────┐
│ 👤 João Mendes                      │
│ ✂️  Corte + Barba (45min)          │
│ 🕐 Preferência: Amanhã, tarde      │
│                                     │
│ [✅ Confirmar às 14:30] [✏️ Sugerir] │
└─────────────────────────────────────┘
```

**Ações do Gerente:**
1. **Confirmar** → Seleciona o slot exato e confirma
2. **Sugerir alternativa** → Propõe horário fora da janela pedida
3. **Cancelar** → Rejeita com motivo obrigatório

---

## 📊 Contrato de Dados — `agendamentos`

```sql
CREATE TABLE agendamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL,
  cliente_id      UUID NOT NULL,
  profissional_id UUID,             -- null até confirmação
  servico_id      UUID NOT NULL,
  
  -- Preferência do Cliente
  data_preferencia   DATE NOT NULL,
  janela_preferida   VARCHAR(10)
    CHECK (janela_preferida IN ('manha', 'tarde', 'noite')),
  
  -- Slot Confirmado pelo Gerente
  horario_inicio  TIMESTAMPTZ,      -- null até confirmação
  horario_fim     TIMESTAMPTZ,
  
  -- Máquina de Estados
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN (
      'PENDING',             -- aguardando gerente
      'CONFIRMED',           -- gerente confirmou
      'RESCHEDULE_PROPOSAL', -- gerente sugeriu outro horário
      'RESCHEDULE_ACCEPTED', -- cliente aceitou proposta
      'CANCELLED_CLIENT',
      'CANCELLED_MANAGER',
      'COMPLETED',
      'NO_SHOW'
    )),
  
  proposta_alternativa TIMESTAMPTZ, -- sugestão do gerente
  motivo_cancelamento  TEXT,
  preco_cobrado        DECIMAL(10,2),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔔 Mapa de Notificações Push

| Evento | Para | Mensagem |
|---|---|---|
| Cliente cria solicitação | Gerente | `"Nova solicitação de João — Corte + Barba (amanhã, tarde)"` |
| Gerente confirma | Cliente | `"✅ Agendado! Corte + Barba amanhã às 14:30"` |
| Gerente sugere alternativa | Cliente | `"💬 O salão sugeriu quinta às 10:00. Aceitar?"` |
| 24h antes | Cliente | `"⏰ Lembrete: Corte + Barba amanhã às 14:30!"` |

---

## ❓ Pontos Abertos — Decisão do Time

> [!IMPORTANT]
> Estas decisões impactam o escopo do sprint de implementação.

1. **Timeout de confirmação:** Quanto tempo o gerente tem antes da solicitação expirar?
   > Sugestão: 2 horas. Após isso, notificar o cliente automaticamente.

2. **Múltiplos profissionais:** O cliente pode pedir um profissional específico?
   > Sugestão: Preferência opcional, gerente tem palavra final.

3. **Lista de espera:** Se não houver slot na janela pedida, entra em fila?
   > Sugestão: Sim, com notificação automática quando abrir.

4. **Reagendamento pelo cliente:** Com quantas horas de antecedência?
   > Sugestão: 2h mínimo, configurável pelo gerente por estabelecimento.
