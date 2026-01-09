import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, CloudSun, Moon, UtensilsCrossed, GlassWater, ChevronRight, Clock, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRecipesByMealTime } from '@/data/recipes';
import { getDetoxByTimeOfDay } from '@/data/detoxDrinks';
import { IMCCategory, Recipe, DetoxDrink } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
interface DailyDietSuggestionProps {
  imcCategory: IMCCategory;
}

const DailyDietSuggestion = ({ imcCategory }: DailyDietSuggestionProps) => {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<DetoxDrink | null>(null);

  const getMealTimeLabel = (mealTime: string) => {
    switch (mealTime) {
      case 'morning': return 'Manhã';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noite';
      default: return '';
    }
  };
  // Get a random recipe/drink for each time of day based on today's date and IMC category
  // This changes daily AND when the IMC category changes
  const dailySelection = useMemo(() => {
    const today = new Date();
    // Include imcCategory in the seed so it changes when IMC updates
    const categoryOffset = imcCategory === 'underweight' ? 0 : 
                           imcCategory === 'normal' ? 100 : 
                           imcCategory === 'overweight' ? 200 : 300;
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + categoryOffset;
    
    const getRandomItem = <T,>(items: T[], offset: number): T | null => {
      if (items.length === 0) return null;
      const index = (seed + offset) % items.length;
      return items[index];
    };

    // Get recipes for each meal time
    const morningRecipes = getRecipesByMealTime(imcCategory, 'morning');
    const afternoonRecipes = getRecipesByMealTime(imcCategory, 'afternoon');
    const nightRecipes = getRecipesByMealTime(imcCategory, 'night');

    // Get detox drinks for each time
    const morningDrinks = getDetoxByTimeOfDay(imcCategory, 'morning');
    const afternoonDrinks = getDetoxByTimeOfDay(imcCategory, 'afternoon');
    const nightDrinks = getDetoxByTimeOfDay(imcCategory, 'night');

    return {
      recipes: {
        morning: getRandomItem(morningRecipes, 1),
        afternoon: getRandomItem(afternoonRecipes, 2),
        night: getRandomItem(nightRecipes, 3),
      },
      drinks: {
        morning: getRandomItem(morningDrinks, 4),
        afternoon: getRandomItem(afternoonDrinks, 5),
        night: getRandomItem(nightDrinks, 6),
      }
    };
  }, [imcCategory]);

  const timeConfig = [
    { 
      key: 'morning' as const, 
      label: 'Manhã', 
      icon: Sun, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      key: 'afternoon' as const, 
      label: 'Tarde', 
      icon: CloudSun, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      key: 'night' as const, 
      label: 'Noite', 
      icon: Moon, 
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
  ];

  return (
    <Card className="p-4 shadow-md bg-card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Dieta do Dia</h3>
            <p className="text-xs text-muted-foreground">Sugestões personalizadas para você</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Receitas Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <h4 className="font-medium text-sm text-foreground">Receitas</h4>
          </div>
          <div className="space-y-2">
            {timeConfig.map((time, index) => {
              const recipe = dailySelection.recipes[time.key];
              const TimeIcon = time.icon;
              
              return (
                <motion.div
                  key={`recipe-${time.key}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${time.bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => recipe && setSelectedRecipe(recipe)}
                >
                  <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center`}>
                    <TimeIcon className={`w-4 h-4 ${time.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{time.label}</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {recipe?.name || 'Não disponível'}
                    </p>
                    {recipe?.calories && (
                      <p className="text-xs text-muted-foreground">{recipe.calories} kcal</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detox Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍵</span>
            <h4 className="font-medium text-sm text-foreground">Sucos & Chás Detox</h4>
          </div>
          <div className="space-y-2">
            {timeConfig.map((time, index) => {
              const drink = dailySelection.drinks[time.key];
              const TimeIcon = time.icon;
              
              return (
                <motion.div
                  key={`drink-${time.key}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${time.bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => drink && setSelectedDrink(drink)}
                >
                  <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center`}>
                    <GlassWater className={`w-4 h-4 ${time.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{time.label}</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {drink?.name || 'Não disponível'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View All Button */}
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={() => navigate('/recipes')}
        >
          Ver Receitas
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={() => navigate('/detox')}
        >
          Ver Detox
        </Button>
      </div>

      {/* Recipe Detail Modal */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{selectedRecipe?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary">
                  {selectedRecipe.mealTime === 'morning' && <Sun className="w-4 h-4 text-warning" />}
                  {selectedRecipe.mealTime === 'afternoon' && <CloudSun className="w-4 h-4 text-primary" />}
                  {selectedRecipe.mealTime === 'night' && <Moon className="w-4 h-4 text-info" />}
                  {getMealTimeLabel(selectedRecipe.mealTime)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.prepTime}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  {selectedRecipe.calories} kcal
                </span>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">Ingredientes:</h4>
                <ul className="space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, i) => (
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
                  {selectedRecipe.instructions.map((step, i) => (
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
          )}
        </DialogContent>
      </Dialog>

      {/* Detox Detail Modal */}
      <Dialog open={!!selectedDrink} onOpenChange={() => setSelectedDrink(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{selectedDrink?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDrink && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary w-fit">
                {selectedDrink.timeOfDay === 'morning' && <Sun className="w-4 h-4 text-warning" />}
                {selectedDrink.timeOfDay === 'afternoon' && <CloudSun className="w-4 h-4 text-primary" />}
                {selectedDrink.timeOfDay === 'night' && <Moon className="w-4 h-4 text-info" />}
                <span className="text-sm">{getMealTimeLabel(selectedDrink.timeOfDay)}</span>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">Ingredientes:</h4>
                <ul className="space-y-1">
                  {selectedDrink.ingredients.map((ingredient, i) => (
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
                  {selectedDrink.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Benefícios:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrink.benefits.map((benefit, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DailyDietSuggestion;
