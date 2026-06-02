# 📱 Execução Mobile: Rodando o Aplicativo no Celular Físico via Android Studio
Data: 2026-05-28

Este documento serve como a especificação de histórico e manual técnico para compilar o aplicativo móvel do **Agendei.**, sincronizá-lo com a camada nativa do Capacitor e executá-lo diretamente em um celular físico conectado via USB com auxílio do Android Studio.

---

## 🛠️ Status da Infraestrutura Local (Diagnóstico)

Sempre que a barra de comandos do Spec Kit é invocada, fazemos a checagem de portas do sistema. Aqui está o relatório das portas locais:
*   **Portas de Banco de Dados local (`5432` / `27017`):** Inativas no momento (containers do Agendei desligados, outros projetos rodando nas portas 8080/3307).
*   **Conexão Mobile-Backend:** O aplicativo mobile cliente está configurado de forma **100% Serverless / Nuvem-First** conectando-se diretamente ao **Supabase de Produção** (`https://vpalasmdcxnhpsbwmsqq.supabase.co`).
*   **Status de Execução:** **Pronto para depuração externa!** Você não precisa ligar o Docker local para testar o aplicativo no celular, ele se comunicará com o banco de produção diretamente via HTTPS.

---

## 📋 Matriz de Tarefas (TODOs)

- [x] **Tarefa 1: Compilação de Produção Frontend (Web)**
  - Gerar o bundle otimizado com `npm run build` na pasta `mobile`.
- [x] **Tarefa 2: Sincronização Nativa (Capacitor Sync)**
  - Atualizar os assets compilados e os plugins nativos da pasta `/dist` para a pasta `/android` com o comando `npx cap sync android`.
- [x] **Tarefa 3: Inicialização Automatizada do Android Studio**
  - Configurar a variável de ambiente `CAPACITOR_ANDROID_STUDIO_PATH` com o caminho absoluto `/home/bcr/Downloads/android-studio-panda4-patch1-linux/android-studio/bin/studio.sh` e invocar a abertura automática do projeto.
- [ ] **Tarefa 4: Conectar Celular Físico e Rodar (Ação do Usuário)**
  - Ativar as opções de desenvolvedor no celular físico.
  - Conectar ao computador por USB e ativar a Depuração USB.
  - Clicar em **Run (Play Verde)** na barra de ferramentas do Android Studio.

---

## 🚀 Guia Passo a Passo: Preparando seu Celular Físico

Para rodar o app direto no seu celular, seu Android precisa permitir que o Android Studio envie o aplicativo para ele. Siga os passos no seu telefone:

### 1. Habilitar as Opções do Desenvolvedor
1. No celular, abra as **Configurações**.
2. Vá em **Sobre o telefone** (ou **Sobre o dispositivo**).
3. Procure por **Informações do software** e localize o campo **Número de compilação** (ou **Build Number**).
4. Toque no **Número de compilação 7 vezes seguidas**.
   * *Você verá uma mensagem dizendo: "Você agora é um desenvolvedor!"*

### 2. Ativar a Depuração USB
1. Volte ao menu principal de **Configurações** e você verá uma nova opção no final: **Opções do desenvolvedor**.
2. Entre nela e role para baixo até achar a seção **Depuração**.
3. Ative a chave **Depuração USB**.
4. Quando aparecer a pergunta se deseja permitir, clique em **OK / Permitir**.

---

## 🔌 Conectando e Executando no Android Studio

Como o Antigravity já compilou os arquivos e abriu o Android Studio na pasta certa para você, basta seguir estes últimos passos:

### 1. Conecte o Cabo USB
1. Plugue o celular no computador usando um cabo USB de boa qualidade.
2. No celular, selecione o modo de conexão como **Transferência de arquivos** (MTP), se solicitado.
3. **Importante:** Irá aparecer um pop-up na tela do seu celular perguntando *"Permitir depuração USB?"* com uma chave criptográfica. Marque a caixinha *"Sempre permitir a partir deste computador"* e clique em **Permitir**.

### 2. Rodar o App pelo Android Studio
1. Olhe para a barra de ferramentas superior do **Android Studio** (que já abriu no seu monitor).
2. Na parte central do menu superior, ao lado do botão verde de **Play (triângulo apontando para a direita)**, você verá um seletor de dispositivos.
3. O nome do seu celular físico (ex: *Samsung SM-G991B*, *Motorola Moto G8*, etc.) deve aparecer listado lá! Selecione-o.
4. Clique no botão de **Play Verde** (ou use o atalho `Shift + F10`).
5. O Android Studio começará a compilar o projeto Gradle nativo do Android e instalará o aplicativo diretamente na tela do seu celular!

---

## 💡 Dicas de Testes Rápidos
*   **Credenciais de Acesso:** Você pode registrar uma conta de cliente nova direto pelo app móvel ou usar um login de cliente existente.
*   **Atualização do App:** Se você fizer qualquer mudança visual no código React/TypeScript no VS Code futuramente, basta rodar `npm run sync` na pasta `mobile` do terminal e depois clicar em **Play** no Android Studio novamente para que as alterações reflitam no seu celular físico na hora!
