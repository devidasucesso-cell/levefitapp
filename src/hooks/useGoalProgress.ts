import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useWaterStreak } from './useWaterStreak';

interface GoalProgress {
  capsuleDays: number;
  capsuleTarget: number;
  hydrationDays: number;
  hydrationTarget: number;
  exercisesCompleted: number;
  exerciseTarget: number;
  recipesCompleted: number;
  recipeTarget: number;
  detoxCompleted: number;
  detoxTarget: number;
  totalProgress: number;
  isLoading: boolean;
  completedExercises: string[];
  completedRecipes: string[];
  completedDetox: string[];
}

export const useGoalProgress = () => {
  const { user, capsuleDays } = useAuth();
  const { totalDaysMetGoal } = useWaterStreak();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [completedRecipes, setCompletedRecipes] = useState<string[]>([]);
  const [completedDetox, setCompletedDetox] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Targets for the prize
  const CAPSULE_TARGET = 25;
  const HYDRATION_TARGET = 25;
  const EXERCISE_TARGET = 10;
  const RECIPE_TARGET = 15;
  const DETOX_TARGET = 10;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchCompletedItems = async () => {
      setIsLoading(true);
      try {
        const [exercisesRes, recipesRes, detoxRes] = await Promise.all([
          supabase
            .from('completed_exercises')
            .select('exercise_id')
            .eq('user_id', user.id),
          supabase
            .from('completed_recipes')
            .select('recipe_id')
            .eq('user_id', user.id),
          supabase
            .from('completed_detox')
            .select('detox_id')
            .eq('user_id', user.id),
        ]);

        if (exercisesRes.data) {
          setCompletedExercises(exercisesRes.data.map(e => e.exercise_id));
        }
        if (recipesRes.data) {
          setCompletedRecipes(recipesRes.data.map(r => r.recipe_id));
        }
        if (detoxRes.data) {
          setCompletedDetox(detoxRes.data.map(d => d.detox_id));
        }
      } catch (error) {
        console.error('Error fetching completed items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedItems();

    // Subscribe to changes
    const exerciseChannel = supabase
      .channel('completed_exercises_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completed_exercises', filter: `user_id=eq.${user.id}` },
        () => fetchCompletedItems()
      )
      .subscribe();

    const recipesChannel = supabase
      .channel('completed_recipes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completed_recipes', filter: `user_id=eq.${user.id}` },
        () => fetchCompletedItems()
      )
      .subscribe();

    const detoxChannel = supabase
      .channel('completed_detox_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completed_detox', filter: `user_id=eq.${user.id}` },
        () => fetchCompletedItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(exerciseChannel);
      supabase.removeChannel(recipesChannel);
      supabase.removeChannel(detoxChannel);
    };
  }, [user]);

  const totalProgress = useMemo(() => {
    const capsuleProgress = Math.min(capsuleDays.length / CAPSULE_TARGET, 1);
    const hydrationProgress = Math.min(totalDaysMetGoal / HYDRATION_TARGET, 1);
    const exerciseProgress = Math.min(completedExercises.length / EXERCISE_TARGET, 1);
    const recipeProgress = Math.min(completedRecipes.length / RECIPE_TARGET, 1);
    const detoxProgress = Math.min(completedDetox.length / DETOX_TARGET, 1);

    // Average of all goals
    const averageProgress = (capsuleProgress + hydrationProgress + exerciseProgress + recipeProgress + detoxProgress) / 5;
    return Math.round(averageProgress * 100);
  }, [capsuleDays.length, totalDaysMetGoal, completedExercises.length, completedRecipes.length, completedDetox.length]);

  return {
    capsuleDays: capsuleDays.length,
    capsuleTarget: CAPSULE_TARGET,
    hydrationDays: totalDaysMetGoal,
    hydrationTarget: HYDRATION_TARGET,
    exercisesCompleted: completedExercises.length,
    exerciseTarget: EXERCISE_TARGET,
    recipesCompleted: completedRecipes.length,
    recipeTarget: RECIPE_TARGET,
    detoxCompleted: completedDetox.length,
    detoxTarget: DETOX_TARGET,
    totalProgress,
    isLoading,
    completedExercises,
    completedRecipes,
    completedDetox,
  };
};
