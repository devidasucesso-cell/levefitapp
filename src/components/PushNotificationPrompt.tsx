import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Droplets, Pill, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PushNotificationPromptProps {
  onActivate: () => Promise<void>;
  onDismiss: () => void;
  isLoading: boolean;
  isIOS: boolean;
  isStandalone: boolean;
}

const PushNotificationPrompt = ({ 
  onActivate, 
  onDismiss, 
  isLoading,
  isIOS,
  isStandalone 
}: PushNotificationPromptProps) => {
  const needsPWA = isIOS && !isStandalone;

  const benefits = [
    {
      icon: Pill,
      title: 'Lembretes da Cápsula',
      description: 'Nunca esqueça de tomar sua LeveFit'
    },
    {
      icon: Droplets,
      title: 'Alertas de Hidratação',
      description: 'Mantenha-se hidratado durante o dia'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento',
      description: 'Resumos diários do seu progresso'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header with animated bell */}
        <div className="gradient-hero p-6 pb-8 text-center">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/20 mb-4"
          >
            <Bell className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h2 className="text-2xl font-bold font-display text-primary-foreground mb-2">
            Ative as Notificações
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            Receba lembretes importantes para manter sua rotina em dia
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="flex items-start gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <benefit.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {benefit.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* iOS PWA Warning */}
          {needsPWA && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-3 rounded-xl bg-accent border border-border"
            >
              <p className="text-xs text-muted-foreground">
                📱 No iPhone/iPad, primeiro adicione o app à tela inicial (botão Compartilhar → "Adicionar à Tela de Início")
              </p>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-6 pt-0 space-y-3">
          <Button
            onClick={onActivate}
            disabled={isLoading || needsPWA}
            className="w-full gradient-primary text-primary-foreground shadow-glow h-12 text-base font-semibold"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Bell className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Bell className="w-5 h-5 mr-2" />
                Ativar Notificações
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onDismiss}
            disabled={isLoading}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Mais Tarde
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PushNotificationPrompt;
