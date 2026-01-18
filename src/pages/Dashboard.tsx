import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Pill, Droplets, LogOut, Shield, Settings, Check, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IMCCalculator from '@/components/IMCCalculator';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import TreatmentReminder from '@/components/TreatmentReminder';
import DailyDietSuggestion from '@/components/DailyDietSuggestion';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import ProgressSummary from '@/components/ProgressSummary';
import { useNavigate } from 'react-router-dom';
import { IMCCategory } from '@/types';
import { differenceInDays } from 'date-fns';

const getKitDuration = (kitType: string | null): number => {
  switch (kitType) {
    case '1_pote': return 30;
    case '3_potes': return 90;
    case '5_potes': return 150;
    default: return 30;
  }
};

const Dashboard = () => {
  const { profile, capsuleDays, markCapsuleTaken, isCapsuleTaken, logout, isAdmin, markOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDisplay = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capsuleTakenToday = isCapsuleTaken(today);
  
  const [showTreatmentReminder, setShowTreatmentReminder] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCapsuleReminder, setShowCapsuleReminder] = useState(true);

  // Check if capsule was taken in the last 24 hours
  const shouldShowCapsuleReminder = useMemo(() => {
    if (capsuleDays.length === 0) return true;
    
    // Sort capsule days and get the most recent one
    const sortedDays = [...capsuleDays].sort().reverse();
    const lastCapsuleDate = sortedDays[0];
    
    if (!lastCapsuleDate) return true;
    
    // Calculate hours since last capsule was taken
    const lastDate = parseISO(lastCapsuleDate);
    const hoursSinceLast = differenceInHours(new Date(), lastDate);
    
    // Show reminder if more than 24 hours have passed
    return hoursSinceLast >= 24;
  }, [capsuleDays]);

  // Check if user should see onboarding (first time login - never completed onboarding)
  useEffect(() => {
    if (profile?.kit_type && profile?.onboarding_completed === false) {
      setShowOnboarding(true);
    }
  }, [profile?.kit_type, profile?.onboarding_completed]);

  const handleOnboardingComplete = async () => {
    await markOnboardingComplete();
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (profile?.treatment_start_date && profile?.kit_type) {
      const startDate = parseISO(profile.treatment_start_date);
      const kitDuration = getKitDuration(profile.kit_type);
      const daysPassed = differenceInDays(new Date(), startDate);
      const remaining = kitDuration - daysPassed;
      
      // Show reminder in last 5 days
      if (remaining >= 0 && remaining <= 5) {
        setDaysRemaining(remaining);
        setShowTreatmentReminder(true);
      }
    }
  }, [profile]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCapsuleTaken = async () => {
    await markCapsuleTaken(today);
    setShowCapsuleReminder(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero p-4 sm:p-6 pb-6 sm:pb-8 rounded-b-3xl shadow-lg safe-area-top">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-primary-foreground">
                Olá, {profile?.name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-primary-foreground/80 text-xs sm:text-sm capitalize">{todayDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground hover:bg-primary-foreground/20 w-9 h-9 sm:w-10 sm:h-10"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/20 w-9 h-9 sm:w-10 sm:h-10"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-3 sm:p-4 bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                <div>
                  <p className="text-primary-foreground/80 text-[10px] sm:text-xs">Água hoje</p>
                  <p className="text-primary-foreground font-bold text-base sm:text-lg">{profile?.water_intake || 0}ml</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-3 sm:p-4 bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                <div>
                  <p className="text-primary-foreground/80 text-[10px] sm:text-xs">Dias LeveFit</p>
                  <p className="text-primary-foreground font-bold text-base sm:text-lg">{capsuleDays.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 -mt-4 max-w-4xl mx-auto">
        {/* Capsule Reminder - Shows if 24h passed since last capsule */}
        <AnimatePresence>
          {shouldShowCapsuleReminder && showCapsuleReminder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 shadow-md bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center gradient-primary shadow-glow">
                      <Pill className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Lembrete LeveFit</h3>
                      <p className="text-sm text-muted-foreground">
                        2 cápsulas/dia, antes das refeições
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCapsuleTaken}
                    className="gradient-primary text-primary-foreground shadow-glow"
                  >
                    Tomei!
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Referral Card - Navigate to dedicated page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card 
            className="p-4 shadow-md bg-gradient-to-br from-amber-500 to-orange-600 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate('/referral')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Indique e Ganhe</h3>
                  <p className="text-sm text-white/80">
                    Convide amigos e ganhe recompensas
                  </p>
                </div>
              </div>
              <Gift className="w-6 h-6 text-white" />
            </div>
          </Card>
        </motion.div>

        {/* Progress Summary - Moved to top */}
        {profile?.imc !== undefined && profile.imc > 0 && (
          <ProgressSummary />
        )}

        {/* IMC Calculator (now "Registro de IMC") */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <IMCCalculator />
        </motion.div>

        {/* Daily Diet Suggestion */}
        {profile?.imc !== undefined && profile.imc > 0 && profile?.imc_category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DailyDietSuggestion imcCategory={profile.imc_category as IMCCategory} />
          </motion.div>
        )}

      </div>

      <WaterReminder />
      {showTreatmentReminder && (
        <TreatmentReminder 
          daysRemaining={daysRemaining} 
          onClose={() => setShowTreatmentReminder(false)} 
        />
      )}
      <Navigation />
      
      {/* Onboarding Tutorial */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTutorial onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
