# Database Model: Agendei.

Este documento define a estrutura de dados inicial para o projeto Agendei. utilizando uma abordagem híbrida (PostgreSQL + MongoDB).

## 🐘 PostgreSQL (Core & Relational)

O PostgreSQL será utilizado para dados que exigem integridade referencial e transações ACID.

### Entidades Principais

#### 1. `users`
- `id`: UUID (PK)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `password_hash`: TEXT (Null if social login)
- `social_id`: VARCHAR(255) // ID do Google para login social
- `phone`: VARCHAR(20)
- `gender`: ENUM ('MALE', 'FEMALE', 'OTHER')
- `role`: ENUM ('ADMIN', 'CUSTOMER', 'BARBER')
- `firebase_token`: TEXT
- `created_at`: TIMESTAMP

#### 2. `establishments` (Salões/Barbearias)
- `id`: UUID (PK)
- `owner_id`: UUID (FK -> users)
- `name`: VARCHAR(255)
- `type`: ENUM ('BARBERSHOP', 'SALON', 'UNISEX')
- `specialties`: JSONB
- `address`: TEXT
- `phone`: VARCHAR(20)
- `whatsapp_number`: VARCHAR(20) // Para comunicação direta via WA.ME
- `rating`: DECIMAL(2,1)
- `opening_hours`: JSONB
- `created_at`: TIMESTAMP

#### 3. `services`
- `id`: UUID (PK)
- `establishment_id`: UUID (FK -> establishments)
- `name`: VARCHAR(255)
- `description`: TEXT
- `price`: DECIMAL(10,2)
- `discount_price`: DECIMAL(10,2)
- `duration_minutes`: INTEGER

#### 4. `appointments` (Agendamentos)
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> users)
- `establishment_id`: UUID (FK -> establishments)
- `services`: JSONB
- `total_price`: DECIMAL(10,2)
- `appointment_time`: TIMESTAMP
- `status`: ENUM ('REQUESTED', 'APPROVED', 'CANCELLED', 'COMPLETED', 'LATE')
- `is_for_guest`: BOOLEAN
- `guest_name`: VARCHAR(255)
- `created_at`: TIMESTAMP

#### 5. `payments`
- `id`: UUID (PK)
- `appointment_id`: UUID (FK -> appointments)
- `amount`: DECIMAL(10,2)
- `method`: ENUM ('CASH', 'CARD_LOCAL', 'PIX_LOCAL')
- `status`: ENUM ('PENDING', 'PAID')
- `paid_at`: TIMESTAMP

---

## 🍃 MongoDB (Logs & Dynamic Configs)

### Collections
1. `notification_logs`: Histórico de e-mails e pushs.
2. `establishment_settings`: Temas, logos e campos customizados.
