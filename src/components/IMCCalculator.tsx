import React, { useState, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Scale, Ruler, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import IMCGuide from './IMCGuide';

const IMCCalculator = forwardRef<HTMLDivElement>((_, ref) => {
  const { profile, updateIMC } = useAuth();
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [showGuide, setShowGuide] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      await updateIMC(w, h);
      setJustCalculated(true);
      setShowGuide(true);
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

        {/* Show current IMC if available */}
        {profile?.imc !== undefined && profile.imc > 0 && categoryInfo && (
          <div className="mb-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Seu IMC atual</p>
              <p className="text-5xl font-bold text-primary font-display">
                {profile.imc.toFixed(1)}
              </p>
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
        )}

        {/* Button to open calculator */}
        <Button 
          onClick={() => setShowCalculator(!showCalculator)} 
          variant={showCalculator ? "outline" : "default"}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            !showCalculator && "gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
          )}
        >
          {showCalculator ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Fechar calculadora
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
