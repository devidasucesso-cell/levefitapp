import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Gift, Tag, Cake, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface PointsHistory {
  id: string;
  action: string;
  points: number;
  description: string | null;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  type: string;
  image_url: string | null;
}

const actionLabels: Record<string, { label: string; icon: string }> = {
  login: { label: 'Login diário', icon: '🔑' },
  weight_update: { label: 'Atualização de peso', icon: '⚖️' },
  purchase: { label: 'Compra na loja', icon: '🛒' },
  redemption: { label: 'Resgate de recompensa', icon: '🎁' },
};

const rewardIcons: Record<string, React.ReactNode> = {
  discount: <Tag className="w-6 h-6" />,
  recipe: <Cake className="w-6 h-6" />,
  gift: <Gift className="w-6 h-6" />,
};

const Points = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    const [pointsRes, historyRes, rewardsRes] = await Promise.all([
      supabase.from('user_points').select('points').eq('user_id', user.id).maybeSingle(),
      supabase.from('points_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('rewards').select('*').eq('is_active', true).order('points_cost', { ascending: true }),
    ]);

    setTotalPoints((pointsRes.data as any)?.points ?? 0);
    setHistory((historyRes.data as any[]) ?? []);
    setRewards((rewardsRes.data as any[]) ?? []);
    setLoading(false);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user || totalPoints < reward.points_cost) {
      toast({ title: 'Pontos insuficientes', description: `Você precisa de ${reward.points_cost} pontos.`, variant: 'destructive' });
      return;
    }

    setRedeeming(reward.id);
    try {
      // Deduct points
      const newTotal = totalPoints - reward.points_cost;
      const { error: updateErr } = await supabase
        .from('user_points')
        .update({ points: newTotal })
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;

      // Record history
      await supabase.from('points_history').insert({
        user_id: user.id,
        action: 'redemption',
        points: -reward.points_cost,
        description: `Resgatou: ${reward.name}`,
      });

      // Record redemption
      await supabase.from('redeemed_rewards').insert({
        user_id: user.id,
        reward_id: reward.id,
      });

      setTotalPoints(newTotal);
      toast({ title: '🎉 Resgate realizado!', description: `Você resgatou "${reward.name}" com sucesso!` });
      fetchData();
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível resgatar. Tente novamente.', variant: 'destructive' });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero p-6 pb-8 rounded-b-3xl shadow-lg safe-area-top">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Meus Pontos</h1>
            <p className="text-primary-foreground/80 text-sm">Ganhe e troque por recompensas</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Card className="bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
            <CardContent className="p-6 text-center">
              <p className="text-primary-foreground/80 text-sm mb-1">Total de pontos</p>
              <p className="text-5xl font-bold text-primary-foreground">{totalPoints}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(Math.min(5, Math.floor(totalPoints / 20)))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="p-4 space-y-4 -mt-4 max-w-4xl mx-auto">
        {/* Como ganhar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Como ganhar pontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>🔑 Login diário</span>
              <span className="font-bold text-primary">+10 pts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>⚖️ Atualizar peso</span>
              <span className="font-bold text-primary">+5 pts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>🛒 Comprar na loja</span>
              <span className="font-bold text-primary">+50 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Recompensas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Trocar Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {rewardIcons[reward.type] || <Gift className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{reward.name}</p>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={totalPoints < reward.points_cost || redeeming === reward.id}
                  onClick={() => handleRedeem(reward)}
                  className="shrink-0"
                >
                  {redeeming === reward.id ? '...' : `${reward.points_cost} pts`}
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum ponto registrado ainda</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => {
                  const actionInfo = actionLabels[entry.action] || { label: entry.action, icon: '📌' };
                  return (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{actionInfo.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{actionInfo.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${entry.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Points;
