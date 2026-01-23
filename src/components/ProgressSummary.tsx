import React, { useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Droplets, Pill, Target, Flame, Award, Sparkles, X, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWaterStreak } from '@/hooks/useWaterStreak';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Weight loss milestones configuration
const WEIGHT_MILESTONES = [
  { kg: 1, id: 'weight_loss_1kg', title: '-1kg Conquistado!', emoji: '🎉', message: 'Você perdeu 1kg! O primeiro passo está dado.' },
  { kg: 2, id: 'weight_loss_2kg', title: '-2kg Conquistado!', emoji: '🔥', message: 'Você perdeu 2kg! Seu esforço está dando resultado.' },
  { kg: 3, id: 'weight_loss_3kg', title: '-3kg Conquistado!', emoji: '💪', message: 'Você perdeu 3kg! Continue assim, você está arrasando!' },
  { kg: 5, id: 'weight_loss_5kg', title: '-5kg Conquistado!', emoji: '🏆', message: 'Incrível! 5kg perdidos! Você é uma inspiração!' },
  { kg: 10, id: 'weight_loss_10kg', title: '-10kg Conquistado!', emoji: '👑', message: 'EXTRAORDINÁRIO! 10kg perdidos! Você é um campeão!' },
];

interface CelebrationData {
  kg: number;
  title: string;
  emoji: string;
  message: string;
}

const ProgressSummary = () => {
  const { profile, capsuleDays, progressHistory, user } = useAuth();
  const { currentStreak, totalDaysMetGoal } = useWaterStreak();
  
  const [showWeightCelebration, setShowWeightCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationData | null>(null);
  const [hasCheckedCelebration, setHasCheckedCelebration] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const stats = useMemo(() => {
    const pesoInicial = progressHistory.length > 0 
      ? progressHistory[0].weight 
      : profile?.weight || 0;
    
    const pesoAtual = progressHistory.length > 0 
      ? progressHistory[progressHistory.length - 1].weight 
      : profile?.weight || 0;

    const pesoVariation = progressHistory.length > 1 ? pesoAtual - pesoInicial : 0;
    const hasVariation = progressHistory.length > 1;
    const weightLost = Math.abs(Math.min(0, pesoVariation)); // Positive number of kg lost
    
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
      weightLost,
      daysSinceStart,
      capsuleConsistency,
      totalCapsuleDays: capsuleDays.length,
      waterStreak: currentStreak,
      totalWaterDays: totalDaysMetGoal,
    };
  }, [profile, progressHistory, capsuleDays, currentStreak, totalDaysMetGoal]);

  // Check for weight loss milestones
  useEffect(() => {
    if (!user || hasCheckedCelebration || stats.weightLost < 1) return;

    const checkWeightMilestones = async () => {
      try {
        // Get all shown weight achievements for this user
        const { data: shownAchievements } = await supabase
          .from('shown_achievements')
          .select('achievement_id')
          .eq('user_id', user.id)
          .like('achievement_id', 'weight_loss_%');

        const shownIds = shownAchievements?.map(a => a.achievement_id) || [];

        // Find the highest milestone reached that hasn't been celebrated
        const reachedMilestones = WEIGHT_MILESTONES.filter(m => stats.weightLost >= m.kg);
        const newMilestone = reachedMilestones.reverse().find(m => !shownIds.includes(m.id));

        if (newMilestone) {
          // Mark as shown
          await supabase
            .from('shown_achievements')
            .insert({
              user_id: user.id,
              achievement_id: newMilestone.id,
            });

          // Set celebration data and show
          setCurrentCelebration({
            kg: newMilestone.kg,
            title: newMilestone.title,
            emoji: newMilestone.emoji,
            message: newMilestone.message,
          });
          setShowWeightCelebration(true);
          
          // Trigger confetti - more particles for bigger milestones
          const particleCount = 100 + (newMilestone.kg * 20);
          confetti({
            particleCount,
            spread: 100 + (newMilestone.kg * 5),
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
          });
        }
      } catch (error) {
        console.error('Error checking weight milestones:', error);
      } finally {
        setHasCheckedCelebration(true);
      }
    };

    checkWeightMilestones();
  }, [user, stats.weightLost, hasCheckedCelebration]);

  const closeCelebration = () => {
    setShowWeightCelebration(false);
  };

  const isLosingWeight = stats.hasVariation && stats.pesoVariation < -0.5;
  const isGainingWeight = stats.hasVariation && stats.pesoVariation > 0.5;

  // Prepare chart data
  const chartData = useMemo(() => {
    if (progressHistory.length === 0) return [];
    
    return progressHistory.map((entry) => ({
      date: format(parseISO(entry.date), 'dd/MM', { locale: ptBR }),
      peso: Number(entry.weight),
      fullDate: format(parseISO(entry.date), "dd 'de' MMM", { locale: ptBR }),
    }));
  }, [progressHistory]);

  const hasChartData = chartData.length >= 2;

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

          {/* Weight Chart Section */}
          {hasChartData && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <button
                onClick={() => setShowChart(!showChart)}
                className="w-full flex items-center justify-between text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Evolução do Peso</span>
                </div>
                {showChart ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              <AnimatePresence>
                {showChart && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="h-32 sm:h-40 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            domain={['dataMin - 1', 'dataMax + 1']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `${value}kg`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return payload[0].payload.fullDate;
                              }
                              return label;
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}kg`, 'Peso']}
                          />
                          <Line
                            type="monotone"
                            dataKey="peso"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Chart legend */}
                    <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Peso registrado</span>
                      </div>
                      {isLosingWeight && (
                        <div className="flex items-center gap-1 text-success">
                          <TrendingDown className="w-3 h-3" />
                          <span>Em queda</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
        {showWeightCelebration && currentCelebration && (
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
                <span className="text-4xl sm:text-5xl">{currentCelebration.emoji}</span>
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
                  {currentCelebration.title}
                </h2>
                
                <p className="text-muted-foreground mb-4">
                  {currentCelebration.message}
                </p>

                <div className="flex items-center justify-center gap-2 text-success font-semibold text-lg">
                  <TrendingDown className="w-5 h-5" />
                  <span>{stats.weightLost.toFixed(1)}kg perdidos no total</span>
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