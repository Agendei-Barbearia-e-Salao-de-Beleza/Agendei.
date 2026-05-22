# 🎯 Especificação de Arquitetura: Agendei SaaS SuperAdmin & Hot-OTA Updates

Esta especificação define o plano técnico e os conceitos de design de engenharia para dois pilares vitais do crescimento do ecossistema do **Agendei.**:
1. **Hot-OTA Updates (Live Updates):** Atualizações instantâneas de código sem necessidade de cabo USB ou reinstalações pelo usuário.
2. **SaaS SuperAdmin Portal (Agendei Control Center):** Painel independente e fechado exclusivo para os fundadores monitorarem tenants, bugs, suporte e engajamento com o produto.

---

## 🔄 1. Hot-OTA Updates (Atualização Silenciosa e Sem Cabos)

Hospedar e distribuir APKs é excelente, mas conexões USB ou reinstalações manuais de arquivos criam barreiras de uso. Em aplicativos híbridos Capacitor, nós podemos atualizar HTML, CSS, assets e JavaScript **diretamente nos dispositivos dos usuários em segundo plano**.

### Arquitetura de Hot-Update
```
┌────────────────────┐          1. Upload do novo dist.zip          ┌────────────────────────┐
│  Desenvolvedor/CI  │ ───────────────────────────────────────────> │ Supabase Storage       │
│  (React Build)     │                                              │ (Bucket: updates-ota)  │
└────────────────────┘                                              └────────────────────────┘
                                                                                ▲
                                                                                │ 3. Baixa e descompacta
                                                                                │    o bundle web
                                                                                │
┌────────────────────┐          2. Notificação Push Firebase        ┌───────────┴────────────┐
│   Firebase Cloud   │ ───────────────────────────────────────────> │ Aplicativo do Gerente  │
│   Messaging (FCM)  │                                              │ (Mobile no celular)    │
└────────────────────┘                                              └────────────────────────┘
```

### O Fluxo Técnico
1. **Build do Código Web:** Executamos `npm run build` na pasta `mobile/` gerando os novos arquivos na pasta `dist/`.
2. **Compactação (.zip):** Criamos um pacote compactado `dist_v1.0.1.zip` com todo o compilado estático.
3. **Upload Supabase Storage:** O zip é enviado ao bucket público `updates-ota` no Supabase.
4. **Acionamento:**
   * **Silencioso (Auto-check):** Ao abrir o app, o Capacitor faz uma requisição rápida para a API comparando o hash do código instalado.
   * **Push Notification (Firebase):** Enviamos uma mensagem de dados (data message) invisível via Firebase Cloud Messaging (FCM). O celular do usuário processa a notificação mesmo em segundo plano.
5. **Download e Instalação (Sem Fios):** 
   O aplicativo móvel faz o download do `.zip`, extrai os arquivos dentro do diretório local seguro de armazenamento do dispositivo (`Data Directory`) e instrui o Capacitor a recarregar a tela apontando para os novos arquivos.
6. **Mecanismo de Fail-Safe (Segurança Extrema):**
   Caso a nova atualização de JS sofra alguma falha grave na inicialização (crash ou loop de erro), o plugin de OTA detecta a instabilidade e **reverte automaticamente em 1 segundo** para a versão original do bundle web que veio gravada dentro do APK!

*Nota: Não há necessidade de cabos USB ou computadores na mão do usuário final!*

---

## 🖥️ 2. SaaS SuperAdmin Portal (Agendei Control Center)

Para monitorar de forma centralizada o funcionamento do ecossistema e garantir a satisfação dos clientes de forma proativa, projetamos um **Portal SuperAdmin**. 

Este sistema é **100% isolado** do painel do gerente (barbearia) e será a cabine de comando da sua empresa.

### Arquitetura do SaaS
Podemos rodar esse portal sob o mesmo repositório do Dashboard, porém sob um **caminho altamente protegido e com layout exclusivo** (`dashboard/src/app/superadmin/`) utilizando políticas rígidas de banco de dados (Row Level Security - RLS) e controle de acessos com claims de usuário (`role = 'SUPER_ADMIN'`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SaaS SuperAdmin Portal (Next.js)                  │
├────────────────────────────────────────────────────────────────────────┤
│ 📊 Módulo 1: SaaS Insights                                             │
│   • MRR/ARR (Faturamento Recorrente Mensal)                            │
│   • Gráfico de Novos Clientes por Região                               │
├────────────────────────────────────────────────────────────────────────┤
│ 🏢 Módulo 2: Diretório de Tenants (Salões/Barbearias)                  │
│   • Nome do Estabelecimento e Proprietário                             │
│   • Plano Contratado e Data de Expiração                               │
│   • Geolocalização no Mapa                                             │
├────────────────────────────────────────────────────────────────────────┤
│ 🐜 Módulo 3: Central de Monitoramento e Bugs                           │
│   • Log de Erros (Stack Trace) enviados por apps mobile e web          │
│   • Status de Portas e Serviços de Backend                             │
├────────────────────────────────────────────────────────────────────────┤
│ 📈 Módulo 4: Análise de Funcionalidades (Product Analytics)            │
│   • Funcionalidades mais acessadas em tempo real                       │
│   • Pesquisas de satisfação interna (NPS do Agendei)                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Modelagem de Dados no PostgreSQL (`superadmin_schema`)

Para suportar essas ferramentas no banco de dados, criaremos tabelas especializadas:

### 1. Registro de Estabelecimentos e Donos (`tenants`)
```sql
CREATE TABLE public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(100) NOT NULL,
    proprietario_nome VARCHAR(100) NOT NULL,
    proprietario_email VARCHAR(100) UNIQUE NOT NULL,
    proprietario_telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    plano_tipo VARCHAR(20) DEFAULT 'FREE', -- 'FREE', 'PRO', 'ENTERPRISE'
    status_assinatura VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAST_DUE', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### 2. Monitoramento de Bugs e Erros em Tempo Real (`system_logs`)
Todas as capturas de erros `try/catch` não tratadas nos apps móveis e dashboard web enviam uma carga de dados silenciosa para esta tabela:
```sql
CREATE TABLE public.system_bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL, -- 'mobile_manager', 'mobile_client', 'dashboard'
    app_version VARCHAR(20) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    device_model VARCHAR(50),
    os_version VARCHAR(20),
    user_email VARCHAR(100), -- Permite entrar em contato direto para dar suporte!
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'RESOLVED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### 3. Métricas de Utilização de Funcionalidades (`feature_usage`)
Cada clique em funções importantes envia um evento leve para o banco de dados:
```sql
CREATE TABLE public.feature_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID REFERENCES public.establishments(id),
    feature_name VARCHAR(50) NOT NULL, -- 'register_expense', 'view_reports', 'create_appointment'
    user_role VARCHAR(20) NOT NULL, -- 'MANAGER', 'COLABORADOR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 📈 Vantagens de Manter no Próprio Next.js com Rota Protegida
1. **Redução drástica de custos:** Não há custos duplicados com hospedagem, domínios e banco de dados adicionais.
2. **Reuso de Design System:** Todo o tema escuro/claro premium de Glassmorphism que já criamos é herdado instantaneamente no portal do SuperAdmin.
3. **Agilidade Técnica:** Se você cadastrar uma nova tabela no banco de dados, ela estará disponível de imediato tanto para a gestão do salão quanto para o painel de monitoramento do SuperAdmin!
