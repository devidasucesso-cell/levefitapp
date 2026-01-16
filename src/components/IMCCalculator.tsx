import React, { useState, forwardRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Scale, Ruler, Calculator, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import IMCGuide from './IMCGuide';
import { differenceInDays, parseISO } from 'date-fns';

const IMCCalculator = forwardRef<HTMLDivElement>((_, ref) => {
  const { profile, updateIMC, progressHistory } = useAuth();
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [showGuide, setShowGuide] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showIMCDetails, setShowIMCDetails] = useState(false);

  // Calculate days since last IMC update
  const { daysSinceLastUpdate, canUpdate, imcVariation } = useMemo(() => {
    if (progressHistory.length === 0) {
      return { daysSinceLastUpdate: null, canUpdate: true, imcVariation: null };
    }

    // Get last two entries to calculate variation
    const lastEntry = progressHistory[progressHistory.length - 1];
    const previousEntry = progressHistory.length > 1 ? progressHistory[progressHistory.length - 2] : null;

    const lastUpdateDate = parseISO(lastEntry.date);
    const daysSince = differenceInDays(new Date(), lastUpdateDate);
    
    // Calculate IMC variation
    let variation = null;
    if (previousEntry) {
      variation = lastEntry.imc - previousEntry.imc;
    }

    return { 
      daysSinceLastUpdate: daysSince, 
      canUpdate: daysSince >= 7,
      imcVariation: variation
    };
  }, [progressHistory]);

  const daysUntilNextUpdate = daysSinceLastUpdate !== null ? Math.max(0, 7 - daysSinceLastUpdate) : 0;

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      await updateIMC(w, h);
      setJustCalculated(true);
      setShowGuide(true);
      setShowCalculator(false);
    }
  };

  const getCategoryInfo = () => {
    if (!profile?.imc) return null;
    
    const categories = {
      underweight: { label: 'Abaixo do peso', color: 'bg-info', description: 'Receitas para ganho saudável' },
      normal: { label: 'Peso normal', color: 'bg-success', description: 'Receitas para manutenção' },
      overweight: { label: 'Sobrepeso', color: 'bg-warning', description: 'Receitas para emagrecimento' },
      obese: { label: 'Obesidade', color: 'bg-destructive', description: 'Receitas leves e saudáveis' },
    };

    return categories[profile.imc_category as keyof typeof categories];
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div ref={ref} className="space-y-4">
      <Card className="p-6 shadow-md bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">Registro de IMC</h2>
            <p className="text-sm text-muted-foreground">Acompanhe seu índice de massa corporal</p>
          </div>
        </div>

        {/* IMC Current Button - opens details */}
        {profile?.imc !== undefined && profile.imc > 0 && (
          <Button 
            onClick={() => setShowIMCDetails(!showIMCDetails)} 
            variant="outline"
            className="w-full flex items-center justify-between gap-2 mb-4"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <span>IMC atual: <strong>{profile.imc.toFixed(1)}</strong></span>
              {imcVariation !== null && (
                <span className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  imcVariation < 0 ? "text-success" : imcVariation > 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {imcVariation < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      {imcVariation.toFixed(1)}
                    </>
                  ) : imcVariation > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      +{imcVariation.toFixed(1)}
                    </>
                  ) : null}
                </span>
              )}
            </div>
            {showIMCDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Expandable IMC Details Section */}
        <AnimatePresence>
          {showIMCDetails && profile?.imc !== undefined && profile.imc > 0 && categoryInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mb-4 space-y-4 pb-4 border-b">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Seu IMC atual</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-5xl font-bold text-primary font-display">
                      {profile.imc.toFixed(1)}
                    </p>
                    {imcVariation !== null && (
                      <div className={cn(
                        "flex items-center gap-1 text-xl font-bold",
                        imcVariation < 0 ? "text-success" : imcVariation > 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {imcVariation < 0 ? (
                          <>
                            <TrendingDown className="w-6 h-6" />
                            <span>{imcVariation.toFixed(1)}</span>
                          </>
                        ) : imcVariation > 0 ? (
                          <>
                            <TrendingUp className="w-6 h-6" />
                            <span>+{imcVariation.toFixed(1)}</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {imcVariation !== null && (
                    <p className={cn(
                      "text-sm mt-1",
                      imcVariation < 0 ? "text-success" : imcVariation > 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {imcVariation < 0 ? "Você perdeu IMC! Continue assim!" : imcVariation > 0 ? "Seu IMC aumentou" : ""}
                    </p>
                  )}
                </div>

                <div className={cn(
                  "p-4 rounded-2xl text-center",
                  categoryInfo.color,
                  "text-white"
                )}>
                  <p className="font-bold text-lg">{categoryInfo.label}</p>
                  <p className="text-sm opacity-90">{categoryInfo.description}</p>
                </div>

                {/* IMC Scale */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Abaixo</span>
                    <span>Normal</span>
                    <span>Sobrepeso</span>
                    <span>Obesidade</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-info" />
                    <div className="flex-1 bg-success" />
                    <div className="flex-1 bg-warning" />
                    <div className="flex-1 bg-destructive" />
                  </div>
                  <div className="relative h-2">
                    <motion.div
                      initial={{ left: '0%' }}
                      animate={{ 
                        left: `${Math.min(Math.max((profile.imc - 15) / 25 * 100, 0), 100)}%` 
                      }}
                      className="absolute w-4 h-4 -top-1 -ml-2 rounded-full bg-foreground border-2 border-card shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button to open calculator - disabled if less than 7 days */}
        <Button 
          onClick={() => canUpdate && setShowCalculator(!showCalculator)} 
          variant={showCalculator ? "outline" : "default"}
          disabled={!canUpdate && !showCalculator}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            !showCalculator && canUpdate && "gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity",
            !canUpdate && !showCalculator && "opacity-70"
          )}
        >
          {showCalculator ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Fechar calculadora
            </>
          ) : !canUpdate ? (
            <>
              <Lock className="w-4 h-4" />
              Aguarde {daysUntilNextUpdate} dia{daysUntilNextUpdate !== 1 ? 's' : ''} para atualizar
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Registre seu IMC a cada 7 dias
            </>
          )}
        </Button>

        {/* Expandable Calculator Section */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4 border-t mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2 text-foreground">
                      <Scale className="w-4 h-4 text-primary" />
                      Peso (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-secondary border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2 text-foreground">
                      <Ruler className="w-4 h-4 text-primary" />
                      Altura (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-secondary border-0"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
                >
                  Calcular IMC
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Guide Button - only show if IMC exists */}
        {profile?.imc !== undefined && profile.imc > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            {showGuide ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar próximos passos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver próximos passos
              </>
            )}
          </Button>
        )}
      </Card>

      {/* Guide Section */}
      <AnimatePresence>
        {showGuide && profile?.imc !== undefined && profile.imc > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IMCGuide 
              imcCategory={profile.imc_category} 
              onClose={() => setShowGuide(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

IMCCalculator.displayName = 'IMCCalculator';

export default IMCCalculator;
