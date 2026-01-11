import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Scale, Droplets, Pill, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import WaterHistoryChart from '@/components/WaterHistoryChart';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Progress = () => {
  const [activeTab, setActiveTab] = useState('weight');
  const { profile, capsuleDays, progressHistory } = useAuth();
  const navigate = useNavigate();

  // Calculate days since user started (first login/profile creation)
  const daysSinceStart = useMemo(() => {
    if (!profile) return 0;
    const createdAt = parseISO(profile.created_at || new Date().toISOString());
    return differenceInDays(new Date(), createdAt) + 1;
  }, [profile]);

  // Use real progress history data
  const chartData = useMemo(() => {
    if (progressHistory.length === 0) {
      // If no progress history, show current data as single point
      if (profile?.weight && profile.weight > 0) {
        return [{
          date: format(new Date(), 'dd/MM'),
          peso: profile.weight,
        }];
      }
      return [];
    }

    return progressHistory.map(entry => ({
      date: format(parseISO(entry.date), 'dd/MM'),
      peso: entry.weight,
    }));
  }, [progressHistory, profile]);
  
  const stats = useMemo(() => {
    const pesoInicial = progressHistory.length > 0 
      ? progressHistory[0].weight 
      : profile?.weight || 0;
    
    const pesoAtual = progressHistory.length > 0 
      ? progressHistory[progressHistory.length - 1].weight 
      : profile?.weight || 0;

    return {
      pesoInicial,
      pesoAtual,
      diasCapsulas: capsuleDays.length,
      diasDesdeInicio: daysSinceStart,
    };
  }, [progressHistory, profile, capsuleDays, daysSinceStart]);

  const pesoDiff = stats.pesoAtual - stats.pesoInicial;
  
  const getTrend = () => {
    if (pesoDiff < -0.5) return { icon: TrendingDown, color: 'text-success', label: 'Perdendo peso' };
    if (pesoDiff > 0.5) return { icon: TrendingUp, color: 'text-destructive', label: 'Ganhando peso' };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Estável' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  // Calculate consistency percentage
  const consistencyPercentage = useMemo(() => {
    if (daysSinceStart === 0) return 0;
    return Math.round((capsuleDays.length / daysSinceStart) * 100);
  }, [capsuleDays.length, daysSinceStart]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Sua Evolução</h1>
            <p className="text-primary-foreground/80 text-sm">Acompanhe seu progresso real</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Peso
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Hidratação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4 mt-4">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Peso Atual</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.pesoAtual} kg</p>
                <div className={`flex items-center gap-1 mt-1 ${trend.color}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-xs">{trend.label}</span>
                </div>
              </Card>

              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-info" />
                  <span className="text-sm text-muted-foreground">Dias de Jornada</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.diasDesdeInicio}</p>
                <span className="text-xs text-muted-foreground">desde o início</span>
              </Card>

              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Dias LeveFit</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.diasCapsulas}</p>
                <span className="text-xs text-muted-foreground">{consistencyPercentage}% consistência</span>
              </Card>

              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Variação</span>
                </div>
                <p className={`text-2xl font-bold ${pesoDiff < 0 ? 'text-success' : pesoDiff > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {pesoDiff > 0 ? '+' : ''}{pesoDiff.toFixed(1)} kg
                </p>
                <span className="text-xs text-muted-foreground">desde o início</span>
              </Card>
            </motion.div>

            {/* Weight Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-card">
                <h3 className="font-semibold mb-4 text-foreground">Evolução do Peso</h3>
                {chartData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 1', 'dataMax + 1']}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: number) => [`${value} kg`, 'Peso']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorPeso)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <p className="text-center">
                      Adicione seu peso no Dashboard para<br />
                      acompanhar sua evolução
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="water" className="mt-4">
            <WaterHistoryChart />
          </TabsContent>
        </Tabs>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Progress;
