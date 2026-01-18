import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sun, CloudSun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getRecipesByMealTime, getCategoryDescription } from '@/data/recipes';
import RecipeCard from '@/components/RecipeCard';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';

type MealTime = 'morning' | 'afternoon' | 'night';

const mealTimeConfig = {
  morning: { label: 'Manhã', icon: Sun, color: 'bg-warning text-warning-foreground' },
  afternoon: { label: 'Tarde', icon: CloudSun, color: 'bg-primary text-primary-foreground' },
  night: { label: 'Noite', icon: Moon, color: 'bg-info text-info-foreground' },
};

const Recipes = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('morning');
  
  const category = profile?.imc_category || 'normal';
  const recipes = getRecipesByMealTime(category, selectedMealTime);
  const description = getCategoryDescription(category);

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
      <div className="p-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {(Object.keys(mealTimeConfig) as MealTime[]).map((time) => {
            const config = mealTimeConfig[time];
            const Icon = config.icon;
            const isSelected = selectedMealTime === time;
            
            return (
              <Button
                key={time}
                onClick={() => setSelectedMealTime(time)}
                className={cn(
                  "flex-1 h-14 flex flex-col gap-1 transition-all",
                  isSelected ? config.color : "bg-card hover:bg-secondary"
                )}
                variant={isSelected ? "default" : "outline"}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{config.label}</span>
              </Button>
            );
          })}
        </motion.div>

        {/* Recipes Grid */}
        <div className="space-y-3">
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={index} category={category} />
          ))}
        </div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Recipes;
