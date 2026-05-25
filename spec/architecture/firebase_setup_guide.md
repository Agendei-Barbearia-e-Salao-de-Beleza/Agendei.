# Configuração do Firebase Admin (Backend)

Para que o backend consiga enviar notificações push para o aplicativo mobile, você precisa configurar a **Chave de Conta de Serviço**.

## 🛠 Passo a Passo para Gerar a Chave

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Selecione o seu projeto (**agendei-2026**).
3.  No menu lateral, clique na engrenagem (**Configurações do Projeto**).
4.  Vá na aba **Contas de Serviço**.
5.  Clique no botão **Gerar nova chave privada**.
6.  Um arquivo `.json` será baixado no seu computador.

## 📂 Onde colocar o arquivo

1.  Renomeie o arquivo baixado para `service-account.json`.
2.  Mova o arquivo para a pasta: `backend/src/main/resources/`.

## 🚀 Como testar

Após colocar o arquivo e reiniciar o servidor, você pode testar o envio de uma notificação fazendo um POST para:
`http://localhost:8080/api/v1/notifications/send`

**Exemplo de JSON no corpo da requisição:**
```json
{
  "token": "TOKEN_DO_DISPOSITIVO_MOBILE",
  "title": "Olá do Agendei!",
  "body": "Seu agendamento foi confirmado para amanhã às 14h.",
  "data": {
    "bookingId": "12345"
  }
}
```

> [!IMPORTANT]
> Nunca comite o arquivo `service-account.json` em repositórios públicos, pois ele contém chaves privadas de acesso ao seu projeto.
