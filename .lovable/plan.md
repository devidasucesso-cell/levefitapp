

# Rastreamento de Ultimo Acesso dos Usuarios

## O que sera feito

Adicionar uma funcionalidade no painel administrativo que mostra quando cada usuario utilizou o app pela ultima vez, com data e hora do ultimo acesso.

## Como vai funcionar

1. **Nova coluna no banco de dados**: Adicionar um campo `last_active_at` na tabela `profiles` que sera atualizado automaticamente toda vez que o usuario abrir o app.

2. **Atualizacao automatica**: Quando o usuario fizer login ou abrir o app (ao carregar o perfil), o sistema atualiza o campo `last_active_at` com a data/hora atual.

3. **Nova aba no Admin**: Adicionar uma aba "Usuarios" no painel administrativo com uma tabela mostrando:
   - Nome do usuario
   - Kit escolhido
   - Ultimo acesso (com indicador visual: verde = hoje, amarelo = ultimos 7 dias, vermelho = inativo ha mais de 7 dias)
   - Data de cadastro
   - Status (aprovado ou nao)

---

## Detalhes Tecnicos

### 1. Migracao do banco de dados
- Adicionar coluna `last_active_at` (timestamp with time zone, nullable) na tabela `profiles`

### 2. Atualizar AuthContext (`src/contexts/AuthContext.tsx`)
- Apos carregar o perfil com sucesso, enviar um UPDATE para `profiles` setando `last_active_at = now()`
- Adicionar o campo ao tipo `Profile`

### 3. Atualizar Admin (`src/pages/Admin.tsx`)
- Adicionar nova aba "Usuarios" com icone `Users`
- Buscar todos os perfis com `last_active_at`, `name`, `kit_type`, `created_at`, `is_approved`
- Exibir tabela ordenada por ultimo acesso (mais recentes primeiro)
- Badges coloridos indicando atividade recente

### 4. Arquivos modificados
- `src/contexts/AuthContext.tsx` - atualizar `last_active_at` e tipo Profile
- `src/pages/Admin.tsx` - nova aba com listagem de usuarios

