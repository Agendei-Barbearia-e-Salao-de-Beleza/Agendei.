# Developer Guide: Agendei. 🎓

Este guia foi criado para ajudar a equipe a entender os padrões técnicos utilizados no projeto, facilitando o aprendizado de Java, Kotlin e TypeScript.

---

## ☕ Backend (Java + Spring Boot)

### Clean Architecture Simplificada
Para não complicar o aprendizado, usaremos uma estrutura de 4 camadas principais:

1.  **Domain (Entidades)**: Onde definimos o que é um "Agendamento" ou "Cliente".
    *   *Exemplo*: `User.java`
2.  **Application (Casos de Uso/Services)**: Onde fica a lógica de negócio.
    *   *Exemplo*: "Para agendar, o horário deve estar vago."
3.  **Infrastructure (Repositories)**: Onde salvamos os dados (PostgreSQL/MongoDB).
4.  **Web (Controllers)**: Onde recebemos as requisições da internet.

**Dica para iniciantes**: Pense no Controller como o "garçom" que anota o pedido, o Service como o "cozinheiro" que executa a lógica, e o Repository como a "despensa" onde os ingredientes (dados) estão guardados.

---

## 📱 Mobile (Kotlin + Jetpack Compose)

### Padrão MVVM (Model-View-ViewModel)

*   **View (Compose)**: Apenas código visual (botões, textos). Não deve ter lógica.
*   **ViewModel**: Ponte entre os dados e a tela. Gerencia o "estado" (ex: "está carregando?").
*   **Model**: Representação dos dados vindos da API.

**Dica para iniciantes**: No Jetpack Compose, a tela "reage" ao estado. Se o estado mudar, a tela se redesenha sozinha.

---

## 💻 Dashboard (TypeScript + React/Next.js)

### Componentização e Tipagem

*   **TypeScript**: Usamos para evitar erros bobos. Se você disser que um preço é um `number`, o código não vai deixar você colocar um texto lá.
*   **Hooks (useState, useEffect)**: Ferramentas do React para controlar dados e ações que acontecem na tela.

---

## 🛠 Boas Práticas Comuns

1.  **Nomes em Inglês**: Classes e variáveis devem ser em inglês (padrão de mercado).
2.  **Commits Pequenos**: Faça uma coisa de cada vez.
3.  **Peça Ajuda**: Como líder técnico, o USER está aqui para guiar. Use as `specs` para discutir ideias antes de codar.

---

*Vamos construir algo grande e aprender juntos! 🚀*
