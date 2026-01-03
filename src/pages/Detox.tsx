import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Sun, CloudSun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getDetoxByTimeOfDay } from '@/data/detoxDrinks';
import DetoxCard from '@/components/DetoxCard';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';

type TimeOfDay = 'morning' | 'afternoon' | 'night';

const timeConfig = {
  morning: { label: 'Manhã', icon: Sun, color: 'bg-warning text-warning-foreground' },
  afternoon: { label: 'Tarde', icon: CloudSun, color: 'bg-primary text-primary-foreground' },
  night: { label: 'Noite', icon: Moon, color: 'bg-info text-info-foreground' },
};

const Detox = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning');
  
  const category = user?.imcCategory || 'normal';
  const drinks = getDetoxByTimeOfDay(category, selectedTime);

  const categoryLabels = {
    underweight: 'Bebidas Nutritivas',
    normal: 'Equilíbrio Natural',
    overweight: 'Detox Emagrecedor',
    obese: 'Desintoxicação Suave',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 pb-8 rounded-b-3xl">
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
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Chás & Sucos Detox</h1>
            <p className="text-primary-foreground/80 text-sm">Bebidas para desintoxicar seu corpo</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium">
            {categoryLabels[category]}
          </span>
        </div>
      </div>

      {/* Time Selector */}
      <div className="p-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {(Object.keys(timeConfig) as TimeOfDay[]).map((time) => {
            const config = timeConfig[time];
            const Icon = config.icon;
            const isSelected = selectedTime === time;
            
            return (
              <Button
                key={time}
                onClick={() => setSelectedTime(time)}
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

        {/* Drinks Grid */}
        <div className="space-y-3">
          {drinks.map((drink, index) => (
            <DetoxCard key={drink.id} drink={drink} index={index} />
          ))}
        </div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Detox;
