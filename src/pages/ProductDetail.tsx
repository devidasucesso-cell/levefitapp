import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/stores/cartStore';
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from '@/lib/shopify';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (handle) fetchProduct();
  }, [handle]);

  const fetchProduct = async () => {
    try {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
      if (data?.data?.productByHandle) {
        setProduct(data.data.productByHandle);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const variant = product.variants.edges[selectedVariantIndex]?.node;
    if (!variant) return;
    const shopifyProduct: ShopifyProduct = { node: product };
    await addItem({
      product: shopifyProduct,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success('Adicionado ao carrinho!', { position: 'top-center' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Produto não encontrado</p>
        <Button onClick={() => navigate('/store')}>Voltar à loja</Button>
      </div>
    );
  }

  const images = product.images.edges;
  const selectedVariant = product.variants.edges[selectedVariantIndex]?.node;
  const hasMultipleVariants = product.variants.edges.length > 1 && product.variants.edges[0]?.node.title !== 'Default Title';

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border p-4 safe-area-top">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/store')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CartDrawer />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Images */}
        <div className="aspect-square bg-secondary overflow-hidden">
          {images[selectedImage]?.node ? (
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[selectedImage].node.url}
              alt={images[selectedImage].node.altText || product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Image thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  i === selectedImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img.node.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Product Info */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              R$ {parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
            </p>
          </div>

          {/* Variants */}
          {hasMultipleVariants && (
            <div className="space-y-2">
              <p className="font-medium text-foreground">Opções:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.edges.map((v, i) => (
                  <Button
                    key={v.node.id}
                    variant={i === selectedVariantIndex ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedVariantIndex(i)}
                    disabled={!v.node.availableForSale}
                    className={i === selectedVariantIndex ? 'gradient-primary text-primary-foreground' : ''}
                  >
                    {v.node.selectedOptions.map(o => o.value).join(' / ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <p className="font-medium text-foreground mb-2">Descrição</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            className="w-full h-14 text-lg gradient-primary text-primary-foreground shadow-glow"
            onClick={handleAddToCart}
            disabled={isCartLoading || !selectedVariant?.availableForSale}
          >
            {isCartLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
