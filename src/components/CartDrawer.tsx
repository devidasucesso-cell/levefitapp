import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2, Wallet } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut] = useState(false);
  const [useBalance, setUseBalance] = useState(false);
  const [isWalletPaying, setIsWalletPaying] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  const { toast } = useToast();
  const { balance, refetch } = useWallet();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  const walletDiscount = useBalance ? Math.min(balance, totalPrice) : 0;
  const finalPrice = totalPrice - walletDiscount;
  const fullyCovered = useBalance && finalPrice <= 0;

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleWalletFullPayment = async () => {
    setIsWalletPaying(true);
    try {
      const checkoutItems = items.map(item => ({
        title: item.product.node.title,
        price: parseFloat(item.price.amount),
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke('use-wallet-balance', {
        body: {
          amount: totalPrice,
          product_title: checkoutItems.map(i => i.title).join(', '),
          items: checkoutItems,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Compra realizada!', description: `Pago com saldo da carteira. Novo saldo: R$ ${data.new_balance.toFixed(2)}` });
      await refetch();
      setIsOpen(false);
      setUseBalance(false);
    } catch (error) {
      console.error('Wallet payment error:', error);
      toast({ title: 'Erro no pagamento', description: 'Não foi possível usar o saldo. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsWalletPaying(false);
    }
  };

  const getMercadoPagoLinkForCart = (): string | null => {
    const MERCADO_PAGO_LINKS: Record<string, string> = {
      '5 pote': 'https://mpago.la/2LKDGgZ',
      '3 pote': 'https://mpago.li/285vej2',
      '1 pote': 'https://mpago.la/2JEW5PU',
    };
    for (const item of items) {
      const lower = item.product.node.title.toLowerCase();
      if (lower.includes('5 pote')) return MERCADO_PAGO_LINKS['5 pote'];
      if (lower.includes('3 pote')) return MERCADO_PAGO_LINKS['3 pote'];
      if (lower.includes('1 pote')) return MERCADO_PAGO_LINKS['1 pote'];
    }
    return null;
  };

  const handleCheckout = () => {
    const link = getMercadoPagoLinkForCart();
    if (link) {
      window.open(link, '_blank');
      setIsOpen(false);
      setUseBalance(false);
    } else {
      toast({ title: 'Erro', description: 'Link de pagamento não encontrado para este produto.', variant: 'destructive' });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Carrinho</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? 'Seu carrinho está vazio' : `${totalItems} ite${totalItems !== 1 ? 'ns' : 'm'} no carrinho`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-2">
                      <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-foreground">{item.product.node.title}</h4>
                        {item.variantTitle !== 'Default Title' && (
                          <p className="text-sm text-muted-foreground">{item.selectedOptions.map(o => o.value).join(' • ')}</p>
                        )}
                        <p className="font-semibold text-foreground">R$ {parseFloat(item.price.amount).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.variantId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                {/* Wallet balance option */}
                {balance > 0 && (
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="w-4 h-4" />
                      <span>Saldo disponível: <strong className="text-foreground">R$ {balance.toFixed(2)}</strong></span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={useBalance}
                        onCheckedChange={(checked) => setUseBalance(checked === true)}
                      />
                      <span className="text-sm font-medium text-foreground">
                        Usar meu saldo (-R$ {Math.min(balance, totalPrice).toFixed(2)})
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <div className="text-right">
                    {useBalance && walletDiscount > 0 && (
                      <span className="text-sm line-through text-muted-foreground block">R$ {totalPrice.toFixed(2)}</span>
                    )}
                    <span className="text-xl font-bold">R$ {(useBalance ? finalPrice : totalPrice).toFixed(2)}</span>
                  </div>
                </div>

                {fullyCovered ? (
                  <Button
                    onClick={handleWalletFullPayment}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                    disabled={isWalletPaying}
                  >
                    {isWalletPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wallet className="w-4 h-4 mr-2" />Finalizar com Saldo</>}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckout}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                    disabled={items.length === 0 || isLoading || isSyncing || isCheckingOut}
                  >
                    {isLoading || isSyncing || isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" />Pagar{useBalance && walletDiscount > 0 ? ` R$ ${finalPrice.toFixed(2)}` : ''}</>}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
