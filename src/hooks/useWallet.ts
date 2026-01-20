import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  referral_id: string | null;
  created_at: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  credit_amount: number;
  kiwify_order_id: string | null;
  created_at: string;
  converted_at: string | null;
  approved_at: string | null;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchWalletData();
    }
  }, [user?.id]);

  const fetchWalletData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create it
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (!createError) {
          walletData = newWallet;
        }
      }

      if (walletData) {
        setWallet(walletData);

        // Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txData) {
          setTransactions(txData);
        }
      }

      // Fetch referrals
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralData) {
        setReferrals(referralData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralCode = () => {
    // Use the auto-generated LF code from the wallet
    return wallet?.referral_code || '';
  };

  const getReferralLink = () => {
    const code = getReferralCode();
    if (!code) return '';
    return `https://leveday.com.br?ref=${code}`;
  };

  const approvedReferrals = referrals.filter(r => r.status === 'approved');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const convertedReferrals = referrals.filter(r => r.status === 'converted');

  return {
    wallet,
    balance: wallet?.balance || 0,
    transactions,
    referrals,
    approvedReferrals,
    pendingReferrals,
    convertedReferrals,
    loading,
    referralCode: getReferralCode(),
    referralLink: getReferralLink(),
    refetch: fetchWalletData,
  };
};
