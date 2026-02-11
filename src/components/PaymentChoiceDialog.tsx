import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { QrCode, CreditCard, Loader2, CheckCircle, Wallet } from 'lucide-react';
import { PixPaymentDialog } from '@/components/PixPaymentDialog';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  price: string;
  pixCode: string | null;
  pixAmount: string | null;
  onCartPayment: () => void;
  isCartLoading?: boolean;
  isAvulso?: boolean;
}

export const PaymentChoiceDialog = ({
  open,
  onOpenChange,
  productTitle,
  price,
  pixCode,
  pixAmount,
  onCartPayment,
  isCartLoading,
  isAvulso = false,
}: PaymentChoiceDialogProps) => {
  const [pixOpen, setPixOpen] = useState(false);
  const [useBalance, setUseBalance] = useState(false);
  const [isWalletPaying, setIsWalletPaying] = useState(false);
  const { balance, refetch } = useWallet();
  const { toast } = useToast();

  const originalPrice = parseFloat(price);
  const walletDiscount = useBalance ? Math.min(balance, originalPrice) : 0;
  const finalPrice = originalPrice - walletDiscount;
  const fullyCovered = useBalance && finalPrice <= 0;

  const handleClose = () => {
    setUseBalance(false);
    onOpenChange(false);
  };

  const handleWalletFullPayment = async () => {
    setIsWalletPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('use-wallet-balance', {
        body: {
          amount: originalPrice,
          product_title: productTitle,
          items: [{ title: productTitle, price: originalPrice, quantity: 1 }],
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Compra realizada!', description: `Pago com saldo da carteira. Novo saldo: R$ ${data.new_balance.toFixed(2)}` });
      await refetch();
      handleClose();
    } catch (error) {
      console.error('Wallet payment error:', error);
      toast({ title: 'Erro no pagamento', description: 'Não foi possível usar o saldo. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsWalletPaying(false);
    }
  };

  const handleCartPaymentWithDiscount = () => {
    handleClose();
    onCartPayment();
  };

  const finalPixAmount = useBalance && pixAmount ? (parseFloat(pixAmount) - walletDiscount).toFixed(2) : pixAmount;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Como deseja pagar? 💳</h2>
            <p className="text-muted-foreground text-sm">{productTitle}</p>

            {/* Wallet balance section - hidden for avulso */}
            {!isAvulso && balance > 0 && (
              <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-3">
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
                    Usar meu saldo (-R$ {Math.min(balance, originalPrice).toFixed(2)})
                  </span>
                </label>
                {useBalance && (
                  <div className="text-sm">
                    <span className="line-through text-muted-foreground">R$ {originalPrice.toFixed(2)}</span>
                    <span className="ml-2 font-bold text-primary">
                      {fullyCovered ? 'R$ 0,00' : `R$ ${finalPrice.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {fullyCovered ? (
                <Button
                  onClick={handleWalletFullPayment}
                  className="w-full gradient-primary text-primary-foreground"
                  size="lg"
                  disabled={isWalletPaying}
                >
                  {isWalletPaying ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Finalizar com Saldo
                </Button>
              ) : (
                <>
                  {pixCode && pixAmount && (
                    <Button
                      onClick={() => {
                        handleClose();
                        setTimeout(() => setPixOpen(true), 200);
                      }}
                      className="w-full gradient-primary text-primary-foreground"
                      size="lg"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Pagar via PIX - R$ {useBalance ? finalPrice.toFixed(2) : pixAmount}
                    </Button>
                  )}
                  <Button
                    onClick={handleCartPaymentWithDiscount}
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled={isCartLoading}
                  >
                    {isCartLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Pagar com Cartão/Boleto{useBalance ? ` - R$ ${finalPrice.toFixed(2)}` : ''}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {pixCode && pixAmount && (
        <PixPaymentDialog
          open={pixOpen}
          onOpenChange={setPixOpen}
          pixCode={pixCode}
          amount={useBalance && finalPixAmount ? finalPixAmount : pixAmount}
          productTitle={productTitle}
        />
      )}
    </>
  );
};
