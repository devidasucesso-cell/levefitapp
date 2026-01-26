import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dumbbell, ChefHat, GlassWater, Lock, ChevronDown, ChevronUp, Droplets, Pill, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { exercises, getRecommendedExercises, getIMCExerciseRecommendation } from '@/data/exercises';
import { recipes } from '@/data/recipes';
import { detoxDrinks } from '@/data/detoxDrinks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { differenceInWeeks, parseISO, startOfWeek, endOfWeek, addWeeks, isWithinInterval, format } from 'date-fns';
import { useWaterStreak } from '@/hooks/useWaterStreak';
import { IMCCategory } from '@/types';

interface ActivityTrackerProps {
  completedExercises: string[];
  completedRecipes: string[];
  completedDetox: string[];
}

interface WeekPhase {
  week: number;
  title: string;
  exerciseIds: string[];
  recipeIds: string[];
  detoxIds: string[];
  waterDaysGoal: number;
  capsuleDaysGoal: number;
}

// Helper to get recipe/detox IDs based on IMC category
const getRecipePrefix = (imcCategory: IMCCategory): string => {
  switch (imcCategory) {
    case 'underweight': return 'uw';
    case 'normal': return 'n';
    case 'overweight': return 'ow';
    case 'obese': return 'ob';
    default: return 'n';
  }
};

const getDetoxPrefix = (imcCategory: IMCCategory): string => {
  switch (imcCategory) {
    case 'underweight': return 'uw-d';
    case 'normal': return 'nm-d';
    case 'overweight': return 'ow-d';
    case 'obese': return 'ob-d';
    default: return 'nm-d';
  }
};

// Define specific activities for each week/phase, filtered by IMC category
// Week 1-2: Easy exercises only
// Week 3-4: Easy + some moderate
// Week 5-6: Moderate focus
// Week 7-8: Moderate + intense (if IMC allows)
const getPhases = (imcCategory: IMCCategory): WeekPhase[] => {
  // Get exercises recommended for this IMC category
  const recommendedExercises = getRecommendedExercises(imcCategory);
  
  // Separate by difficulty
  const easyExercises = recommendedExercises.filter(e => e.difficulty === 'easy');
  const moderateExercises = recommendedExercises.filter(e => e.difficulty === 'moderate');
  const intenseExercises = recommendedExercises.filter(e => e.difficulty === 'intense');
  
  // Helper to get exercise IDs by count
  const getExerciseIds = (pool: typeof easyExercises, startIndex: number, count: number) => {
    const ids: string[] = [];
    for (let i = 0; i < count && (startIndex + i) < pool.length; i++) {
      ids.push(pool[startIndex + i].id);
    }
    return ids;
  };

  // Get prefixes based on IMC category
  const recipePrefix = getRecipePrefix(imcCategory);
  const detoxPrefix = getDetoxPrefix(imcCategory);
  
  // For obese users, stay with easy exercises longer and limit intensity
  const isHighIMC = imcCategory === 'obese' || imcCategory === 'overweight';
  
  return [
    { 
      week: 1, 
      title: 'Adaptação', 
      exerciseIds: getExerciseIds(easyExercises, 0, 3),
      recipeIds: [`${recipePrefix}-1`, `${recipePrefix}-2`, `${recipePrefix}-18`],
      detoxIds: [`${detoxPrefix}1`, `${detoxPrefix}2`],
      waterDaysGoal: 3,
      capsuleDaysGoal: 5,
    },
    { 
      week: 2, 
      title: 'Começando Bem', 
      exerciseIds: getExerciseIds(easyExercises, 3, 4),
      recipeIds: [`${recipePrefix}-3`, `${recipePrefix}-4`, `${recipePrefix}-19`, `${recipePrefix}-35`],
      detoxIds: [`${detoxPrefix}3`, `${detoxPrefix}18`, `${detoxPrefix}35`],
      waterDaysGoal: 4,
      capsuleDaysGoal: 6,
    },
    { 
      week: 3, 
      title: 'Progresso Inicial', 
      exerciseIds: isHighIMC 
        ? getExerciseIds(easyExercises, 7, 5)
        : [...getExerciseIds(easyExercises, 7, 3), ...getExerciseIds(moderateExercises, 0, 2)],
      recipeIds: [`${recipePrefix}-5`, `${recipePrefix}-6`, `${recipePrefix}-20`, `${recipePrefix}-21`, `${recipePrefix}-36`],
      detoxIds: [`${detoxPrefix}4`, `${detoxPrefix}5`, `${detoxPrefix}19`],
      waterDaysGoal: 5,
      capsuleDaysGoal: 6,
    },
    { 
      week: 4, 
      title: 'Consolidação', 
      exerciseIds: isHighIMC
        ? [...getExerciseIds(easyExercises, 12, 3), ...getExerciseIds(moderateExercises, 0, 2)]
        : [...getExerciseIds(easyExercises, 10, 2), ...getExerciseIds(moderateExercises, 2, 3)],
      recipeIds: [`${recipePrefix}-7`, `${recipePrefix}-8`, `${recipePrefix}-22`, `${recipePrefix}-23`, `${recipePrefix}-37`, `${recipePrefix}-38`],
      detoxIds: [`${detoxPrefix}6`, `${detoxPrefix}7`, `${detoxPrefix}20`, `${detoxPrefix}36`],
      waterDaysGoal: 5,
      capsuleDaysGoal: 7,
    },
    { 
      week: 5, 
      title: 'Intensificação', 
      exerciseIds: isHighIMC
        ? [...getExerciseIds(easyExercises, 15, 2), ...getExerciseIds(moderateExercises, 2, 4)]
        : getExerciseIds(moderateExercises, 5, 6),
      recipeIds: [`${recipePrefix}-9`, `${recipePrefix}-10`, `${recipePrefix}-24`, `${recipePrefix}-25`, `${recipePrefix}-39`, `${recipePrefix}-40`],
      detoxIds: [`${detoxPrefix}8`, `${detoxPrefix}9`, `${detoxPrefix}21`, `${detoxPrefix}22`, `${detoxPrefix}37`],
      waterDaysGoal: 6,
      capsuleDaysGoal: 7,
    },
    { 
      week: 6, 
      title: 'Desafio Moderado', 
      exerciseIds: isHighIMC
        ? getExerciseIds(moderateExercises, 6, 6)
        : [...getExerciseIds(moderateExercises, 11, 4), ...getExerciseIds(intenseExercises, 0, 2)],
      recipeIds: [`${recipePrefix}-11`, `${recipePrefix}-12`, `${recipePrefix}-26`, `${recipePrefix}-27`, `${recipePrefix}-41`, `${recipePrefix}-42`],
      detoxIds: [`${detoxPrefix}10`, `${detoxPrefix}11`, `${detoxPrefix}23`, `${detoxPrefix}24`, `${detoxPrefix}38`, `${detoxPrefix}39`],
      waterDaysGoal: 6,
      capsuleDaysGoal: 7,
    },
    { 
      week: 7, 
      title: 'Superação', 
      exerciseIds: isHighIMC
        ? getExerciseIds(moderateExercises, 12, 7)
        : [...getExerciseIds(moderateExercises, 15, 3), ...getExerciseIds(intenseExercises, 2, 4)],
      recipeIds: [`${recipePrefix}-13`, `${recipePrefix}-14`, `${recipePrefix}-28`, `${recipePrefix}-29`, `${recipePrefix}-43`, `${recipePrefix}-44`, `${recipePrefix}-45`],
      detoxIds: [`${detoxPrefix}12`, `${detoxPrefix}13`, `${detoxPrefix}25`, `${detoxPrefix}26`, `${detoxPrefix}40`, `${detoxPrefix}41`],
      waterDaysGoal: 7,
      capsuleDaysGoal: 7,
    },
    { 
      week: 8, 
      title: 'Transformação', 
      exerciseIds: isHighIMC
        ? [...getExerciseIds(moderateExercises, 19, 4), ...getExerciseIds(intenseExercises, 0, 3)]
        : getExerciseIds(intenseExercises, 6, 7),
      recipeIds: [`${recipePrefix}-15`, `${recipePrefix}-16`, `${recipePrefix}-17`, `${recipePrefix}-30`, `${recipePrefix}-31`, `${recipePrefix}-46`, `${recipePrefix}-47`, `${recipePrefix}-48`],
      detoxIds: [`${detoxPrefix}14`, `${detoxPrefix}15`, `${detoxPrefix}27`, `${detoxPrefix}28`, `${detoxPrefix}42`, `${detoxPrefix}43`, `${detoxPrefix}44`],
      waterDaysGoal: 7,
      capsuleDaysGoal: 7,
    },
  ];
};

const ActivityTracker = ({ completedExercises, completedRecipes, completedDetox }: ActivityTrackerProps) => {
  const { user, profile, capsuleDays } = useAuth();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { waterHistory } = useWaterStreak();
  
  const imcCategory = (profile?.imc_category as IMCCategory) || 'normal';
  const imcRecommendation = getIMCExerciseRecommendation(imcCategory);
  const phases = useMemo(() => getPhases(imcCategory), [imcCategory]);
  
  // Calculate current week based on treatment start date
  const currentWeek = useMemo(() => {
    if (!profile?.treatment_start_date) return 1;
    const startDate = parseISO(profile.treatment_start_date);
    const weeksElapsed = differenceInWeeks(new Date(), startDate);
    return Math.min(Math.max(weeksElapsed + 1, 1), 8);
  }, [profile?.treatment_start_date]);

  // Get the start date of each week based on treatment start
  const getWeekDateRange = (weekNumber: number) => {
    if (!profile?.treatment_start_date) return null;
    const treatmentStart = parseISO(profile.treatment_start_date);
    const weekStart = addWeeks(treatmentStart, weekNumber - 1);
    const weekEnd = addWeeks(treatmentStart, weekNumber);
    return { start: weekStart, end: weekEnd };
  };

  // Count capsule days within a specific week
  const getCapsuleDaysInWeek = (weekNumber: number) => {
    const range = getWeekDateRange(weekNumber);
    if (!range) return 0;
    
    return capsuleDays.filter(dateStr => {
      const date = parseISO(dateStr);
      return isWithinInterval(date, { start: range.start, end: range.end });
    }).length;
  };

  // Count water days (days that met the goal) within a specific week
  const getWaterDaysInWeek = (weekNumber: number) => {
    const range = getWeekDateRange(weekNumber);
    if (!range || !waterHistory) return 0;
    
    const waterGoal = profile?.water_goal || 2000;
    
    return waterHistory.filter(entry => {
      const date = parseISO(entry.date);
      return isWithinInterval(date, { start: range.start, end: range.end }) && 
             entry.total_intake >= waterGoal;
    }).length;
  };

  // Get activity details by ID
  const getExerciseById = (id: string) => exercises.find(e => e.id === id);
  const getRecipeById = (id: string) => recipes.find(r => r.id === id);
  const getDetoxById = (id: string) => detoxDrinks.find(d => d.id === id);

  // Calculate progress for each week
  const getWeekProgress = (phase: WeekPhase) => {
    const exerciseProgress = phase.exerciseIds.filter(id => completedExercises.includes(id)).length;
    const recipeProgress = phase.recipeIds.filter(id => completedRecipes.includes(id)).length;
    const detoxProgress = phase.detoxIds.filter(id => completedDetox.includes(id)).length;
    
    // Get water and capsule progress for this specific week
    const capsuleProgress = Math.min(getCapsuleDaysInWeek(phase.week), phase.capsuleDaysGoal);
    const waterProgress = Math.min(getWaterDaysInWeek(phase.week), phase.waterDaysGoal);
    
    const totalGoal = phase.exerciseIds.length + phase.recipeIds.length + phase.detoxIds.length + 
                      phase.waterDaysGoal + phase.capsuleDaysGoal;
    const totalProgress = exerciseProgress + recipeProgress + detoxProgress + capsuleProgress + waterProgress;
    
    return {
      exercises: { current: exerciseProgress, goal: phase.exerciseIds.length },
      recipes: { current: recipeProgress, goal: phase.recipeIds.length },
      detox: { current: detoxProgress, goal: phase.detoxIds.length },
      water: { current: waterProgress, goal: phase.waterDaysGoal },
      capsules: { current: capsuleProgress, goal: phase.capsuleDaysGoal },
      percentage: totalGoal > 0 ? Math.round((totalProgress / totalGoal) * 100) : 0,
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

  // Toggle functions for activities
  const toggleExercise = async (exerciseId: string, exerciseName: string, isCompleted: boolean) => {
    if (!user) return;
    setLoading(exerciseId);
    
    try {
      if (isCompleted) {
        await supabase
          .from('completed_exercises')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);
        toast.success('Exercício desmarcado');
      } else {
        await supabase
          .from('completed_exercises')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            exercise_name: exerciseName,
          });
        toast.success('Exercício marcado como feito!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar exercício');
    } finally {
      setLoading(null);
    }
  };

  const toggleRecipe = async (recipeId: string, recipeName: string, isCompleted: boolean) => {
    if (!user) return;
    setLoading(recipeId);
    
    try {
      if (isCompleted) {
        await supabase
          .from('completed_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
        toast.success('Receita desmarcada');
      } else {
        await supabase
          .from('completed_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            recipe_name: recipeName,
          });
        toast.success('Receita marcada como feita!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar receita');
    } finally {
      setLoading(null);
    }
  };

  const toggleDetox = async (detoxId: string, detoxName: string, isCompleted: boolean) => {
    if (!user) return;
    setLoading(detoxId);
    
    try {
      if (isCompleted) {
        await supabase
          .from('completed_detox')
          .delete()
          .eq('user_id', user.id)
          .eq('detox_id', detoxId);
        toast.success('Detox desmarcado');
      } else {
        await supabase
          .from('completed_detox')
          .insert({
            user_id: user.id,
            detox_id: detoxId,
            detox_name: detoxName,
          });
        toast.success('Detox marcado como feito!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar detox');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Progresso das Fases</h3>
      </div>
      
      {/* IMC-based recommendation tip */}
      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">{imcRecommendation.title}</p>
            <p className="text-xs text-muted-foreground">{imcRecommendation.tip}</p>
          </div>
        </div>
      </div>

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
                className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  unlocked 
                    ? isCurrentWeek 
                      ? "border-primary bg-primary/5" 
                      : progress.isComplete 
                        ? "border-success/50 bg-success/5"
                        : "border-border bg-card"
                    : "border-border/50 bg-muted/30 opacity-60"
                )}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(phase.week)}
                  className={cn(
                    "p-3 flex items-center gap-3 cursor-pointer",
                    !unlocked && "cursor-not-allowed"
                  )}
                >
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
                      {progress.isComplete && unlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-success text-white rounded-full">
                          Completa
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

                {/* Expanded details with checkable items */}
                <AnimatePresence>
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-4">
                        {/* Capsules section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-foreground">
                              Cápsulas ({progress.capsules.current}/{progress.capsules.goal} dias)
                            </span>
                          </div>
                          <div className="ml-6">
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((progress.capsules.current / progress.capsules.goal) * 100, 100)}%` }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                  "h-full rounded-full",
                                  progress.capsules.current >= progress.capsules.goal ? "bg-success" : "bg-primary"
                                )}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Tome suas cápsulas diariamente na tela inicial
                            </p>
                          </div>
                        </div>

                        {/* Water section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-info" />
                            <span className="text-xs font-medium text-foreground">
                              Hidratação ({progress.water.current}/{progress.water.goal} dias)
                            </span>
                          </div>
                          <div className="ml-6">
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((progress.water.current / progress.water.goal) * 100, 100)}%` }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                  "h-full rounded-full",
                                  progress.water.current >= progress.water.goal ? "bg-success" : "bg-info"
                                )}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Atinja sua meta de água ({profile?.water_goal || 2000}ml) diariamente
                            </p>
                          </div>
                        </div>

                        {/* Exercises section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-foreground">
                              Exercícios ({progress.exercises.current}/{progress.exercises.goal})
                            </span>
                          </div>
                          <div className="space-y-1.5 ml-6">
                            {phase.exerciseIds.map(id => {
                              const exercise = getExerciseById(id);
                              if (!exercise) return null;
                              const isCompleted = completedExercises.includes(id);
                              const isLoading = loading === id;
                              const isRecommended = exercise.recommendedFor?.includes(imcCategory);
                              
                              return (
                                <div 
                                  key={id} 
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    id={`exercise-${id}`}
                                    checked={isCompleted}
                                    disabled={isLoading}
                                    onCheckedChange={() => toggleExercise(id, exercise.name, isCompleted)}
                                    className="h-4 w-4"
                                  />
                                  <label 
                                    htmlFor={`exercise-${id}`}
                                    className={cn(
                                      "text-xs cursor-pointer flex-1 flex items-center gap-1 transition-all duration-300",
                                      isCompleted ? "text-success line-through decoration-success decoration-2" : "text-foreground"
                                    )}
                                  >
                                    {exercise.name}
                                    {isRecommended && !isCompleted && (
                                      <Star className="w-3 h-3 text-primary fill-primary" />
                                    )}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recipes section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-accent-foreground" />
                            <span className="text-xs font-medium text-foreground">
                              Receitas ({progress.recipes.current}/{progress.recipes.goal})
                            </span>
                          </div>
                          <div className="space-y-1.5 ml-6">
                            {phase.recipeIds.map(id => {
                              const recipe = getRecipeById(id);
                              if (!recipe) return null;
                              const isCompleted = completedRecipes.includes(id);
                              const isLoading = loading === id;
                              const isRecommended = recipe.category === imcCategory;
                              
                              return (
                                <div 
                                  key={id} 
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    id={`recipe-${id}`}
                                    checked={isCompleted}
                                    disabled={isLoading}
                                    onCheckedChange={() => toggleRecipe(id, recipe.name, isCompleted)}
                                    className="h-4 w-4"
                                  />
                                  <label 
                                    htmlFor={`recipe-${id}`}
                                    className={cn(
                                      "text-xs cursor-pointer flex-1 flex items-center gap-1 transition-all duration-300",
                                      isCompleted ? "text-success line-through decoration-success decoration-2" : "text-foreground"
                                    )}
                                  >
                                    {recipe.name}
                                    {isRecommended && !isCompleted && (
                                      <Star className="w-3 h-3 text-primary fill-primary" />
                                    )}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detox section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <GlassWater className="w-4 h-4 text-success" />
                            <span className="text-xs font-medium text-foreground">
                              Detox ({progress.detox.current}/{progress.detox.goal})
                            </span>
                          </div>
                          <div className="space-y-1.5 ml-6">
                            {phase.detoxIds.map(id => {
                              const detox = getDetoxById(id);
                              if (!detox) return null;
                              const isCompleted = completedDetox.includes(id);
                              const isLoading = loading === id;
                              const isRecommended = detox.category === imcCategory;
                              
                              return (
                                <div 
                                  key={id} 
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    id={`detox-${id}`}
                                    checked={isCompleted}
                                    disabled={isLoading}
                                    onCheckedChange={() => toggleDetox(id, detox.name, isCompleted)}
                                    className="h-4 w-4"
                                  />
                                  <label 
                                    htmlFor={`detox-${id}`}
                                    className={cn(
                                      "text-xs cursor-pointer flex-1 flex items-center gap-1 transition-all duration-300",
                                      isCompleted ? "text-success line-through decoration-success decoration-2" : "text-foreground"
                                    )}
                                  >
                                    {detox.name}
                                    {isRecommended && !isCompleted && (
                                      <Star className="w-3 h-3 text-primary fill-primary" />
                                    )}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
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
