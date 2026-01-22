import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, ChefHat, GlassWater, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { exercises } from '@/data/exercises';
import { recipes } from '@/data/recipes';
import { detoxDrinks } from '@/data/detoxDrinks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActivityTrackerProps {
  completedExercises: string[];
  completedRecipes: string[];
  completedDetox: string[];
}

const ActivityTracker = ({ completedExercises, completedRecipes, completedDetox }: ActivityTrackerProps) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('exercises');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Local optimistic state for instant UI updates
  const [localCompletedExercises, setLocalCompletedExercises] = useState<string[]>(completedExercises);
  const [localCompletedRecipes, setLocalCompletedRecipes] = useState<string[]>(completedRecipes);
  const [localCompletedDetox, setLocalCompletedDetox] = useState<string[]>(completedDetox);

  // Sync with props when they change from realtime
  useEffect(() => {
    setLocalCompletedExercises(completedExercises);
  }, [completedExercises]);

  useEffect(() => {
    setLocalCompletedRecipes(completedRecipes);
  }, [completedRecipes]);

  useEffect(() => {
    setLocalCompletedDetox(completedDetox);
  }, [completedDetox]);

  // Filter by user's IMC category
  const userCategory = profile?.imc_category || 'normal';
  
  const filteredRecipes = recipes.filter(r => r.category === userCategory);
  const filteredDetox = detoxDrinks.filter(d => d.category === userCategory);
  
  // Get first 30 for display
  const displayedExercises = exercises.slice(0, 30);
  const displayedRecipes = filteredRecipes.slice(0, 30);
  const displayedDetox = filteredDetox.slice(0, 30);

  const toggleExercise = async (exerciseId: string, exerciseName: string) => {
    if (!user || isLoading) return;
    
    const isCompleted = localCompletedExercises.includes(exerciseId);
    
    // Optimistic update - immediately update UI
    if (isCompleted) {
      setLocalCompletedExercises(prev => prev.filter(id => id !== exerciseId));
    } else {
      setLocalCompletedExercises(prev => [...prev, exerciseId]);
    }
    
    setIsLoading(exerciseId);
    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('completed_exercises')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);
        
        if (error) throw error;
        toast.success('Exercício removido');
      } else {
        const { error } = await supabase
          .from('completed_exercises')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            exercise_name: exerciseName,
          });
        
        if (error) throw error;
        toast.success('Exercício marcado como feito! 💪');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCompleted) {
        setLocalCompletedExercises(prev => [...prev, exerciseId]);
      } else {
        setLocalCompletedExercises(prev => prev.filter(id => id !== exerciseId));
      }
      console.error('Error toggling exercise:', error);
      toast.error('Erro ao atualizar exercício');
    } finally {
      setIsLoading(null);
    }
  };

  const toggleRecipe = async (recipeId: string, recipeName: string) => {
    if (!user || isLoading) return;
    
    const isCompleted = localCompletedRecipes.includes(recipeId);
    
    // Optimistic update - immediately update UI
    if (isCompleted) {
      setLocalCompletedRecipes(prev => prev.filter(id => id !== recipeId));
    } else {
      setLocalCompletedRecipes(prev => [...prev, recipeId]);
    }
    
    setIsLoading(recipeId);
    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('completed_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
        
        if (error) throw error;
        toast.success('Receita removida');
      } else {
        const { error } = await supabase
          .from('completed_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            recipe_name: recipeName,
          });
        
        if (error) throw error;
        toast.success('Receita preparada! 👨‍🍳');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCompleted) {
        setLocalCompletedRecipes(prev => [...prev, recipeId]);
      } else {
        setLocalCompletedRecipes(prev => prev.filter(id => id !== recipeId));
      }
      console.error('Error toggling recipe:', error);
      toast.error('Erro ao atualizar receita');
    } finally {
      setIsLoading(null);
    }
  };

  const toggleDetox = async (detoxId: string, detoxName: string) => {
    if (!user || isLoading) return;
    
    const isCompleted = localCompletedDetox.includes(detoxId);
    
    // Optimistic update - immediately update UI
    if (isCompleted) {
      setLocalCompletedDetox(prev => prev.filter(id => id !== detoxId));
    } else {
      setLocalCompletedDetox(prev => [...prev, detoxId]);
    }
    
    setIsLoading(detoxId);
    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('completed_detox')
          .delete()
          .eq('user_id', user.id)
          .eq('detox_id', detoxId);
        
        if (error) throw error;
        toast.success('Detox removido');
      } else {
        const { error } = await supabase
          .from('completed_detox')
          .insert({
            user_id: user.id,
            detox_id: detoxId,
            detox_name: detoxName,
          });
        
        if (error) throw error;
        toast.success('Detox consumido! 🥤');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCompleted) {
        setLocalCompletedDetox(prev => [...prev, detoxId]);
      } else {
        setLocalCompletedDetox(prev => prev.filter(id => id !== detoxId));
      }
      console.error('Error toggling detox:', error);
      toast.error('Erro ao atualizar detox');
    } finally {
      setIsLoading(null);
    }
  };

  const renderActivityItem = (
    id: string,
    name: string,
    isCompleted: boolean,
    onToggle: () => void,
    color: string
  ) => (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
        isCompleted ? "bg-success/10 border border-success/30" : "bg-muted/30 hover:bg-muted/50"
      )}
      onClick={onToggle}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
        isCompleted ? "bg-success" : "bg-muted"
      )}>
        {isLoading === id ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : isCompleted ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
        )}
      </div>
      <span className={cn(
        "text-sm flex-1 truncate transition-all",
        isCompleted ? "text-success font-medium line-through" : "text-foreground"
      )}>
        {name}
      </span>
    </motion.div>
  );

  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold text-foreground text-sm mb-4">Minhas Atividades Completadas</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="exercises" className="text-xs">
            <Dumbbell className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Exercícios</span>
            <span className="sm:hidden">Ex</span>
            <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">
              {localCompletedExercises.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="text-xs">
            <ChefHat className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Receitas</span>
            <span className="sm:hidden">Rec</span>
            <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">
              {localCompletedRecipes.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="detox" className="text-xs">
            <GlassWater className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Detox</span>
            <span className="sm:hidden">Det</span>
            <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">
              {localCompletedDetox.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-2 max-h-64 overflow-y-auto">
          {displayedExercises.map((exercise) => 
            renderActivityItem(
              exercise.id,
              exercise.name,
              localCompletedExercises.includes(exercise.id),
              () => toggleExercise(exercise.id, exercise.name),
              'orange'
            )
          )}
        </TabsContent>

        <TabsContent value="recipes" className="space-y-2 max-h-64 overflow-y-auto">
          {displayedRecipes.length > 0 ? (
            displayedRecipes.map((recipe) => 
              renderActivityItem(
                recipe.id,
                recipe.name,
                localCompletedRecipes.includes(recipe.id),
                () => toggleRecipe(recipe.id, recipe.name),
                'pink'
              )
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Configure seu IMC para ver receitas personalizadas
            </p>
          )}
        </TabsContent>

        <TabsContent value="detox" className="space-y-2 max-h-64 overflow-y-auto">
          {displayedDetox.length > 0 ? (
            displayedDetox.map((drink) => 
              renderActivityItem(
                drink.id,
                drink.name,
                localCompletedDetox.includes(drink.id),
                () => toggleDetox(drink.id, drink.name),
                'purple'
              )
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Configure seu IMC para ver bebidas detox personalizadas
            </p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityTracker;
