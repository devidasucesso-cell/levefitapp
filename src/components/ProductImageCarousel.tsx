import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

const KIT_IMAGES: Record<string, string[]> = {
  '1': [
    '/images/levefit-1pote.png',
    '/images/levefit-box.png',
  ],
  '3': [
    '/images/levefit-3potes.png',
    '/images/levefit-1pote.png',
    '/images/levefit-box.png',
  ],
  '5': [
    '/images/levefit-5potes.png',
    '/images/levefit-collage.jpg',
    '/images/levefit-box.png',
  ],
};

export function getKitImages(title: string): string[] | null {
  const lower = title.toLowerCase();
  if (lower.includes('5 pote')) return KIT_IMAGES['5'];
  if (lower.includes('3 pote')) return KIT_IMAGES['3'];
  if (lower.includes('1 pote') || (lower.includes('pote') && !lower.includes('potes'))) return KIT_IMAGES['1'];
  return null;
}

export const ProductImageCarousel = ({ images, alt, className }: ProductImageCarouselProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-700',
            i === current ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i === current ? 'bg-primary w-3' : 'bg-primary/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
