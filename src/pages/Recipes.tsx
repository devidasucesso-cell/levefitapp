import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Flame, ChevronRight } from 'lucide-react';
import { getRecipesByMealTime, getCategoryDescription } from '@/data/recipes';
// Fix import path verified
import { MealTime } from '@/types';
import { getRecipeImage } from '@/data/recipeImages';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PremiumLock from '@/components/PremiumLock';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';

const Recipes = () => {
  const { profile, isCodeValidated } = useAuth();
  const navigate = useNavigate();
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('morning');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const category = profile?.imc_category || 'normal';
  const recipes = getRecipesByMealTime(category, selectedMealTime);
  const description = getCategoryDescription(category);

  const handleRecipeClick = (recipe: any, index: number) => {
    if (!isCodeValidated && index >= 5) {
      setSelectedRecipe({ ...recipe, locked: true });
    } else {
      setSelectedRecipe(recipe);
    }
  };

  const categoryLabels = {
    underweight: 'Ganho de Peso',
    normal: 'Manutenção',
    overweight: 'Emagrecimento',
    obese: 'Alimentação Leve',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Receitas</h1>
            <p className="text-primary-foreground/80 text-sm">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium">
            {categoryLabels[category]}
          </span>
        </div>
      </div>

      {/* Meal Time Selector */}
      <div className="px-6 -mt-6">
        <div className="bg-card shadow-lg rounded-2xl p-2 flex justify-between items-center">
          {(['morning', 'afternoon', 'night'] as const).map((time) => (
            <button
              key={time}
              onClick={() => setSelectedMealTime(time)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                selectedMealTime === time
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {time === 'morning' ? 'Café' : time === 'afternoon' ? 'Almoço' : 'Jantar'}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe List */}
      <div className="px-6 mt-6 space-y-4">
        {recipes.map((recipe, index) => {
          const isLocked = !isCodeValidated && index >= 5;
          
          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleRecipeClick(recipe, index)}
              className={`bg-card rounded-2xl p-3 shadow-sm flex gap-4 cursor-pointer relative overflow-hidden ${isLocked ? 'opacity-80' : ''}`}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img
                  src={getRecipeImage(selectedMealTime, category, index)}
                  alt={recipe.name}
                  className={`w-full h-full object-cover ${isLocked ? 'filter grayscale blur-[1px]' : ''}`}
                />
                {isLocked && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                     <span className="text-2xl">🔒</span>
                   </div>
                )}
              </div>
              
              <div className="flex-1 py-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{recipe.name}</h3>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {recipe.calories} kcal
                  </span>
                </div>

                <div className="flex items-center text-primary text-xs font-medium">
                  Ver detalhes
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recipe Detail Modal */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedRecipe?.locked ? (
             <PremiumLock message="Tenha acesso ilimitado" buttonText="Quero acesso ilimitado" />
          ) : (
            selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedRecipe.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="relative h-48 -mx-6 -mt-2 mb-4 overflow-hidden">
                    <img 
                      src={getRecipeImage(selectedMealTime, category, 0)} 
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary">
                      <Clock className="w-4 h-4" />
                      {selectedRecipe.prepTime}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary">
                      <Flame className="w-4 h-4" />
                      {selectedRecipe.calories} kcal
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Ingredientes</h4>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Modo de Preparo</h4>
                    <ol className="space-y-4">
                      {selectedRecipe.instructions.map((step: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm text-muted-foreground">
                          <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Recipes;
