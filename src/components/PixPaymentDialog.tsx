import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, MessageCircle } from 'lucide-react';

const WHATSAPP_LINK = 'https://wa.me/message/HQIWLURN37IUP1';

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
          <Button
            asChild
            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Comprovante
            </a>
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full" size="sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
