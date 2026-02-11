

# Usar Saldo de Indicacao nas Compras da Loja

## Resumo
Adicionar a opcao de usar o saldo da carteira de indicacao como forma de pagamento (total ou parcial) ao comprar produtos na loja. O usuario podera aplicar seu saldo como desconto antes de finalizar o pagamento.

## Como vai funcionar

1. No dialog de pagamento (ao clicar "Comprar"), o usuario vera seu saldo disponivel
2. Podera ativar um toggle/checkbox "Usar meu saldo de R$ XX,XX"
3. Se o saldo cobrir o valor total, o pagamento e finalizado direto (sem Stripe/PIX)
4. Se o saldo cobrir parcialmente, o valor restante sera pago via PIX ou Cartao/Boleto
5. O produto "avulso" (sem acompanhamento) nao participa -- saldo nao pode ser usado nele

## Fluxo visual

```text
[Comprar] 
   |
   v
+----------------------------------+
| Como deseja pagar?               |
|                                  |
| Saldo disponivel: R$ 50,00      |
| [x] Usar meu saldo (-R$ 50,00)  |
|                                  |
| Total: R$ 397,00 -> R$ 347,00   |
|                                  |
| [Pagar via PIX - R$ 347,00]     |
| [Pagar com Cartao/Boleto]       |
+----------------------------------+
```

Se o saldo cobre tudo:
```text
+----------------------------------+
| Saldo disponivel: R$ 200,00     |
| [x] Usar meu saldo (-R$ 197,00) |
|                                  |
| Total: R$ 0,00                   |
|                                  |
| [Finalizar com Saldo]           |
+----------------------------------+
```

## Detalhes Tecnicos

### 1. Nova Edge Function: `use-wallet-balance`
- Recebe: `user_id`, `amount`, `product_title`, `items` (opcional)
- Valida que o usuario tem saldo suficiente
- Desconta o valor da carteira (`wallets.balance`)
- Registra transacao negativa em `wallet_transactions` (type: `purchase`, amount negativo)
- Cria registro em `orders` com status `paid` e metadado indicando pagamento via saldo
- Retorna sucesso/erro

### 2. Atualizar `PaymentChoiceDialog`
- Importar `useWallet` para buscar o saldo
- Adicionar checkbox "Usar meu saldo" com o valor disponivel
- Recalcular precos exibidos quando saldo e aplicado
- Se saldo >= preco total: mostrar botao "Finalizar com Saldo" em vez dos outros
- Se saldo < preco: ajustar valores nos botoes PIX e Cartao

### 3. Atualizar `create-checkout` Edge Function
- Aceitar parametro `wallet_discount` no body
- Aplicar desconto via Stripe coupon ou ajuste no `unit_amount`
- Registrar a transacao de saldo no webhook ao confirmar pagamento

### 4. Atualizar `CartDrawer`
- Adicionar opcao de usar saldo no checkout do carrinho tambem
- Mostrar saldo disponivel e toggle para aplicar

### 5. Restricoes
- Produto "avulso/sem acompanhamento" nao aceita saldo (ja e PIX-only e fora do programa)
- Saldo nao pode ficar negativo
- Operacao atomica para evitar uso duplo do saldo

### Arquivos que serao criados/modificados:
- **Criar**: `supabase/functions/use-wallet-balance/index.ts`
- **Modificar**: `src/components/PaymentChoiceDialog.tsx` -- adicionar logica de saldo
- **Modificar**: `src/components/CartDrawer.tsx` -- adicionar opcao de saldo
- **Modificar**: `supabase/functions/create-checkout/index.ts` -- suportar desconto parcial via saldo
- **Modificar**: `supabase/functions/stripe-webhook/index.ts` -- registrar debito do saldo apos pagamento confirmado

