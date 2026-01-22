import React from 'react';
import { Card } from '@/components/ui/card';
import { Gift, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useGoalProgress } from '@/hooks/useGoalProgress';

const PrizeBanner = () => {
  const { totalProgress, isLoading } = useGoalProgress();

  // Only show when user has reached 75% of all goals
  if (isLoading || totalProgress < 75) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <Card className="p-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 border-none shadow-lg overflow-hidden relative">
        {/* Sparkle decorations */}
        <div className="absolute top-1 right-2 opacity-50">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-1 left-2 opacity-50">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight">🎉 Parabéns!</h3>
            <p className="text-white/90 text-xs mt-1 font-medium">
              Você completou 75% do seu processo.<br/>
              Seu corpo já está em transformação.
            </p>
            <p className="text-white font-bold text-sm mt-2 bg-white/20 px-2 py-1 rounded inline-block">
              🎁 DESBLOQUEIO FINAL: POTE GRÁTIS
            </p>
          </div>
        </div>

        <div className="mt-4 relative z-10 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
          <p className="text-center text-white text-sm mb-3 font-medium">
            Compre 1 LeveFit por R$297 e<br/>
            <span className="font-bold text-yellow-100">GANHE OUTRO TOTALMENTE GRÁTIS</span>
          </p>
          
          <p className="text-center text-white/80 text-[10px] mb-3 flex items-center justify-center gap-1">
            ⏰ Oferta válida por 48 horas
          </p>

          <motion.a
            href="https://pay.kiwify.com.br/seu-link-aqui" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full bg-white text-orange-600 font-bold text-center py-2.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm uppercase tracking-wide"
          >
            Quero meu pote grátis
          </motion.a>
        </div>
      </Card>
    </motion.div>
  );
};

export default PrizeBanner;
