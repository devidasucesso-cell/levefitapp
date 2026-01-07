import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreatmentReminderProps {
  daysRemaining: number;
  onClose: () => void;
}

const TreatmentReminder = ({ daysRemaining, onClose }: TreatmentReminderProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 shadow-2xl text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-white animate-pulse" />
              <span className="font-semibold text-lg">Lembrete LeveFit</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-white/95 text-base leading-relaxed mb-3">
            Seu tratamento está acabando! 
            {daysRemaining === 1 
              ? ' Falta apenas 1 dia!' 
              : ` Faltam ${daysRemaining} dias!`}
          </p>
          
          <p className="text-white font-medium text-base">
            Tenha constância e peça o seu próximo LeveFit 💚
          </p>

          <div className="mt-4 flex gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - (daysRemaining / 5) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white rounded-full h-2"
              />
            </div>
            <span className="text-sm text-white/80">{daysRemaining}d</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TreatmentReminder;