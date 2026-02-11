import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Plus, Check, X, Shield, Loader2, Copy, Users, Gift, Wallet, DollarSign, CheckCircle2, Clock, FileText, Banknote, TrendingUp } from 'lucide-react';
import { getCommissionRates, getAffiliateLevel } from '@/hooks/useAffiliate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AccessCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  user_name?: string;
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
  referrer_name?: string;
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
  user_name?: string;
  affiliate_code?: string;
}

interface AffiliateWithName {
  id: string;
  user_id: string;
  affiliate_code: string;
  is_active: boolean;
  total_sales: number;
  total_commission: number;
  user_name: string;
  monthly_sales: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [withdrawals, setWithdrawals] = useState<PixWithdrawal[]>([]);
  const [affiliatesList, setAffiliatesList] = useState<AffiliateWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [newReferralEmail, setNewReferralEmail] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [newOrderId, setNewOrderId] = useState('');
  const [saleAffiliateId, setSaleAffiliateId] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleKit, setSaleKit] = useState('');
  const [saleCustomerEmail, setSaleCustomerEmail] = useState('');
  const [saleOrderId, setSaleOrderId] = useState('');
  const [registeringSale, setRegisteringSale] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    await Promise.all([fetchCodes(), fetchReferrals(), fetchWithdrawals(), fetchAffiliatesList()]);
    setLoading(false);
  };

  const fetchAffiliatesList = async () => {
    try {
      const { data: affiliates, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!affiliates || affiliates.length === 0) { setAffiliatesList([]); return; }

      const userIds = affiliates.map(a => a.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', userIds);
      const names: Record<string, string> = {};
      if (profiles) profiles.forEach(p => { names[p.user_id] = p.name; });

      // Get monthly sales count for each affiliate
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlySalesData } = await supabase
        .from('affiliate_sales')
        .select('affiliate_id')
        .eq('status', 'paid')
        .gte('created_at', startOfMonth);

      const monthlyCounts: Record<string, number> = {};
      if (monthlySalesData) {
        monthlySalesData.forEach(s => {
          monthlyCounts[s.affiliate_id] = (monthlyCounts[s.affiliate_id] || 0) + 1;
        });
      }

      setAffiliatesList(affiliates.map(a => ({
        id: a.id,
        user_id: a.user_id,
        affiliate_code: a.affiliate_code,
        is_active: a.is_active ?? true,
        total_sales: a.total_sales ?? 0,
        total_commission: a.total_commission ?? 0,
        user_name: names[a.user_id] || 'Usuário',
        monthly_sales: monthlyCounts[a.id] || 0,
      })));
    } catch (err) {
      console.error('Error fetching affiliates:', err);
    }
  };

  const registerAffiliateSale = async () => {
    if (!saleAffiliateId || !saleAmount || !saleKit) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' });
      return;
    }

    setRegisteringSale(true);
    try {
      const affiliate = affiliatesList.find(a => a.id === saleAffiliateId);
      if (!affiliate) throw new Error('Afiliado não encontrado');

      // Calculate commission based on current monthly sales level
      const rates = getCommissionRates(affiliate.monthly_sales);
      let ratePercent = rates.kit1;
      if (saleKit === '3') ratePercent = rates.kit3;
      if (saleKit === '5') ratePercent = rates.kit5;

      const commission = (amount * ratePercent) / 100;

      // 1. Insert affiliate sale
      const { error: saleError } = await supabase
        .from('affiliate_sales')
        .insert({
          affiliate_id: affiliate.id,
          order_id: saleOrderId || `MANUAL-${Date.now()}`,
          sale_amount: amount,
          commission_amount: commission,
          customer_email: saleCustomerEmail || null,
          status: 'paid',
          paid_at: new Date().toISOString(),
        });

      if (saleError) throw saleError;

      // 2. Update affiliate totals
      const { error: updateError } = await supabase
        .from('affiliates')
        .update({
          total_sales: (affiliate.total_sales || 0) + 1,
          total_commission: (affiliate.total_commission || 0) + commission,
        })
        .eq('id', affiliate.id);

      if (updateError) throw updateError;

      toast({
        title: 'Venda registrada! 🎉',
        description: `Comissão de R$ ${commission.toFixed(2)} (${ratePercent}%) creditada para ${affiliate.user_name}`,
      });

      setSaleAffiliateId('');
      setSaleAmount('');
      setSaleKit('');
      setSaleCustomerEmail('');
      setSaleOrderId('');
      fetchAffiliatesList();
    } catch (err) {
      console.error('Error registering affiliate sale:', err);
      toast({ title: 'Erro ao registrar venda', variant: 'destructive' });
    } finally {
      setRegisteringSale(false);
    }
  };

  const fetchCodes = async () => {
    try {
      const { data: codesData, error: codesError } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      if (codesData) {
        const usedByIds = codesData
          .filter(c => c.used_by)
          .map(c => c.used_by);

        let userNames: Record<string, string> = {};
        
        if (usedByIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, name')
            .in('user_id', usedByIds);
          
          if (profiles) {
            userNames = profiles.reduce((acc, p) => {
              acc[p.user_id] = p.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        setCodes(codesData.map(code => ({
          ...code,
          user_name: code.used_by ? userNames[code.used_by] || 'Usuário' : undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      if (referralsData) {
        const referrerIds = [...new Set(referralsData.map(r => r.referrer_id))];

        let userNames: Record<string, string> = {};
        
        if (referrerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, name')
            .in('user_id', referrerIds);
          
          if (profiles) {
            userNames = profiles.reduce((acc, p) => {
              acc[p.user_id] = p.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        setReferrals(referralsData.map(referral => ({
          ...referral,
          referrer_name: userNames[referral.referrer_id] || 'Usuário',
        })));
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('pix_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const userIds = [...new Set(data.map((w: any) => w.user_id))];
        const affIds = [...new Set(data.map((w: any) => w.affiliate_id))];

        let userNames: Record<string, string> = {};
        let affCodes: Record<string, string> = {};

        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', userIds);
          if (profiles) userNames = profiles.reduce((acc: any, p: any) => { acc[p.user_id] = p.name; return acc; }, {});
        }
        if (affIds.length > 0) {
          const { data: affiliates } = await supabase.from('affiliates').select('id, affiliate_code').in('id', affIds);
          if (affiliates) affCodes = affiliates.reduce((acc: any, a: any) => { acc[a.id] = a.affiliate_code; return acc; }, {});
        }

        setWithdrawals(data.map((w: any) => ({
          ...w,
          user_name: userNames[w.user_id] || 'Usuário',
          affiliate_code: affCodes[w.affiliate_id] || '',
        })));
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const approveWithdrawal = async (withdrawalId: string) => {
    setApprovingId(withdrawalId);
    try {
      const { error } = await supabase
        .from('pix_withdrawals')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq('id', withdrawalId);

      if (error) throw error;
      toast({ title: 'Saque aprovado!', description: 'Faça a transferência Pix manualmente.' });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({ title: 'Erro', description: 'Não foi possível aprovar o saque.', variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  const rejectWithdrawal = async (withdrawalId: string) => {
    setApprovingId(withdrawalId);
    try {
      const { error } = await supabase
        .from('pix_withdrawals')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq('id', withdrawalId);

      if (error) throw error;
      toast({ title: 'Saque rejeitado' });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({ title: 'Erro', description: 'Não foi possível rejeitar o saque.', variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const createCode = async () => {
    if (!newCode.trim()) {
      toast({
        title: 'Código obrigatório',
        description: 'Digite ou gere um código.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase
        .from('access_codes')
        .insert({ code: newCode.toUpperCase().trim() });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Código já existe',
            description: 'Este código já está cadastrado.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Código criado!',
          description: `Código ${newCode.toUpperCase()} criado com sucesso.`,
        });
        setNewCode('');
        fetchCodes();
      }
    } catch (error) {
      console.error('Error creating code:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o código.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência.',
    });
  };

  const deleteCode = async (id: string, code: string) => {
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCodes(codes.filter(c => c.id !== id));
      toast({
        title: 'Código removido',
        description: `Código ${code} foi removido.`,
      });
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o código.',
        variant: 'destructive',
      });
    }
  };

  const approveReferral = async (referralId: string, referrerId: string, creditAmount: number) => {
    setApprovingId(referralId);
    try {
      // 1. Get or create wallet for referrer
      let { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', referrerId)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Create wallet
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: referrerId })
          .select()
          .single();
        
        if (createError) throw createError;
        wallet = newWallet;
      }

      if (!wallet) throw new Error('Could not find or create wallet');

      // 2. Update wallet balance
      const newBalance = Number(wallet.balance) + creditAmount;
      const { error: updateWalletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateWalletError) throw updateWalletError;

      // 3. Create transaction record
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: referrerId,
          amount: creditAmount,
          type: 'credit',
          description: 'Crédito de indicação aprovada',
          referral_id: referralId,
        });

      if (txError) throw txError;

      // 4. Update referral status
      const { error: referralError } = await supabase
        .from('referrals')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', referralId);

      if (referralError) throw referralError;

      toast({
        title: 'Indicação aprovada!',
        description: `R$${creditAmount.toFixed(2)} creditados na carteira.`,
      });

      fetchReferrals();
    } catch (error) {
      console.error('Error approving referral:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a indicação.',
        variant: 'destructive',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const registerConversion = async () => {
    if (!newReferralCode.trim()) {
      toast({
        title: 'Código obrigatório',
        description: 'Digite o código de referência usado na compra.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // Find user by referral code pattern
      const codePrefix = newReferralCode.replace('REF', '').toLowerCase();
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .limit(100);

      if (profileError) throw profileError;

      const matchingProfile = profiles?.find(p => 
        p.user_id.toLowerCase().startsWith(codePrefix)
      );

      if (!matchingProfile) {
        toast({
          title: 'Código não encontrado',
          description: 'Não foi possível encontrar um usuário com este código.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: matchingProfile.user_id,
          referred_email: newReferralEmail || null,
          referral_code: newReferralCode.toUpperCase(),
          status: 'converted',
          kiwify_order_id: newOrderId || null,
          converted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: 'Conversão registrada!',
        description: `Indicação de ${matchingProfile.name} registrada. Aguardando aprovação.`,
      });

      setNewReferralCode('');
      setNewReferralEmail('');
      setNewOrderId('');
      fetchReferrals();
    } catch (error) {
      console.error('Error registering conversion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a conversão.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const availableCodes = codes.filter(c => !c.is_used);
  const usedCodes = codes.filter(c => c.is_used);
  const pendingReferrals = referrals.filter(r => r.status === 'converted' || r.status === 'pending');
  const approvedReferrals = referrals.filter(r => r.status === 'approved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-background dark:via-background dark:to-background pb-8">
      {/* Header */}
      <header className="bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/audit-logs')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Logs
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="affiliates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="affiliates" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Afiliados
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Indicações
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Saques
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Códigos
            </TabsTrigger>
          </TabsList>

          {/* Affiliates Tab */}
          <TabsContent value="affiliates" className="space-y-6">
            {/* Register Sale */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Registrar Venda de Afiliado
                  </CardTitle>
                  <CardDescription>
                    Registre manualmente uma venda feita por um afiliado. A comissão será calculada automaticamente pelo nível atual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select value={saleAffiliateId} onValueChange={setSaleAffiliateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o afiliado" />
                      </SelectTrigger>
                      <SelectContent>
                        {affiliatesList.map(a => {
                          const level = getAffiliateLevel(a.monthly_sales);
                          return (
                            <SelectItem key={a.id} value={a.id}>
                              {a.user_name} ({a.affiliate_code}) {level.emoji}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select value={saleKit} onValueChange={setSaleKit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kit vendido" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Kit 1 Pote</SelectItem>
                        <SelectItem value="3">Kit 3 Potes</SelectItem>
                        <SelectItem value="5">Kit 5 Potes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Valor da venda (R$)"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      type="number"
                      step="0.01"
                    />
                    <Input
                      placeholder="Email do cliente (opcional)"
                      value={saleCustomerEmail}
                      onChange={(e) => setSaleCustomerEmail(e.target.value)}
                      type="email"
                    />
                    <Input
                      placeholder="ID do pedido (opcional)"
                      value={saleOrderId}
                      onChange={(e) => setSaleOrderId(e.target.value)}
                    />
                  </div>

                  {/* Commission preview */}
                  {saleAffiliateId && saleKit && saleAmount && parseFloat(saleAmount) > 0 && (() => {
                    const aff = affiliatesList.find(a => a.id === saleAffiliateId);
                    if (!aff) return null;
                    const rates = getCommissionRates(aff.monthly_sales);
                    const level = getAffiliateLevel(aff.monthly_sales);
                    let rate = rates.kit1;
                    if (saleKit === '3') rate = rates.kit3;
                    if (saleKit === '5') rate = rates.kit5;
                    const commission = (parseFloat(saleAmount) * rate) / 100;
                    return (
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {level.emoji} Nível {level.level} ({level.name}) — {aff.monthly_sales} vendas no mês
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          Comissão: R$ {commission.toFixed(2)} ({rate}%)
                        </p>
                      </div>
                    );
                  })()}

                  <Button
                    onClick={registerAffiliateSale}
                    disabled={registeringSale || !saleAffiliateId || !saleKit || !saleAmount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    {registeringSale ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Registrar Venda
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affiliates List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Afiliados Ativos ({affiliatesList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {affiliatesList.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum afiliado ativo</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Nível</TableHead>
                            <TableHead>Vendas (mês)</TableHead>
                            <TableHead>Comissão Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {affiliatesList.map(a => {
                            const level = getAffiliateLevel(a.monthly_sales);
                            return (
                              <TableRow key={a.id}>
                                <TableCell className="font-medium">{a.user_name}</TableCell>
                                <TableCell className="font-mono text-xs">{a.affiliate_code}</TableCell>
                                <TableCell>
                                  <span className={level.color}>{level.emoji} {level.name}</span>
                                </TableCell>
                                <TableCell>{a.monthly_sales}</TableCell>
                                <TableCell className="font-bold text-green-600">
                                  R$ {(a.total_commission || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingReferrals.length}</p>
                        <p className="text-sm text-amber-600 dark:text-amber-500">Aguardando</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{approvedReferrals.length}</p>
                        <p className="text-sm text-green-600 dark:text-green-500">Aprovadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Register Conversion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Registrar Conversão (Kiwify)
                  </CardTitle>
                  <CardDescription>
                    Registre uma venda confirmada com código de indicação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Código (ex: REF12345678)"
                      value={newReferralCode}
                      onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                    />
                    <Input
                      placeholder="Email do comprador (opcional)"
                      value={newReferralEmail}
                      onChange={(e) => setNewReferralEmail(e.target.value)}
                      type="email"
                    />
                    <Input
                      placeholder="ID pedido Kiwify (opcional)"
                      value={newOrderId}
                      onChange={(e) => setNewOrderId(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={registerConversion}
                    disabled={creating || !newReferralCode.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Registrar Conversão
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Referrals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Aguardando Aprovação ({pendingReferrals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingReferrals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma indicação aguardando aprovação
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Indicador</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Comprador</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReferrals.map(referral => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">{referral.referrer_name}</TableCell>
                              <TableCell className="font-mono text-xs">{referral.referral_code}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {referral.referred_email || '-'}
                              </TableCell>
                              <TableCell className="font-bold text-green-600">
                                R${referral.credit_amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => approveReferral(referral.id, referral.referrer_id, referral.credit_amount)}
                                  disabled={approvingId === referral.id}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  {approvingId === referral.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Approved Referrals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Indicações Aprovadas ({approvedReferrals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedReferrals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma indicação aprovada ainda
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Indicador</TableHead>
                            <TableHead>Comprador</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Aprovado em</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReferrals.slice(0, 20).map(referral => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">{referral.referrer_name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {referral.referred_email || '-'}
                              </TableCell>
                              <TableCell className="font-bold text-green-600">
                                R${referral.credit_amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {referral.approved_at
                                  ? format(new Date(referral.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            {(() => {
              const pendingW = withdrawals.filter(w => w.status === 'pending');
              const processedW = withdrawals.filter(w => w.status !== 'pending');
              return (
                <>
                  {/* Pending Withdrawals */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-500" />
                          Saques Pendentes ({pendingW.length})
                        </CardTitle>
                        <CardDescription>Aprovar ou rejeitar solicitações de saque via Pix</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pendingW.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhum saque pendente</p>
                        ) : (
                          <div className="space-y-3">
                            {pendingW.map((w) => (
                              <div key={w.id} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-foreground">{w.user_name}</p>
                                    <p className="text-xs text-muted-foreground">Código: {w.affiliate_code}</p>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">R$ {w.amount.toFixed(2)}</p>
                                </div>
                                <div className="bg-secondary rounded-lg p-2">
                                  <p className="text-xs text-muted-foreground">
                                    Tipo: <span className="font-medium text-foreground">{w.pix_key_type === 'cpf' ? 'CPF' : w.pix_key_type === 'email' ? 'E-mail' : w.pix_key_type === 'phone' ? 'Telefone' : 'Chave Aleatória'}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Chave: <span className="font-medium text-foreground font-mono">{w.pix_key}</span>
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Solicitado em {format(new Date(w.requested_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={approvingId === w.id}
                                    onClick={() => approveWithdrawal(w.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={approvingId === w.id}
                                    onClick={() => rejectWithdrawal(w.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Processed Withdrawals */}
                  {processedW.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Histórico de Saques</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {processedW.map((w) => (
                              <div key={w.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <div>
                                  <p className="font-medium text-foreground text-sm">{w.user_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(w.requested_at), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground text-sm">R$ {w.amount.toFixed(2)}</span>
                                  <Badge variant={w.status === 'approved' ? 'default' : 'destructive'}>
                                    {w.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </>
              );
            })()}
          </TabsContent>

          {/* Codes Tab */}
          <TabsContent value="codes" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{availableCodes.length}</p>
                        <p className="text-sm text-green-600 dark:text-green-500">Disponíveis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{usedCodes.length}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-500">Utilizados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Create Code */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Criar Novo Código
                  </CardTitle>
                  <CardDescription>
                    Digite um código ou gere um automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o código"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                      maxLength={20}
                    />
                    <Button variant="outline" onClick={generateCode}>
                      Gerar
                    </Button>
                  </div>
                  <Button
                    onClick={createCode}
                    disabled={creating || !newCode.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Criar Código
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Available Codes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5 text-green-500" />
                    Códigos Disponíveis ({availableCodes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableCodes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum código disponível
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableCodes.slice(0, 20).map(code => (
                            <TableRow key={code.id}>
                              <TableCell className="font-mono font-bold">{code.code}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(code.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyCode(code.code)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteCode(code.id, code.code)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Used Codes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-500" />
                    Códigos Utilizados ({usedCodes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usedCodes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum código utilizado ainda
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Usado por</TableHead>
                            <TableHead>Data de uso</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usedCodes.map(code => (
                            <TableRow key={code.id}>
                              <TableCell className="font-mono">
                                <Badge variant="secondary">{code.code}</Badge>
                              </TableCell>
                              <TableCell>{code.user_name || 'Usuário'}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {code.used_at
                                  ? new Date(code.used_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
