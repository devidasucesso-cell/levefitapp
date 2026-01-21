import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, Check, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { exercises } from '@/data/exercises';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActivityTrackerProps {
  completedExercises: string[];
  currentWeek: number;
}

const ActivityTracker = ({ completedExercises, currentWeek }: ActivityTrackerProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Local optimistic state for instant UI updates
  const [localCompletedExercises, setLocalCompletedExercises] = useState<string[]>(completedExercises);

  // Sync with props when they change from realtime
  useEffect(() => {
    setLocalCompletedExercises(completedExercises);
  }, [completedExercises]);

  // Filter exercises based on current week/phase
  const displayedExercises = useMemo(() => {
    let difficulty: 'easy' | 'moderate' | 'intense' = 'easy';
    
    if (currentWeek === 1) difficulty = 'easy';
    else if (currentWeek === 2) difficulty = 'moderate';
    else if (currentWeek >= 3) difficulty = 'intense';
    
    return exercises.filter(e => e.difficulty === difficulty);
  }, [currentWeek]);

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

  const renderActivityItem = (
    id: string,
    name: string,
    isCompleted: boolean,
    onToggle: () => void
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Minhas Atividades (Semana {currentWeek})</h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {localCompletedExercises.filter(id => displayedExercises.some(e => e.id === id)).length} / {displayedExercises.length}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {displayedExercises.length > 0 ? (
          displayedExercises.map((exercise) => 
            renderActivityItem(
              exercise.id,
              exercise.name,
              localCompletedExercises.includes(exercise.id),
              () => toggleExercise(exercise.id, exercise.name)
            )
          )
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade disponível para esta fase.
          </p>
        )}
      </div>
    </Card>
  );
};

export default ActivityTracker;
