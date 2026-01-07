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
  created_at: string;
  is_approved: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isApproved: boolean;
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
        created_at: data.created_at,
        is_approved: data.is_approved ?? false,
      });
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

    await updateProfile({
      weight,
      height,
      imc: Math.round(imc * 100) / 100,
      imc_category: imcCategory,
    });
  };

  const addWaterIntake = async () => {
    if (!user || !profile) return;

    const newIntake = profile.water_intake + 250;
    await updateProfile({ water_intake: newIntake });
  };

  const resetWaterIntake = async () => {
    if (!user) return;
    await updateProfile({ water_intake: 0 });
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isLoggedIn: !!user,
        isApproved: profile?.is_approved ?? false,
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
