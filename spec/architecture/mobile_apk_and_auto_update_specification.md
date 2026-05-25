# 📱 Especificação Técnica: Geração de APK e Auto-Atualização Gratuita (OTA)

Esta especificação detalha o roteiro para compilar o aplicativo móvel **Agendei Manager** em formato nativo (.APK) e implementar um sistema de **auto-atualização automatizado e 100% gratuito** utilizando a infraestrutura existente do **Supabase**.

---

## 🏗️ 1. Como Compilar o APK Localmente (Roteiro Prático)

Como o projeto móvel utiliza **Capacitor**, todo o código React/TypeScript é convertido em uma Web View nativa de altíssima performance para Android. Para gerar o seu arquivo `.apk` na sua máquina:

### Passo a Passo no Terminal
Execute os seguintes comandos no seu terminal visível (dentro do diretório `mobile/`):

```bash
# 1. Instalar as dependências do Capacitor Android se ainda não estiverem na pasta
npm install @capacitor/android

# 2. Compilar o projeto web React (gera a pasta /dist com os arquivos otimizados)
npm run build

# 3. Sincronizar os arquivos web e os plugins com a pasta nativa do Android
npx cap sync android

# 4. Abrir o projeto nativo no Android Studio
npx cap open android
```

### Dentro do Android Studio
1. Aguarde a sincronização do **Gradle** ser concluída (uma barra de carregamento no canto inferior direito).
2. No menu superior, vá em: `Build` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`.
3. O Android Studio compilará o aplicativo e exibirá um pop-up de sucesso no canto inferior direito contendo o link **"locate"**.
4. Ao clicar em **"locate"**, você abrirá a pasta física contendo o seu arquivo `app-debug.apk` ou `app-release.apk` pronto para instalar em qualquer celular!

---

## 🔄 2. Sistema de Auto-Atualização Gratuita (Fluxo de Trabalho)

Para fazer com que os usuários recebam atualizações sem precisar ir na Google Play Store e sem precisar desinstalar a versão anterior do APK, faremos um fluxo híbrido integrado com o **Supabase Storage** (que é 100% gratuito para até 1GB de dados).

```
┌──────────────────┐               1. Consulta Versão               ┌───────────────────────┐
│  Aplicativo APK  │ ─────────────────────────────────────────────> │  Tabela Supabase/API  │
│  (Local: 1.0.0)  │ <───────────────────────────────────────────── │  (Última: 1.1.0)      │
└────────┬─────────┘            2. Retorna URL de Download          └───────────────────────┘
         │
         │ 3. Executa Download
         ▼
┌──────────────────┐
│ Bucket Supabase  │ ➔ Baixa o novo app-release.apk
│ (Storage Grátis) │ ➔ O Android abre o instalador nativo sobrepondo o app anterior
└──────────────────┘
```

---

## 🛠️ Plano de Implementação (Passo a Passo)

### Parte A: Configurar a versão no Banco de Dados
Criaremos uma tabela simples no Supabase para controlar a versão e o link do instalador:

```sql
CREATE TABLE public.app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL, -- 'android' ou 'ios'
    latest_version VARCHAR(10) NOT NULL, -- '1.1.0'
    download_url TEXT NOT NULL, -- Link público do Bucket do Supabase Storage
    required_update BOOLEAN DEFAULT FALSE, -- Se true, impede o uso sem atualizar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Parte B: Bucket de Atualizações no Supabase Storage
1. Crie um bucket público chamado `app-updates` no console do seu Supabase.
2. Sempre que gerar um novo APK (`app-release.apk`), você faz o upload dele nesse bucket. O link gerado será permanente (ex: `https://[seu-projeto].supabase.co/storage/v1/object/public/app-updates/app-release.apk`).
3. Insira o registro na tabela `app_versions` com a nova versão (ex: `1.1.0`) e essa URL.

### Parte C: O Código de Verificação no App Mobile (`App.tsx`)
No aplicativo React, a partir do plugin oficial `@capacitor/app` (que lê a versão atual do app), faremos a verificação ao abrir o app:

```typescript
import { App as CapApp } from '@capacitor/app';
import { supabase } from './lib/supabase';

async function checkAppUpdates() {
  try {
    // 1. Obtém as informações da versão atual do app instalada no celular
    const info = await CapApp.getInfo();
    const currentVersion = info.version; // ex: '1.0.0'

    // 2. Consulta a versão mais recente cadastrada no Supabase
    const { data, error } = await supabase
      .from('app_versions')
      .select('latest_version, download_url, required_update')
      .eq('platform', 'android')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return;

    // 3. Compara as versões (usando semver ou comparação direta de string)
    if (isNewerVersion(data.latest_version, currentVersion)) {
      // 4. Exibe um modal premium para o usuário informando sobre a atualização
      showUpdateNotificationModal(data.download_url, data.required_update);
    }
  } catch (err) {
    console.error("Erro na verificação de atualização:", err);
  }
}
```

### Parte D: O Modal de Atualização e Instalação
Quando o usuário clica em **"Atualizar Agora"** no modal:
1. O aplicativo abre a `download_url` no navegador do celular.
2. O navegador faz o download instantâneo do `.apk` do Supabase de forma rápida.
3. Ao finalizar, o usuário clica em abrir o arquivo baixado. O sistema Android detecta que já existe o aplicativo `agendei.app` instalado e pergunta: **"Deseja instalar uma atualização para este aplicativo existente? Seus dados existentes não serão perdidos."**.
4. O usuário clica em **Instalar** e a nova versão substitui a antiga mantendo todos os logins e dados locais salvos com segurança absoluta!

---

## 📈 Benefícios da Abordagem
* **100% Gratuito:** Zero custos com servidores extras ou plataformas de live-update comerciais.
* **Sob Medida:** Total controle sobre as atualizações direto pelo painel de controle ou banco de dados.
* **Segurança:** O Supabase garante criptografia SSL no tráfego do download do instalador.
