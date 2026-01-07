import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after delay if not installed
    if (isIOSDevice) {
      const hasShownIOSPrompt = localStorage.getItem('pwa-ios-prompt-shown');
      if (!hasShownIOSPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-ios-prompt-shown', 'true');
    }
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Instalar Leve Fit
              </h3>
              {isIOS ? (
                <p className="text-sm text-muted-foreground">
                  Toque em <Share className="w-4 h-4 inline-block mx-1" /> e depois em "Adicionar à Tela de Início"
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Instale o app para acesso rápido e notificações
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={handleDismiss}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!isIOS && deferredPrompt && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
              <Button
                className="flex-1 gradient-primary"
                onClick={handleInstall}
              >
                Instalar
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
