# Especificações de Fluxo e Diagramas: Agendei. 📊

Este documento contém a representação visual e técnica da lógica do sistema, utilizando Mermaid para diagramação.

---

## 1. Fluxo de Atividade (Onboarding & Home)
```mermaid
activityDiagram
    start
    :Login via Google;
    if (Primeiro Acesso?) then (Sim)
        :Solicitar Celular;
        :Solicitar Gênero (Masc/Fem);
    else (Não)
    endif
    if (Gênero == Masculino) then
        :Redirecionar Sessão Barbearia;
        :Exibir Especialidades (Barba, Black, etc.);
    else
        :Redirecionar Sessão Salão;
        :Exibir Especialidades (Corte, Coloração, etc.);
    endif
    stop
```

---

## 2. Diagrama de Sequência (Agendamento & Aprovação)
```mermaid
sequenceDiagram
    participant C as Cliente (App)
    participant B as Backend (Spring Boot)
    participant D as Admin (Dashboard)
    participant W as WhatsApp
    participant F as Firebase (FCM)

    C->>B: POST /appointments (Serviços, Data, Guest?)
    B->>B: Valida conflito de horários
    B-->>C: 201 Created (Status: REQUESTED)
    B->>F: Envia Push para o Estabelecimento
    F->>D: Notifica Novo Agendamento
    D->>D: Revisa e Aceita
    D->>B: PATCH /appointments/{id}/status (APPROVED)
    B->>F: Envia Push de Confirmação
    F->>C: Notificação: "Seu horário foi aprovado!"
    
    Note over C,W: Opcional: Cliente chama no WhatsApp para tirar dúvidas
    C->>W: Redirecionamento wa.me
```

---

## 3. Diagrama de Classes UML (Simplificado)
```mermaid
classDiagram
    class User {
        +UUID id
        +String name
        +Enum gender
        +Enum role
    }
    class Establishment {
        +UUID id
        +String name
        +Enum type
        +String whatsappNumber
    }
    class Service {
        +UUID id
        +String name
        +Decimal price
        +Decimal discountPrice
    }
    class Appointment {
        +UUID id
        +DateTime time
        +Enum status
        +Boolean isForGuest
        +Decimal totalPrice
    }
    
    User "1" -- "*" Appointment : realiza
    Establishment "1" -- "*" Service : oferece
    Establishment "1" -- "*" Appointment : recebe
    Appointment "*" -- "*" Service : contém
```

---

## 4. Diagrama de Estados do Agendamento
```mermaid
stateDiagram-v2
    [*] --> REQUESTED: Cliente solicita
    REQUESTED --> APPROVED: Admin aceita
    REQUESTED --> CANCELLED: Admin/Cliente recusa
    APPROVED --> COMPLETED: Serviço realizado
    APPROVED --> LATE: Cliente atrasou
    APPROVED --> CANCELLED: Cancelamento tardio
    COMPLETED --> [*]
    LATE --> [*]
```

---

## 5. Fluxo de Retenção (Firebase)
*   **Trigger**: 25-30 dias sem novo agendamento.
*   **Ação**: Backend detecta via Job agendado.
*   **Canal**: Push Notification (FCM).
*   **Conteúdo**: "Sentimos sua falta! Que tal agendar seu próximo corte?".

---

## 6. Fluxo Administrativo (Dashboard)

### 6.1 Gestão de Fluxo de Caixa
```mermaid
graph TD
    A[Dashboard Financeiro] --> B{Tipo de Transação}
    B -->|Entrada| C[Visualizar Apenas]
    B -->|Saída/Despesa| D[Lançar/Editar/Excluir]
    D --> E[Selecionar Categoria]
    E --> F[Salvar no Supabase]
```

### 6.2 Controle de Disponibilidade (Pausa)
- **Ação**: Admin seleciona dias no calendário.
- **Visual**: Ícone de café animado indica status "Pausado" na Home.
- **Impacto**: Impede novos agendamentos de clientes para as datas selecionadas.
