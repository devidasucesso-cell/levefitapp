import React from 'react';
import { Recipe } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock, Flame, Sun, CloudSun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getRecipeImage } from '@/data/recipeImages';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  category?: string;
}

const getMealTimeIcon = (mealTime: string) => {
  switch (mealTime) {
    case 'morning': return <Sun className="w-4 h-4 text-warning" />;
    case 'afternoon': return <CloudSun className="w-4 h-4 text-primary" />;
    case 'night': return <Moon className="w-4 h-4 text-info" />;
    default: return null;
  }
};

const getMealTimeLabel = (mealTime: string) => {
  switch (mealTime) {
    case 'morning': return 'Manhã';
    case 'afternoon': return 'Tarde';
    case 'night': return 'Noite';
    default: return '';
  }
};

const RecipeCard = ({ recipe, index, category = 'normal' }: RecipeCardProps) => {
  const imageUrl = getRecipeImage(recipe.mealTime as 'morning' | 'afternoon' | 'night', category, index);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
            <div className="flex items-stretch">
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0 relative">
                <img 
                  src={imageUrl} 
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{recipe.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {getMealTimeIcon(recipe.mealTime)}
                  <span>{getMealTimeLabel(recipe.mealTime)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {recipe.calories} kcal
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        {/* Modal Image */}
        <div className="w-full h-40 -mt-6 -mx-6 mb-4 relative">
          <img 
            src={imageUrl} 
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{recipe.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary">
              {getMealTimeIcon(recipe.mealTime)}
              {getMealTimeLabel(recipe.mealTime)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {recipe.prepTime}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Flame className="w-4 h-4" />
              {recipe.calories} kcal
            </span>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-foreground">Ingredientes:</h4>
            <ul className="space-y-1">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-foreground">Modo de preparo:</h4>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
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

export default RecipeCard;
