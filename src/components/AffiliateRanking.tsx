import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface RankingEntry {
  rank_position: number;
  affiliate_name: string;
  affiliate_code: string;
  sales_count: number;
  total_commission: number;
}

const positionIcons: Record<number, React.ReactNode> = {
  1: <Trophy className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Award className="w-5 h-5 text-amber-600" />,
};

const AffiliateRanking = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data, error } = await supabase.rpc('get_monthly_affiliate_ranking');
        if (error) throw error;
        setRanking((data as RankingEntry[]) || []);
      } catch (err) {
        console.error('Error fetching ranking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const monthName = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-48" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return null; // Don't show if no data
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">
            🏆 Top Afiliados — <span className="capitalize">{monthName}</span>
          </h3>
        </div>

        <div className="space-y-2">
          {ranking.map((entry) => (
            <div
              key={entry.affiliate_code}
              className={`flex items-center justify-between p-2.5 rounded-lg ${
                entry.rank_position === 1
                  ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800'
                  : entry.rank_position <= 3
                  ? 'bg-muted/50 border border-border'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-background">
                  {positionIcons[entry.rank_position] || (
                    <span className="text-xs font-bold text-muted-foreground">
                      {entry.rank_position}º
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.affiliate_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {entry.affiliate_code}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {entry.sales_count} {entry.sales_count === 1 ? 'venda' : 'vendas'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default AffiliateRanking;
