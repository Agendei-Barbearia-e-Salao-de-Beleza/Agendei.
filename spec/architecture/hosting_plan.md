# 🌐 Plano de Hospedagem Zero Custo: Agendei.

Para um projeto acadêmico e de portfólio, é possível manter tudo rodando sem gastar um centavo usando as melhores ferramentas do mercado em suas camadas gratuitas.

---

## 🏗️ A Stack Gratuita

| Componente | Plataforma | Por que? |
| :--- | :--- | :--- |
| **Backend (API Spring)** | [Render.com](https://render.com) ou [Koyeb](https://koyeb.com) | Oferecem instâncias gratuitas para Java/Spring (o Render "dorme" após inatividade, mas é estável). |
| **Banco Relacional (Postgres)** | [Supabase](https://supabase.com) | O melhor nível gratuito do mercado para PostgreSQL (500MB de storage). |
| **Banco NoSQL (Mongo)** | [MongoDB Atlas](https://mongodb.com/atlas) | Tier "M0" gratuito para logs e configurações dinâmicas. |
| **Dashboard (Next.js)** | [Vercel](https://vercel.com) | O padrão ouro para hospedar React/Next.js de graça para projetos pessoais. |
| **Notificações & Auth** | [Firebase](https://firebase.google.com) | Tier "Spark" gratuito (generoso para Push Notifications e Analytics). |
| **Imagens (Fotos)** | [Cloudinary](https://cloudinary.com) | Gerencia o upload e redimensionamento de fotos sem ocupar espaço no banco. |

---

## ⚡ Estratégia de Deploy

1.  **Vercel & Render**: Ambos conectam direto com o seu **GitHub**. Sempre que você der um `git push`, o site e a API se atualizam sozinhos.
2.  **Supabase**: Fornece uma URL de conexão JDBC que você simplesmente coloca no seu `application.properties` do Spring Boot.
3.  **Firebase**: Usaremos o SDK Admin para conectar o Java ao Firebase Cloud Messaging (FCM) de forma gratuita.

## ⚠️ Limitações do Plano Gratuito (E como contornar)
*   **Cold Start (Render/Koyeb)**: A API pode demorar uns 30 segundos para "acordar" no primeiro acesso do dia.
    *   *Dica*: Na apresentação, abra o site 1 minuto antes para ele já estar acordado.
*   **Conexões Simultâneas**: O Supabase e o Atlas limitam o número de conexões.
    *   *Dica*: Usaremos um "Connection Pool" (HikariCP) bem configurado no Spring para não estourar esse limite.

---

**Com essa configuração, o projeto pode ficar online por anos no seu portfólio sem custo algum.**
