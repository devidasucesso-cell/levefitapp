import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Pill, Droplets, Dumbbell, ChefHat, GlassWater, Trophy, ChevronRight, Lock, CheckCircle2, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoalProgress } from '@/hooks/useGoalProgress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PrizeBanner from './PrizeBanner';

const GoalTracker = () => {
  const navigate = useNavigate();
  const { 
    capsuleDays, 
    hydrationDays, 
    exercisesCompleted, 
    recipesCompleted, 
    detoxCompleted, 
    totalProgress, 
    isLoading,
    targets 
  } = useGoalProgress();

  if (isLoading) {
    return (
      <Card className="p-4 bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  // Determine current week/phase
  const isWeek1Complete = totalProgress >= 30;
  const isWeek2Complete = totalProgress >= 55;
  const isWeek3Complete = totalProgress >= 75;

  const weeks = [
    {
      id: 1,
      title: "SEMANA 1 — ADAPTAÇÃO",
      subtitle: "Criar hábito",
      status: isWeek1Complete ? 'completed' : 'current',
      progress: Math.min(totalProgress / 30 * 100, 100),
      message: "Seu corpo está se adaptando. Continue.",
      goals: [
        { 
          icon: <Pill className="w-4 h-4" />, 
          text: `Tomar cápsulas (${Math.min(capsuleDays, targets.week1.capsule)}/${targets.week1.capsule})`,
          completed: capsuleDays >= targets.week1.capsule
        },
        { 
          icon: <Droplets className="w-4 h-4" />, 
          text: `Registrar água (${Math.min(hydrationDays, targets.week1.hydration)}/${targets.week1.hydration})`,
          completed: hydrationDays >= targets.week1.hydration
        },
        { 
          icon: <Dumbbell className="w-4 h-4" />, 
          text: `Exercícios leves (${Math.min(exercisesCompleted, targets.week1.exercise)}/${targets.week1.exercise})`,
          completed: exercisesCompleted >= targets.week1.exercise
        }
      ]
    },
    {
      id: 2,
      title: "SEMANA 2 — CONSTÂNCIA",
      subtitle: "Sentir resultado",
      status: !isWeek1Complete ? 'locked' : isWeek2Complete ? 'completed' : 'current',
      progress: isWeek1Complete ? Math.min((totalProgress - 30) / 25 * 100, 100) : 0,
      message: "Seu corpo já começou a responder.",
      goals: [
        { 
          icon: <Pill className="w-4 h-4" />, 
          text: `Cápsulas (${Math.min(capsuleDays, targets.week2.capsule)}/${targets.week2.capsule})`,
          completed: capsuleDays >= targets.week2.capsule
        },
        { 
          icon: <Droplets className="w-4 h-4" />, 
          text: `Água (${Math.min(hydrationDays, targets.week2.hydration)}/${targets.week2.hydration})`,
          completed: hydrationDays >= targets.week2.hydration
        },
        { 
          icon: <Dumbbell className="w-4 h-4" />, 
          text: `Exercícios acumulados (${Math.min(exercisesCompleted, targets.week2.exercise)}/${targets.week2.exercise})`,
          completed: exercisesCompleted >= targets.week2.exercise
        },
        { 
          icon: <ChefHat className="w-4 h-4" />, 
          text: `Receita ou Detox (${Math.min(recipesCompleted + detoxCompleted, targets.week2.recipeDetox)}/${targets.week2.recipeDetox})`,
          completed: (recipesCompleted + detoxCompleted) >= targets.week2.recipeDetox
        }
      ]
    },
    {
      id: 3,
      title: "SEMANA 3 — TRANSFORMAÇÃO",
      subtitle: "Evolução visível",
      status: !isWeek2Complete ? 'locked' : isWeek3Complete ? 'completed' : 'current',
      progress: isWeek2Complete ? Math.min((totalProgress - 55) / 20 * 100, 100) : 0,
      message: "Seu corpo já está em transformação.",
      goals: [
        { 
          icon: <Pill className="w-4 h-4" />, 
          text: `Cápsulas (${Math.min(capsuleDays, targets.week3.capsule)}/${targets.week3.capsule})`,
          completed: capsuleDays >= targets.week3.capsule
        },
        { 
          icon: <Droplets className="w-4 h-4" />, 
          text: `Água (${Math.min(hydrationDays, targets.week3.hydration)}/${targets.week3.hydration})`,
          completed: hydrationDays >= targets.week3.hydration
        },
        { 
          icon: <Dumbbell className="w-4 h-4" />, 
          text: `Exercícios total (${Math.min(exercisesCompleted, targets.week3.exercise)}/${targets.week3.exercise})`,
          completed: exercisesCompleted >= targets.week3.exercise
        },
        { 
          icon: <Trophy className="w-4 h-4" />, 
          text: "Progresso 75%+",
          completed: totalProgress >= 75
        }
      ]
    }
  ];

  return (
    <Card className="p-4 bg-card space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Conquistas por Semana</h3>
            <p className="text-[10px] text-muted-foreground">Siga o plano ideal</p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-lg font-bold",
            totalProgress >= 75 ? "text-success" : "text-foreground"
          )}>
            {totalProgress}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {weeks.map((week) => (
          <motion.div
            key={week.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border p-4 transition-all",
              week.status === 'current' ? "bg-accent/5 border-primary/20 shadow-sm" : 
              week.status === 'completed' ? "bg-success/5 border-success/20" : 
              "bg-muted/30 border-border opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className={cn("font-bold text-sm", 
                  week.status === 'completed' ? "text-success" : 
                  week.status === 'current' ? "text-primary" : "text-muted-foreground"
                )}>
                  {week.title}
                </h4>
                <p className="text-xs text-muted-foreground">{week.subtitle}</p>
              </div>
              {week.status === 'locked' && <Lock className="w-4 h-4 text-muted-foreground" />}
              {week.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>

            {/* Progress Bar for the Week */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Progresso da fase</span>
                <span>{Math.round(week.progress)}%</span>
              </div>
              <Progress value={week.progress} className="h-1.5" />
            </div>

            {/* Goals List */}
            <div className="space-y-2">
              {week.goals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border",
                    goal.completed ? "bg-success text-white border-success" : "bg-background text-muted-foreground border-border"
                  )}>
                    {goal.completed ? <CheckCircle2 className="w-3 h-3" /> : goal.icon}
                  </div>
                  <span className={cn(goal.completed && "text-muted-foreground line-through")}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Motivational Message - Only if current or completed */}
            {week.status !== 'locked' && (
              <div className="mt-3 pt-3 border-t border-border/50 text-center">
                <p className="text-xs italic text-muted-foreground">"{week.message}"</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Prize Banner Component - Shown when Week 3 is complete (75%+) */}
      {isWeek3Complete && (
        <PrizeBanner />
      )}
    </Card>
  );
};

export default GoalTracker;
