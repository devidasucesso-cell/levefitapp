import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Utensils, 
  Droplets, 
  Bell, 
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Dumbbell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface IMCGuideProps {
  imcCategory?: string | null;
  onClose?: () => void;
}

const IMCGuide: React.FC<IMCGuideProps> = ({ imcCategory, onClose }) => {
  const navigate = useNavigate();

  const getPersonalizedTips = () => {
    switch (imcCategory) {
      case 'underweight':
        return {
          title: 'Foco em Ganho Saudável',
          tips: [
            'Aumente a ingestão calórica com alimentos nutritivos',
            'Inclua proteínas em todas as refeições',
            'Faça lanches saudáveis entre as refeições principais'
          ],
          recipeType: 'nutritivas'
        };
      case 'normal':
        return {
          title: 'Manutenção do Peso Ideal',
          tips: [
            'Continue com uma alimentação equilibrada',
            'Mantenha a rotina de exercícios',
            'Monitore seu peso semanalmente'
          ],
          recipeType: 'balanceadas'
        };
      case 'overweight':
        return {
          title: 'Foco em Emagrecimento',
          tips: [
            'Reduza carboidratos simples',
            'Aumente o consumo de fibras e vegetais',
            'Pratique atividades físicas regularmente'
          ],
          recipeType: 'low-carb'
        };
      case 'obese':
        return {
          title: 'Programa Intensivo',
          tips: [
            'Siga rigorosamente o tratamento LeveFit',
            'Evite alimentos ultraprocessados',
            'Consulte um profissional de saúde'
          ],
          recipeType: 'leves'
        };
      default:
        return {
          title: 'Próximos Passos',
          tips: [
            'Calcule seu IMC para recomendações personalizadas',
            'Configure lembretes de cápsula e água',
            'Explore receitas e exercícios'
          ],
          recipeType: 'saudáveis'
        };
    }
  };

  const personalizedTips = getPersonalizedTips();

  const steps = [
    {
      icon: Bell,
      title: '1. Configure seus lembretes',
      description: 'Ative notificações push para lembrar de tomar sua cápsula e beber água',
      action: () => navigate('/settings'),
      actionLabel: 'Configurar'
    },
    {
      icon: Utensils,
      title: `2. Explore receitas ${personalizedTips.recipeType}`,
      description: 'Veja receitas personalizadas para seu objetivo',
      action: () => navigate('/recipes'),
      actionLabel: 'Ver Receitas'
    },
    {
      icon: Dumbbell,
      title: '3. Inicie os exercícios',
      description: 'Exercícios adaptados ao seu nível de condicionamento',
      action: () => navigate('/exercises'),
      actionLabel: 'Ver Exercícios'
    },
    {
      icon: Droplets,
      title: '4. Hidrate-se bem',
      description: 'Beba pelo menos 2L de água por dia para melhores resultados',
      action: () => navigate('/detox'),
      actionLabel: 'Ver Detox'
    },
    {
      icon: TrendingUp,
      title: '5. Acompanhe seu progresso',
      description: 'Registre seu peso semanalmente para ver sua evolução',
      action: () => navigate('/progress'),
      actionLabel: 'Ver Progresso'
    }
  ];

  return (
    <Card className="p-6 bg-card shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            {personalizedTips.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Siga estes passos para melhores resultados
          </p>
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Dicas para você
        </h3>
        <ul className="space-y-2">
          {personalizedTips.tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary mt-0.5">•</span>
              {tip}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
            onClick={step.action}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{step.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-warning">💡 Importante:</strong> Para receber lembretes 
          mesmo com o app fechado, ative as notificações push nas configurações.
        </p>
      </div>

      {onClose && (
        <Button 
          onClick={onClose}
          variant="outline"
          className="w-full mt-4"
        >
          Entendi, começar agora!
        </Button>
      )}
    </Card>
  );
};

export default IMCGuide;