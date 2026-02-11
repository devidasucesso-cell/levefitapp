import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { PixPaymentDialog } from '@/components/PixPaymentDialog';

interface PaymentChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  price: string;
  pixCode: string | null;
  pixAmount: string | null;
  onCartPayment: () => void;
  isCartLoading?: boolean;
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
}: PaymentChoiceDialogProps) => {
  const [pixOpen, setPixOpen] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Como deseja pagar? 💳</h2>
            <p className="text-muted-foreground text-sm">{productTitle}</p>
            <div className="flex flex-col gap-3 pt-2">
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
                  Pagar via PIX - R$ {pixAmount}
                </Button>
              )}
              <Button
                onClick={() => {
                  handleClose();
                  onCartPayment();
                }}
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
                Pagar com Cartão/Boleto
              </Button>
              <Button onClick={handleClose} variant="ghost" size="sm" className="text-muted-foreground">
                Não, pagar depois
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {pixCode && pixAmount && (
        <PixPaymentDialog
          open={pixOpen}
          onOpenChange={setPixOpen}
          pixCode={pixCode}
          amount={pixAmount}
          productTitle={productTitle}
        />
      )}
    </>
  );
};
