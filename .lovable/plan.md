

# Sistema de Pontos - LeveFit

## Estrutura

### 1. Tabela `user_points`
- `id`, `user_id`, `points` (total acumulado), `created_at`, `updated_at`

### 2. Tabela `points_history`
- `id`, `user_id`, `action` (login, weight_update, purchase), `points`, `description`, `created_at`
- RLS: usuarios veem apenas seus proprios registros

### 3. Tabela `rewards`
- `id`, `name`, `description`, `points_cost`, `type` (discount, recipe, gift), `is_active`, `image_url`
- Populada com recompensas iniciais

### 4. Tabela `redeemed_rewards`
- `id`, `user_id`, `reward_id`, `redeemed_at`, `status` (pending, delivered)

### Regras de pontos
| Acao | Pontos |
|------|--------|
| Login diario | 10 |
| Atualizou peso | 5 |
| Comprou na loja | 50 |

### Logica de login diario
- No `AuthContext`, apos carregar perfil, verificar se ja ganhou pontos hoje (checar `points_history` com action='login' e data de hoje)
- Se nao, inserir automaticamente 10 pontos

### Logica de peso
- Na funcao `updateIMC` do `AuthContext`, apos salvar peso com sucesso, inserir 5 pontos

### Logica de compra
- No webhook de pagamento (kiwify-webhook ou stripe-webhook), ao confirmar pagamento, inserir 50 pontos

## Alteracoes no Frontend

### Nova pagina `src/pages/Points.tsx`
- Exibe total de pontos no topo com animacao
- Historico de pontos ganhos
- Secao "Trocar Pontos" com cards de recompensas disponiveis (desconto, receita exclusiva, brinde)
- Botao "Resgatar" que desconta os pontos e registra em `redeemed_rewards`

### Dashboard - Card de pontos
- Novo card no header ou abaixo dos stats mostrando total de pontos com icone de troféu
- Link para pagina de pontos

### Navigation
- Adicionar item "Pontos" com icone Trophy na barra de navegacao (substituir ou reorganizar itens)

## Recompensas iniciais (seed)
- 🎫 Desconto de R$10 na loja - 100 pontos
- 🍰 Receita Exclusiva Premium - 50 pontos
- 🎁 Brinde Surpresa - 200 pontos

## Arquivos modificados/criados
- Migration SQL: criar tabelas `user_points`, `points_history`, `rewards`, `redeemed_rewards` com RLS
- `src/pages/Points.tsx` - nova pagina
- `src/contexts/AuthContext.tsx` - adicionar pontos no login e updateIMC
- `src/components/Navigation.tsx` - adicionar link para Pontos
- `src/App.tsx` - adicionar rota /points
- `src/pages/Dashboard.tsx` - card de pontos
- `supabase/functions/kiwify-webhook/index.ts` - adicionar 50 pontos na compra
- `supabase/functions/stripe-webhook/index.ts` - adicionar 50 pontos na compra

