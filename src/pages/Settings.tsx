import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Clock, Droplets, Pill, Save, BellRing, Loader2, Send, AlertCircle, CheckCircle2, XCircle, Package, ChevronRight, ShoppingCart, ExternalLink, Target, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const kits = [
  { id: '1_pote', label: '1 Pote', description: '30 dias de tratamento' },
  { id: '3_potes', label: '3 Potes', description: '90 dias de tratamento' },
  { id: '5_potes', label: '5 Potes', description: '150 dias de tratamento' },
];

const Settings = () => {
  const { notificationSettings, updateNotificationSettings, profile, updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading: pushLoading, 
    permissionStatus,
    subscribeUser, 
    unsubscribeUser, 
    sendTestNotification,
    getPermissionMessage 
  } = usePushNotifications();
  const [testLoading, setTestLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showKitDialog, setShowKitDialog] = useState(false);
  const [selectedKit, setSelectedKit] = useState(profile?.kit_type || '');
  const [kitLoading, setKitLoading] = useState(false);

  const [capsuleReminder, setCapsuleReminder] = useState(notificationSettings.capsuleReminder ?? true);
  const [capsuleTime, setCapsuleTime] = useState(notificationSettings.capsuleTime);
  const [waterReminder, setWaterReminder] = useState(notificationSettings.waterReminder ?? true);
  const [waterInterval, setWaterInterval] = useState(notificationSettings.waterInterval.toString());
  
  // Water goal settings
  const [useCustomWaterGoal, setUseCustomWaterGoal] = useState(false);
  const [customWaterGoal, setCustomWaterGoal] = useState((profile?.water_goal || 2000).toString());
  
  // Calculate recommended water goal based on weight (30-35ml per kg)
  const calculatedWaterGoal = useMemo(() => {
    const weight = profile?.weight || 70;
    return Math.round((weight * 35) / 100) * 100; // Round to nearest 100ml
  }, [profile?.weight]);

  useEffect(() => {
    if (profile?.kit_type) {
      setSelectedKit(profile.kit_type);
    }
    // Check if user has a custom water goal different from calculated
    if (profile?.water_goal && profile.water_goal !== calculatedWaterGoal && profile.water_goal !== 2000) {
      setUseCustomWaterGoal(true);
      setCustomWaterGoal(profile.water_goal.toString());
    }
  }, [profile?.kit_type, profile?.water_goal, calculatedWaterGoal]);

  const handleKitChange = async () => {
    if (!selectedKit) return;
    
    setKitLoading(true);
    try {
      await updateProfile({ 
        kit_type: selectedKit,
        treatment_start_date: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: 'Kit alterado!',
        description: 'Seu tratamento foi reiniciado com o novo kit.',
      });
      
      setShowKitDialog(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o kit. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setKitLoading(false);
    }
  };

  const getKitLabel = (kitType: string | null) => {
    const kit = kits.find(k => k.id === kitType);
    return kit ? kit.label : 'Não selecionado';
  };


  const handleSave = async () => {
    // Determine the water goal to save
    const waterGoalToSave = useCustomWaterGoal 
      ? parseInt(customWaterGoal) || 2000 
      : calculatedWaterGoal;
    
    // Update notification settings
    await updateNotificationSettings({
      capsuleReminder,
      capsuleTime,
      waterReminder,
      waterInterval: parseInt(waterInterval) || 60,
    });
    
    // Update water goal in profile
    await updateProfile({ water_goal: waterGoalToSave });

    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribeUser();
    } else {
      await subscribeUser();
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    await sendTestNotification();
    setTestLoading(false);
  };

  const handleDailySummaryTest = async () => {
    if (!user) return;
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { type: 'daily_summary', userId: user.id },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Resumo diário enviado! 📊',
        description: 'Você deve receber o resumo em instantes.',
      });
    } catch (error) {
      console.error('Error sending daily summary:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o resumo diário.',
        variant: 'destructive',
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  // Get permission status icon and color
  const getPermissionStatusUI = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        };
      case 'denied':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10'
        };
    }
  };

  const permissionUI = getPermissionStatusUI();

  // Schedule local notifications (fallback when app is open)
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if (capsuleReminder && capsuleTime) {
      const [hours, minutes] = capsuleTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeout = scheduledTime.getTime() - now.getTime();
      
      const timerId = setTimeout(() => {
        new Notification('💊 Hora do LeveFit!', {
          body: 'Não esqueça de tomar sua cápsula LeveFit hoje!',
          icon: '/pwa-192x192.png',
        });
      }, timeout);

      return () => clearTimeout(timerId);
    }
  }, [capsuleReminder, capsuleTime]);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if (waterReminder && waterInterval) {
      const interval = parseInt(waterInterval) * 60 * 1000;
      
      const intervalId = setInterval(() => {
        new Notification('💧 Beba Água!', {
          body: 'É hora de se hidratar! Beba um copo de água.',
          icon: '/pwa-192x192.png',
        });
      }, interval);

      return () => clearInterval(intervalId);
    }
  }, [waterReminder, waterInterval]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-transparent p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Configurações</h1>
            <p className="text-muted-foreground text-sm">Personalize seus lembretes</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Kit Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="p-4 bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => setShowKitDialog(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Package className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Meu Kit</h3>
                <p className="text-sm text-muted-foreground">{getKitLabel(profile?.kit_type)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>

        {/* Push Notifications Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-card border-2 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Notificações</h3>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed 
                    ? 'Receba lembretes mesmo com o app fechado' 
                    : 'Ative para receber lembretes em segundo plano'
                  }
                </p>
              </div>
              {isSupported ? (
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  size="sm"
                  onClick={handlePushToggle}
                  disabled={pushLoading || permissionStatus === 'denied'}
                  className={isSubscribed ? "" : "bg-gradient-to-r from-orange-500 to-red-500"}
                >
                  {pushLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSubscribed ? (
                    'Desativar'
                  ) : (
                    'Ativar'
                  )}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Não suportado</span>
              )}
            </div>

            {/* Permission Status Indicator */}
            {isSupported && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${permissionUI.bgColor}`}>
                <span className={permissionUI.color}>{permissionUI.icon}</span>
                <span className={`text-xs ${permissionUI.color}`}>
                  {getPermissionMessage()}
                </span>
              </div>
            )}

            {/* Blocked Permission Help */}
            {permissionStatus === 'denied' && (
              <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Como desbloquear:</strong> Clique no ícone de cadeado na barra de endereço do navegador, 
                  encontre "Notificações" e altere para "Permitir". Depois, recarregue a página.
                </p>
              </div>
            )}
            
            {isSubscribed && (
              <div className="pt-3 mt-3 border-t border-border space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  disabled={testLoading}
                  className="w-full"
                >
                  {testLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Notificação de Teste
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDailySummaryTest}
                  disabled={summaryLoading}
                  className="w-full text-muted-foreground"
                >
                  {summaryLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  Testar Resumo Diário
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Capsule Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Lembrete LeveFit</h3>
                <p className="text-sm text-muted-foreground">Receba notificação para tomar a cápsula</p>
              </div>
              <Switch
                checked={capsuleReminder}
                onCheckedChange={setCapsuleReminder}
              />
            </div>

            {capsuleReminder && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    Horário do lembrete
                  </Label>
                  <Input
                    type="time"
                    value={capsuleTime}
                    onChange={(e) => setCapsuleTime(e.target.value)}
                    className="bg-secondary border-0"
                  />
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Water Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-info flex items-center justify-center">
                <Droplets className="w-5 h-5 text-info-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Lembrete de Água</h3>
                <p className="text-sm text-muted-foreground">Receba notificação para beber água</p>
              </div>
              <Switch
                checked={waterReminder}
                onCheckedChange={setWaterReminder}
              />
            </div>

            {waterReminder && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Bell className="w-4 h-4 text-info" />
                    Intervalo (minutos)
                  </Label>
                  <Input
                    type="number"
                    value={waterInterval}
                    onChange={(e) => setWaterInterval(e.target.value)}
                    placeholder="60"
                    min="15"
                    max="180"
                    className="bg-secondary border-0"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo: 15 min | Máximo: 180 min</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Water Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-4 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Meta Diária de Água</h3>
                <p className="text-sm text-muted-foreground">Personalize sua meta de hidratação</p>
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-border">
              {/* Calculated Goal Info */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Calculator className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Meta recomendada: <span className="text-primary">{calculatedWaterGoal}ml</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Baseado no seu peso ({profile?.weight || 70}kg × 35ml)
                  </p>
                </div>
              </div>

              {/* Custom Goal Toggle */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-foreground">
                  Usar meta personalizada
                </Label>
                <Switch
                  checked={useCustomWaterGoal}
                  onCheckedChange={(checked) => {
                    setUseCustomWaterGoal(checked);
                    if (!checked) {
                      setCustomWaterGoal(calculatedWaterGoal.toString());
                    }
                  }}
                />
              </div>

              {/* Custom Goal Input */}
              {useCustomWaterGoal && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Droplets className="w-4 h-4 text-info" />
                    Meta personalizada (ml)
                  </Label>
                  <Input
                    type="number"
                    value={customWaterGoal}
                    onChange={(e) => setCustomWaterGoal(e.target.value)}
                    placeholder="2000"
                    min="1000"
                    max="5000"
                    step="100"
                    className="bg-secondary border-0"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo: 1000ml | Máximo: 5000ml</p>
                </div>
              )}

              {/* Current Goal Display */}
              <div className="flex items-center justify-center p-4 bg-primary/10 rounded-xl">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {useCustomWaterGoal ? customWaterGoal : calculatedWaterGoal}ml
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {useCustomWaterGoal ? 'Meta personalizada' : 'Meta calculada'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleSave}
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Configurações
          </Button>
        </motion.div>

        {/* Buy Kit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <a 
            href="https://wa.me/message/HQIWLURN37IUP1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <Button 
              variant="outline"
              className="w-full h-12 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Comprar meu Kit
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Dica:</strong> Ative as notificações push para receber lembretes mesmo quando o app estiver fechado. 
              Isso funciona como um alarme no seu celular!
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Kit Selection Dialog */}
      <Dialog open={showKitDialog} onOpenChange={setShowKitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Kit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ao alterar o kit, sua data de início será reiniciada para hoje.
            </p>
            <RadioGroup value={selectedKit} onValueChange={setSelectedKit} className="space-y-3">
              {kits.map((kit) => (
                <Label
                  key={kit.id}
                  htmlFor={`kit-${kit.id}`}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                    selectedKit === kit.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-secondary border-2 border-transparent hover:bg-secondary/80'
                  }`}
                >
                  <RadioGroupItem value={kit.id} id={`kit-${kit.id}`} className="sr-only" />
                  <Package className={`w-6 h-6 ${selectedKit === kit.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${selectedKit === kit.id ? 'text-primary' : 'text-foreground'}`}>
                      {kit.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{kit.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            <Button
              onClick={handleKitChange}
              disabled={!selectedKit || kitLoading}
              className="w-full gradient-primary text-primary-foreground"
            >
              {kitLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Alteração
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default Settings;