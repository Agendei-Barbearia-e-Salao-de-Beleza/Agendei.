# 2026-05-08 - Remoção do Resend e Migração para Supabase Auth Nativo

## 🎯 Objetivo
Remover a dependência do Resend para envio de e-mails de boas-vindas/confirmação no cadastro de novos estabelecimentos, utilizando as capacidades nativas do Supabase Auth para simplificar a arquitetura e resolver erros 500 detectados.

## 📋 TODO
- [x] Investigar o fluxo de cadastro atual no front-end (`dashboard`).
- [x] Localizar a integração com o Resend no back-end ou front-end (Confirmado como configuração externa no Supabase).
- [x] Melhorar o tratamento de erro na página de cadastro (`register/page.tsx`).
- [x] Fornecer guia de ajuste no Supabase Dashboard para o usuário.
- [x] Validar a lógica de tratamento de erro no código.

## 📝 Notas
- O usuário relatou erro 500 ao tentar cadastrar um novo estabelecimento.
- O Resend estava falhando no envio de e-mails.
- Deseja-se uma solução integrada ao Supabase sem softwares terceiros (além do que o Supabase já usa).
