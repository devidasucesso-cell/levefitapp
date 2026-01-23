import React, { useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Droplets, Pill, Target, Flame, Award, Sparkles, X, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWaterStreak } from '@/hooks/useWaterStreak';
import { differenceInDays, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

const WEIGHT_LOSS_ACHIEVEMENT_ID = 'weight_loss_1kg';

const ProgressSummary = () => {
  const { profile, capsuleDays, progressHistory, user } = useAuth();
  const { currentStreak, totalDaysMetGoal } = useWaterStreak();
  
  const [showWeightCelebration, setShowWeightCelebration] = useState(false);
  const [hasCheckedCelebration, setHasCheckedCelebration] = useState(false);

  const stats = useMemo(() => {
    const pesoInicial = progressHistory.length > 0 
      ? progressHistory[0].weight 
      : profile?.weight || 0;
    
    const pesoAtual = progressHistory.length > 0 
      ? progressHistory[progressHistory.length - 1].weight 
      : profile?.weight || 0;

    const pesoVariation = progressHistory.length > 1 ? pesoAtual - pesoInicial : 0;
    const hasVariation = progressHistory.length > 1;
    const lostMoreThan1kg = pesoVariation <= -1;
    
    // Days since start
    const daysSinceStart = profile?.created_at 
      ? differenceInDays(new Date(), parseISO(profile.created_at)) + 1 
      : 1;
    
    // Consistency percentage
    const capsuleConsistency = daysSinceStart > 0 
      ? Math.round((capsuleDays.length / daysSinceStart) * 100) 
      : 0;

    return {
      pesoAtual,
      pesoVariation,
      hasVariation,
      lostMoreThan1kg,
      daysSinceStart,
      capsuleConsistency,
      totalCapsuleDays: capsuleDays.length,
      waterStreak: currentStreak,
      totalWaterDays: totalDaysMetGoal,
    };
  }, [profile, progressHistory, capsuleDays, currentStreak, totalDaysMetGoal]);

  // Check for weight loss celebration
  useEffect(() => {
    if (!user || hasCheckedCelebration || !stats.lostMoreThan1kg) return;

    const checkWeightLossCelebration = async () => {
      try {
        // Check if this celebration was already shown
        const { data: existing } = await supabase
          .from('shown_achievements')
          .select('id')
          .eq('user_id', user.id)
          .eq('achievement_id', WEIGHT_LOSS_ACHIEVEMENT_ID)
          .maybeSingle();

        if (!existing) {
          // Mark as shown
          await supabase
            .from('shown_achievements')
            .insert({
              user_id: user.id,
              achievement_id: WEIGHT_LOSS_ACHIEVEMENT_ID,
            });

          // Show celebration
          setShowWeightCelebration(true);
          
          // Trigger confetti
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
          });
        }
      } catch (error) {
        console.error('Error checking weight loss celebration:', error);
      } finally {
        setHasCheckedCelebration(true);
      }
    };

    checkWeightLossCelebration();
  }, [user, stats.lostMoreThan1kg, hasCheckedCelebration]);

  const closeCelebration = () => {
    setShowWeightCelebration(false);
  };

  const isLosingWeight = stats.hasVariation && stats.pesoVariation < -0.5;
  const isGainingWeight = stats.hasVariation && stats.pesoVariation > 0.5;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card 
          className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Resumo do Progresso</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stats.daysSinceStart} dias de jornada</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Current Weight & Variation */}
            <div className="bg-background/60 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                {isLosingWeight ? (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                ) : isGainingWeight ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                ) : (
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">Peso</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">
                {stats.pesoAtual > 0 ? `${stats.pesoAtual.toFixed(1)}kg` : '--'}
              </p>
              {stats.hasVariation && (
                <p className={`text-[10px] ${
                  isLosingWeight ? 'text-success' : isGainingWeight ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {stats.pesoVariation > 0 ? '+' : ''}{stats.pesoVariation.toFixed(1)}kg
                </p>
              )}
            </div>

            {/* Capsule Days */}
            <div className="bg-background/60 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <Pill className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Cápsulas</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">
                {stats.totalCapsuleDays} dias
              </p>
              <p className="text-[10px] text-muted-foreground">{stats.capsuleConsistency}% consistência</p>
            </div>

            {/* Water Streak */}
            <div className="bg-background/60 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Sequência</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">
                {stats.waterStreak} dias
              </p>
              <p className="text-[10px] text-muted-foreground">de hidratação</p>
            </div>

            {/* Total Water Days */}
            <div className="bg-background/60 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-info" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Meta água</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">
                {stats.totalWaterDays} dias
              </p>
              <p className="text-[10px] text-muted-foreground">atingida</p>
            </div>
          </div>

          {/* Motivation message */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              {stats.capsuleConsistency >= 80 ? (
                <span>🏆 Excelente consistência! Continue assim!</span>
              ) : stats.capsuleConsistency >= 50 ? (
                <span>💪 Bom progresso! Mantenha o foco!</span>
              ) : stats.totalCapsuleDays > 0 ? (
                <span>🌱 Cada dia conta! Vamos melhorar juntos!</span>
              ) : (
                <span>✨ Comece sua jornada tomando sua primeira cápsula!</span>
              )}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Weight Loss Celebration Modal */}
      <AnimatePresence>
        {showWeightCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="bg-card rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeCelebration}
                className="absolute top-3 right-3 p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: 2,
                  repeatType: 'reverse' 
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center mb-4"
              >
                <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Parabéns!</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  -1kg Conquistado! 🎉
                </h2>
                
                <p className="text-muted-foreground mb-4">
                  Você perdeu mais de 1kg desde o início! Seu esforço está valendo a pena. Continue assim!
                </p>

                <div className="flex items-center justify-center gap-2 text-success font-semibold text-lg">
                  <TrendingDown className="w-5 h-5" />
                  <span>{Math.abs(stats.pesoVariation).toFixed(1)}kg perdidos</span>
                </div>
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={closeCelebration}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-success to-emerald-400 text-white font-semibold"
              >
                Continuar 💪
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProgressSummary;