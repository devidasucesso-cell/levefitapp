import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, Flame, Clock, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { IMCCategory, Exercise } from '@/types';
import { getRecommendedExercises, getIMCExerciseRecommendation, exerciseCategoryLabels } from '@/data/exercises';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';

interface DashboardExerciseSuggestionProps {
  imcCategory: IMCCategory;
}

const DashboardExerciseSuggestion: React.FC<DashboardExerciseSuggestionProps> = ({ imcCategory }) => {
  const navigate = useNavigate();

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
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    } else if (imcCategory === 'overweight') {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(moderate, 1);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    } else {
      const ex1 = getSeededItem(easy, 0);
      const ex2 = getSeededItem(moderate, 1);
      if (ex1) suggestions.push(ex1);
      if (ex2) suggestions.push(ex2);
    }
    
    return suggestions;
  }, [imcCategory]);

  const recommendation = getIMCExerciseRecommendation(imcCategory);

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
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Exercícios do Dia</h3>
            <p className="text-xs text-muted-foreground">{recommendation.title}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/exercises')}
          className="text-xs text-primary hover:underline"
        >
          Ver todos
        </button>
      </div>

      {/* Dica personalizada */}
      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">{recommendation.tip}</p>
        </div>
      </div>

      {/* Lista de exercícios sugeridos com fotos */}
      <div className="space-y-3">
        {dailyExercises.map((exercise, index) => {
          const categoryInfo = exerciseCategoryLabels[exercise.category];
          
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl overflow-hidden border border-border bg-secondary/30 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate('/exercises')}
            >
              {/* Foto do exercício */}
              {exercise.image && (
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={exercise.image} 
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              )}
              
              {/* Info do exercício */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{categoryInfo?.icon || '🏃'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {exercise.name}
                      </p>
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
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default DashboardExerciseSuggestion;
