import React, { useState, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Scale, Ruler, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const IMCCalculator = forwardRef<HTMLDivElement>((_, ref) => {
  const { profile, updateIMC } = useAuth();
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      await updateIMC(w, h);
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

    return categories[profile.imc_category];
  };

  const categoryInfo = getCategoryInfo();

  return (
    <Card className="p-6 shadow-md bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Calculator className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Calculadora de IMC</h2>
          <p className="text-sm text-muted-foreground">Descubra seu índice de massa corporal</p>
        </div>
      </div>

      <div className="space-y-4">
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

        {profile?.imc !== undefined && profile.imc > 0 && categoryInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Seu IMC</p>
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
          </motion.div>
        )}
      </div>
    </Card>
  );
});

IMCCalculator.displayName = 'IMCCalculator';

export default IMCCalculator;
