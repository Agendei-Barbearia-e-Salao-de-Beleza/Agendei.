# Developer Guide: Agendei. 🎓

Este guia foi criado para ajudar a equipe a entender os padrões técnicos utilizados no projeto, focando na simplicidade do padrão **MVC** para o backend.

---

## ☕ Backend (Java + Spring Boot)

### Padrão MVC (Model-View-Controller)
Para facilitar o desenvolvimento em grupo, usaremos o padrão MVC tradicional do Spring Boot:

1.  **Model (Entidades)**: Representam as tabelas do banco de dados.
    *   *Pasta*: `com.agendei.api.model`
    *   *Exemplo*: `User.java`, `Appointment.java`.
2.  **Repository**: Interface que faz a ponte com o banco de dados (Select, Insert, etc.).
    *   *Pasta*: `com.agendei.api.repository`
    *   *Exemplo*: `UserRepository.java`.
3.  **Service**: Onde fica a "regra de negócio" (Cálculos, validações de horário).
    *   *Pasta*: `com.agendei.api.service`
    *   *Exemplo*: `AppointmentService.java`.
4.  **Controller**: Onde criamos os Endpoints que o App e o Dashboard vão chamar.
    *   *Pasta*: `com.agendei.api.controller`
    *   *Exemplo*: `AuthController.java`.

---

## 📱 Mobile (Kotlin + Jetpack Compose)

### Padrão MVVM (Model-View-ViewModel)

*   **View (Compose)**: Apenas código visual (botões, textos).
*   **ViewModel**: Ponte entre os dados e a tela. Gerencia o "estado".
*   **Model**: Classes de dados (Data Classes).

---

## 💻 Dashboard (TypeScript + React/Next.js)

### Componentização e Tipagem

*   **TypeScript**: Tipagem estrita para evitar erros de undefined.
*   **Next.js (App Router)**: Sistema de pastas para rotas automáticas.

---

## 🛠 Boas Práticas Comuns

1.  **KISS (Keep It Simple, Stupid)**: Não complique o código desnecessariamente.
2.  **Nomes em Inglês**: Classes e variáveis devem ser em inglês.
3.  **DRY (Don't Repeat Yourself)**: Evite código duplicado.

---

*Vamos focar no simples que funciona! 🚀*
