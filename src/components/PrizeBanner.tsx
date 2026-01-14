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
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">🎉 Parabéns! Você conquistou!</span>
            </div>
            <p className="text-white font-semibold text-base leading-tight">
              Compre 1 pote e ganhe o segundo!
            </p>
            <p className="text-white/80 text-xs mt-1">
              Por R$ 297,00
            </p>
          </div>
        </div>

        <div className="mt-3 relative z-10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/90 text-xs">Seu progresso</span>
            <span className="text-white font-bold text-xs">{totalProgress}%</span>
          </div>
          <Progress 
            value={totalProgress} 
            className="h-2 bg-white/20" 
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default PrizeBanner;
