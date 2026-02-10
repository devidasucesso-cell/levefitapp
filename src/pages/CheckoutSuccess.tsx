import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pagamento Confirmado!</h1>
        <p className="text-muted-foreground">
          Seu pedido foi realizado com sucesso. Você receberá um e-mail com os detalhes da compra.
        </p>
        <Button onClick={() => navigate('/store')} className="gradient-primary text-primary-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a Loja
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
