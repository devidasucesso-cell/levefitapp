import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Pill, Droplets, Dumbbell, ChefHat, GlassWater, Trophy, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoalProgress } from '@/hooks/useGoalProgress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const GoalTracker = () => {
  const { 
    capsuleDays, capsuleTarget,
    hydrationDays, hydrationTarget,
    exercisesCompleted, exerciseTarget,
    recipesCompleted, recipeTarget,
    detoxCompleted, detoxTarget,
    totalProgress,
    isLoading 
  } = useGoalProgress();
  const navigate = useNavigate();

  const goals = [
    {
      id: 'capsule',
      icon: <Pill className="w-4 h-4" />,
      name: 'Cápsulas',
      current: capsuleDays,
      target: capsuleTarget,
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-green-500/10',
      route: '/dashboard',
    },
    {
      id: 'hydration',
      icon: <Droplets className="w-4 h-4" />,
      name: 'Hidratação',
      current: hydrationDays,
      target: hydrationTarget,
      color: 'from-blue-400 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      route: '/progress',
    },
    {
      id: 'exercise',
      icon: <Dumbbell className="w-4 h-4" />,
      name: 'Exercícios',
      current: exercisesCompleted,
      target: exerciseTarget,
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-500/10',
      route: '/exercises',
    },
    {
      id: 'recipe',
      icon: <ChefHat className="w-4 h-4" />,
      name: 'Receitas',
      current: recipesCompleted,
      target: recipeTarget,
      color: 'from-pink-400 to-rose-600',
      bgColor: 'bg-pink-500/10',
      route: '/recipes',
    },
    {
      id: 'detox',
      icon: <GlassWater className="w-4 h-4" />,
      name: 'Detox',
      current: detoxCompleted,
      target: detoxTarget,
      color: 'from-purple-400 to-violet-600',
      bgColor: 'bg-purple-500/10',
      route: '/detox',
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-4 bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Metas do Prêmio</h3>
            <p className="text-[10px] text-muted-foreground">Complete 75% para ganhar</p>
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

      <div className="space-y-3">
        {goals.map((goal, index) => {
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = goal.current >= goal.target;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(goal.route)}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isComplete ? `bg-gradient-to-br ${goal.color}` : goal.bgColor
              )}>
                <span className={isComplete ? "text-white" : "text-muted-foreground"}>
                  {goal.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground truncate">{goal.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1.5"
                />
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {totalProgress >= 75 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-3 border-t border-border"
        >
          <p className="text-center text-sm text-success font-medium">
            🎉 Parabéns! Você desbloqueou a promoção!
          </p>
        </motion.div>
      )}
    </Card>
  );
};

export default GoalTracker;
