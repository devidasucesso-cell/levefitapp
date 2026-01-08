import React, { forwardRef } from 'react';
import { Droplets } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const WaterReminder = forwardRef<HTMLDivElement>((_, ref) => {
  const { profile, addWaterIntake } = useAuth();
  const waterGoal = 2000; // 2L
  const currentIntake = profile?.water_intake || 0;
  const percentage = Math.min((currentIntake / waterGoal) * 100, 100);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-24 right-4 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={addWaterIntake}
        className="relative group"
      >
        <div className="w-16 h-16 rounded-full gradient-primary shadow-glow flex items-center justify-center animate-bounce-gentle">
          <Droplets className="w-8 h-8 text-primary-foreground" />
        </div>
        
        {/* Water level indicator */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
          {Math.round(percentage)}%
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-card rounded-lg shadow-lg p-3 text-sm whitespace-nowrap">
            <p className="font-semibold text-foreground">Beba Água! 💧</p>
            <p className="text-muted-foreground">{currentIntake}ml / {waterGoal}ml</p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
});

WaterReminder.displayName = 'WaterReminder';

export default WaterReminder;
