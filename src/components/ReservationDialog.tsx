import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!name.trim() || !phone.trim() || !email.trim()) return;

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
          product_title: productTitle,
          amount: 150,
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

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSuccess(false);
      setName('');
      setPhone('');
      setEmail('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Reserva Confirmada! 🎉</h2>
            <p className="text-muted-foreground">Você receberá mais informações em breve.</p>
            <Button onClick={handleClose} className="gradient-primary text-primary-foreground">Fechar</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reservar {productTitle}</DialogTitle>
              <DialogDescription>Preencha seus dados para reservar o produto.</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-secondary/50 p-4 text-center mb-2">
              <p className="text-sm text-muted-foreground">Valor da reserva</p>
              <p className="text-2xl font-extrabold text-primary">R$ 150,00</p>
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
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Reserva - R$ 150,00'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
