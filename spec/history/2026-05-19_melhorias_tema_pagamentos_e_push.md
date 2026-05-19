# 2026-05-19 - Push Notifications, Gestão Financeira, Paridade Web/Mobile e UI Dinâmica

## 🎯 Objetivo
Implementar a infraestrutura completa de notificações por push para dispositivos móveis, unificar os fluxos de faturamento e pagamentos ("Marcar como Pago") entre o site administrativo e o aplicativo móvel, padronizar componentes visuais com ícones profissionais e corrigir os bugs de contraste e acessibilidade da interface do usuário (UI) nos modos claro e escuro.

## 📋 TODO
- [x] **Notificações Push com FCM**: Integrar `@capacitor/push-notifications` e `@capacitor-community/firebase-analytics` no Mobile para capturar Device Tokens e sincronizá-los com o perfil de usuário no Supabase.
- [x] **Controle de Status Bar Nativo**: Instalar e integrar `@capacitor/status-bar` no ciclo de vida do tema no React, chaveando estilos de ícones (escuro/claro) e cor de fundo programaticamente no Android/iOS.
- [x] **Tabbar Dinâmica de Alto Contraste**: Ajustar as classes e overrides globais de CSS no `index.css` e `App.tsx` para forçar fundo branco sólido com alta legibilidade no tema claro, mantendo o glassmorphism elegante no tema escuro.
- [x] **Faturamento Unificado ("Marcar como Pago")**: Implementar o botão e ação de liquidação financeira de agendamentos no dashboard do site web e no mobile, com atualização via RPC e registro na tabela `pagamentos`.
- [x] **Upgrade de Mídia no Catálogo**: Adicionar o recurso de importação de múltiplas imagens do armazenamento local e da galeria de fotos para serviços, permitindo ao gerente flexibilidade de catálogo.
- [x] **Substituição de Emojis por Ícones de Biblioteca**: Remover emojis remanescentes de botões de mídia no Mobile e Dashboard, substituindo-os por ícones das bibliotecas de vetores oficiais (`lucide-react`).
- [x] **Ajustes de UI de Configurações**: Manter legibilidade alta (texto branco sólido) no card do estabelecimento no topo das Configurações quando o tema claro for acionado, eliminando contornos espúrios.

## 📝 Notas
- O aplicativo móvel agora utiliza com sucesso a sincronização reativa de temas diretamente na raiz do WebView através do Capacitor.
- O fluxo de pagamento resolve problemas de RLS (Row-Level Security) no Supabase através da RPC nativa `atualizar_status_agendamento`, com plano de contingência para inserções locais.
- A consistência do design mobile/web foi levada ao estado da arte, removendo as marcações de emojis e aplicando as diretrizes premium de branding e tipografia estabelecidas.
