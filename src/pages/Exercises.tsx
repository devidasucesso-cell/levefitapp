import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getExercisesByDifficulty } from '@/data/exercises';
import ExerciseCard from '@/components/ExerciseCard';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';

type Difficulty = 'easy' | 'moderate' | 'intense';

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-exercise-easy text-white', description: 'Perfeito para iniciantes' },
  moderate: { label: 'Moderado', color: 'bg-exercise-moderate text-warning-foreground', description: 'Desafio equilibrado' },
  intense: { label: 'Intenso', color: 'bg-exercise-intense text-white', description: 'Para quem quer resultados rápidos' },
};

const Exercises = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  
  const exercises = getExercisesByDifficulty(selectedDifficulty);
  const config = difficultyConfig[selectedDifficulty];

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

      {/* Difficulty Selector */}
      <div className="p-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {(Object.keys(difficultyConfig) as Difficulty[]).map((difficulty) => {
            const dConfig = difficultyConfig[difficulty];
            const isSelected = selectedDifficulty === difficulty;
            
            return (
              <Button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
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

        {/* Exercises Grid */}
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
          ))}
        </div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Exercises;
