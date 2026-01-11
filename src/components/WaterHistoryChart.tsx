import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Droplets, TrendingUp, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WaterHistoryEntry {
  date: string;
  total_intake: number;
}

const WaterHistoryChart = () => {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<WaterHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const waterGoal = 2000;

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('water_intake_history')
        .select('date, total_intake')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });

      if (data && !error) {
        setHistory(data);
      }
      setIsLoading(false);
    };

    fetchHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('water-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_intake_history',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Format data for chart
  const chartData = history.map(entry => ({
    date: format(parseISO(entry.date), 'dd/MM', { locale: ptBR }),
    fullDate: format(parseISO(entry.date), "dd 'de' MMMM", { locale: ptBR }),
    intake: entry.total_intake,
    goal: waterGoal,
    percentage: Math.round((entry.total_intake / waterGoal) * 100),
  }));

  // Calculate statistics
  const totalDays = history.length;
  const daysMetGoal = history.filter(h => h.total_intake >= waterGoal).length;
  const averageIntake = totalDays > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.total_intake, 0) / totalDays)
    : 0;
  const consistencyRate = totalDays > 0 ? Math.round((daysMetGoal / totalDays) * 100) : 0;
  const todayIntake = profile?.water_intake || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-semibold text-foreground">{payload[0]?.payload?.fullDate}</p>
          <p className="text-primary">
            <Droplets className="inline w-4 h-4 mr-1" />
            {payload[0]?.value}ml consumidos
          </p>
          <p className="text-muted-foreground text-sm">
            {payload[0]?.payload?.percentage}% da meta
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-lg font-bold text-foreground">{todayIntake}ml</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Média</p>
                <p className="text-lg font-bold text-foreground">{averageIntake}ml</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consistência</p>
                <p className="text-lg font-bold text-foreground">{consistencyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta atingida</p>
                <p className="text-lg font-bold text-foreground">{daysMetGoal} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Histórico de Hidratação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${value / 1000}L`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    y={waterGoal} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Meta 2L', 
                      position: 'right',
                      fill: 'hsl(var(--primary))',
                      fontSize: 10
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="intake"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#waterGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Droplets className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum registro de hidratação ainda</p>
              <p className="text-sm text-muted-foreground">
                Use o botão de água para registrar seu consumo diário
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-l-4 border-l-primary">
        <CardContent className="p-4">
          <h4 className="font-semibold text-foreground mb-2">💡 Dica de Hidratação</h4>
          <p className="text-sm text-muted-foreground">
            {consistencyRate >= 80 
              ? "Excelente! Você está mantendo uma ótima consistência. Continue assim! 🎉"
              : consistencyRate >= 50
                ? "Bom progresso! Tente manter o consumo mais regular para atingir a meta diária."
                : "Dica: Configure lembretes de água para criar o hábito de beber regularmente!"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterHistoryChart;
