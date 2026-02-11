import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Gift, Copy, Share2, Check, Users, Wallet, Clock, CheckCircle2, ShoppingBag, TrendingUp, Link2, Banknote, CreditCard, ScrollText, AlertTriangle, Ban, Shield, Settings2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import CreditReleasedDialog from '@/components/CreditReleasedDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { useAffiliate } from '@/hooks/useAffiliate';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Referral = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedAff, setCopiedAff] = useState(false);
  const [pixKeyType, setPixKeyType] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [savingPix, setSavingPix] = useState(false);
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);
  const { 
    balance, referrals, approvedReferrals, pendingReferrals, convertedReferrals,
    loading, referralCode, referralLink, transactions,
    showCreditDialog, newCreditAmount, dismissCreditDialog
  } = useWallet();
  const { affiliate, sales, withdrawals, loading: affLoading, activating, activateAffiliate, affiliateLink, savePixKey, requestWithdrawal } = useAffiliate();

  const referralMessage = `🌿 Garanta seu LeveFit com 10% de desconto! Use meu código ${referralCode} na hora da compra. Acesse: ${referralLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralMessage);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Não foi possível copiar');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LeveFit - Indique e Ganhe R$25', text: referralMessage });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopyAffLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopiedAff(true);
      toast.success('Link de afiliado copiado!');
      setTimeout(() => setCopiedAff(false), 2000);
    } catch (error) {
      toast.error('Não foi possível copiar');
    }
  };

  const handleShareAffLink = async () => {
    const affMessage = `💰 Confira os produtos LeveFit! Acesse: ${affiliateLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LeveFit - Produtos Naturais', text: affMessage });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') handleCopyAffLink();
      }
    } else {
      handleCopyAffLink();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            {status === 'paid' ? 'Pago' : 'Aprovado'}
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Check className="w-3 h-3" />
            Convertido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground flex items-center gap-2">
              🤝 Ganhe
            </h1>
            <p className="text-primary-foreground/80 text-sm">Indicando ou vendendo</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="p-3 bg-white/20 backdrop-blur border-white/20">
            <div className="flex flex-col items-center">
              <Users className="w-6 h-6 text-white mb-1" />
              <p className="text-white font-bold text-lg">{referrals.length}</p>
              <p className="text-white/80 text-xs">Indicações</p>
            </div>
          </Card>
          <Card className="p-3 bg-white/20 backdrop-blur border-white/20">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-6 h-6 text-white mb-1" />
              <p className="text-white font-bold text-lg">{affiliate?.total_sales || 0}</p>
              <p className="text-white/80 text-xs">Vendas Afiliado</p>
            </div>
          </Card>
          <Card className="p-3 bg-white/20 backdrop-blur border-white/20">
            <div className="flex flex-col items-center">
              <Wallet className="w-6 h-6 text-white mb-1" />
              <p className="text-white font-bold text-lg">R${balance.toFixed(2)}</p>
              <p className="text-white/80 text-xs">Saldo</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4 max-w-4xl mx-auto">
        {/* Tabs: Indicar / Afiliado */}
        <Tabs defaultValue="affiliate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Indicar
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Afiliado
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB: INDICAR ===== */}
          <TabsContent value="referral" className="space-y-4 mt-4">
            {/* Referral Code Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-card">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Seu link de indicação</p>
                  <div className="bg-secondary rounded-xl p-4 mb-2">
                    <p className="text-sm font-mono text-foreground break-all">{referralLink}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Código: <span className="font-bold text-primary">{referralCode}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  <Button onClick={handleShare} className="gradient-primary text-primary-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Como funciona?
                </h3>
                <ol className="space-y-4">
                  {[
                    { step: 1, title: 'Compartilhe seu link', desc: 'Envie seu link único para amigos e familiares' },
                    { step: 2, title: 'Seu amigo compra', desc: 'Quando ele comprar usando seu link' },
                    { step: 3, title: 'Você ganha R$25', desc: 'O crédito é liberado em sua carteira' },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </motion.div>

            {/* Referrals List */}
            {referrals.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6 bg-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Minhas Indicações ({referrals.length})
                  </h3>
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{referral.referred_email || 'Aguardando...'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(referral.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(referral.status)}
                          {referral.status === 'approved' && (
                            <span className="text-sm font-bold text-green-600">+R${referral.credit_amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* ===== TAB: AFILIADO ===== */}
          <TabsContent value="affiliate" className="space-y-4 mt-4">
            {!affiliate ? (
              /* Activation Card */
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 bg-card text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Seja um Afiliado LeveFit</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ganhe <span className="font-bold text-primary">25% de comissão</span> sobre cada venda feita pelo seu link!
                  </p>
                  <ul className="text-left text-sm space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Link exclusivo para compartilhar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">25% de comissão por venda confirmada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Créditos direto na sua carteira</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={activateAffiliate} 
                    disabled={activating}
                    className="w-full gradient-primary text-primary-foreground text-base h-12"
                  >
                    {activating ? 'Ativando...' : '🚀 Quero ser Afiliado'}
                  </Button>
                </Card>
              </motion.div>
            ) : (
              /* Affiliate Dashboard */
              <>
                {/* Affiliate Link */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Seu Link de Afiliado</h3>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 mb-2">
                      <p className="text-sm font-mono text-foreground break-all">{affiliateLink}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Código: <span className="font-bold text-primary">{affiliate.affiliate_code}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={handleCopyAffLink} className="flex items-center gap-2">
                        {copiedAff ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedAff ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button onClick={handleShareAffLink} className="gradient-primary text-primary-foreground flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </Card>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-muted-foreground">Vendas</p>
                      <p className="text-2xl font-bold text-foreground">{affiliate.total_sales}</p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground">Comissões</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {affiliate.total_commission.toFixed(2)}</p>
                    </Card>
                  </div>
                </motion.div>

                {/* Affiliate Wallet */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Carteira Afiliado</h3>
                          <p className="text-sm text-muted-foreground">Comissões acumuladas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          R$ {affiliate.total_commission.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {sales.length > 0 && (
                      <div className="border-t border-blue-200 dark:border-blue-800 pt-4 mt-4">
                        <p className="text-sm font-medium text-foreground mb-2">Últimas comissões</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {sales.slice(0, 3).map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Comissão de venda</span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                +R$ {sale.commission_amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Pix Key Registration */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
                  <Card className="p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Dados Pix para Saque</h3>
                    </div>
                    {affiliate.pix_key ? (
                      <div className="space-y-2">
                        <div className="bg-secondary rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Tipo: <span className="font-medium text-foreground">{affiliate.pix_key_type === 'cpf' ? 'CPF' : affiliate.pix_key_type === 'email' ? 'E-mail' : affiliate.pix_key_type === 'phone' ? 'Telefone' : 'Chave Aleatória'}</span></p>
                          <p className="text-xs text-muted-foreground mt-1">Chave: <span className="font-medium text-foreground">{affiliate.pix_key}</span></p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                          setPixKeyType(affiliate.pix_key_type || '');
                          setPixKey('');
                        }}>
                          Alterar chave Pix
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Select value={pixKeyType} onValueChange={setPixKeyType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de chave Pix" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="random">Chave Aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder={pixKeyType === 'cpf' ? '000.000.000-00' : pixKeyType === 'email' ? 'seu@email.com' : pixKeyType === 'phone' ? '(00) 00000-0000' : 'Cole sua chave aleatória'}
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          maxLength={100}
                        />
                        <Button
                          className="w-full gradient-primary text-primary-foreground"
                          disabled={!pixKeyType || !pixKey.trim() || savingPix}
                          onClick={async () => {
                            if (!pixKeyType || !pixKey.trim()) return;
                            setSavingPix(true);
                            await savePixKey(pixKeyType, pixKey.trim());
                            setSavingPix(false);
                            setPixKey('');
                          }}
                        >
                          {savingPix ? 'Salvando...' : 'Salvar Chave Pix'}
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Withdrawal Request */}
                {affiliate.pix_key && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <Card className="p-6 bg-card">
                      <div className="flex items-center gap-2 mb-4">
                        <Banknote className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Solicitar Saque</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Mínimo: R$ 50,00 • Disponível: <span className="font-bold text-foreground">R$ {affiliate.total_commission.toFixed(2)}</span>
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Valor (R$)"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          min={50}
                          step={0.01}
                        />
                        <Button
                          className="gradient-primary text-primary-foreground whitespace-nowrap"
                          disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50 || requestingWithdrawal}
                          onClick={async () => {
                            setRequestingWithdrawal(true);
                            const success = await requestWithdrawal(parseFloat(withdrawAmount));
                            if (success) setWithdrawAmount('');
                            setRequestingWithdrawal(false);
                          }}
                        >
                          {requestingWithdrawal ? 'Enviando...' : 'Sacar'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Withdrawal History */}
                {withdrawals.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                    <Card className="p-6 bg-card">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" />
                        Histórico de Saques
                      </h3>
                      <div className="space-y-3">
                        {withdrawals.map((w) => (
                          <div key={w.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <p className="font-medium text-foreground text-sm">R$ {w.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(w.requested_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            {getStatusBadge(w.status)}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* How it works */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Card className="p-6 bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Como funciona?
                    </h3>
                    <ol className="space-y-4">
                      {[
                        { step: 1, title: 'Compartilhe seu link', desc: 'Envie o link da loja para seus contatos' },
                        { step: 2, title: 'Cliente compra', desc: 'Quando alguém comprar pelo seu link' },
                        { step: 3, title: 'Ganhe 25%', desc: '25% do valor da venda é creditado na sua carteira' },
                      ].map((item) => (
                        <li key={item.step} className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {item.step}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </motion.div>

                {/* Regulamento do Programa de Afiliados */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                  <Card className="p-6 bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <ScrollText className="w-5 h-5 text-primary" />
                      📜 Regulamento do Programa
                    </h3>
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="participacao">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> 1️⃣ Quem pode participar</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>Qualquer usuário maior de 18 anos pode se tornar afiliado.</p>
                          <p>Ao participar, o afiliado concorda com todas as regras descritas neste regulamento.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="como-funciona">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> 2️⃣ Como funciona a afiliação</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>O afiliado recebe um link e/ou código exclusivo para divulgação.</p>
                          <p>Toda venda realizada por meio desse link/código será automaticamente vinculada ao afiliado.</p>
                          <p>A comissão é válida apenas para vendas confirmadas e aprovadas.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="prazo">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 4️⃣ Prazo de liberação</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>A comissão fica pendente até a confirmação do pagamento.</p>
                          <p>Após a confirmação, a comissão será liberada em até 3 dias corridos.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="pagamento">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Banknote className="w-4 h-4 text-primary" /> 5️⃣ Pagamento</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>O pagamento é feito exclusivamente via Pix, para a chave cadastrada no app.</p>
                          <p>Valor mínimo para saque: <strong className="text-foreground">R$ 50,00</strong>.</p>
                          <p>Após a solicitação, o pagamento será realizado em até 2 dias úteis.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="responsabilidades">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> 6️⃣ Responsabilidades do afiliado</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>Divulgar o produto de forma ética e verdadeira.</p>
                          <p>Não utilizar promessas falsas, linguagem enganosa ou informações não autorizadas.</p>
                          <p>Não se passar por representante oficial, suporte ou equipe do app.</p>
                          <p>Não realizar spam, anúncios enganosos ou práticas abusivas.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="proibicoes">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Ban className="w-4 h-4 text-destructive" /> 7️⃣ Proibições</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>É proibido:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Comprar o produto usando o próprio link de afiliado.</li>
                            <li>Criar contas falsas para gerar comissão.</li>
                            <li>Utilizar tráfego fraudulento, bots ou qualquer meio ilícito.</li>
                            <li>Copiar ou modificar materiais oficiais sem autorização.</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="penalidades">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> 8️⃣ Penalidades</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>Em caso de descumprimento das regras, o afiliado poderá:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Ter comissões canceladas</li>
                            <li>Ter a conta suspensa ou encerrada</li>
                            <li>Ser removido do programa sem aviso prévio</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="alteracoes">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <span className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" /> 9️⃣ Alterações no programa</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-1">
                          <p>O programa de afiliados pode ser alterado, suspenso ou encerrado a qualquer momento.</p>
                          <p>Alterações serão comunicadas dentro do app.</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                </motion.div>

                {/* Sales History */}
                {sales.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="p-6 bg-card">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        Histórico de Vendas ({sales.length})
                      </h3>
                      <div className="space-y-3">
                        {sales.map((sale) => (
                          <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                Venda R$ {sale.sale_amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(sale.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(sale.status)}
                              <span className="text-sm font-bold text-green-600">
                                +R$ {sale.commission_amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Wallet Balance - shared between tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Minha Carteira</h3>
                  <p className="text-sm text-muted-foreground">Saldo disponível</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {balance.toFixed(2)}</p>
              </div>
            </div>

            {transactions.length > 0 && (
              <div className="border-t border-green-200 dark:border-green-800 pt-4 mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Últimas transações</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{tx.description || 'Crédito de indicação'}</span>
                      <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount > 0 ? '+' : ''}R$ {tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Rules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">⚠️ Regras e Condições</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span className="text-muted-foreground"><strong className="text-foreground">Créditos intransferíveis:</strong> Os créditos não podem ser transferidos para outra pessoa ou conta.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span className="text-muted-foreground"><strong className="text-foreground">Uso exclusivo:</strong> Os créditos só podem ser utilizados na loja oficial de produtos LeveFit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span className="text-muted-foreground"><strong className="text-foreground">Validade de 90 dias:</strong> Os créditos expiram após 90 dias.</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <WaterReminder />
      <Navigation />
      <CreditReleasedDialog open={showCreditDialog} onOpenChange={dismissCreditDialog} amount={newCreditAmount || 25} />
    </div>
  );
};

export default Referral;
