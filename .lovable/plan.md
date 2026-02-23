
# Corrigir Entrega de Notificacoes e Limpar Interface

## Problema Diagnosticado

Dos 38 usuarios:
- 30 nunca ativaram notificacoes (precisam clicar "Ativar" no app)
- 8 ativaram, mas apenas 6 tem assinatura valida no banco
- 2 perderam a assinatura (navegador limpou cache ou trocou de dispositivo)

## Alteracoes

### 1. Remover botoes "Enviar Notificacao de Teste" e "Testar Resumo Diario"
- Em `src/pages/Settings.tsx`, remover o bloco inteiro com os dois botoes (linhas 345-376)
- Remover as funcoes `handleTestNotification`, `handleDailySummaryTest` e os estados `testLoading`, `summaryLoading`
- Remover imports nao utilizados (`Send`)

### 2. Auto-recriar assinatura de forma mais agressiva
- Em `src/hooks/usePushNotifications.ts`, quando `push_activated=true` no perfil mas nao existe assinatura no banco de dados, chamar `autoRecreateSubscription` automaticamente
- Hoje o codigo ja faz isso parcialmente, mas precisa tambem cobrir o caso em que nao existe registro no banco (linha 69-72 retorna sem tentar recriar)
- Adicionar verificacao: se `profile.push_activated === true` e nao tem subscription no DB, tentar recriar silenciosamente

### 3. Garantir persistencia ao sair e entrar do app
- A assinatura push do navegador persiste entre sessoes (esta vinculada ao service worker, nao ao estado do app)
- O `checkSubscription` ja roda quando o usuario faz login (useEffect na linha 37-47)
- Melhorar para que, se `push_activated=true` e nao tem subscription, tente recriar em vez de apenas marcar `isSubscribed=false`

### 4. Limpar assinaturas expiradas no servidor
- As edge functions `send-push-notification` e `schedule-notifications` ja limpam subscriptions com status 410 (expiradas)
- Isso esta funcionando corretamente

---

## Detalhes Tecnicos

### Settings.tsx - Remocoes
- Remover estados: `testLoading`, `summaryLoading`
- Remover funcoes: `handleTestNotification`, `handleDailySummaryTest`
- Remover bloco JSX dos botoes de teste (linhas 345-376)
- Remover `sendTestNotification` do destructuring de `usePushNotifications`
- Remover import `Send` do lucide-react

### usePushNotifications.ts - Auto-recriar
Modificar `checkSubscription` para, quando nao encontrar subscription no DB mas `profile.push_activated === true`, chamar `autoRecreateSubscription()` em vez de apenas setar `isSubscribed(false)`.

Antes:
```
if (!dbSubscription) {
  console.log('No subscription found in database');
  setIsSubscribed(false);
  return;
}
```

Depois:
```
if (!dbSubscription) {
  console.log('No subscription found in database');
  // Se push_activated, tenta recriar automaticamente
  if (profile?.push_activated) {
    console.log('push_activated is true, auto-recreating...');
    await autoRecreateSubscription();
    return;
  }
  setIsSubscribed(false);
  return;
}
```

Para isso, o hook precisa acessar `profile` do `useAuth()`. Ja importa `useAuth`, basta adicionar `profile` no destructuring.

### Arquivos modificados
- `src/pages/Settings.tsx` - remover botoes de teste
- `src/hooks/usePushNotifications.ts` - auto-recriar quando push_activated=true sem subscription
