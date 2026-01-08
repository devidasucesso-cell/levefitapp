import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, Heart, Sparkles, ArrowRight, Star } from 'lucide-react';

const HAS_LOGGED_IN_KEY = 'levefit_has_logged_in';

const Index = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingPreviousLogin, setCheckingPreviousLogin] = useState(true);

  useEffect(() => {
    // If user is logged in, go to dashboard
    if (isLoggedIn) {
      // Mark that user has logged in before
      localStorage.setItem(HAS_LOGGED_IN_KEY, 'true');
      navigate('/dashboard');
      return;
    }

    // Check if user has logged in before (returning user who logged out)
    const hasLoggedInBefore = localStorage.getItem(HAS_LOGGED_IN_KEY);
    
    if (!isLoading && hasLoggedInBefore === 'true' && !isLoggedIn) {
      // User has logged in before, redirect to auth page
      navigate('/auth');
      return;
    }

    setCheckingPreviousLogin(false);
  }, [isLoggedIn, isLoading, navigate]);

  const handleStart = () => {
    navigate('/auth');
  };

  if (isLoading || checkingPreviousLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 text-primary/20"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        className="absolute top-32 right-8 text-accent/20"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Star className="w-6 h-6" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-12 text-primary/15"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-7 h-7" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-full mb-8 shadow-glow"
        >
          <Leaf className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        {/* Welcome Message */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4"
        >
          Olá! 👋
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-foreground mb-6"
        >
          Bem-vindo ao <span className="text-primary">LeveFit</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-8 text-left"
        >
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Estamos muito felizes em ter você aqui! 💚
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            O <strong className="text-foreground">LeveFit</strong> é seu companheiro diário para uma vida mais saudável. 
            Aqui você vai encontrar:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">🥗</span>
              <span>Receitas saudáveis e deliciosas</span>
            </motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">🍹</span>
              <span>Sucos detox revigorantes</span>
            </motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">💪</span>
              <span>Exercícios para seu bem-estar</span>
            </motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">📊</span>
              <span>Acompanhamento do seu progresso</span>
            </motion.li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-muted-foreground mb-6">
            Vamos começar essa jornada juntos? 🚀
          </p>

          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg gradient-primary text-primary-foreground shadow-glow"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-muted-foreground mt-6"
        >
          Sua transformação começa aqui ✨
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
