import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Droplets, Pill, Flame, Star, Award, Target, Zap, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  total?: number;
  color: string;
}

interface AchievementsCardProps {
  capsuleDays: number;
  waterStreak: number;
  totalWaterDays: number;
}

const AchievementsCard = ({ capsuleDays, waterStreak, totalWaterDays }: AchievementsCardProps) => {
  const { user } = useAuth();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const [isLoadingShown, setIsLoadingShown] = useState(true);

  // Fetch shown achievements from database
  useEffect(() => {
    if (!user) {
      setIsLoadingShown(false);
      return;
    }

    const fetchShownAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('shown_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setShownAchievements(data?.map(a => a.achievement_id) || []);
      } catch (error) {
        console.error('Error fetching shown achievements:', error);
      } finally {
        setIsLoadingShown(false);
      }
    };

    fetchShownAchievements();
  }, [user]);

  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'first-capsule',
      name: 'Primeiro Passo',
      description: 'Tomou sua primeira cápsula',
      icon: <Pill className="w-5 h-5" />,
      unlocked: capsuleDays >= 1,
      color: 'from-green-400 to-green-600',
    },
    {
      id: 'week-capsule',
      name: 'Semana Completa',
      description: '7 dias tomando a cápsula',
      icon: <Star className="w-5 h-5" />,
      unlocked: capsuleDays >= 7,
      progress: Math.min(capsuleDays, 7),
      total: 7,
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'month-capsule',
      name: 'Mês de Dedicação',
      description: '30 dias tomando a cápsula',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: capsuleDays >= 30,
      progress: Math.min(capsuleDays, 30),
      total: 30,
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 'hydration-start',
      name: 'Hidratação Iniciada',
      description: 'Primeiro dia batendo meta de água',
      icon: <Droplets className="w-5 h-5" />,
      unlocked: totalWaterDays >= 1,
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 'hydration-week',
      name: 'Semana Hidratada',
      description: '7 dias batendo a meta de água',
      icon: <Zap className="w-5 h-5" />,
      unlocked: totalWaterDays >= 7,
      progress: Math.min(totalWaterDays, 7),
      total: 7,
      color: 'from-cyan-400 to-cyan-600',
    },
    {
      id: 'consistency',
      name: 'Consistência',
      description: '15 dias de cápsula',
      icon: <Target className="w-5 h-5" />,
      unlocked: capsuleDays >= 15,
      progress: Math.min(capsuleDays, 15),
      total: 15,
      color: 'from-pink-400 to-pink-600',
    },
    {
      id: 'master',
      name: 'Mestre LeveFit',
      description: '60 dias de tratamento',
      icon: <Award className="w-5 h-5" />,
      unlocked: capsuleDays >= 60,
      progress: Math.min(capsuleDays, 60),
      total: 60,
      color: 'from-amber-400 to-amber-600',
    },
    {
      id: 'fire',
      name: 'Em Chamas',
      description: '3 dias seguidos de hidratação',
      icon: <Flame className="w-5 h-5" />,
      unlocked: waterStreak >= 3,
      progress: Math.min(waterStreak, 3),
      total: 3,
      color: 'from-red-400 to-red-600',
    },
  ], [capsuleDays, totalWaterDays, waterStreak]);

  // Check for newly unlocked achievements (only those not shown before in DB)
  useEffect(() => {
    if (isLoadingShown || !user) return;

    const checkNewUnlocks = async () => {
      const unlockedAchievements = achievements.filter(a => a.unlocked);
      
      // Find achievements that are unlocked but haven't been shown yet
      const newUnlocks = unlockedAchievements.filter(a => !shownAchievements.includes(a.id));
      
      if (newUnlocks.length > 0) {
        const achievementToShow = newUnlocks[0];
        
        // Save to database that this achievement was shown
        try {
          await supabase
            .from('shown_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievementToShow.id,
            });

          // Update local state
          setShownAchievements(prev => [...prev, achievementToShow.id]);
          
          // Show celebration
          setNewlyUnlocked(achievementToShow);
          setShowCelebration(true);
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
          });
        } catch (error) {
          // If insert fails (e.g., already exists), just ignore
          console.error('Error saving shown achievement:', error);
        }
      }
    };

    checkNewUnlocks();
  }, [achievements, shownAchievements, isLoadingShown, user]);

  const closeCelebration = () => {
    setShowCelebration(false);
    setNewlyUnlocked(null);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <>
      <Card className="p-3 sm:p-4 bg-card">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Conquistas</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{unlockedCount}/{achievements.length} desbloqueadas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <motion.div
                className={cn(
                  "w-full aspect-square rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                  achievement.unlocked
                    ? `bg-gradient-to-br ${achievement.color} shadow-lg`
                    : "bg-muted/50 opacity-40"
                )}
                whileHover={achievement.unlocked ? { scale: 1.1 } : {}}
                whileTap={achievement.unlocked ? { scale: 0.95 } : {}}
              >
                <span className={cn(
                  "scale-75 sm:scale-100",
                  achievement.unlocked ? "text-white" : "text-muted-foreground"
                )}>
                  {achievement.icon}
                </span>
              </motion.div>
              
              {/* Progress indicator */}
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] text-muted-foreground font-medium">
                  {achievement.progress}/{achievement.total}
                </div>
              )}

              {/* Tooltip - hidden on mobile, visible on hover for desktop */}
              <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[120px]">
                <p className="text-xs font-medium text-foreground text-center">{achievement.name}</p>
                <p className="text-[10px] text-muted-foreground text-center">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile achievement names - horizontal scroll */}
        <div className="mt-3 sm:hidden overflow-x-auto -mx-3 px-3">
          <div className="flex gap-2 pb-1">
            {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
              <div 
                key={achievement.id}
                className="flex-shrink-0 px-2 py-1 bg-secondary rounded-full"
              >
                <span className="text-[10px] text-foreground font-medium">{achievement.name}</span>
              </div>
            ))}
            {achievements.filter(a => a.unlocked).length === 0 && (
              <span className="text-[10px] text-muted-foreground">Complete desafios para desbloquear conquistas!</span>
            )}
          </div>
        </div>
      </Card>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && newlyUnlocked && (
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
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                  newlyUnlocked.color
                )}
              >
                <span className="text-white scale-150">
                  {newlyUnlocked.icon}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Nova Conquista!</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {newlyUnlocked.name}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {newlyUnlocked.description}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeCelebration}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl"
                >
                  Continuar 🎉
                </motion.button>
              </motion.div>
              
              {/* Close button */}
              <button
                onClick={closeCelebration}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementsCard;
