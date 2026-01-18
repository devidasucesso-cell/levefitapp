import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gift, Copy, Share2, Check, Users, Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Referral = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Generate referral code based on user id
  const referralCode = user?.id ? `LEVEFIT${user.id.slice(0, 6).toUpperCase()}` : 'LEVEFIT000000';
  
  const referralLink = `https://levefitapp.lovable.app/?ref=${referralCode}`;
  const referralMessage = `🌿 Estou usando o LeveFit e estou adorando os resultados! Use meu código ${referralCode} para ganhar 10% de desconto no seu primeiro pedido. Acesse: ${referralLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralMessage);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Não foi possível copiar');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LeveFit - Indique e Ganhe',
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

  const benefits = [
    {
      icon: <Star className="w-5 h-5" />,
      title: '10% de desconto',
      description: 'Seu indicado ganha desconto no primeiro pedido'
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'Pontos de recompensa',
      description: 'Ganhe pontos por cada indicação bem-sucedida'
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'Frete grátis',
      description: 'Após 3 indicações, ganhe frete grátis'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 pb-8 rounded-b-3xl">
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
            <p className="text-primary-foreground/80 text-sm">Convide amigos e ganhe recompensas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card className="p-4 bg-white/20 backdrop-blur border-white/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <div>
                <p className="text-white/80 text-xs">Indicados</p>
                <p className="text-white font-bold text-lg">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/20 backdrop-blur border-white/20">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-white" />
              <div>
                <p className="text-white/80 text-xs">Pontos</p>
                <p className="text-white font-bold text-lg">0</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4 max-w-4xl mx-auto">
        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Seu código de indicação</p>
              <div className="bg-secondary rounded-xl p-4 mb-4">
                <p className="text-2xl font-bold font-mono text-foreground tracking-wider">
                  {referralCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button 
                onClick={handleShare}
                className="gradient-primary text-primary-foreground flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Benefícios
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white">{benefit.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-card">
            <h3 className="font-semibold text-foreground mb-4">Como funciona?</h3>
            <ol className="space-y-3">
              {[
                'Compartilhe seu código com amigos e familiares',
                'Seu indicado usa o código na primeira compra',
                'Vocês dois ganham benefícios exclusivos!',
              ].map((step, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </motion.div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Referral;
