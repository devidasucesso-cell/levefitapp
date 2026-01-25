import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Flame, Clock, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IMCCategory, Exercise } from '@/types';
import { getRecommendedExercises, getIMCExerciseRecommendation, exerciseCategoryLabels } from '@/data/exercises';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DailyExerciseSuggestionProps {
  imcCategory: IMCCategory;
  completedExercises?: string[];
  onExerciseCompleted?: (exerciseId: string) => void;
}

const DailyExerciseSuggestion: React.FC<DailyExerciseSuggestionProps> = ({ 
  imcCategory, 
  completedExercises = [],
  onExerciseCompleted 
}) => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  // Seleciona exercícios recomendados para o dia baseado na data
  const dailyExercises = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Pegar exercícios recomendados para o IMC
    const recommended = getRecommendedExercises(imcCategory);
    
    // Separar por dificuldade para variar
    const easy = recommended.filter(e => e.difficulty === 'easy');
    const moderate = recommended.filter(e => e.difficulty === 'moderate');
    
    // Função para selecionar item baseado na seed
    const getSeededItem = <T,>(arr: T[], offset: number): T | undefined => {
      if (arr.length === 0) return undefined;
      return arr[(seed + offset) % arr.length];
    };
    
    const suggestions: Exercise[] = [];
    
    // Para IMC alto, priorizar exercícios fáceis
    if (imcCategory === 'obese') {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(easy.filter(e => e.id !== ex1?.id), 1);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    } else if (imcCategory === 'overweight') {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(moderate, 1);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    } else {
      // Normal e underweight podem ter mais variedade
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(moderate, 1);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    }
    
    return suggestions;
  }, [imcCategory]);

  const recommendation = getIMCExerciseRecommendation(imcCategory);

  const handleMarkComplete = async (exercise: Exercise) => {
    if (!user || isMarking) return;
    
    const isCompleted = completedExercises.includes(exercise.id);
    
    setIsMarking(true);
    try {
      if (isCompleted) {
        // Remover
        await supabase
          .from('completed_exercises')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exercise.id);
        toast.success('Exercício desmarcado');
      } else {
        // Adicionar
        await supabase
          .from('completed_exercises')
          .insert({
            user_id: user.id,
            exercise_id: exercise.id,
            exercise_name: exercise.name
          });
        toast.success('Exercício concluído! 🎉');
      }
      
      onExerciseCompleted?.(exercise.id);
    } catch (error) {
      toast.error('Erro ao atualizar exercício');
    } finally {
      setIsMarking(false);
      setSelectedExercise(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-exercise-easy text-white';
      case 'moderate': return 'bg-exercise-moderate text-warning-foreground';
      case 'intense': return 'bg-exercise-intense text-white';
      default: return 'bg-muted';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'moderate': return 'Moderado';
      case 'intense': return 'Intenso';
      default: return difficulty;
    }
  };

  if (dailyExercises.length === 0) return null;

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Exercícios do Dia</h3>
            <p className="text-xs text-muted-foreground">{recommendation.title}</p>
          </div>
        </div>

        {/* Dica personalizada */}
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{recommendation.tip}</p>
          </div>
        </div>

        {/* Lista de exercícios sugeridos */}
        <div className="space-y-2">
          {dailyExercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            const categoryInfo = exerciseCategoryLabels[exercise.category];
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-secondary/30 border-border hover:border-primary/30'
                }`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{categoryInfo?.icon || '🏃'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {exercise.name}
                        </p>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exercise.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {exercise.calories} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Dialog de detalhes do exercício */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {exerciseCategoryLabels[selectedExercise.category]?.icon || '🏃'}
                  </span>
                  <div>
                    <DialogTitle className="text-left">{selectedExercise.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {exerciseCategoryLabels[selectedExercise.category]?.label}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Métricas */}
                <div className="flex items-center gap-4">
                  <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(selectedExercise.difficulty)}`}>
                    {getDifficultyLabel(selectedExercise.difficulty)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedExercise.duration}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Flame className="w-4 h-4" />
                    {selectedExercise.calories} kcal
                  </span>
                </div>

                {/* Descrição */}
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                </div>

                {/* Passos */}
                <div>
                  <h4 className="font-medium mb-2">Como fazer</h4>
                  <ol className="space-y-2">
                    {selectedExercise.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Botão de marcar como feito */}
                <Button
                  onClick={() => handleMarkComplete(selectedExercise)}
                  disabled={isMarking}
                  className="w-full"
                  variant={completedExercises.includes(selectedExercise.id) ? "outline" : "default"}
                >
                  {completedExercises.includes(selectedExercise.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Concluído - Clique para desmarcar
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marcar como Feito
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyExerciseSuggestion;
