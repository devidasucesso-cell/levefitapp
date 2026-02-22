
# Gravar Ativacao Permanente de Notificacoes

## Objetivo

Uma vez que o usuario ativar as notificacoes push, gravar essa ativacao no perfil e nao permitir mais a desativacao. O botao "Desativar" sera removido da interface.

## Alteracoes

### 1. Adicionar campo `push_activated` na tabela `profiles`
- Novo campo booleano `push_activated` (default `false`)
- Quando o usuario ativar notificacoes pela primeira vez, esse campo sera marcado como `true` permanentemente

### 2. Marcar ativacao permanente ao ativar notificacoes
- Em `usePushNotifications.ts`: apos `subscribeUser` ter sucesso, gravar `push_activated = true` no perfil do usuario
- Em `AuthContext.tsx`: incluir `push_activated` no tipo `Profile` e na consulta de perfil

### 3. Remover opcao de desativar na pagina Settings
- Em `Settings.tsx`: quando `push_activated` for `true`, mostrar apenas o status "Notificacoes ativas" sem botao de desativar
- Manter o botao "Testar" para enviar notificacao de teste
- Remover a logica de toggle que chamava `unsubscribeUser`

### 4. Auto-reativar se necessario
- Em `usePushNotifications.ts`: se o perfil tem `push_activated = true` mas o navegador nao tem subscription ativa, recriar automaticamente (ja existe logica de `autoRecreateSubscription` que sera reaproveitada)

### 5. Remover banner de reativacao
- No Dashboard: se `push_activated = true`, nao mostrar mais o banner ou prompt pedindo para ativar notificacoes, pois ja estao permanentemente ativas

---

## Detalhes Tecnicos

### Migracao SQL
```sql
ALTER TABLE profiles ADD COLUMN push_activated boolean DEFAULT false;
```

### Arquivos modificados
- `src/contexts/AuthContext.tsx` - adicionar `push_activated` ao tipo Profile e consulta
- `src/hooks/usePushNotifications.ts` - gravar `push_activated = true` no perfil apos ativacao; auto-reativar se `push_activated = true` mas sem subscription
- `src/pages/Settings.tsx` - remover botao "Desativar", mostrar status fixo quando ativado
- `src/pages/Dashboard.tsx` - nao mostrar prompt/banner se `push_activated = true`
