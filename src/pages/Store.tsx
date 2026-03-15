import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { ReservationDialog } from '@/components/ReservationDialog';
import { PaymentChoiceDialog } from '@/components/PaymentChoiceDialog';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  tag?: string;
  kiwifyLink: string;
  pixCode: string;
  pixAmount: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1-pote',
    title: '1 Pote - Experimente',
    price: 197,
    originalPrice: 297,
    image: '/images/levefit-1pote.png',
    kiwifyLink: 'https://pay.kiwify.com.br/djZ0jPJ',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406197.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521ijG7D3PyjYf9Rcc7athiv6304720F',
    pixAmount: '197,00',
  },
  {
    id: '3-potes',
    title: '3 Potes - Mais Vendido',
    price: 397,
    originalPrice: 591,
    image: '/images/levefit-3potes.png',
    tag: '🔥 MAIS VENDIDO',
    kiwifyLink: 'https://pay.kiwify.com.br/tl70FtX',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406397.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521T7yyFq4m0DDTZGn7athiv6304AEDE',
    pixAmount: '397,00',
  },
  {
    id: '5-potes',
    title: '5 Potes - Tratamento Completo',
    price: 597,
    originalPrice: 985,
    image: '/images/levefit-5potes.png',
    tag: '💎 MELHOR CUSTO',
    kiwifyLink: 'https://pay.kiwify.com.br/2f37f71',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406597.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521KCxNwZ1Nj4tt3UT7athiv630496F5',
    pixAmount: '554,00',
  },
];

const Store = () => {
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationProduct, setReservationProduct] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  // Capture affiliate code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const affCode = params.get('aff');
    if (affCode) {
      localStorage.setItem('aff_code', affCode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero p-4 sm:p-6 pb-6 rounded-b-3xl shadow-lg safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">Loja LeveFit</h1>
          </div>
        </div>
      </div>

      {/* Detox Banner */}
      <div className="px-4 max-w-4xl mx-auto -mt-4 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 p-5 shadow-glow cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => {
            setReservationProduct('Leve Fit Detox - Em Breve');
            setReservationOpen(true);
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-block bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-2">
              🍍 LANÇAMENTO
            </span>
            <h2 className="text-lg font-bold text-primary-foreground leading-tight">Leve Fit Detox</h2>
            <p className="text-primary-foreground/80 text-sm mt-1">Sabor Abacaxi com Hortelã • Natural, Sem Açúcar, Sem Glúten</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-primary-foreground/60 line-through text-sm">R$ 297,00</span>
              <span className="text-primary-foreground font-extrabold text-xl">R$ 119,99</span>
            </div>
            <p className="text-primary-foreground/90 text-xs mt-2 font-semibold">Toque para reservar o seu! 🔥</p>
          </div>
        </motion.div>
      </div>

      {/* Kit 3 Potes Banner */}
      <div className="px-4 max-w-4xl mx-auto mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent p-5 shadow-glow cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => {
            const kit3 = PRODUCTS.find(p => p.id === '3-potes');
            if (kit3) {
              setSelectedProduct(kit3);
              setPaymentDialogOpen(true);
            }
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-block bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-2">
              🔥 MAIS VENDIDO
            </span>
            <h2 className="text-lg font-bold text-primary-foreground leading-tight">Kit 3 Potes LeveFit</h2>
            <p className="text-primary-foreground/80 text-sm mt-1">90 dias de tratamento completo com frete grátis!</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-primary-foreground/60 line-through text-sm">R$ 591,00</span>
              <span className="text-primary-foreground font-extrabold text-xl">R$ 397,00</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-secondary overflow-hidden relative">
                  {product.tag && (
                    <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {product.tag}
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground line-through text-sm">R$ {product.originalPrice.toFixed(2)}</span>
                    <span className="text-primary font-bold text-lg">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full mt-3 gradient-primary text-primary-foreground"
                    onClick={() => {
                      setSelectedProduct(product);
                      setPaymentDialogOpen(true);
                    }}
                  >
                    Comprar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <ReservationDialog open={reservationOpen} onOpenChange={setReservationOpen} productTitle={reservationProduct} />

      {selectedProduct && (
        <PaymentChoiceDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          productTitle={selectedProduct.title}
          price={selectedProduct.price.toString()}
          pixCode={selectedProduct.pixCode}
          pixAmount={selectedProduct.pixAmount}
          kiwifyLink={selectedProduct.kiwifyLink}
          onCartPayment={() => {}}
          isAvulso={false}
        />
      )}

      <Navigation />
    </div>
  );
};

export default Store;
