import React, { useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Droplets, Pill, Star, Award, Target, Sparkles, X, Check, ChefHat, GlassWater, CakeSlice } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

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
  completedRecipes?: number;
  completedDetox?: number;
  completedDesserts?: number;
}

const AchievementsCard = ({ capsuleDays, waterStreak, totalWaterDays, completedRecipes = 0, completedDetox = 0, completedDesserts = 0 }: AchievementsCardProps) => {
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
      icon: <Pill className="w-4 h-4" />,
      unlocked: capsuleDays >= 1,
      color: 'from-green-400 to-green-600',
    },
    {
      id: 'week-capsule',
      name: 'Semana Completa',
      description: '7 dias tomando a cápsula',
      icon: <Star className="w-4 h-4" />,
      unlocked: capsuleDays >= 7,
      progress: Math.min(capsuleDays, 7),
      total: 7,
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'consistency',
      name: 'Consistência',
      description: '15 dias de cápsula',
      icon: <Target className="w-4 h-4" />,
      unlocked: capsuleDays >= 15,
      progress: Math.min(capsuleDays, 15),
      total: 15,
      color: 'from-pink-400 to-pink-600',
    },
    {
      id: 'month-capsule',
      name: 'Mês de Dedicação',
      description: '30 dias tomando a cápsula',
      icon: <Trophy className="w-4 h-4" />,
      unlocked: capsuleDays >= 30,
      progress: Math.min(capsuleDays, 30),
      total: 30,
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 'master',
      name: 'Mestre LeveFit',
      description: '60 dias de tratamento',
      icon: <Award className="w-4 h-4" />,
      unlocked: capsuleDays >= 60,
      progress: Math.min(capsuleDays, 60),
      total: 60,
      color: 'from-amber-400 to-amber-600',
    },
    {
      id: 'hydration-week',
      name: 'Semana Hidratada',
      description: '7 dias batendo a meta de água',
      icon: <Droplets className="w-4 h-4" />,
      unlocked: totalWaterDays >= 7,
      progress: Math.min(totalWaterDays, 7),
      total: 7,
      color: 'from-cyan-400 to-cyan-600',
    },
    // Detox achievements
    {
      id: 'detox-lover',
      name: 'Amante Detox',
      description: 'Completou 10 drinks detox',
      icon: <GlassWater className="w-4 h-4" />,
      unlocked: completedDetox >= 10,
      progress: Math.min(completedDetox, 10),
      total: 10,
      color: 'from-teal-400 to-teal-600',
    },
    {
      id: 'detox-master',
      name: 'Detox Master',
      description: 'Completou 25 drinks detox — corpo purificado!',
      icon: <GlassWater className="w-4 h-4" />,
      unlocked: completedDetox >= 25,
      progress: Math.min(completedDetox, 25),
      total: 25,
      color: 'from-green-500 to-emerald-600',
    },
    // Recipe achievement
    {
      id: 'first-recipe',
      name: 'Primeira Receita',
      description: 'Preparou sua primeira receita fit',
      icon: <ChefHat className="w-4 h-4" />,
      unlocked: completedRecipes >= 1,
      color: 'from-orange-400 to-orange-600',
    },
    // Dessert achievement
    {
      id: 'dessert-master',
      name: 'Confeiteiro Fit',
      description: 'Completou 15 sobremesas — doçura sem culpa!',
      icon: <CakeSlice className="w-4 h-4" />,
      unlocked: completedDesserts >= 15,
      progress: Math.min(completedDesserts, 15),
      total: 15,
      color: 'from-fuchsia-400 to-purple-600',
    },
  ], [capsuleDays, totalWaterDays, waterStreak, completedRecipes, completedDetox, completedDesserts]);

  // Check for newly unlocked achievements
  useEffect(() => {
    if (isLoadingShown || !user) return;

    const checkNewUnlocks = async () => {
      const unlockedAchievements = achievements.filter(a => a.unlocked);
      const newUnlocks = unlockedAchievements.filter(a => !shownAchievements.includes(a.id));
      
      if (newUnlocks.length > 0) {
        const achievementToShow = newUnlocks[0];
        
        try {
          await supabase
            .from('shown_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievementToShow.id,
            });

          setShownAchievements(prev => [...prev, achievementToShow.id]);
          setNewlyUnlocked(achievementToShow);
          setShowCelebration(true);
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
          });
        } catch (error) {
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
        <div className="flex items-center justify-between mb-3">
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

        {/* Only show incomplete achievements */}
        <div className="space-y-2">
          {achievements.filter(a => !a.unlocked).map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-2 rounded-lg transition-all bg-muted/30"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                <span className="text-muted-foreground">
                  {achievement.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate text-muted-foreground">
                  {achievement.name}
                </span>
                
                {/* Progress bar */}
                {achievement.progress !== undefined && achievement.total && (
                  <div className="flex items-center gap-2 mt-1">
                    <Progress 
                      value={(achievement.progress / achievement.total) * 100} 
                      className="h-1.5 flex-1"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
                  Continuar
                </motion.button>
              </motion.div>
              
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
