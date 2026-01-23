import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dumbbell, ChefHat, GlassWater, Lock, ChevronDown, ChevronUp } from 'lucide-react';
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
  exerciseIds: string[];
  recipeIds: string[];
  detoxIds: string[];
}

// Define specific activities for each week/phase
const getPhases = (): WeekPhase[] => {
  // Get exercises by difficulty
  const easyExercises = exercises.filter(e => e.difficulty === 'easy').map(e => e.id);
  const moderateExercises = exercises.filter(e => e.difficulty === 'moderate').map(e => e.id);
  const intenseExercises = exercises.filter(e => e.difficulty === 'intense').map(e => e.id);
  
  // Get all recipes and detox drinks
  const allRecipes = recipes.map(r => r.id);
  const allDetox = detoxDrinks.map(d => d.id);

  return [
    { 
      week: 1, 
      title: 'Exercícios Leves', 
      exerciseIds: easyExercises.slice(0, 3),
      recipeIds: allRecipes.slice(0, 2),
      detoxIds: allDetox.slice(0, 1),
    },
    { 
      week: 2, 
      title: 'Adaptação', 
      exerciseIds: easyExercises.slice(3, 7),
      recipeIds: allRecipes.slice(2, 5),
      detoxIds: allDetox.slice(1, 3),
    },
    { 
      week: 3, 
      title: 'Progresso Inicial', 
      exerciseIds: easyExercises.slice(7, 12),
      recipeIds: allRecipes.slice(5, 8),
      detoxIds: allDetox.slice(3, 5),
    },
    { 
      week: 4, 
      title: 'Consolidação', 
      exerciseIds: [...easyExercises.slice(12, 15), ...moderateExercises.slice(0, 2)],
      recipeIds: allRecipes.slice(8, 12),
      detoxIds: allDetox.slice(5, 8),
    },
    { 
      week: 5, 
      title: 'Intensificação', 
      exerciseIds: moderateExercises.slice(2, 8),
      recipeIds: allRecipes.slice(12, 16),
      detoxIds: allDetox.slice(8, 11),
    },
    { 
      week: 6, 
      title: 'Desafio Moderado', 
      exerciseIds: moderateExercises.slice(8, 14),
      recipeIds: allRecipes.slice(16, 21),
      detoxIds: allDetox.slice(11, 15),
    },
    { 
      week: 7, 
      title: 'Superação', 
      exerciseIds: [...moderateExercises.slice(14, 18), ...intenseExercises.slice(0, 3)],
      recipeIds: allRecipes.slice(21, 26),
      detoxIds: allDetox.slice(15, 19),
    },
    { 
      week: 8, 
      title: 'Transformação', 
      exerciseIds: intenseExercises.slice(3, 10),
      recipeIds: allRecipes.slice(26, 32),
      detoxIds: allDetox.slice(19, 24),
    },
  ];
};

const ActivityTracker = ({ completedExercises, completedRecipes, completedDetox }: ActivityTrackerProps) => {
  const { user, profile } = useAuth();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  const phases = useMemo(() => getPhases(), []);
  
  // Calculate current week based on treatment start date
  const currentWeek = useMemo(() => {
    if (!profile?.treatment_start_date) return 1;
    const startDate = parseISO(profile.treatment_start_date);
    const weeksElapsed = differenceInWeeks(new Date(), startDate);
    return Math.min(Math.max(weeksElapsed + 1, 1), 8);
  }, [profile?.treatment_start_date]);

  // Get activity details by ID
  const getExerciseById = (id: string) => exercises.find(e => e.id === id);
  const getRecipeById = (id: string) => recipes.find(r => r.id === id);
  const getDetoxById = (id: string) => detoxDrinks.find(d => d.id === id);

  // Calculate progress for each week
  const getWeekProgress = (phase: WeekPhase) => {
    const exerciseProgress = phase.exerciseIds.filter(id => completedExercises.includes(id)).length;
    const recipeProgress = phase.recipeIds.filter(id => completedRecipes.includes(id)).length;
    const detoxProgress = phase.detoxIds.filter(id => completedDetox.includes(id)).length;
    
    const totalGoal = phase.exerciseIds.length + phase.recipeIds.length + phase.detoxIds.length;
    const totalProgress = exerciseProgress + recipeProgress + detoxProgress;
    
    return {
      exercises: { current: exerciseProgress, goal: phase.exerciseIds.length },
      recipes: { current: recipeProgress, goal: phase.recipeIds.length },
      detox: { current: detoxProgress, goal: phase.detoxIds.length },
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
                        {/* Exercises section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-orange-500" />
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
                                      "text-xs cursor-pointer flex-1",
                                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                                    )}
                                  >
                                    {exercise.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recipes section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-pink-500" />
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
                                      "text-xs cursor-pointer flex-1",
                                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                                    )}
                                  >
                                    {recipe.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detox section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <GlassWater className="w-4 h-4 text-purple-500" />
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
                                      "text-xs cursor-pointer flex-1",
                                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                                    )}
                                  >
                                    {detox.name}
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
