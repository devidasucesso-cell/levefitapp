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

  // Targets for the prize based on weekly achievements
  const WEEK1_CAPSULE_TARGET = 5;
  const WEEK1_HYDRATION_TARGET = 5;
  const WEEK1_EXERCISE_TARGET = 3;

  const WEEK2_CAPSULE_TARGET = 10;
  const WEEK2_HYDRATION_TARGET = 10;
  const WEEK2_EXERCISE_TARGET = 5;
  const WEEK2_RECIPE_DETOX_TARGET = 1;

  const WEEK3_CAPSULE_TARGET = 18; // 18-21 days
  const WEEK3_HYDRATION_TARGET = 15;
  const WEEK3_EXERCISE_TARGET = 10;
  const WEEK3_PROGRESS_TARGET = 75; // 75% progress

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
    // Calculate progress based on weekly goals weighting
    // Week 1 (30% max)
    const week1Capsule = Math.min(capsuleDays.length / WEEK1_CAPSULE_TARGET, 1);
    const week1Hydration = Math.min(totalDaysMetGoal / WEEK1_HYDRATION_TARGET, 1);
    const week1Exercise = Math.min(completedExercises.length / WEEK1_EXERCISE_TARGET, 1);
    
    const week1Progress = (week1Capsule + week1Hydration + week1Exercise) / 3 * 30;

    // Week 2 (adds up to 25% -> total 55%)
    const week2Capsule = Math.min(Math.max(0, capsuleDays.length - WEEK1_CAPSULE_TARGET) / (WEEK2_CAPSULE_TARGET - WEEK1_CAPSULE_TARGET), 1);
    const week2Hydration = Math.min(Math.max(0, totalDaysMetGoal - WEEK1_HYDRATION_TARGET) / (WEEK2_HYDRATION_TARGET - WEEK1_HYDRATION_TARGET), 1);
    const week2Exercise = Math.min(Math.max(0, completedExercises.length - WEEK1_EXERCISE_TARGET) / (WEEK2_EXERCISE_TARGET - WEEK1_EXERCISE_TARGET), 1);
    const week2RecipeDetox = Math.min((completedRecipes.length + completedDetox.length) / WEEK2_RECIPE_DETOX_TARGET, 1);

    const week2Progress = (week2Capsule + week2Hydration + week2Exercise + week2RecipeDetox) / 4 * 25;

    // Week 3 (adds up to 45% -> total 100%)
    const week3Capsule = Math.min(Math.max(0, capsuleDays.length - WEEK2_CAPSULE_TARGET) / (WEEK3_CAPSULE_TARGET - WEEK2_CAPSULE_TARGET), 1);
    const week3Hydration = Math.min(Math.max(0, totalDaysMetGoal - WEEK2_HYDRATION_TARGET) / (WEEK3_HYDRATION_TARGET - WEEK2_HYDRATION_TARGET), 1);
    const week3Exercise = Math.min(Math.max(0, completedExercises.length - WEEK2_EXERCISE_TARGET) / (WEEK3_EXERCISE_TARGET - WEEK2_EXERCISE_TARGET), 1);

    const week3Progress = (week3Capsule + week3Hydration + week3Exercise) / 3 * 45;

    // Determine current phase based on raw numbers for simplicity in logic, but cumulative progress
    let currentTotal = 0;
    
    // Logic for progress capping based on weeks completion
    // Week 1 Complete?
    if (week1Capsule >= 1 && week1Hydration >= 1 && week1Exercise >= 1) {
        currentTotal = 30;
        // Week 2 Complete?
        if (week2Capsule >= 1 && week2Hydration >= 1 && week2Exercise >= 1 && week2RecipeDetox >= 1) {
            currentTotal = 55;
             // Week 3 Contribution
             currentTotal += week3Progress;
        } else {
             currentTotal += week2Progress;
        }
    } else {
        currentTotal = week1Progress;
    }

    return Math.min(Math.round(currentTotal), 100);
  }, [capsuleDays.length, totalDaysMetGoal, completedExercises.length, completedRecipes.length, completedDetox.length]);

  return {
    capsuleDays: capsuleDays.length,
    hydrationDays: totalDaysMetGoal,
    exercisesCompleted: completedExercises.length,
    recipesCompleted: completedRecipes.length,
    detoxCompleted: completedDetox.length,
    totalProgress,
    isLoading,
    completedExercises,
    completedRecipes,
    completedDetox,
    targets: {
      week1: {
        capsule: WEEK1_CAPSULE_TARGET,
        hydration: WEEK1_HYDRATION_TARGET,
        exercise: WEEK1_EXERCISE_TARGET
      },
      week2: {
        capsule: WEEK2_CAPSULE_TARGET,
        hydration: WEEK2_HYDRATION_TARGET,
        exercise: WEEK2_EXERCISE_TARGET,
        recipeDetox: WEEK2_RECIPE_DETOX_TARGET
      },
      week3: {
        capsule: WEEK3_CAPSULE_TARGET,
        hydration: WEEK3_HYDRATION_TARGET,
        exercise: WEEK3_EXERCISE_TARGET
      }
    }
  };
};
