import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight } from 'lucide-react';

const Index = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-8 shadow-xl"
        >
          <Leaf className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          LeveFit
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          Seu guia completo para uma vida mais saudável com receitas, exercícios e dicas personalizadas para seu perfil.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
          >
            Começar agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm text-muted-foreground">Receitas</p>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">🏃</div>
            <p className="text-sm text-muted-foreground">Exercícios</p>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">🍵</div>
            <p className="text-sm text-muted-foreground">Detox</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
