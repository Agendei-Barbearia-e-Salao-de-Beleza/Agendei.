# API Contracts: Agendei.

Este documento define os principais endpoints da API Restful, seguindo rigorosamente o padrão **CRUD** (Create, Read, Update, Delete).

## Base URL
`https://api.agendei.com/v1`

## 👤 Usuários (CRUD)
- `POST /auth/google`: [C]reate / Auth
- `GET /users/me`: [R]ead
- `PATCH /users/me`: [U]pdate (Perfil e Gênero)
- `DELETE /users/me`: [D]elete (Desativar conta)

---

## 📅 Agendamentos (CRUD & Status)
- `POST /appointments`: [C]reate (Reserva)
- `GET /appointments`: [R]ead (Lista do Cliente/Salão)
- `PATCH /appointments/{id}`: [U]pdate (Mudar horário)
- `PATCH /appointments/{id}/status`: [U]pdate (Aprovar/Cancelar/Completar)
- `DELETE /appointments/{id}`: [D]elete (Remover registro)

---

## ✂️ Serviços (CRUD - Admin Only)
- `POST /services`: [C]reate (Novo serviço: Corte, Barba, etc.)
- `GET /services`: [R]ead (Lista pública)
- `PUT /services/{id}`: [U]pdate (Alterar preço/descrição)
- `DELETE /services/{id}`: [D]elete (Remover serviço)

---

## 🏠 Estabelecimentos (CRUD - Admin Only)
- `POST /establishments`: [C]reate
- `GET /establishments`: [R]ead
- `PATCH /establishments/{id}`: [U]pdate (Melhorar o site/perfil, mudar endereço)
- `DELETE /establishments/{id}`: [D]elete

---

## 📊 Dashboard & Relatórios
- `GET /dashboard/metrics`: Visão Geral
- `GET /dashboard/financial-report`: Extrato Mensal
- `GET /dashboard/schedule`: Controle de Agenda

---

## ⭐ Avaliações & Fotos
- `POST /reviews`: [C]reate
- `GET /reviews/{establishmentId}`: [R]ead
- `POST /photos`: Upload de fotos para o portfólio.
