import React from 'react';
import { Exercise } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
}

const getDifficultyConfig = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return { label: 'Fácil', color: 'bg-exercise-easy text-white' };
    case 'moderate': return { label: 'Moderado', color: 'bg-exercise-moderate text-warning-foreground' };
    case 'intense': return { label: 'Intenso', color: 'bg-exercise-intense text-white' };
    default: return { label: '', color: '' };
  }
};

const ExerciseCard = ({ exercise, index }: ExerciseCardProps) => {
  const diffConfig = getDifficultyConfig(exercise.difficulty);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                diffConfig.color
              )}>
                <span className="text-2xl">🏃</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{exercise.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
          </Card>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", diffConfig.color)}>
              {diffConfig.label}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {exercise.duration}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flame className="w-4 h-4" />
              {exercise.calories} kcal
            </span>
          </div>

          <p className="text-muted-foreground">{exercise.description}</p>

          <div>
            <h4 className="font-semibold mb-2 text-foreground">Como fazer:</h4>
            <ol className="space-y-2">
              {exercise.steps.map((step, i) => (
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
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCard;
