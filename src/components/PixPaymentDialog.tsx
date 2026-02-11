import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check } from 'lucide-react';

interface PixPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixCode: string;
  amount: string;
  productTitle: string;
}

export const PixPaymentDialog = ({ open, onOpenChange, pixCode, amount, productTitle }: PixPaymentDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="py-4 space-y-4">
          <div className="text-center space-y-2">
            <QrCode className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Pagamento via PIX</h2>
            <p className="text-sm text-muted-foreground">{productTitle}</p>
            <p className="text-sm text-muted-foreground">Copie o código abaixo e cole no app do seu banco</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Valor: <span className="text-primary font-bold">R$ {amount}</span></p>
            <div className="bg-background rounded-lg p-3 border border-input">
              <p className="text-xs text-muted-foreground break-all font-mono leading-relaxed">{pixCode}</p>
            </div>
            <Button onClick={handleCopy} className="w-full gradient-primary text-primary-foreground" size="lg">
              {copied ? <><Check className="w-4 h-4 mr-2" />Copiado!</> : <><Copy className="w-4 h-4 mr-2" />Copiar código PIX</>}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Após o pagamento, envie o comprovante pelo WhatsApp para confirmar.
          </p>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full" size="sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
