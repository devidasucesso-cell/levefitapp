import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO, differenceInDays, subDays } from 'date-fns';

interface WaterStreakData {
  currentStreak: number;
  totalDaysMetGoal: number;
  isLoading: boolean;
}

export const useWaterStreak = (): WaterStreakData => {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<{ date: string; total_intake: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const waterGoal = profile?.water_goal || 2000;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('water_intake_history')
        .select('date, total_intake')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data && !error) {
        setHistory(data);
      }
      setIsLoading(false);
    };

    fetchHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('water-streak-changes')
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

  const { currentStreak, totalDaysMetGoal } = useMemo(() => {
    if (history.length === 0) {
      return { currentStreak: 0, totalDaysMetGoal: 0 };
    }

    // Count total days that met the goal
    const daysMetGoal = history.filter(h => h.total_intake >= waterGoal);
    const totalDaysMetGoal = daysMetGoal.length;

    // Calculate current streak (consecutive days meeting goal, starting from most recent)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort by date descending (most recent first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Check consecutive days from today/yesterday backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const dayEntry = sortedHistory.find(h => h.date === checkDateStr);
      
      if (dayEntry && dayEntry.total_intake >= waterGoal) {
        currentStreak++;
      } else if (i === 0) {
        // If today doesn't have data yet, check from yesterday
        continue;
      } else {
        // Streak broken
        break;
      }
    }

    return { currentStreak, totalDaysMetGoal };
  }, [history, waterGoal]);

  return {
    currentStreak,
    totalDaysMetGoal,
    isLoading,
  };
};
