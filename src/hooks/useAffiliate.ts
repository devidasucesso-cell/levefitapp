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
  pix_key_type: string | null;
  pix_key: string | null;
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

interface PixWithdrawal {
  id: string;
  user_id: string;
  affiliate_id: string;
  amount: number;
  pix_key_type: string;
  pix_key: string;
  status: string;
  admin_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function useAffiliate() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [withdrawals, setWithdrawals] = useState<PixWithdrawal[]>([]);
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
        const [salesRes, withdrawalsRes] = await Promise.all([
          supabase.from('affiliate_sales').select('*').eq('affiliate_id', data.id).order('created_at', { ascending: false }),
          supabase.from('pix_withdrawals').select('*').eq('affiliate_id', data.id).order('created_at', { ascending: false }),
        ]);

        if (salesRes.error) throw salesRes.error;
        setSales((salesRes.data as AffiliateSale[]) || []);

        if (withdrawalsRes.error) throw withdrawalsRes.error;
        setWithdrawals((withdrawalsRes.data as PixWithdrawal[]) || []);
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

  const savePixKey = async (pixKeyType: string, pixKey: string) => {
    if (!affiliate) return;
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ pix_key_type: pixKeyType, pix_key: pixKey })
        .eq('id', affiliate.id);

      if (error) throw error;
      setAffiliate({ ...affiliate, pix_key_type: pixKeyType, pix_key: pixKey });
      toast.success('Chave Pix salva com sucesso!');
    } catch (err) {
      console.error('Error saving pix key:', err);
      toast.error('Erro ao salvar chave Pix');
    }
  };

  const requestWithdrawal = async (amount: number) => {
    if (!user || !affiliate || !affiliate.pix_key || !affiliate.pix_key_type) {
      toast.error('Cadastre sua chave Pix primeiro');
      return false;
    }
    if (amount < 50) {
      toast.error('Valor mínimo para saque é R$ 50,00');
      return false;
    }
    if (amount > affiliate.total_commission) {
      toast.error('Saldo insuficiente');
      return false;
    }
    // Check for pending withdrawals
    const hasPending = withdrawals.some(w => w.status === 'pending');
    if (hasPending) {
      toast.error('Você já tem um saque pendente');
      return false;
    }

    try {
      const { error } = await supabase.from('pix_withdrawals').insert({
        user_id: user.id,
        affiliate_id: affiliate.id,
        amount,
        pix_key_type: affiliate.pix_key_type,
        pix_key: affiliate.pix_key,
      });

      if (error) throw error;
      toast.success('Solicitação de saque enviada! Aguarde aprovação.');
      await fetchAffiliate();
      return true;
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      toast.error('Erro ao solicitar saque');
      return false;
    }
  };

  const affiliateLink = affiliate
    ? `https://levefitapp.lovable.app/store?aff=${affiliate.affiliate_code}`
    : '';

  return {
    affiliate,
    sales,
    withdrawals,
    loading,
    activating,
    activateAffiliate,
    affiliateLink,
    savePixKey,
    requestWithdrawal,
    refetch: fetchAffiliate,
  };
}
