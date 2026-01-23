import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Plus, Check, X, Shield, Loader2, Copy, Users, Gift, Wallet, DollarSign, CheckCircle2, Clock, FileText } from 'lucide-react';
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

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [newReferralEmail, setNewReferralEmail] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [newOrderId, setNewOrderId] = useState('');

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
    await Promise.all([fetchCodes(), fetchReferrals()]);
    setLoading(false);
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
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Indicações
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Códigos
            </TabsTrigger>
          </TabsList>

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
