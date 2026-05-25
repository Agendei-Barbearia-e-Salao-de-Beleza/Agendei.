# 2026-05-19 - Push Notifications, Gestão Financeira, Paridade Web/Mobile e UI Dinâmica

## 🎯 Objetivo
Implementar a infraestrutura completa de notificações por push para dispositivos móveis, unificar os fluxos de faturamento e pagamentos ("Marcar como Pago") entre o site administrativo e o aplicativo móvel, padronizar componentes visuais com ícones profissionais e corrigir os bugs de contraste e acessibilidade da interface do usuário (UI) nos modos claro e escuro.

## 📋 TODO
- [x] **Notificações Push com FCM**: Integrar `@capacitor/push-notifications` e `@capacitor-community/firebase-analytics` no Mobile para capturar Device Tokens e sincronizá-los com o perfil de usuário no Supabase.
- [x] **Controle de Status Bar Nativo**: Instalar e integrar `@capacitor/status-bar` no ciclo de vida do tema no React, chaveando estilos de ícones (escuro/claro) e cor de fundo programaticamente no Android/iOS.
- [x] **Tabbar Dinâmica de Alto Contraste**: Excluir regras globais de CSS com `!important` conflitantes no `index.css` e adotar controle inline DOM dinâmico (`style={{ ... }}`) no React para garantir imunidade absoluta e fundo branco sólido perfeito no tema claro.
- [x] **Ajustes de UI de Configurações**: Utilizar as classes específicas `.profile-banner-text` e `.profile-banner-text-muted` no card de estabelecimento no topo das Configurações, garantindo textos em branco absoluto e cinza claro sobre o degradê de fundo escuro em qualquer tema.

## 📝 Notas
- O aplicativo móvel agora utiliza com sucesso a sincronização reativa de temas diretamente na raiz do WebView através do Capacitor, com a tabbar controlada por injeção reativa DOM infalível no React.
- Resolvido o conflito onde classes globais de `.light .text-white` forçavam o texto do banner a ficar preto (invisível sobre a imagem) no tema claro.
- A consistência do design mobile/web foi levada ao estado da arte, removendo as marcações de emojis e aplicando as diretrizes premium de branding e tipografia estabelecidas.
