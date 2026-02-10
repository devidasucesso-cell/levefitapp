

# Integrar Pagamentos Stripe na Loja LeveFit

## Objetivo
Substituir o checkout externo do Shopify por um checkout integrado via Stripe, aceitando PIX, cartao de credito e debito -- tudo dentro do app.

## Fluxo Atual vs Novo

```text
ATUAL:
  Carrinho -> Shopify Checkout (pagina externa)

NOVO:
  Carrinho -> Stripe Checkout Session (pagina Stripe segura)
  - Cartao de credito/debito
  - PIX (via Stripe Brasil)
```

## Etapas de Implementacao

### 1. Habilitar Stripe
- Ativar a integracao Stripe no projeto
- Voce vai inserir sua chave de API restrita do Stripe de forma segura

### 2. Criar Edge Function `create-checkout`
- Recebe os itens do carrinho (titulo, preco, quantidade, imagem)
- Cria uma Stripe Checkout Session com:
  - Metodos de pagamento: `card` e `boleto` (PIX via Stripe Brasil depende da ativacao na sua conta Stripe)
  - Moeda: BRL
  - URLs de sucesso e cancelamento
- Retorna a URL da sessao de checkout

### 3. Modificar o Fluxo de Checkout
- No `CartDrawer`, o botao "Finalizar Compra" vai chamar a edge function
- A edge function retorna a URL do Stripe Checkout
- O usuario e redirecionado para a pagina segura do Stripe
- Apos o pagamento, volta para o app com confirmacao

### 4. Pagina de Sucesso
- Criar rota `/checkout-success` para confirmar a compra
- Limpar o carrinho apos pagamento bem-sucedido

## Detalhes Tecnicos

### Edge Function `create-checkout`
- Usa o SDK do Stripe (`stripe` npm via Deno)
- Recebe array de `line_items` com dados dos produtos do Shopify
- Cria `Checkout Session` com payment_method_types configurados
- Retorna `session.url` para redirect

### Alteracoes no Frontend
- **CartDrawer.tsx**: Botao "Finalizar Compra" chama a edge function em vez de usar `getCheckoutUrl()`
- **Nova pagina** `CheckoutSuccess.tsx`: Exibe confirmacao e limpa carrinho
- **App.tsx**: Adicionar rota `/checkout-success`

### Produtos
- Os produtos continuam vindo do Shopify (catalogo)
- Apenas o pagamento passa pelo Stripe
- Precos sao enviados dinamicamente a partir dos dados do Shopify

## Pre-requisitos
- Sua chave de API restrita do Stripe (formato `rk_test_...` ou `sk_test_...`)
- Para aceitar PIX, o metodo precisa estar habilitado no painel do Stripe (Configuracoes > Metodos de Pagamento)

