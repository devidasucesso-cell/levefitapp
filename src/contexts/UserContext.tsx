import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, IMCCategory, NotificationSettings, ProgressEntry } from '@/types';

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isLoggedIn: boolean;
  login: (name: string, code: string) => void;
  logout: () => void;
  updateIMC: (weight: number, height: number) => void;
  addWaterIntake: () => void;
  markCapsuleTaken: (date: string) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  progressHistory: ProgressEntry[];
  addProgressEntry: (entry: ProgressEntry) => void;
}

const defaultNotificationSettings: NotificationSettings = {
  capsuleReminder: true,
  capsuleTime: '08:00',
  waterReminder: true,
  waterInterval: 60,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const calculateIMCCategory = (imc: number): IMCCategory => {
  if (imc < 18.5) return 'underweight';
  if (imc < 25) return 'normal';
  if (imc < 30) return 'overweight';
  return 'obese';
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('levefit-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('levefit-notifications');
    return saved ? JSON.parse(saved) : defaultNotificationSettings;
  });

  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>(() => {
    const saved = localStorage.getItem('levefit-progress');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('levefit-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('levefit-user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('levefit-notifications', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('levefit-progress', JSON.stringify(progressHistory));
  }, [progressHistory]);

  const setUser = (newUser: UserData | null) => {
    setUserState(newUser);
  };

  const login = (name: string, code: string) => {
    setUserState({
      name,
      accessCode: code,
      weight: 0,
      height: 0,
      imc: 0,
      imcCategory: 'normal',
      waterIntake: 0,
      capsuleDays: [],
    });
  };

  const logout = () => {
    setUserState(null);
  };

  const updateIMC = (weight: number, height: number) => {
    if (!user) return;
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    const imcCategory = calculateIMCCategory(imc);
    
    setUserState({
      ...user,
      weight,
      height,
      imc,
      imcCategory,
    });
  };

  const addWaterIntake = () => {
    if (!user) return;
    setUserState({
      ...user,
      waterIntake: user.waterIntake + 250,
    });
  };

  const markCapsuleTaken = (date: string) => {
    if (!user) return;
    if (!user.capsuleDays.includes(date)) {
      setUserState({
        ...user,
        capsuleDays: [...user.capsuleDays, date],
      });
    }
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  const addProgressEntry = (entry: ProgressEntry) => {
    setProgressHistory(prev => [...prev, entry]);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
        login,
        logout,
        updateIMC,
        addWaterIntake,
        markCapsuleTaken,
        notificationSettings,
        updateNotificationSettings,
        progressHistory,
        addProgressEntry,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
