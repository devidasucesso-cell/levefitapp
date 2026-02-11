import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  is_active: boolean;
  total_sales: number;
  total_commission: number;
  created_at: string;
}

interface AffiliateSale {
  id: string;
  affiliate_id: string;
  order_id: string;
  sale_amount: number;
  commission_amount: number;
  customer_email: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export function useAffiliate() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  const fetchAffiliate = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAffiliate(data as Affiliate | null);

      if (data) {
        const { data: salesData, error: salesError } = await supabase
          .from('affiliate_sales')
          .select('*')
          .eq('affiliate_id', data.id)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;
        setSales((salesData as AffiliateSale[]) || []);
      }
    } catch (err) {
      console.error('Error fetching affiliate:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAffiliate();
  }, [fetchAffiliate]);

  const activateAffiliate = async () => {
    if (!user) return;
    setActivating(true);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .insert({ user_id: user.id, affiliate_code: 'TEMP' })
        .select()
        .single();

      if (error) throw error;
      setAffiliate(data as Affiliate);
      toast.success('Você agora é um afiliado! 🎉');
    } catch (err) {
      console.error('Error activating affiliate:', err);
      toast.error('Erro ao ativar afiliado');
    } finally {
      setActivating(false);
    }
  };

  const affiliateLink = affiliate
    ? `https://levefitapp.lovable.app/store?aff=${affiliate.affiliate_code}`
    : '';

  return {
    affiliate,
    sales,
    loading,
    activating,
    activateAffiliate,
    affiliateLink,
  };
}
