import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditReleasedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
}

const CreditReleasedDialog = ({ open, onOpenChange, amount = 25 }: CreditReleasedDialogProps) => {
  const navigate = useNavigate();

  const handleUseCredits = () => {
    onOpenChange(false);
    // Navigate to where credits can be used (could be a store or settings page)
    navigate('/referral');
  };

  const handleInviteMore = () => {
    onOpenChange(false);
    navigate('/referral');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-green-50 to-white dark:from-green-950/50 dark:to-background">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex flex-col items-center text-center p-4"
        >
          {/* Celebration Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg"
          >
            <span className="text-4xl">🎉</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Crédito liberado!
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4"
          >
            Parabéns! 🎊
          </motion.p>

          {/* Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            <p className="text-muted-foreground">
              Seu amigo comprou pelo seu link e o pagamento foi confirmado.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 dark:text-green-400">
              <span>💰</span>
              <span>R${amount.toFixed(2)} em créditos</span>
            </div>
            
            <p className="text-muted-foreground">
              já estão disponíveis na sua conta para usar no Leve Fit.
            </p>
            
            <p className="text-sm text-muted-foreground mt-4">
              Continue indicando e ganhe ainda mais! 💚
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full space-y-3"
          >
            <Button
              onClick={handleUseCredits}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6"
            >
              <Gift className="w-5 h-5 mr-2" />
              Usar meus créditos
            </Button>
            
            <Button
              onClick={handleInviteMore}
              variant="outline"
              className="w-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 py-6"
            >
              <Users className="w-5 h-5 mr-2" />
              Indicar mais amigos
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditReleasedDialog;
