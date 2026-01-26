import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, Flame, Clock, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { IMCCategory, Exercise } from '@/types';
import { getRecommendedExercises, getIMCExerciseRecommendation, exerciseCategoryLabels } from '@/data/exercises';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DashboardExerciseSuggestionProps {
  imcCategory: IMCCategory;
}

const DashboardExerciseSuggestion: React.FC<DashboardExerciseSuggestionProps> = ({ imcCategory }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Seleciona exercícios recomendados para o dia baseado na data
  const dailyExercises = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    const recommended = getRecommendedExercises(imcCategory);
    
    const easy = recommended.filter(e => e.difficulty === 'easy');
    const moderate = recommended.filter(e => e.difficulty === 'moderate');
    
    const getSeededItem = <T,>(arr: T[], offset: number): T | undefined => {
      if (arr.length === 0) return undefined;
      return arr[(seed + offset) % arr.length];
    };
    
    const suggestions: Exercise[] = [];
    
    if (imcCategory === 'obese') {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(easy.filter(e => e.id !== ex1?.id), 1);
      const ex3 = getSeededItem(easy.filter(e => e.id !== ex1?.id && e.id !== ex2?.id), 2);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
      if (ex3) suggestions.push(ex3);
    } else if (imcCategory === 'overweight') {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(easy.filter(e => e.id !== ex1?.id), 1);
      const ex3 = getSeededItem(moderate, 2);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
      if (ex3) suggestions.push(ex3);
    } else {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(moderate, 1);
      const ex3 = getSeededItem(moderate.filter(e => e.id !== ex2?.id), 2);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
      if (ex3) suggestions.push(ex3);
    }
    
    return suggestions;
  }, [imcCategory]);

  const recommendation = getIMCExerciseRecommendation(imcCategory);

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { label: 'Fácil', color: 'bg-exercise-easy text-white' };
      case 'moderate': return { label: 'Moderado', color: 'bg-exercise-moderate text-warning-foreground' };
      case 'intense': return { label: 'Intenso', color: 'bg-exercise-intense text-white' };
      default: return { label: '', color: 'bg-muted' };
    }
  };

  if (dailyExercises.length === 0) return null;

  return (
    <>
      <Card className="p-4 shadow-md bg-card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Exercícios do Dia</h3>
              <p className="text-xs text-muted-foreground">{recommendation.title}</p>
            </div>
          </div>
        </div>

        {/* Dica personalizada */}
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{recommendation.tip}</p>
          </div>
        </div>

        {/* Lista de exercícios sugeridos com fotos - estilo igual às receitas */}
        <div className="space-y-2">
          {dailyExercises.map((exercise, index) => {
            const categoryInfo = exerciseCategoryLabels[exercise.category];
            const diffConfig = getDifficultyConfig(exercise.difficulty);
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedExercise(exercise)}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={exercise.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop'} 
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>
                
                {/* Content */}
                <div className="relative flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-lg">{categoryInfo?.icon || '🏃'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {exercise.name}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${diffConfig.color}`}>
                        {diffConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70 mt-0.5">
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
                  <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Exercise Detail Modal */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedExercise && (
            <>
              {/* Exercise Image */}
              <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                <img 
                  src={selectedExercise.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop'} 
                  alt={selectedExercise.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-display font-bold text-white">{selectedExercise.name}</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Metrics */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyConfig(selectedExercise.difficulty).color}`}>
                    {getDifficultyConfig(selectedExercise.difficulty).label}
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

                {/* Category */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary w-fit">
                  <span className="text-lg">{exerciseCategoryLabels[selectedExercise.category]?.icon || '🏃'}</span>
                  <span className="text-sm">{exerciseCategoryLabels[selectedExercise.category]?.label || 'Exercício'}</span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Descrição:</h4>
                  <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Como fazer:</h4>
                  <ol className="space-y-2">
                    {selectedExercise.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardExerciseSuggestion;
