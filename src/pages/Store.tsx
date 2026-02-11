import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore, ShopifyProduct } from '@/stores/cartStore';
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY } from '@/lib/shopify';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { ReservationDialog } from '@/components/ReservationDialog';
import { PaymentChoiceDialog } from '@/components/PaymentChoiceDialog';
import { ProductImageCarousel, getKitImages } from '@/components/ProductImageCarousel';

const PIX_CODES: Record<string, { code: string; amount: string }> = {
  '1 pote': {
    code: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406197.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521ijG7D3PyjYf9Rcc7athiv6304720F',
    amount: '197,00',
  },
  '3 pote': {
    code: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406397.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521T7yyFq4m0DDTZGn7athiv6304AEDE',
    amount: '397,00',
  },
  '5 pote': {
    code: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406597.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521KCxNwZ1Nj4tt3UT7athiv630496F5',
    amount: '597,00',
  },
  'avulso': {
    code: '00020126580014BR.GOV.BCB.PIX0136f390df5b-7463-4a54-8e02-59f6f71825d45204000053039865406135.005802BR592564.399.771 ESTER SANTOS F6009SAO PAULO61080540900062250521X68eRj5W0U7fIEr7athiv6304B810',
    amount: '135,00',
  },
};

function getPixForProduct(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('avulso') || lower.includes('sem acompanhamento')) return PIX_CODES['avulso'];
  if (lower.includes('5 pote')) return PIX_CODES['5 pote'];
  if (lower.includes('3 pote')) return PIX_CODES['3 pote'];
  if (lower.includes('1 pote')) return PIX_CODES['1 pote'];
  return null;
}

const Store = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationProduct, setReservationProduct] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  // Capture affiliate code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const affCode = params.get('aff');
    if (affCode) {
      localStorage.setItem('aff_code', affCode);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
      if (data?.data?.products?.edges) {
        setProducts(data.data.products.edges);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success('Adicionado ao carrinho!', { position: 'top-center' });
  };

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
            <h2 className="text-lg font-bold text-primary-foreground leading-tight">
              Leve Fit Detox
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Sabor Abacaxi com Hortelã • Natural, Sem Açúcar, Sem Glúten
            </p>
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
            const kit3 = products.find(p => p.node.title.toLowerCase().includes('3 pote'));
            if (kit3) navigate(`/product/${kit3.node.handle}`);
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-block bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-2">
              🔥 MAIS VENDIDO
            </span>
            <h2 className="text-lg font-bold text-primary-foreground leading-tight">
              Kit 3 Potes LeveFit
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              90 dias de tratamento completo com frete grátis!
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-primary-foreground/60 line-through text-sm">R$ 591,00</span>
              <span className="text-primary-foreground font-extrabold text-xl">R$ 397,00</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground">Em breve teremos produtos disponíveis para você!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {products.map((product, index) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              const kitImages = getKitImages(product.node.title);
              return (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/product/${product.node.handle}`)}
                  >
                    <div className="aspect-square bg-secondary overflow-hidden">
                      {kitImages ? (
                        <ProductImageCarousel images={kitImages} alt={product.node.title} />
                      ) : image ? (
                        <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground truncate">{product.node.title}</h3>
                      {product.node.title.toLowerCase().includes('em breve') ? (
                        <>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-muted-foreground line-through text-xs">R$ 297,00</span>
                            <span className="text-primary font-bold text-sm">R$ 119,99</span>
                          </div>
                          <Button
                            className="w-full mt-2 gradient-primary text-primary-foreground text-xs h-8"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReservationProduct(product.node.title);
                              setReservationOpen(true);
                            }}
                          >
                            Reservar o meu
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-primary font-bold mt-1">R$ {parseFloat(price.amount).toFixed(2)}</p>
                          <Button
                            className="w-full mt-2 gradient-primary text-primary-foreground text-xs h-8"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setPaymentDialogOpen(true);
                            }}
                          >
                            Comprar
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <ReservationDialog open={reservationOpen} onOpenChange={setReservationOpen} productTitle={reservationProduct} />
      {selectedProduct && (() => {
        const pix = getPixForProduct(selectedProduct.node.title);
        const variant = selectedProduct.node.variants.edges[0]?.node;
        return (
          <PaymentChoiceDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            productTitle={selectedProduct.node.title}
            price={variant?.price.amount || '0'}
            pixCode={pix?.code || null}
            pixAmount={pix?.amount || null}
            onCartPayment={() => handleAddToCart(selectedProduct)}
            isCartLoading={isCartLoading}
            isAvulso={(() => { const t = selectedProduct.node.title.toLowerCase(); return t.includes('avulso') || t.includes('sem acompanhamento') || t.includes('detox'); })()}
          />
        );
      })()}
      <Navigation />
    </div>
  );
};

export default Store;
