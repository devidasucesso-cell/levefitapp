import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { IMCCategory, NotificationSettings } from '@/types';

type SimpleProgressEntry = {
  date: string;
  weight: number;
  imc: number;
};

interface Profile {
  id: string;
  user_id: string;
  name: string;
  weight: number;
  height: number;
  imc: number;
  imc_category: IMCCategory;
  water_intake: number;
  water_goal: number;
  created_at: string;
  is_approved: boolean;
  kit_type: string | null;
  treatment_start_date: string | null;
  code_validated: boolean;
  onboarding_completed: boolean;
  push_prompt_shown: boolean;
  last_active_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isApproved: boolean;
  isCodeValidated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateIMC: (weight: number, height: number) => Promise<void>;
  addWaterIntake: () => Promise<void>;
  resetWaterIntake: () => Promise<void>;
  markCapsuleTaken: (date: string) => Promise<void>;
  isCapsuleTaken: (date: string) => boolean;
  capsuleDays: string[];
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  progressHistory: SimpleProgressEntry[];
  addProgressEntry: (entry: SimpleProgressEntry) => Promise<void>;
  refreshProfile: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  markPushPromptShown: () => Promise<void>;
}

const defaultNotificationSettings: NotificationSettings = {
  capsuleReminder: true,
  capsuleTime: '08:00',
  waterReminder: true,
  waterInterval: 60,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const calculateIMCCategory = (imc: number): IMCCategory => {
  if (imc < 18.5) return 'underweight';
  if (imc < 25) return 'normal';
  if (imc < 30) return 'overweight';
  return 'obese';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [capsuleDays, setCapsuleDays] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [progressHistory, setProgressHistory] = useState<SimpleProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user has admin role
  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!data && !error);
  };

  // Fetch profile data
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data && !error) {
      setProfile({
        ...data,
        weight: Number(data.weight) || 0,
        height: Number(data.height) || 0,
        imc: Number(data.imc) || 0,
        imc_category: (data.imc_category as IMCCategory) || 'normal',
        water_goal: data.water_goal ?? 2000,
        created_at: data.created_at,
        is_approved: data.is_approved ?? false,
        kit_type: data.kit_type ?? null,
        treatment_start_date: data.treatment_start_date ?? null,
        code_validated: data.code_validated ?? false,
        onboarding_completed: data.onboarding_completed ?? false,
        push_prompt_shown: data.push_prompt_shown ?? false,
        last_active_at: data.last_active_at ?? null,
      });

      // Update last_active_at silently
      supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', userId)
        .then();
    }
  };

  // Fetch capsule days
  const fetchCapsuleDays = async (userId: string) => {
    const { data, error } = await supabase
      .from('capsule_days')
      .select('date')
      .eq('user_id', userId);

    if (data && !error) {
      setCapsuleDays(data.map(d => d.date));
    }
  };

  // Fetch notification settings
  const fetchNotificationSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data && !error) {
      setNotificationSettings({
        capsuleReminder: data.capsule_reminder,
        capsuleTime: data.capsule_time?.slice(0, 5) || '08:00',
        waterReminder: data.water_reminder,
        waterInterval: data.water_interval,
      });
    }
  };

  // Fetch progress history
  const fetchProgressHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('progress_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (data && !error) {
      setProgressHistory(data.map(p => ({
        date: p.date,
        weight: Number(p.weight),
        imc: Number(p.imc),
      })));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await Promise.all([
        fetchProfile(user.id),
        fetchCapsuleDays(user.id),
        fetchNotificationSettings(user.id),
        fetchProgressHistory(user.id),
        checkAdminRole(user.id),
      ]);
    }
  };

  // Check daily water reset when profile changes
  useEffect(() => {
    if (profile && user) {
      checkDailyWaterReset();
    }
  }, [profile?.created_at, user?.id]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Defer Supabase calls with setTimeout to avoid deadlock
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchCapsuleDays(session.user.id);
          fetchNotificationSettings(session.user.id);
          fetchProgressHistory(session.user.id);
          checkAdminRole(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setCapsuleDays([]);
        setNotificationSettings(defaultNotificationSettings);
        setProgressHistory([]);
        setIsAdmin(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchCapsuleDays(session.user.id),
          fetchNotificationSettings(session.user.id),
          fetchProgressHistory(session.user.id),
          checkAdminRole(session.user.id),
        ]).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProfile(user.id);
        }
      )
      .subscribe();

    const capsuleChannel = supabase
      .channel('capsule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'capsule_days',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCapsuleDays(user.id);
        }
      )
      .subscribe();

    const progressChannel = supabase
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_history',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProgressHistory(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(capsuleChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCapsuleDays([]);
    setNotificationSettings(defaultNotificationSettings);
    setProgressHistory([]);
    setIsAdmin(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const updateIMC = async (weight: number, height: number) => {
    if (!user) return;

    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    const imcCategory = calculateIMCCategory(imc);
    const imcRounded = Math.round(imc * 100) / 100;
    const today = new Date().toISOString().split('T')[0];

    // Prepare entries
    const newProgressEntry = { date: today, weight, imc: imcRounded };
    let initialEntry: { date: string; weight: number; imc: number } | null = null;

    // Check if we need to backfill initial weight (if no history exists)
    if (progressHistory.length === 0 && profile?.weight && profile?.created_at) {
      const createdDate = profile.created_at.split('T')[0];
      // Only backfill if the creation date is before today
      if (createdDate < today) {
        initialEntry = {
          date: createdDate,
          weight: profile.weight,
          imc: profile.imc || 0
        };
      }
    }

    // Optimistic update - immediately update local state for instant UI feedback
    setProgressHistory(prev => {
      let updated = [...prev];

      // Add initial entry if needed and doesn't exist
      if (initialEntry && !updated.some(e => e.date === initialEntry.date)) {
        updated.push(initialEntry);
      }

      const existingIndex = updated.findIndex(e => e.date === today);
      if (existingIndex >= 0) {
        updated[existingIndex] = newProgressEntry;
      } else {
        updated.push(newProgressEntry);
      }

      return updated.sort((a, b) => a.date.localeCompare(b.date));
    });

    // Optimistic profile update
    if (profile) {
      setProfile({
        ...profile,
        weight,
        height,
        imc: imcRounded,
        imc_category: imcCategory,
      });
    }

    // Update profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        weight,
        height,
        imc: imcRounded,
        imc_category: imcCategory,
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Automatically add to progress history
    // First backfill if needed
    if (initialEntry) {
      const { error: initialError } = await supabase
        .from('progress_history')
        .upsert({
          user_id: user.id,
          date: initialEntry.date,
          weight: initialEntry.weight,
          imc: initialEntry.imc,
        }, {
          onConflict: 'user_id,date'
        });
      
      if (initialError) {
        console.error('Error backfilling initial progress:', initialError);
      }
    }

    // Then add current entry
    const { error } = await supabase
      .from('progress_history')
      .upsert({
        user_id: user.id,
        date: today,
        weight: weight,
        imc: imcRounded,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error updating progress history:', error);
    }
  };

  const addWaterIntake = async () => {
    if (!user || !profile) return;

    const today = new Date().toISOString().split('T')[0];
    const newIntake = profile.water_intake + 250;
    
    // Update profile water intake
    await updateProfile({ water_intake: newIntake });
    
    // Save to water history
    const { error } = await supabase
      .from('water_intake_history')
      .upsert({ 
        user_id: user.id, 
        date: today, 
        total_intake: newIntake 
      }, { 
        onConflict: 'user_id,date' 
      });
  };

  const resetWaterIntake = async () => {
    if (!user) return;
    await updateProfile({ water_intake: 0 });
  };

  // Check and reset water intake at start of new day
  const checkDailyWaterReset = async () => {
    if (!user || !profile) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastUpdate = profile.created_at?.split('T')[0];
    
    // Get last water history entry
    const { data } = await supabase
      .from('water_intake_history')
      .select('date, total_intake')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If last entry is not today and profile has water, save yesterday's and reset
    if (data && data.date !== today && profile.water_intake > 0) {
      await updateProfile({ water_intake: 0 });
    } else if (!data && profile.water_intake > 0) {
      // First time - just reset for new day tracking
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await supabase.from('water_intake_history').insert({
        user_id: user.id,
        date: yesterday.toISOString().split('T')[0],
        total_intake: profile.water_intake
      });
      await updateProfile({ water_intake: 0 });
    }
  };

  const markCapsuleTaken = async (date: string) => {
    if (!user) return;

    if (!capsuleDays.includes(date)) {
      const { error } = await supabase
        .from('capsule_days')
        .insert({ user_id: user.id, date });

      if (!error) {
        setCapsuleDays([...capsuleDays, date]);
      }
    }
  };

  const isCapsuleTaken = (date: string) => {
    return capsuleDays.includes(date);
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (settings.capsuleReminder !== undefined) dbUpdates.capsule_reminder = settings.capsuleReminder;
    if (settings.capsuleTime !== undefined) dbUpdates.capsule_time = settings.capsuleTime;
    if (settings.waterReminder !== undefined) dbUpdates.water_reminder = settings.waterReminder;
    if (settings.waterInterval !== undefined) dbUpdates.water_interval = settings.waterInterval;

    const { error } = await supabase
      .from('notification_settings')
      .update(dbUpdates)
      .eq('user_id', user.id);

    if (!error) {
      setNotificationSettings(prev => ({ ...prev, ...settings }));
    }
  };

  const addProgressEntry = async (entry: SimpleProgressEntry) => {
    if (!user) return;

    const { error } = await supabase
      .from('progress_history')
      .insert({
        user_id: user.id,
        date: entry.date,
        weight: entry.weight,
        imc: entry.imc,
      });

    if (!error) {
      setProgressHistory(prev => [...prev, entry]);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user || !profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);

    if (!error) {
      setProfile({ ...profile, onboarding_completed: true });
    }
  };

  const markPushPromptShown = async () => {
    if (!user || !profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ push_prompt_shown: true })
      .eq('user_id', user.id);

    if (!error) {
      setProfile({ ...profile, push_prompt_shown: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isLoggedIn: !!user,
        isApproved: profile?.is_approved ?? false,
        isCodeValidated: profile?.code_validated ?? false,
        isAdmin,
        logout,
        updateProfile,
        updateIMC,
        addWaterIntake,
        resetWaterIntake,
        markCapsuleTaken,
        isCapsuleTaken,
        capsuleDays,
        notificationSettings,
        updateNotificationSettings,
        progressHistory,
        addProgressEntry,
        refreshProfile,
        markOnboardingComplete,
        markPushPromptShown,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
