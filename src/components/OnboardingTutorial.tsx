import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Utensils, 
  Droplets, 
  Pill, 
  Leaf, 
  Dumbbell, 
  TrendingUp, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao LeveFit! 🎉',
    description: 'Vamos fazer um tour rápido para você conhecer todas as funcionalidades do app e aproveitar ao máximo sua jornada!',
    icon: <Leaf className="w-8 h-8" />,
    emoji: '🌿',
  },
  {
    id: 'imc',
    title: 'Calculadora de IMC',
    description: 'No Dashboard, você encontra a calculadora de IMC. Digite seu peso e altura para calcular. O app vai personalizar receitas e dicas com base no seu resultado!',
    icon: <Scale className="w-8 h-8" />,
    emoji: '⚖️',
  },
  {
    id: 'daily-diet',
    title: 'Dieta do Dia',
    description: 'Logo abaixo do IMC, você verá sugestões diárias de receitas e sucos detox personalizados. Clique em qualquer um para ver o modo de preparo!',
    icon: <Utensils className="w-8 h-8" />,
    emoji: '🍽️',
  },
  {
    id: 'water',
    title: 'Controle de Água',
    description: 'O card de água mostra quanto você bebeu hoje. No canto inferior direito, aparece um botão flutuante 💧 - clique para adicionar 250ml cada vez!',
    icon: <Droplets className="w-8 h-8" />,
    emoji: '💧',
  },
  {
    id: 'capsule',
    title: 'Lembrete da Cápsula',
    description: 'O card "Lembrete LeveFit" mostra se você tomou a cápsula hoje. Clique em "Tomei!" para marcar. Você pode configurar lembretes automáticos nas configurações!',
    icon: <Pill className="w-8 h-8" />,
    emoji: '💊',
  },
  {
    id: 'detox',
    title: 'Sucos Detox',
    description: 'Na seção Detox (menu inferior), encontre receitas de sucos que ajudam na desintoxicação. Cada receita tem ingredientes e modo de preparo completo!',
    icon: <Leaf className="w-8 h-8" />,
    emoji: '🍵',
  },
  {
    id: 'recipes',
    title: 'Receitas Saudáveis',
    description: 'A seção Receitas tem opções para café da manhã, almoço, jantar e lanches. Todas adaptadas ao seu perfil de IMC para melhores resultados!',
    icon: <Utensils className="w-8 h-8" />,
    emoji: '🥗',
  },
  {
    id: 'exercises',
    title: 'Exercícios',
    description: 'Em Exercícios, você encontra treinos de diferentes níveis. Cada exercício tem duração, calorias queimadas e instruções detalhadas!',
    icon: <Dumbbell className="w-8 h-8" />,
    emoji: '🏃',
  },
  {
    id: 'progress',
    title: 'Acompanhe sua Evolução',
    description: 'A seção Progresso mostra gráficos do seu peso e IMC ao longo do tempo. Registre atualizações regularmente para ver sua evolução!',
    icon: <TrendingUp className="w-8 h-8" />,
    emoji: '📈',
  },
  {
    id: 'settings',
    title: 'Configurações',
    description: 'Em Configurações (ícone de engrenagem), você pode ajustar lembretes de água e cápsula, ativar notificações push e alterar seu kit se necessário.',
    icon: <Settings className="w-8 h-8" />,
    emoji: '⚙️',
  },
  {
    id: 'finish',
    title: 'Tudo pronto! 🚀',
    description: 'Agora você conhece todas as funcionalidades do LeveFit! Comece calculando seu IMC e explore as receitas personalizadas. Boa jornada!',
    icon: <CheckCircle2 className="w-8 h-8" />,
    emoji: '✅',
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4 pb-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-5xl">{step.emoji}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-foreground mb-3">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-center leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-6 bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 gradient-primary text-primary-foreground shadow-glow ${
                  isFirstStep ? 'w-full' : ''
                }`}
              >
                {isLastStep ? (
                  <>
                    Começar!
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular tutorial
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingTutorial;
