

# Desvincular Shopify e Criar Loja com Produtos do leveday.com.br

## O que sera feito

Remover toda a integracao com Shopify e substituir por uma loja estatica com os 3 produtos do site leveday.com.br, cada um com foto, preco e link de pagamento Kiwify.

## Produtos (extraidos do leveday.com.br)

| Produto | Preco | De | Link Kiwify |
|---------|-------|----|-------------|
| 1 Pote - Experimente | R$ 197,00 | R$ 297,00 | https://pay.kiwify.com.br/djZ0jPJ |
| 3 Potes - Mais Vendido | R$ 397,00 | R$ 591,00 | https://pay.kiwify.com.br/tl70FtX |
| 5 Potes - Tratamento Completo | R$ 597,00 | R$ 985,00 | https://pay.kiwify.com.br/2f37f71 |

Imagens: usar as que ja existem em `/public/images/` (levefit-1pote.png, levefit-3potes.png, levefit-5potes.png, levefit-box.png, etc.)

## Alteracoes

### 1. Reescrever `src/pages/Store.tsx`
- Remover imports de Shopify, cart store, CartDrawer
- Definir array estatico de produtos com: titulo, preco, preco original, imagem, link Kiwify, tag (ex: "Mais Vendido"), PIX code/amount
- Ao clicar "Comprar", abrir `PaymentChoiceDialog` com opcoes PIX e Kiwify (cartao/boleto)
- Manter o banner do Detox e o banner do Kit 3 Potes
- Manter Navigation

### 2. Remover `src/pages/ProductDetail.tsx` e rota `/product/:handle`
- Nao e mais necessario pois os produtos sao simples e o pagamento e direto
- Remover import e rota do `App.tsx`

### 3. Simplificar `src/stores/cartStore.ts`
- Remover toda logica Shopify (cart create, lines add, etc.)
- Manter apenas um store simples local (ou remover se o carrinho nao for mais necessario, ja que cada produto vai direto para pagamento)

### 4. Remover/simplificar `src/lib/shopify.ts`
- Remover o arquivo inteiro (nao sera mais usado)

### 5. Remover `src/components/FloatingCart.tsx` e `src/components/CartDrawer.tsx`
- Sem carrinho Shopify, nao ha necessidade de cart drawer flutuante
- Remover imports do `App.tsx`

### 6. Atualizar `src/App.tsx`
- Remover import de ProductDetail, CartDrawer, FloatingCart, useCartSync
- Remover rota `/product/:handle`

### 7. Atualizar `src/components/PaymentChoiceDialog.tsx`
- Atualizar links Mercado Pago para links Kiwify
- Manter PIX + Kiwify como opcoes

### 8. Manter `src/hooks/useCartSync.ts` removido ou vazio

## Fluxo do usuario

1. Abre a loja → ve os 3 kits + banner Detox
2. Clica "Comprar" → abre dialog com opcoes PIX ou Cartao/Boleto (Kiwify)
3. PIX: mostra QR code/codigo
4. Cartao/Boleto: redireciona para Kiwify

## Arquivos modificados/removidos
- `src/pages/Store.tsx` - reescrito sem Shopify
- `src/lib/shopify.ts` - removido
- `src/stores/cartStore.ts` - simplificado ou removido
- `src/components/CartDrawer.tsx` - removido
- `src/components/FloatingCart.tsx` - removido
- `src/hooks/useCartSync.ts` - removido
- `src/pages/ProductDetail.tsx` - removido
- `src/App.tsx` - limpar imports e rotas
- `src/components/PaymentChoiceDialog.tsx` - trocar Mercado Pago por Kiwify

