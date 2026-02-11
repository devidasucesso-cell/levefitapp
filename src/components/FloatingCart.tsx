import { useLocation } from 'react-router-dom';
import { CartDrawer } from '@/components/CartDrawer';

const SHOW_ON_ROUTES = ['/dashboard', '/recipes', '/detox', '/exercises', '/progress', '/store', '/referral', '/settings'];

export const FloatingCart = () => {
  const location = useLocation();
  const show = SHOW_ON_ROUTES.some(r => location.pathname.startsWith(r));

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 safe-area-bottom">
      <div className="shadow-glow rounded-full">
        <CartDrawer />
      </div>
    </div>
  );
};
