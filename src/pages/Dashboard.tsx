import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Pill, Droplets, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IMCCalculator from '@/components/IMCCalculator';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { profile, capsuleDays, markCapsuleTaken, isCapsuleTaken, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDisplay = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capsuleTakenToday = isCapsuleTaken(today);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-primary-foreground">
                Olá, {profile?.name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-primary-foreground/80 text-sm capitalize">{todayDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Shield className="w-5 h-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-4 bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <div className="flex items-center gap-3">
                <Droplets className="w-8 h-8 text-primary-foreground" />
                <div>
                  <p className="text-primary-foreground/80 text-xs">Água hoje</p>
                  <p className="text-primary-foreground font-bold text-lg">{profile?.water_intake || 0}ml</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-4 bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <div className="flex items-center gap-3">
                <Pill className="w-8 h-8 text-primary-foreground" />
                <div>
                  <p className="text-primary-foreground/80 text-xs">Dias LeveFit</p>
                  <p className="text-primary-foreground font-bold text-lg">{capsuleDays.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 -mt-4">
        {/* Capsule Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 shadow-md bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  capsuleTakenToday ? 'bg-success/20' : 'gradient-primary shadow-glow'
                }`}>
                  <Pill className={`w-6 h-6 ${capsuleTakenToday ? 'text-success' : 'text-primary-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Lembrete LeveFit</h3>
                  <p className="text-sm text-muted-foreground">
                    {capsuleTakenToday ? 'Você já tomou hoje! ✅' : 'Não esqueça de tomar!'}
                  </p>
                </div>
              </div>
              {!capsuleTakenToday && (
                <Button 
                  onClick={() => markCapsuleTaken(today)}
                  className="gradient-primary text-primary-foreground shadow-glow"
                >
                  Tomei!
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* IMC Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <IMCCalculator />
        </motion.div>

        {/* Category Info */}
        {profile?.imc !== undefined && profile.imc > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 shadow-md bg-card">
              <h3 className="font-semibold mb-3 text-foreground">Conteúdo personalizado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Com base no seu IMC, preparamos receitas e dicas especiais para você!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => navigate('/recipes')}
                >
                  <span className="text-xl">🍽️</span>
                  <span className="text-xs">Receitas</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => navigate('/detox')}
                >
                  <span className="text-xl">🍵</span>
                  <span className="text-xs">Detox</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => navigate('/exercises')}
                >
                  <span className="text-xl">🏃</span>
                  <span className="text-xs">Exercícios</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => navigate('/progress')}
                >
                  <span className="text-xl">📈</span>
                  <span className="text-xs">Evolução</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Dashboard;
