

# Diagnostico e Plano: Notificacoes Locais + Push por Plataforma

## 1. DIAGNOSTICO - Arquivos Atuais

### Arquivos de notificacao existentes:
- `public/firebase-messaging-sw.js` - Service Worker para push (handles `push`, `notificationclick`, `install`, `activate`, `pushsubscriptionchange`)
- `src/hooks/usePushNotifications.ts` - Hook principal: registra SW, solicita permissao, cria subscription Push API + VAPID, salva no banco
- `src/components/PushNotificationPrompt.tsx` - Modal fullscreen pedindo ativacao (pos-onboarding)
- `src/components/NotificationReminderBanner.tsx` - Banner no dashboard para quem nao ativou
- `src/pages/Settings.tsx` - Toggle de ativacao + fallback local com `new Notification()` e `setTimeout`/`setInterval` na thread principal
- `supabase/functions/send-push-notification/index.ts` - Edge function que envia push via Web Push Protocol (RFC 8291, VAPID, AES-128-GCM)
- `supabase/functions/schedule-notifications/index.ts` - Cron que dispara agua/capsula/resumo via push server
- `vite.config.ts` - VitePWA configurado com manifest e workbox

### Por que provavelmente nao funciona bem:

1. **iOS sem PWA instalado**: O codigo ja detecta isso e bloqueia, mas nao tem instrucao visual clara de passo-a-passo
2. **iOS com PWA**: Push API com servidor externo (VAPID) **nao funciona no iOS Safari** sem Apple Push Notification Service (APNS). O iOS Safari 16.4+ suporta Push API apenas para push via servidor web padrao, mas a implementacao atual deveria funcionar - o problema real pode ser que poucos usuarios iOS instalaram como PWA
3. **Fallback local ruim**: Em `Settings.tsx` linhas 159-201, usa `new Notification()` na thread principal com `setTimeout`/`setInterval` - isso so funciona enquanto o app esta aberto e a aba ativa. Quando o usuario fecha o app, os timers morrem
4. **Service Worker nao agenda localmente**: O SW atual so responde a eventos `push` do servidor. Nao tem listener `message` para receber agendamentos do app principal. Nao usa `setTimeout` dentro do SW para disparar `showNotification` localmente
5. **Sem persistencia de alarmes**: Se o SO encerra o SW, todos os agendamentos em memoria se perdem. Nao usa IndexedDB
6. **`navigateFallbackDenylist` ausente**: O VitePWA workbox nao exclui `/~oauth`, podendo cachear rotas de autenticacao

### Permissoes solicitadas e quando:
- `Notification.requestPermission()` chamado em `subscribeUser()` dentro de `usePushNotifications.ts`
- Chamado por gesto do usuario (clique no botao "Ativar") - correto
- Em `autoRecreateSubscription()` tambem chama `requestPermission()` - isso pode falhar no iOS pois nao e gesto do usuario

---

## 2. PLANO DE IMPLEMENTACAO

### A. Service Worker (`public/firebase-messaging-sw.js`)

Adicionar ao SW existente:
- Listener `message` para receber agendamentos do app: `{ type: 'SCHEDULE', id, title, body, delayMs, repeat }`
- `setTimeout` dentro do SW para disparar `self.registration.showNotification()` nos horarios corretos
- Listener para `{ type: 'CANCEL', id }` e `{ type: 'CANCEL_ALL' }`
- Armazenar alarmes pendentes em IndexedDB (`idb-alarms`) para re-hidratar ao ativar
- No evento `activate`, ler IndexedDB e re-agendar alarmes pendentes
- Manter toda a logica de push existente intacta

### B. Novo utilitario `src/lib/notificationScheduler.ts`

- `scheduleAlarm(id, title, body, targetTime, repeat?)` - calcula delay, envia postMessage ao SW
- `cancelAlarm(id)` - envia cancel ao SW
- `cancelAllAlarms()` - limpa tudo
- `rescheduleAllAlarms(settings)` - chamado ao abrir o app, re-envia todos os alarmes baseado nas configuracoes do usuario

### C. Atualizar `src/pages/Settings.tsx`

- Remover fallback `new Notification()` com `setTimeout`/`setInterval` da thread principal (linhas 159-201)
- Ao salvar configuracoes, chamar `rescheduleAllAlarms()` que envia horarios ao SW via postMessage
- Calcular alarmes de capsula (horario fixo) e agua (intervalos, respeitando 7h-22h)

### D. Atualizar `src/hooks/usePushNotifications.ts`

- Na funcao `autoRecreateSubscription`, remover chamada direta a `requestPermission()` (nao e gesto do usuario)
- Adicionar funcao `scheduleLocalNotifications(settings)` que usa o scheduler

### E. Atualizar componente de permissao iOS

- Em `PushNotificationPrompt.tsx`: quando `needsPWA` (iOS nao instalado), mostrar passo-a-passo visual claro com icones: Safari > Compartilhar > Adicionar a Tela de Inicio
- Trocar texto generico por instrucoes com 3 passos numerados

### F. Atualizar `vite.config.ts`

- Adicionar `navigateFallbackDenylist: [/^\/~oauth/]` ao workbox config

### G. Atualizar `src/main.tsx`

- Adicionar guard contra registro de SW em iframe/preview
- Ao carregar app (fora de iframe), chamar `rescheduleAllAlarms()` para re-enviar alarmes ao SW

### H. Validacao e tratamento de erros

- Se `Notification.permission === 'denied'`: mostrar instrucoes de como desbloquear (ja existe em Settings)
- Se SW nao registrar: toast de erro amigavel
- Ao recarregar app, re-enviar alarmes ao SW (coberto pelo item G)

---

## Arquivos modificados/criados

| Arquivo | Acao |
|---------|------|
| `public/firebase-messaging-sw.js` | Adicionar listener `message`, agendamento local, IndexedDB |
| `src/lib/notificationScheduler.ts` | Criar - utilitario de agendamento via postMessage |
| `src/pages/Settings.tsx` | Remover fallback thread principal, usar scheduler |
| `src/hooks/usePushNotifications.ts` | Remover requestPermission automatico, integrar scheduler |
| `src/components/PushNotificationPrompt.tsx` | Melhorar instrucoes iOS passo-a-passo |
| `vite.config.ts` | Adicionar navigateFallbackDenylist |
| `src/main.tsx` | Guard iframe/preview + reschedule ao iniciar |

