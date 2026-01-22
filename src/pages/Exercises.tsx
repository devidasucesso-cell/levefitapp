import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getExercisesByDifficultyAndCategory, getCategoriesForDifficulty, exerciseCategoryLabels } from '@/data/exercises';
import ExerciseCard from '@/components/ExerciseCard';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';
import { ExerciseCategory } from '@/types';
import { Card } from '@/components/ui/card';

type Difficulty = 'easy' | 'moderate' | 'intense';

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-exercise-easy text-white', description: 'Perfeito para iniciantes' },
  moderate: { label: 'Moderado', color: 'bg-exercise-moderate text-warning-foreground', description: 'Desafio equilibrado' },
  intense: { label: 'Intenso', color: 'bg-exercise-intense text-white', description: 'Para quem quer resultados rápidos' },
};

// Imagens para cada categoria de exercício
const categoryImages: Record<ExerciseCategory, string> = {
  caminhada: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=200&fit=crop',
  corrida: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=200&fit=crop&q=80',
  danca: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=400&h=200&fit=crop',
  yoga_pilates: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop',
  natacao_aquatico: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=200&fit=crop',
  ciclismo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=200&fit=crop',
  esportes: 'https://images.unsplash.com/photo-1461896836934- voices-0c35f?w=400&h=200&fit=crop',
  funcional: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
  alongamento: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=200&fit=crop',
  musculacao: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=200&fit=crop',
  outros: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=200&fit=crop',
};

const Exercises = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [expandedCategory, setExpandedCategory] = useState<ExerciseCategory | null>(null);
  
  const categories = useMemo(() => getCategoriesForDifficulty(selectedDifficulty), [selectedDifficulty]);
  
  const config = difficultyConfig[selectedDifficulty];

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setExpandedCategory(null);
  };

  const toggleCategory = (category: ExerciseCategory) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className={cn("p-6 pb-8 rounded-b-3xl", config.color)}>
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-current hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display">Exercícios Aeróbicos</h1>
            <p className="opacity-80 text-sm">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
        {/* Difficulty Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          {(Object.keys(difficultyConfig) as Difficulty[]).map((difficulty) => {
            const dConfig = difficultyConfig[difficulty];
            const isSelected = selectedDifficulty === difficulty;
            
            return (
              <Button
                key={difficulty}
                onClick={() => handleDifficultyChange(difficulty)}
                className={cn(
                  "flex-1 h-12 transition-all font-semibold",
                  isSelected ? dConfig.color : "bg-card hover:bg-secondary text-foreground"
                )}
                variant={isSelected ? "default" : "outline"}
              >
                {dConfig.label}
              </Button>
            );
          })}
        </motion.div>

        {/* Categories List - Vertical */}
        <div className="space-y-3">
          {categories.map((category, index) => {
            const categoryInfo = exerciseCategoryLabels[category];
            const exercises = getExercisesByDifficultyAndCategory(selectedDifficulty, category);
            const isExpanded = expandedCategory === category;
            const imageUrl = categoryImages[category];
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all",
                    isExpanded && "ring-2 ring-primary"
                  )}
                  onClick={() => toggleCategory(category)}
                >
                  {/* Category Header with Image */}
                  <div className="relative h-24 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={categoryInfo.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryInfo.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{categoryInfo.label}</h3>
                          <p className="text-white/70 text-sm">{exercises.length} exercícios</p>
                        </div>
                      </div>
                      <div className="text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6" />
                        ) : (
                          <ChevronDown className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Expanded Exercises */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        {exercises.map((exercise, exerciseIndex) => (
                          <ExerciseCard 
                            key={exercise.id} 
                            exercise={exercise} 
                            index={exerciseIndex} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma categoria encontrada para esta dificuldade.
          </div>
        )}
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Exercises;
