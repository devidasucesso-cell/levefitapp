import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gift, Copy, Share2, Check, Users, Star, Wallet, Clock, CheckCircle2, DollarSign, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import CreditReleasedDialog from '@/components/CreditReleasedDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Referral = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showAffiliateRules, setShowAffiliateRules] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const { 
    balance, 
    referrals, 
    approvedReferrals, 
    pendingReferrals,
    convertedReferrals,
    loading, 
    referralCode, 
    referralLink,
    transactions,
    showCreditDialog,
    newCreditAmount,
    dismissCreditDialog
  } = useWallet();

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
        await navigator.share({
          title: 'LeveFit - Indique e Ganhe R$25',
          text: referralMessage,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleAffiliateClick = () => {
    setShowAffiliateRules(true);
  };

  const handleConfirmAffiliate = () => {
    if (!acceptedRules) {
      toast.error('Você precisa aceitar as regras para continuar.');
      return;
    }
    
    // Show redirect message toast
    toast.success('Redirecionando para Kiwify...', {
      description: 'Após aprovação, você receberá seu link e código exclusivo.',
      duration: 3000,
    });

    // Open link after short delay
    setTimeout(() => {
      window.open('https://dashboard.kiwify.com/join/affiliate/xCT8ugcn', '_blank');
      setShowAffiliateRules(false);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Aprovado
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

  if (!profile?.code_validated) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center space-y-6 bg-gradient-to-br from-card to-secondary/30 border-2 border-primary/20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-foreground">Acesso Exclusivo</h2>
            <p className="text-muted-foreground">
              O programa de indicação e recompensas é exclusivo para membros Premium do LeveFit.
            </p>
          </div>

          <div className="py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Ganhe dinheiro indicando</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Receba créditos no app</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-transform"
            onClick={() => window.open('https://leveday.com.br', '_blank')}
          >
            Quero ser Premium
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground"
          >
            Voltar ao Dashboard
          </Button>
        </Card>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 pb-8 rounded-b-3xl md:rounded-3xl md:m-4 md:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground flex items-center gap-2">
              🎁 Indique e Ganhe
            </h1>
            <p className="text-primary-foreground/80 text-sm">Ganhe R$25 por cada indicação</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 md:grid-cols-3 md:gap-6">
          <Card className="p-3 bg-white/20 backdrop-blur border-white/20">
            <div className="flex flex-col items-center">
              <Users className="w-6 h-6 text-white mb-1" />
              <p className="text-white font-bold text-lg">{referrals.length}</p>
              <p className="text-white/80 text-xs">Indicações</p>
            </div>
          </Card>
          <Card className="p-3 bg-white/20 backdrop-blur border-white/20">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-6 h-6 text-white mb-1" />
              <p className="text-white font-bold text-lg">{approvedReferrals.length}</p>
              <p className="text-white/80 text-xs">Aprovadas</p>
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

      <div className="p-4 -mt-4 md:mt-0 space-y-6 max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        
        {/* Left Column (Desktop) */}
        <div className="space-y-6">
          {/* Affiliate Button - NEW SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-5 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <DollarSign className="w-24 h-24 text-green-600" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                    Ganhe Dinheiro Real
                  </span>
                  <h3 className="font-bold text-lg text-foreground leading-tight">
                    Já está tendo resultados com o LeveFit?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Torne-se um afiliado oficial e receba comissões.
                  </p>
                </div>

                <Button 
                  onClick={handleAffiliateClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md font-bold"
                >
                  QUERO SER AFILIADO
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <div className="relative md:hidden">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou ganhe créditos no app</span>
            </div>
          </div>

          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Indique para Amigos</h3>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-3">Compartilhe seu cupom de 10% de desconto:</p>
                <div className="bg-secondary/50 rounded-xl p-4 mb-3 border border-border/50">
                  <p className="text-sm font-mono text-foreground break-all font-medium">
                    {referralLink}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Código: <span className="font-bold text-primary text-lg ml-1">{referralCode}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  className="flex items-center gap-2 h-11"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button 
                  onClick={handleShare}
                  className="gradient-primary text-primary-foreground flex items-center gap-2 h-11 shadow-lg shadow-primary/20"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (Desktop) */}
        <div className="space-y-6">
          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Como funciona o Crédito?
              </h3>
              <ol className="space-y-4 mb-6">
                {[
                  { step: 1, title: 'Compartilhe seu link', desc: 'Envie seu link único para amigos e familiares' },
                  { step: 2, title: 'Seu amigo compra', desc: 'Quando ele comprar usando seu link' },
                  { step: 3, title: 'Você ganha R$25', desc: 'O crédito é liberado em sua carteira no app' },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 space-y-3 text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Regras Importantes
                </h4>
                <ul className="space-y-2 list-disc pl-4 opacity-90">
                  <li>Os créditos são válidos <strong>apenas para produtos LeveFit</strong> dentro do app.</li>
                  <li>Não é possível sacar em dinheiro ou transferir.</li>
                  <li>Os créditos expiram em <strong>90 dias</strong> após a liberação.</li>
                  <li>Limite de <strong>5 indicações aprovadas por mês</strong> por usuário.</li>
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Wallet Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Minha Carteira (Créditos)</h3>
                    <p className="text-sm text-muted-foreground">Saldo para uso no app</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R$ {balance.toFixed(2)}
                  </p>
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

          {/* Referrals List */}
          {referrals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Minhas Indicações ({referrals.length})
                </h3>
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">
                          {referral.referred_email || 'Aguardando...'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(referral.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(referral.status)}
                        {referral.status === 'approved' && (
                          <span className="text-sm font-bold text-green-600">
                            +R${referral.credit_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <WaterReminder />
      
      {/* Navigation - Hidden on desktop if we implement sidebar later, for now just hide/show */}
      <div className="md:hidden">
        <Navigation />
      </div>
      
      {/* Credit Released Dialog */}
      <CreditReleasedDialog 
        open={showCreditDialog} 
        onOpenChange={dismissCreditDialog}
        amount={newCreditAmount || 25}
      />

      {/* Affiliate Rules Dialog */}
      <Dialog open={showAffiliateRules} onOpenChange={setShowAffiliateRules}>
        {/* ... (Dialog content remains same) ... */}
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
              Regras Rápidas — Afiliado
            </DialogTitle>
            <DialogDescription>
              Leia com atenção antes de continuar para a Kiwify.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-700 dark:text-blue-300 flex gap-2">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Você será direcionada para a Kiwify para solicitar sua afiliação. Após aprovação, você receberá seu link e código exclusivo.</p>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-500" /> QUEM PODE SE AFILIAR
              </h4>
              <ul className="list-disc pl-8 text-muted-foreground">
                <li>Maiores de 18 anos</li>
                <li>Afiliação sujeita à aprovação</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" /> COMISSÃO
              </h4>
              <ul className="list-disc pl-8 text-muted-foreground">
                <li>Comissão paga pela Kiwify</li>
                <li>Recompras geram comissão se for pelo seu link de indicação novamente</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2 mb-1">
                <Share2 className="w-4 h-4 text-green-500" /> PODE DIVULGAR
              </h4>
              <ul className="list-disc pl-8 text-muted-foreground">
                <li>Controle do apetite</li>
                <li>Experiência pessoal com o produto</li>
                <li>Conteúdos nas redes sociais e WhatsApp</li>
                <li>Materiais oficiais do LeveFit</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2 mb-1 text-red-500">
                <AlertTriangle className="w-4 h-4" /> NÃO PODE DIVULGAR
              </h4>
              <ul className="list-disc pl-8 text-muted-foreground">
                <li>Promessas de emagrecimento garantido</li>
                <li>Resultados milagrosos ou cura</li>
                <li>Nome de médicos ou órgãos de saúde</li>
                <li>Antes e depois</li>
                <li>"Pote grátis", conquistas ou benefícios do app</li>
                <li>Preços diferentes do oficial</li>
                <li>Perfis ou anúncios fingindo ser a marca</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" /> USO DA MARCA
              </h4>
              <ul className="list-disc pl-8 text-muted-foreground">
                <li>Pode usar o nome LeveFit apenas para divulgação autorizada</li>
                <li className="text-red-500 font-medium">Proibido criar perfis, domínios ou anúncios com o nome da marca</li>
              </ul>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-700 dark:text-red-300 text-xs">
              <p className="font-bold mb-1">⚠ DESCUMPRIMENTO</p>
              <p>Pode gerar advertência, cancelamento da afiliação e perda de comissões.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox 
              id="terms" 
              checked={acceptedRules}
              onCheckedChange={(checked) => setAcceptedRules(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              📌 Declaro que li e concordo com essas regras.
            </Label>
          </div>

          <DialogFooter className="mt-2">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={handleConfirmAffiliate}
              disabled={!acceptedRules}
            >
              SIM, QUERO ME AFILIAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Referral;
