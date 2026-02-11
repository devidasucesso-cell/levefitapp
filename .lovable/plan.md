

# Sistema de Afiliados - Comissao de 25% por Venda

## Resumo

Implementar um sistema de afiliados onde qualquer usuario pode se tornar afiliado, compartilhar seu link personalizado e ganhar 25% de comissao sobre cada venda confirmada feita atraves do seu link. Isso funciona separado do sistema de indicacao existente (que paga R$25 fixo via Kiwify).

## Como vai funcionar

1. Na pagina de Referral, adicionar uma nova secao "Afiliado" alem da indicacao existente
2. O usuario ativa o modo afiliado com um clique
3. Recebe um link de afiliado que direciona para a loja do app
4. Quando alguem compra pelo link, o afiliado ganha 25% do valor da venda como credito na carteira

```text
Fluxo do Afiliado:
Usuario ativa afiliado --> Recebe link da loja com ?aff=CODIGO
       --> Cliente acessa loja --> Compra via Stripe
       --> Webhook confirma pagamento --> 25% creditado na carteira do afiliado
```

## Detalhes Tecnicos

### 1. Tabela no banco de dados

Criar tabela `affiliates` para controlar quem e afiliado:

```sql
CREATE TABLE affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  total_sales integer DEFAULT 0,
  total_commission numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

Criar tabela `affiliate_sales` para registrar cada venda do afiliado:

```sql
CREATE TABLE affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id),
  order_id text NOT NULL UNIQUE,  -- stripe session id
  sale_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  customer_email text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);
```

Ambas com RLS para o usuario ver apenas seus dados e admin ver tudo.

### 2. Fluxo de ativacao

- Botao "Quero ser Afiliado" na pagina Referral
- Ao clicar, insere registro na tabela `affiliates` com codigo gerado (ex: `AFF` + sequencia)
- Mostra link da loja: `https://levefitapp.lovable.app/store?aff=AFFXXXXX`

### 3. Rastreamento da venda

- Na pagina da Loja (`Store.tsx`), capturar o parametro `?aff=` da URL e salvar no `localStorage`
- No checkout (`create-checkout` edge function), enviar o codigo do afiliado como `metadata` na sessao Stripe
- No webhook do Stripe (`stripe-webhook`), ao confirmar pagamento:
  - Verificar se existe metadata de afiliado
  - Calcular 25% do valor da venda
  - Creditar na carteira do afiliado
  - Registrar na tabela `affiliate_sales`

### 4. Interface na pagina Referral

Adicionar uma secao com tabs ou cards separados:
- **Indicar** (sistema atual de R$25 fixo via Kiwify)
- **Afiliado** (novo - 25% sobre vendas na loja do app)

Na aba de Afiliado mostrar:
- Botao para ativar (se ainda nao e afiliado)
- Link do afiliado para copiar/compartilhar
- Total de vendas e comissoes ganhas
- Historico de vendas com status

### 5. Arquivos que serao criados/editados

| Arquivo | Acao |
|---------|------|
| Migracao SQL | Criar tabelas `affiliates` e `affiliate_sales` |
| `src/pages/Referral.tsx` | Adicionar secao de afiliado |
| `src/hooks/useAffiliate.ts` | Novo hook para gerenciar dados do afiliado |
| `src/pages/Store.tsx` | Capturar parametro `?aff=` e salvar no localStorage |
| `supabase/functions/create-checkout/index.ts` | Enviar codigo afiliado como metadata |
| `supabase/functions/stripe-webhook/index.ts` | Processar comissao do afiliado |

