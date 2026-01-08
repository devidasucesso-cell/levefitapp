import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import KitSelection from '@/components/KitSelection';

const HAS_LOGGED_IN_KEY = 'levefit_has_logged_in';

const Index = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingPreviousLogin, setCheckingPreviousLogin] = useState(true);

  useEffect(() => {
    // If user is logged in, go to dashboard
    if (isLoggedIn) {
      // Mark that user has logged in before
      localStorage.setItem(HAS_LOGGED_IN_KEY, 'true');
      navigate('/dashboard');
      return;
    }

    // Check if user has logged in before (returning user who logged out)
    const hasLoggedInBefore = localStorage.getItem(HAS_LOGGED_IN_KEY);
    
    if (!isLoading && hasLoggedInBefore === 'true' && !isLoggedIn) {
      // User has logged in before, redirect to auth page
      navigate('/auth');
      return;
    }

    setCheckingPreviousLogin(false);
  }, [isLoggedIn, isLoading, navigate]);

  const handleKitSelect = (kitType: string) => {
    // Store kit selection in sessionStorage to use after signup
    sessionStorage.setItem('selectedKit', kitType);
    navigate('/auth');
  };

  if (isLoading || checkingPreviousLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show kit selection only for new users
  return <KitSelection onSelect={handleKitSelect} />;
};

export default Index;