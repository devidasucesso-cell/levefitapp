import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, ChefHat, GlassWater, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { exercises } from '@/data/exercises';
import { recipes } from '@/data/recipes';
import { detoxDrinks } from '@/data/detoxDrinks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { differenceInWeeks, parseISO } from 'date-fns';

interface ActivityTrackerProps {
  completedExercises: string[];
  completedRecipes: string[];
  completedDetox: string[];
}

interface WeekPhase {
  week: number;
  title: string;
  exerciseGoal: number;
  recipeGoal: number;
  detoxGoal: number;
  difficulty: 'easy' | 'moderate' | 'hard';
}

const phases: WeekPhase[] = [
  { week: 1, title: 'Exercícios Leves', exerciseGoal: 3, recipeGoal: 2, detoxGoal: 1, difficulty: 'easy' },
  { week: 2, title: 'Adaptação', exerciseGoal: 4, recipeGoal: 3, detoxGoal: 2, difficulty: 'easy' },
  { week: 3, title: 'Progresso Inicial', exerciseGoal: 5, recipeGoal: 3, detoxGoal: 2, difficulty: 'easy' },
  { week: 4, title: 'Consolidação', exerciseGoal: 5, recipeGoal: 4, detoxGoal: 3, difficulty: 'moderate' },
  { week: 5, title: 'Intensificação', exerciseGoal: 6, recipeGoal: 4, detoxGoal: 3, difficulty: 'moderate' },
  { week: 6, title: 'Desafio Moderado', exerciseGoal: 6, recipeGoal: 5, detoxGoal: 4, difficulty: 'moderate' },
  { week: 7, title: 'Superação', exerciseGoal: 7, recipeGoal: 5, detoxGoal: 4, difficulty: 'moderate' },
  { week: 8, title: 'Transformação', exerciseGoal: 7, recipeGoal: 6, detoxGoal: 5, difficulty: 'hard' },
];

const ActivityTracker = ({ completedExercises, completedRecipes, completedDetox }: ActivityTrackerProps) => {
  const { user, profile } = useAuth();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  
  // Calculate current week based on treatment start date
  const currentWeek = useMemo(() => {
    if (!profile?.treatment_start_date) return 1;
    const startDate = parseISO(profile.treatment_start_date);
    const weeksElapsed = differenceInWeeks(new Date(), startDate);
    return Math.min(Math.max(weeksElapsed + 1, 1), 8);
  }, [profile?.treatment_start_date]);

  // Filter exercises by difficulty
  const getExercisesByDifficulty = (difficulty: string) => {
    return exercises.filter(e => e.difficulty === difficulty);
  };

  // Calculate progress for each week
  const getWeekProgress = (phase: WeekPhase) => {
    const exercisesByDifficulty = getExercisesByDifficulty(phase.difficulty);
    const exerciseIds = exercisesByDifficulty.map(e => e.id);
    
    const completedInPhase = completedExercises.filter(id => exerciseIds.includes(id));
    const exerciseProgress = Math.min(completedInPhase.length, phase.exerciseGoal);
    
    const recipeProgress = Math.min(completedRecipes.length, phase.recipeGoal);
    const detoxProgress = Math.min(completedDetox.length, phase.detoxGoal);
    
    const totalGoal = phase.exerciseGoal + phase.recipeGoal + phase.detoxGoal;
    const totalProgress = exerciseProgress + recipeProgress + detoxProgress;
    
    return {
      exercises: { current: exerciseProgress, goal: phase.exerciseGoal },
      recipes: { current: recipeProgress, goal: phase.recipeGoal },
      detox: { current: detoxProgress, goal: phase.detoxGoal },
      percentage: Math.round((totalProgress / totalGoal) * 100),
      isComplete: totalProgress >= totalGoal,
    };
  };

  // Check if a week is unlocked
  const isWeekUnlocked = (weekNumber: number) => {
    if (weekNumber === 1) return true;
    // Week is unlocked if previous week is complete or if user is on that week
    const previousPhase = phases[weekNumber - 2];
    if (!previousPhase) return true;
    const previousProgress = getWeekProgress(previousPhase);
    return previousProgress.isComplete || weekNumber <= currentWeek;
  };

  const toggleExpand = (week: number) => {
    if (!isWeekUnlocked(week)) return;
    setExpandedWeek(expandedWeek === week ? null : week);
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Leve';
      case 'moderate': return 'Moderado';
      case 'hard': return 'Intenso';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10';
      case 'moderate': return 'text-warning bg-warning/10';
      case 'hard': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold text-foreground text-sm mb-4">Progresso das Fases</h3>

      <div className="space-y-3">
        {phases.map((phase) => {
          const progress = getWeekProgress(phase);
          const unlocked = isWeekUnlocked(phase.week);
          const isCurrentWeek = phase.week === currentWeek;
          const isExpanded = expandedWeek === phase.week;

          return (
            <motion.div
              key={phase.week}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: phase.week * 0.05 }}
            >
              <div
                onClick={() => toggleExpand(phase.week)}
                className={cn(
                  "rounded-xl border transition-all cursor-pointer overflow-hidden",
                  unlocked 
                    ? isCurrentWeek 
                      ? "border-primary bg-primary/5" 
                      : progress.isComplete 
                        ? "border-success/50 bg-success/5"
                        : "border-border bg-card hover:bg-secondary/50"
                    : "border-border/50 bg-muted/30 cursor-not-allowed opacity-60"
                )}
              >
                {/* Header */}
                <div className="p-3 flex items-center gap-3">
                  {/* Week indicator */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    unlocked
                      ? progress.isComplete
                        ? "bg-success text-white"
                        : isCurrentWeek
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {!unlocked ? (
                      <Lock className="w-4 h-4" />
                    ) : progress.isComplete ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{phase.week}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">Semana {phase.week}</span>
                      {isCurrentWeek && unlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{phase.title}</p>
                  </div>

                  {/* Progress or Lock */}
                  {unlocked ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-semibold",
                          progress.isComplete ? "text-success" : "text-foreground"
                        )}>
                          {progress.percentage}%
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Progress bar */}
                {unlocked && (
                  <div className="px-3 pb-3">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={cn(
                          "h-full rounded-full",
                          progress.isComplete ? "bg-success" : "bg-primary"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                        {/* Difficulty badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            getDifficultyColor(phase.difficulty)
                          )}>
                            Nível {getDifficultyLabel(phase.difficulty)}
                          </span>
                        </div>

                        {/* Exercise progress */}
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground flex-1">Exercícios</span>
                          <span className={cn(
                            "text-xs font-medium",
                            progress.exercises.current >= progress.exercises.goal 
                              ? "text-success" 
                              : "text-foreground"
                          )}>
                            {progress.exercises.current}/{progress.exercises.goal}
                          </span>
                          {progress.exercises.current >= progress.exercises.goal && (
                            <Check className="w-3 h-3 text-success" />
                          )}
                        </div>

                        {/* Recipe progress */}
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-pink-500" />
                          <span className="text-xs text-muted-foreground flex-1">Receitas</span>
                          <span className={cn(
                            "text-xs font-medium",
                            progress.recipes.current >= progress.recipes.goal 
                              ? "text-success" 
                              : "text-foreground"
                          )}>
                            {progress.recipes.current}/{progress.recipes.goal}
                          </span>
                          {progress.recipes.current >= progress.recipes.goal && (
                            <Check className="w-3 h-3 text-success" />
                          )}
                        </div>

                        {/* Detox progress */}
                        <div className="flex items-center gap-2">
                          <GlassWater className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-muted-foreground flex-1">Detox</span>
                          <span className={cn(
                            "text-xs font-medium",
                            progress.detox.current >= progress.detox.goal 
                              ? "text-success" 
                              : "text-foreground"
                          )}>
                            {progress.detox.current}/{progress.detox.goal}
                          </span>
                          {progress.detox.current >= progress.detox.goal && (
                            <Check className="w-3 h-3 text-success" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityTracker;
