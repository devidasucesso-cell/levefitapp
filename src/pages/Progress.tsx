import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Scale, Droplets, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';

const Progress = () => {
  const { profile, capsuleDays } = useAuth();
  const navigate = useNavigate();

  // Generate sample data for visualization
  const generateChartData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const baseWeight = profile?.weight || 70;
      const variation = Math.sin(i * 0.3) * 0.5 + (Math.random() - 0.5) * 0.3;
      data.push({
        date: format(date, 'dd/MM'),
        peso: Math.round((baseWeight - (i * 0.05) + variation) * 10) / 10,
        agua: Math.round(1500 + Math.random() * 1000),
      });
    }
    return data;
  };

  const chartData = generateChartData();
  
  const stats = {
    pesoInicial: chartData[0]?.peso || 0,
    pesoAtual: chartData[chartData.length - 1]?.peso || 0,
    mediaAgua: Math.round(chartData.reduce((acc, d) => acc + d.agua, 0) / chartData.length),
    diasCapsulas: capsuleDays.length,
  };

  const pesoDiff = stats.pesoAtual - stats.pesoInicial;
  const getTrend = () => {
    if (pesoDiff < -0.5) return { icon: TrendingDown, color: 'text-success', label: 'Perdendo peso' };
    if (pesoDiff > 0.5) return { icon: TrendingUp, color: 'text-destructive', label: 'Ganhando peso' };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Estável' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

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
            <p className="text-primary-foreground/80 text-sm">Acompanhe seu progresso</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
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
              <Droplets className="w-5 h-5 text-info" />
              <span className="text-sm text-muted-foreground">Média Água</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.mediaAgua}ml</p>
            <span className="text-xs text-muted-foreground">por dia</span>
          </Card>

          <Card className="p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Dias LeveFit</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.diasCapsulas}</p>
            <span className="text-xs text-muted-foreground">dias consistentes</span>
          </Card>

          <Card className="p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Variação</span>
            </div>
            <p className={`text-2xl font-bold ${pesoDiff < 0 ? 'text-success' : pesoDiff > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {pesoDiff > 0 ? '+' : ''}{pesoDiff.toFixed(1)} kg
            </p>
            <span className="text-xs text-muted-foreground">últimos 30 dias</span>
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
          </Card>
        </motion.div>

        {/* Water Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Consumo de Água</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAgua" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0}/>
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
                  />
                  <Area 
                    type="monotone" 
                    dataKey="agua" 
                    stroke="hsl(var(--info))" 
                    fillOpacity={1} 
                    fill="url(#colorAgua)" 
                    strokeWidth={2}
                    name="Água (ml)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Progress;
