

# Notificacoes Estilo Shopee - Ricas e Visiveis na Tela

## Diagnostico Atual

As notificacoes **estao funcionando** para os 7 usuarios que ativaram push. Os lembretes de agua sao enviados a cada 60 minutos (cron roda a cada 15 min e respeita o intervalo). O problema e que as notificacoes sao simples demais - titulo e texto basicos, sem destaque visual.

## O que sera feito

Transformar as notificacoes em estilo Shopee: ricas, com imagem grande, mensagens variadas, som, vibracao e botoes de acao que chamam a atencao na tela do usuario.

## Alteracoes

### 1. Service Worker - Notificacoes Ricas (public/firebase-messaging-sw.js)

Atualizar o service worker para exibir notificacoes com:
- **Imagem grande** (banner como Shopee usa) via propriedade `image`
- **Badge** (icone pequeno na barra de status)
- **Acoes** com botoes clicaveis ("Abrir", "Registrar")
- **requireInteraction: true** (nao desaparece automaticamente)
- **renotify: true** com tags unicas (sempre mostra mesmo se ja tem uma)
- **Vibracao** padrao [200, 100, 200, 100, 200]
- **Som** do sistema (silent: false)

### 2. Edge Function - Payloads Enriquecidos (supabase/functions/send-push-notification/index.ts)

Adicionar campo `image` no payload JSON enviado ao push service. Variar as mensagens para nao ficar repetitivo:

**Agua** - rotacionar entre mensagens como:
- "Hora de se hidratar! Beba um copo de agua agora"
- "Ja bebeu agua? Seu corpo precisa de hidratacao"
- "Pausa para agua! Mantenha seu corpo funcionando bem"
- "Lembrete de hidratacao! Um gole de saude para voce"

**Capsula** - rotacionar entre:
- "Hora da sua capsula LeveFit! Nao esqueca"
- "Sua capsula esta esperando! Tome agora"
- "Lembrete: tome sua LeveFit para manter o tratamento em dia"

### 3. Edge Function - schedule-notifications (supabase/functions/schedule-notifications/index.ts)

Aplicar as mesmas melhorias de payload rico com `image` e mensagens variadas.

## Detalhes Tecnicos

### Service Worker (firebase-messaging-sw.js)

No handler de `push`, extrair o campo `image` do payload e passar para `showNotification`:

```javascript
self.registration.showNotification(title, {
  body: data.body,
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  image: data.image || undefined, // Imagem grande estilo Shopee
  tag: data.tag,
  requireInteraction: true,
  renotify: true,
  vibrate: [200, 100, 200, 100, 200],
  silent: false,
  actions: data.actions || [
    { action: 'open', title: 'Abrir' },
    { action: 'dismiss', title: 'Dispensar' }
  ],
  data: { url: data.url || '/dashboard' }
});
```

### send-push-notification/index.ts

Adicionar array de mensagens variadas e campo `image` no payload:

```typescript
const waterMessages = [
  { title: '💧 Hora da Agua!', body: 'Beba um copo de agua agora! Seu corpo agradece.' },
  { title: '💧 Hidrate-se!', body: 'Ja bebeu agua? Mantenha-se hidratado para mais energia!' },
  { title: '💧 Pausa para Agua!', body: 'Um gole de saude! Beba agua e continue seu dia.' },
  { title: '💧 Lembrete!', body: 'Seu corpo precisa de agua. Beba um copo agora!' },
  { title: '💧 Agua Agora!', body: 'Hidratacao e saude! Nao esqueca de beber agua.' },
];

const capsuleMessages = [
  { title: '💊 Hora da Capsula!', body: 'Tome sua LeveFit agora! Mantenha o tratamento em dia.' },
  { title: '💊 Sua LeveFit!', body: 'Sua capsula esta esperando! Tome agora para melhores resultados.' },
  { title: '💊 Lembrete LeveFit!', body: 'Nao esqueca da sua capsula! Constancia e o segredo.' },
];
```

Selecionar mensagem aleatoria: `messages[Math.floor(Math.random() * messages.length)]`

Incluir `image` no payload JSON enviado ao navegador para que o service worker exiba a imagem grande.

### schedule-notifications/index.ts

Aplicar as mesmas melhorias de mensagens variadas e payload rico.

### Arquivos modificados
- `public/firebase-messaging-sw.js` - notificacoes ricas com imagem
- `supabase/functions/send-push-notification/index.ts` - mensagens variadas + image
- `supabase/functions/schedule-notifications/index.ts` - mensagens variadas + image

