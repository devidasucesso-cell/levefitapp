

# Corrigir Notificacoes de Agua com Som e Vibracao

## Problema Encontrado

A funcao `schedule-notifications` usa uma chave VAPID **diferente** da usada no frontend e na funcao `send-push-notification`. Isso faz com que as notificacoes enviadas por essa funcao falhem, pois a assinatura VAPID nao corresponde a assinatura do navegador do usuario.

- Frontend e `send-push-notification`: `BIJswByPtq...`
- `schedule-notifications`: `BC9cm85BFH...` (ERRADA)

## O que sera feito

### 1. Corrigir chave VAPID na funcao schedule-notifications
- Atualizar `VAPID_PUBLIC_KEY` em `supabase/functions/schedule-notifications/index.ts` para usar a mesma chave do frontend (`BIJswByPtqkQMVr0BAso8dG3XA-4bn4hL5cn0sILvEXj9QEifo7_9cQj15dDu9v__hsWfnzRaA-JaswPxZ54xoI`)

### 2. Garantir vibracao e som nas notificacoes de agua
- O service worker (`firebase-messaging-sw.js`) ja esta configurado com `vibrate: [200, 100, 200]` e `silent: false`
- As notificacoes ja sao enviadas com `Urgency: 'high'`
- Nenhuma alteracao necessaria no service worker

## Resultado esperado

Apos corrigir a chave VAPID, as notificacoes de lembrete de agua serao enviadas automaticamente a cada 15 minutos (conforme o cron job ativo) para usuarios com notificacoes habilitadas, com som e vibracao do sistema.

---

## Detalhes Tecnicos

### Arquivo modificado
- `supabase/functions/schedule-notifications/index.ts` - corrigir VAPID_PUBLIC_KEY na linha 10

### Infraestrutura ja existente (sem alteracoes)
- Cron job `water-reminder-job` roda a cada 15 minutos
- Cron job `send-water-notifications` roda a cada 30 minutos  
- Service worker configurado com vibracao `[200, 100, 200]` e `silent: false`
- Urgencia `high` nos headers das notificacoes push

