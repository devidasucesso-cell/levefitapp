import React from 'react';
import { DetoxDrink } from '@/types';
import { Card } from '@/components/ui/card';
import { Sun, CloudSun, Moon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDetoxImage } from '@/data/recipeImages';

interface DetoxCardProps {
  drink: DetoxDrink;
  index: number;
}

const getTimeIcon = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'morning': return <Sun className="w-4 h-4 text-warning" />;
    case 'afternoon': return <CloudSun className="w-4 h-4 text-primary" />;
    case 'night': return <Moon className="w-4 h-4 text-info" />;
    default: return null;
  }
};

const getTimeLabel = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'morning': return 'Manhã';
    case 'afternoon': return 'Tarde';
    case 'night': return 'Noite';
    default: return '';
  }
};

const DetoxCard = ({ drink, index }: DetoxCardProps) => {
  const imageUrl = getDetoxImage(drink.timeOfDay as 'morning' | 'afternoon' | 'night', index);

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
              <div className="w-20 h-20 flex-shrink-0 relative">
                <img 
                  src={imageUrl} 
                  alt={drink.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{drink.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {getTimeIcon(drink.timeOfDay)}
                  <span>{getTimeLabel(drink.timeOfDay)}</span>
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
            alt={drink.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{drink.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary w-fit">
            {getTimeIcon(drink.timeOfDay)}
            <span className="text-sm">{getTimeLabel(drink.timeOfDay)}</span>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-foreground">Ingredientes:</h4>
            <ul className="space-y-1">
              {drink.ingredients.map((ingredient, i) => (
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
              {drink.instructions.map((step, i) => (
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
              {drink.benefits.map((benefit, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetoxCard;
