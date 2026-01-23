import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Droplets, Pill, Target, Flame, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWaterStreak } from '@/hooks/useWaterStreak';
import { differenceInDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ProgressSummary = () => {
  const { profile, capsuleDays, progressHistory } = useAuth();
  const { currentStreak, totalDaysMetGoal } = useWaterStreak();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const pesoInicial = progressHistory.length > 0 
      ? progressHistory[0].weight 
      : profile?.weight || 0;
    
    const pesoAtual = progressHistory.length > 0 
      ? progressHistory[progressHistory.length - 1].weight 
      : profile?.weight || 0;

    const pesoVariation = progressHistory.length > 1 ? pesoAtual - pesoInicial : 0;
    const hasVariation = progressHistory.length > 1;
    
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
      daysSinceStart,
      capsuleConsistency,
      totalCapsuleDays: capsuleDays.length,
      waterStreak: currentStreak,
      totalWaterDays: totalDaysMetGoal,
    };
  }, [profile, progressHistory, capsuleDays, currentStreak, totalDaysMetGoal]);

  const isLosingWeight = stats.hasVariation && stats.pesoVariation < -0.5;
  const isGainingWeight = stats.hasVariation && stats.pesoVariation > 0.5;

  return (
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
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
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
  );
};

export default ProgressSummary;
