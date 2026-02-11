import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle, CreditCard, Copy, Check, QrCode, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
}

export const ReservationDialog = ({ open, onOpenChange, productTitle }: ReservationDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [flavor, setFlavor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !flavor) return;

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast({ title: 'Telefone inválido', description: 'Informe um telefone com DDD.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.functions.invoke('create-reservation', {
        body: {
          name: name.trim(),
          phone: phoneDigits,
          email: email.trim(),
          product_title: `${productTitle} - Sabor: ${flavor}`,
          amount: 119.99,
          user_id: user?.id || null,
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Reservation error:', err);
      toast({ title: 'Erro ao reservar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setIsRedirecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [{
            title: `Leve Fit Detox - Sabor: ${flavor}`,
            price: 119.99,
            quantity: 1,
          }],
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({ title: 'Erro ao iniciar pagamento', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsRedirecting(false);
    }
  };

  const PIX_CODE = '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406119.995802BR592564.399.771 ESTER SANTOS F6009SAO PAULO610805409000622505216pAtxEbE75Nit4t7athiv6304CBA6';

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSuccess(false);
      setShowPix(false);
      setCopied(false);
      setName('');
      setPhone('');
      setEmail('');
      setFlavor('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success && !showPix ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Reserva Confirmada! 🎉</h2>
            <p className="text-muted-foreground">Deseja pagar sua reserva agora?</p>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => setShowPix(true)}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Pagar via PIX - R$ 119,99
              </Button>
              <Button
                onClick={handlePayment}
                className="w-full"
                variant="outline"
                size="lg"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
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
        ) : showPix ? (
          <div className="py-4 space-y-4">
            <div className="text-center space-y-2">
              <QrCode className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold text-foreground">Pagamento via PIX</h2>
              <p className="text-sm text-muted-foreground">Copie o código abaixo e cole no app do seu banco</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Valor: <span className="text-primary font-bold">R$ 119,99</span></p>
              
              <div className="bg-background rounded-lg p-3 border border-input">
                <p className="text-xs text-muted-foreground break-all font-mono leading-relaxed">{PIX_CODE}</p>
              </div>
              <Button onClick={handleCopyPix} className="w-full gradient-primary text-primary-foreground" size="lg">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código PIX
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Após o pagamento, envie o comprovante pelo WhatsApp para confirmar.
            </p>
            <Button
              asChild
              className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
              size="lg"
            >
              <a href="https://wa.me/message/HQIWLURN37IUP1" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Comprovante
              </a>
            </Button>
            <Button onClick={handleClose} variant="outline" className="w-full" size="sm">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reservar {productTitle}</DialogTitle>
              <DialogDescription>Preencha seus dados para reservar o produto.</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-secondary/50 p-4 text-center mb-2">
              <p className="text-sm text-muted-foreground">Desconto do produto</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-muted-foreground line-through text-lg">R$ 297,00</span>
                <span className="text-2xl font-extrabold text-primary">R$ 119,99</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="res-name">Nome completo</Label>
                <Input id="res-name" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-phone">Telefone (WhatsApp)</Label>
                <Input id="res-phone" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-email">E-mail</Label>
                <Input id="res-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required maxLength={255} />
              </div>
              <div className="space-y-3">
                <Label>Sabor desejado</Label>
                <RadioGroup value={flavor} onValueChange={setFlavor} className="flex flex-col gap-3">
                  <div className="flex items-center space-x-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="Limão" id="flavor-limao" />
                    <Label htmlFor="flavor-limao" className="cursor-pointer font-medium">🍋 Limão</Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="Abacaxi com Hortelã" id="flavor-abacaxi" />
                    <Label htmlFor="flavor-abacaxi" className="cursor-pointer font-medium">🍍 Abacaxi com Hortelã</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" size="lg" disabled={isSubmitting || !flavor}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Reserva - R$ 119,99'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
