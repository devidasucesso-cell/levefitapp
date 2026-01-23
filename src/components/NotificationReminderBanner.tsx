import React from 'react';
import { motion } from 'framer-motion';
import { Bell, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NotificationReminderBannerProps {
  onActivate: () => void;
  onDismiss: () => void;
  isIOS: boolean;
  isStandalone: boolean;
}

const NotificationReminderBanner = ({
  onActivate,
  onDismiss,
  isIOS,
  isStandalone
}: NotificationReminderBannerProps) => {
  const needsPWA = isIOS && !isStandalone;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-md">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -5, 5, 0],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
            className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow"
          >
            <Bell className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              🔔 Ative as Notificações
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {needsPWA 
                ? 'Instale o app primeiro (Compartilhar → Adicionar à Tela)'
                : 'Receba lembretes de cápsula e água no horário certo!'
              }
            </p>
            
            <Button
              onClick={onActivate}
              disabled={needsPWA}
              size="sm"
              className="mt-2 gradient-primary text-primary-foreground shadow-glow h-8 text-xs"
            >
              {needsPWA ? 'Instalar App' : 'Ativar Agora'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default NotificationReminderBanner;
